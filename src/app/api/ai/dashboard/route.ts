import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { openai } from '@/lib/openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type DashboardData = {
  totalShifts: number;
  assignedShifts: number;
  openShifts: number;
  totalHours: number;
  coverageRate: number;
  activeEmployees: number;
  totalEmployees: number;
  utilizationRate: number;
  avgHoursPerShift: number;
  avgShiftsPerEmployee: number;
  hoursTrend: number;
  shiftsTrend: number;
  todayShiftsCount: number;
  upcomingShiftsCount: number;
  pendingTimeOffCount: number;
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
    const { action, dashboardData } = body as { action: string; dashboardData?: DashboardData };

    let result: string;

    switch (action) {
      case 'insights':
        if (!dashboardData) {
          return NextResponse.json({ error: 'Dashboard data is required' }, { status: 400 });
        }
        result = await generateDashboardInsights(dashboardData);
        break;

      case 'recommendations':
        if (!dashboardData) {
          return NextResponse.json({ error: 'Dashboard data is required' }, { status: 400 });
        }
        result = await generateRecommendations(dashboardData);
        break;

      case 'alerts':
        if (!dashboardData) {
          return NextResponse.json({ error: 'Dashboard data is required' }, { status: 400 });
        }
        result = await generateAlerts(dashboardData);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: insights, recommendations, or alerts' },
          { status: 400 }
        );
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('AI Dashboard API Error:', error);

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
      { error: error.message || 'Failed to process AI request' },
      { status: 500 }
    );
  }
}

async function generateDashboardInsights(data: DashboardData): Promise<string> {
  const systemPrompt = `You are an AI workforce analytics assistant. Provide brief, actionable insights for a scheduling dashboard.

Your response should be:
- Concise (2-3 bullet points max)
- Focused on the most important findings
- Actionable and specific
- Professional but friendly tone
- Use emojis sparingly for emphasis`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Analyze this week's scheduling data and provide key insights:

📊 Current Week Overview:
- Total Shifts: ${data.totalShifts}
- Assigned: ${data.assignedShifts} (${data.coverageRate}% coverage)
- Open Shifts: ${data.openShifts}
- Total Hours: ${data.totalHours}

👥 Team Metrics:
- Active Employees: ${data.activeEmployees} of ${data.totalEmployees} (${data.utilizationRate}% utilization)
- Avg Shifts/Employee: ${data.avgShiftsPerEmployee}
- Avg Hours/Shift: ${data.avgHoursPerShift}

📈 Trends (vs last week):
- Hours: ${data.hoursTrend > 0 ? '+' : ''}${data.hoursTrend}%
- Shifts: ${data.shiftsTrend > 0 ? '+' : ''}${data.shiftsTrend}%

⏰ Upcoming:
- Today's Shifts: ${data.todayShiftsCount}
- Upcoming Shifts: ${data.upcomingShiftsCount}
- Pending Time Off: ${data.pendingTimeOffCount}

Provide 2-3 key insights that would be most valuable to a manager.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 300,
  });

  return response.choices[0]?.message?.content || 'No insights available.';
}

async function generateRecommendations(data: DashboardData): Promise<string> {
  const systemPrompt = `You are an AI workforce optimization assistant. Provide brief, prioritized recommendations for a scheduling dashboard.

Your response should be:
- Concise (2-3 recommendations max)
- Prioritized by impact
- Actionable with clear next steps
- Professional tone
- Use emojis for visual clarity`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Based on this scheduling data, provide top recommendations:

Current Status:
- Coverage Rate: ${data.coverageRate}%
- Open Shifts: ${data.openShifts}
- Team Utilization: ${data.utilizationRate}%
- Avg Hours/Employee: ${(data.totalHours / data.totalEmployees).toFixed(1)}
- Pending Time Off: ${data.pendingTimeOffCount}

Trends:
- Hours trend: ${data.hoursTrend > 0 ? '+' : ''}${data.hoursTrend}%
- Shifts trend: ${data.shiftsTrend > 0 ? '+' : ''}${data.shiftsTrend}%

Provide 2-3 top priority recommendations to improve operations.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 300,
  });

  return response.choices[0]?.message?.content || 'No recommendations available.';
}

async function generateAlerts(data: DashboardData): Promise<string> {
  const systemPrompt = `You are an AI workforce monitoring assistant. Identify urgent issues or important alerts for a scheduling dashboard.

Your response should be:
- Brief (2-3 alerts max)
- Focus on urgent or time-sensitive issues
- Clear and direct
- Include severity level (🔴 Critical, 🟡 Warning, 🟢 Good)`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Identify any alerts or urgent issues:

Current Metrics:
- Coverage Rate: ${data.coverageRate}%
- Open Shifts: ${data.openShifts}
- Team Utilization: ${data.utilizationRate}%
- Today's Shifts: ${data.todayShiftsCount}
- Pending Time Off: ${data.pendingTimeOffCount}

Thresholds for concern:
- Coverage below 85% = Warning
- Coverage below 70% = Critical
- Open shifts > 5 = Warning
- Utilization below 50% = Warning
- Pending time off > 10 = Warning

Identify 1-3 most important alerts (if any). If everything looks good, provide a positive message.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 250,
  });

  return response.choices[0]?.message?.content || 'No alerts at this time.';
}
