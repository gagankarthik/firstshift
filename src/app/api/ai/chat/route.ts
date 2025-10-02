import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { openai } from '@/lib/openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's active organization
    const { data: activeOrgData, error: orgError } = await supabase
      .rpc('get_or_init_active_org')
      .maybeSingle<{ org_id: string; org_name: string | null; role: string }>();

    if (orgError || !activeOrgData?.org_id) {
      return NextResponse.json(
        { error: 'No active organization found. Please create or join an organization first.' },
        { status: 400 }
      );
    }

    const orgId = activeOrgData.org_id;

    // Parse request body
    const body = await request.json();
    const { message, conversationHistory } = body as {
      message: string;
      conversationHistory?: ChatMessage[];
    };

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Fetch organization-specific data
    const contextData = await fetchOrganizationContext(supabase, orgId);

    // Generate AI response
    const aiResponse = await generateChatResponse(
      message,
      contextData,
      conversationHistory || []
    );

    return NextResponse.json({ response: aiResponse });
  } catch (error: any) {
    console.error('AI Chat API Error:', error);

    if (error?.status === 401) {
      return NextResponse.json({ error: 'Invalid OpenAI API key' }, { status: 401 });
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to process chat request' },
      { status: 500 }
    );
  }
}

async function fetchOrganizationContext(supabase: any, orgId: string) {
  // Fetch employees
  const { data: employees } = await supabase
    .from('employees')
    .select('id, first_name, last_name, position, status')
    .eq('org_id', orgId)
    .eq('status', 'active')
    .limit(100);

  // Fetch recent shifts (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: shifts } = await supabase
    .from('shifts')
    .select('id, employee_id, starts_at, ends_at, status, position, location')
    .eq('org_id', orgId)
    .gte('starts_at', thirtyDaysAgo.toISOString())
    .order('starts_at', { ascending: false })
    .limit(500);

  // Fetch upcoming shifts (next 14 days)
  const now = new Date();
  const fourteenDaysFromNow = new Date();
  fourteenDaysFromNow.setDate(fourteenDaysFromNow.getDate() + 14);

  const { data: upcomingShifts } = await supabase
    .from('shifts')
    .select('id, employee_id, starts_at, ends_at, status, position, location')
    .eq('org_id', orgId)
    .gte('starts_at', now.toISOString())
    .lte('starts_at', fourteenDaysFromNow.toISOString())
    .order('starts_at', { ascending: true })
    .limit(200);

  // Fetch time-off requests
  const { data: timeOffRequests } = await supabase
    .from('time_off_requests')
    .select('id, employee_id, starts_at, ends_at, status, type')
    .eq('org_id', orgId)
    .gte('ends_at', now.toISOString())
    .order('starts_at', { ascending: true })
    .limit(100);

  // Fetch availability
  const { data: availability } = await supabase
    .from('availability')
    .select('employee_id, weekday, start_time, end_time')
    .eq('org_id', orgId)
    .limit(500);

  return {
    employees: employees || [],
    shifts: shifts || [],
    upcomingShifts: upcomingShifts || [],
    timeOffRequests: timeOffRequests || [],
    availability: availability || [],
  };
}

async function generateChatResponse(
  userMessage: string,
  contextData: any,
  conversationHistory: ChatMessage[]
): Promise<string> {
  const lowerMessage = userMessage.toLowerCase();

  // Build context summary
  const totalEmployees = contextData.employees.length;
  const totalShifts = contextData.shifts.length;
  const upcomingShiftsCount = contextData.upcomingShifts.length;
  const openUpcomingShifts = contextData.upcomingShifts.filter(
    (s: any) => !s.employee_id
  ).length;
  const pendingTimeOff = contextData.timeOffRequests.filter(
    (r: any) => r.status === 'pending'
  ).length;

  // Calculate shift statistics
  const completedShifts = contextData.shifts.filter(
    (s: any) => s.status === 'completed'
  ).length;
  const cancelledShifts = contextData.shifts.filter(
    (s: any) => s.status === 'cancelled'
  ).length;

  // Group shifts by employee for overtime analysis
  const shiftsByEmployee = contextData.shifts.reduce((acc: any, shift: any) => {
    if (shift.employee_id) {
      if (!acc[shift.employee_id]) {
        acc[shift.employee_id] = [];
      }
      acc[shift.employee_id].push(shift);
    }
    return acc;
  }, {});

  // Calculate hours per employee
  const employeeHours = Object.entries(shiftsByEmployee).map(([empId, shifts]: [string, any]) => {
    const totalHours = shifts.reduce((sum: number, shift: any) => {
      const start = new Date(shift.starts_at);
      const end = new Date(shift.ends_at);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);

    const employee = contextData.employees.find((e: any) => e.id === empId);
    return {
      id: empId,
      name: employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown',
      position: employee?.position || 'N/A',
      hours: totalHours,
      shiftCount: shifts.length,
    };
  });

  // Sort by hours to find least overtime
  employeeHours.sort((a, b) => a.hours - b.hours);

  const systemPrompt = `You are an AI assistant for a workforce scheduling application called FirstShift.
You help managers with scheduling, employee management, performance analysis, and answering questions about their workforce.

You have access to REAL data from the user's organization. Use this data to provide accurate, helpful responses.

IMPORTANT RULES:
- Only reference data from the provided context
- Never make up employee names or fake statistics
- If you don't have enough data to answer, say so
- Be concise and actionable
- Use bullet points and clear formatting
- Reference specific employees by their actual names from the data

Current Organization Data:
- Total Employees: ${totalEmployees}
- Recent Shifts (last 30 days): ${totalShifts}
- Upcoming Shifts (next 14 days): ${upcomingShiftsCount}
- Open Upcoming Shifts: ${openUpcomingShifts}
- Pending Time-Off Requests: ${pendingTimeOff}
- Completed Shifts: ${completedShifts}
- Cancelled Shifts: ${cancelledShifts}

Employees:
${contextData.employees.slice(0, 20).map((e: any) =>
  `- ${e.first_name} ${e.last_name} (${e.position || 'No position'})`
).join('\n')}
${contextData.employees.length > 20 ? `... and ${contextData.employees.length - 20} more employees` : ''}

Employee Hours (Last 30 days):
${employeeHours.slice(0, 10).map((e: any, i: number) =>
  `${i + 1}. ${e.name} (${e.position}): ${e.hours.toFixed(1)} hours across ${e.shiftCount} shifts`
).join('\n')}

Upcoming Schedule:
${contextData.upcomingShifts.slice(0, 15).map((s: any) => {
  const emp = contextData.employees.find((e: any) => e.id === s.employee_id);
  const empName = emp ? `${emp.first_name} ${emp.last_name}` : 'OPEN';
  return `- ${new Date(s.starts_at).toLocaleDateString()} ${new Date(s.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${empName} (${s.position || 'N/A'})`;
}).join('\n')}

Pending Time-Off:
${contextData.timeOffRequests.filter((r: any) => r.status === 'pending').slice(0, 10).map((r: any) => {
  const emp = contextData.employees.find((e: any) => e.id === r.employee_id);
  const empName = emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown';
  return `- ${empName}: ${new Date(r.starts_at).toLocaleDateString()} to ${new Date(r.ends_at).toLocaleDateString()} (${r.type})`;
}).join('\n') || 'None'}`;

  // Build conversation messages
  const messages: any[] = [
    { role: 'system', content: systemPrompt },
  ];

  // Add conversation history (limit to last 10 messages)
  const recentHistory = conversationHistory.slice(-10);
  messages.push(...recentHistory);

  // Add current user message
  messages.push({ role: 'user', content: userMessage });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.';
}
