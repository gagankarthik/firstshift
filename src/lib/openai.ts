import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type ScheduleData = {
  employees: Array<{
    id: string;
    name: string;
    position?: string;
    availability: Array<{
      weekday: number;
      start_time: string;
      end_time: string;
    }>;
    timeOff: Array<{
      starts_at: string;
      ends_at: string;
      type: string;
    }>;
  }>;
  shifts: Array<{
    id: string;
    employee_id: string | null;
    position?: string;
    location?: string;
    starts_at: string;
    ends_at: string;
    status: string;
  }>;
  dateRange: {
    start: string;
    end: string;
  };
};

export async function generateScheduleSuggestions(
  scheduleData: ScheduleData,
  userPrompt: string
) {
  const systemPrompt = `You are an AI assistant specialized in employee scheduling and workforce optimization.
You help managers create efficient, fair, and compliant work schedules.

Analyze the provided schedule data and user request to provide actionable suggestions.

Key considerations:
- Employee availability and time-off requests
- Fair distribution of shifts
- Avoiding scheduling conflicts
- Meeting coverage requirements
- Respecting break times and labor regulations
- Position and location assignments

Provide clear, specific recommendations that can be implemented.`;

  const dataContext = `
Current Schedule Data:
- Date Range: ${scheduleData.dateRange.start} to ${scheduleData.dateRange.end}
- Total Employees: ${scheduleData.employees.length}
- Total Shifts: ${scheduleData.shifts.length}
- Open Shifts: ${scheduleData.shifts.filter(s => !s.employee_id).length}

Employees:
${scheduleData.employees.map(emp => `
  - ${emp.name} (${emp.position || 'No position'})
    Availability: ${emp.availability.length > 0 ? emp.availability.map(a =>
      `Day ${a.weekday}: ${a.start_time}-${a.end_time}`
    ).join(', ') : 'Not set'}
    Time Off: ${emp.timeOff.length > 0 ? emp.timeOff.map(t =>
      `${t.starts_at} to ${t.ends_at} (${t.type})`
    ).join(', ') : 'None'}
`).join('\n')}

Current Shifts:
${scheduleData.shifts.slice(0, 20).map(shift => `
  - ${shift.starts_at} to ${shift.ends_at}
    Employee: ${shift.employee_id || 'OPEN'}
    Position: ${shift.position || 'N/A'}
    Location: ${shift.location || 'N/A'}
    Status: ${shift.status}
`).join('\n')}
${scheduleData.shifts.length > 20 ? `\n... and ${scheduleData.shifts.length - 20} more shifts` : ''}
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `${dataContext}\n\nUser Request: ${userPrompt}` },
    ],
    temperature: 0.7,
    max_tokens: 1500,
  });

  return response.choices[0]?.message?.content || 'No suggestions generated.';
}

export async function optimizeSchedule(scheduleData: ScheduleData) {
  const systemPrompt = `You are an AI scheduling optimizer. Analyze the schedule and provide specific optimization recommendations.

Focus on:
1. Filling open shifts with qualified available employees
2. Identifying overscheduled or underscheduled employees
3. Suggesting shift swaps to improve work-life balance
4. Detecting potential conflicts or issues
5. Recommending coverage improvements

Provide actionable suggestions in a clear, numbered format.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: JSON.stringify({
          employees: scheduleData.employees.map(e => ({
            id: e.id,
            name: e.name,
            position: e.position,
            availabilityCount: e.availability.length,
            timeOffCount: e.timeOff.length,
          })),
          totalShifts: scheduleData.shifts.length,
          openShifts: scheduleData.shifts.filter(s => !s.employee_id).length,
          assignedShifts: scheduleData.shifts.filter(s => s.employee_id).length,
          shiftsPerEmployee: scheduleData.employees.map(e => ({
            name: e.name,
            count: scheduleData.shifts.filter(s => s.employee_id === e.id).length,
          })),
        }, null, 2)
      },
    ],
    temperature: 0.7,
    max_tokens: 1500,
  });

  return response.choices[0]?.message?.content || 'No optimization suggestions available.';
}

export async function generateShiftDescription(
  shift: {
    position?: string;
    location?: string;
    starts_at: string;
    ends_at: string;
    break_minutes?: number;
  },
  employeeName?: string
) {
  const prompt = `Generate a brief, professional description for a work shift with these details:
- ${employeeName ? `Employee: ${employeeName}` : 'Open position'}
- Position: ${shift.position || 'Not specified'}
- Location: ${shift.location || 'Not specified'}
- Time: ${shift.starts_at} to ${shift.ends_at}
- Break: ${shift.break_minutes || 0} minutes

Keep it under 50 words, focus on key responsibilities or notes.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    max_tokens: 100,
  });

  return response.choices[0]?.message?.content || '';
}

export async function analyzeCoverageGaps(scheduleData: ScheduleData) {
  const systemPrompt = `You are a workforce coverage analyzer. Identify gaps in schedule coverage and recommend solutions.

Analyze:
- Time periods with insufficient coverage
- Days with too many or too few employees
- Position-specific coverage issues
- Location coverage balance

Provide specific recommendations with time ranges and suggested actions.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Analyze coverage for this schedule:\n${JSON.stringify({
          dateRange: scheduleData.dateRange,
          totalEmployees: scheduleData.employees.length,
          shifts: scheduleData.shifts.map(s => ({
            day: new Date(s.starts_at).toLocaleDateString(),
            time: `${new Date(s.starts_at).toLocaleTimeString()} - ${new Date(s.ends_at).toLocaleTimeString()}`,
            assigned: !!s.employee_id,
            position: s.position,
            location: s.location,
          })),
        }, null, 2)}`
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content || 'Unable to analyze coverage gaps.';
}
