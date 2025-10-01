import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ReportData = {
  kpis: {
    totalHours: number;
    totalShifts: number;
    completedShifts: number;
    cancelledShifts: number;
    completionRate: number;
    cancellationRate: number;
    avgHoursPerShift: number;
    avgHoursPerEmployee: number;
    efficiency: number;
    approvedTimeOffDays: number;
    pendingTimeOffRequests: number;
  };
  employees: Array<{
    name: string;
    position: string;
    hours: number;
    shifts: number;
  }>;
  dateRange: {
    from: string;
    to: string;
  };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, reportData } = body as { action: string; reportData: ReportData };

    if (!reportData) {
      return NextResponse.json(
        { error: 'Report data is required' },
        { status: 400 }
      );
    }

    let result: string;

    switch (action) {
      case 'analyze':
        result = await generateReportAnalysis(reportData);
        break;

      case 'recommendations':
        result = await generateRecommendations(reportData);
        break;

      case 'insights':
        result = await generateInsights(reportData);
        break;

      case 'forecast':
        result = await generateForecast(reportData);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: analyze, recommendations, insights, or forecast' },
          { status: 400 }
        );
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('AI Reports API Error:', error);

    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key' },
        { status: 401 }
      );
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

async function generateReportAnalysis(data: ReportData): Promise<string> {
  const systemPrompt = `You are an expert workforce analytics consultant. Analyze workforce performance data and provide comprehensive insights.

Focus on:
1. Overall workforce efficiency and productivity
2. Key performance indicators (KPIs) analysis
3. Staffing patterns and utilization
4. Shift completion and cancellation trends
5. Employee workload distribution
6. Time management and scheduling effectiveness

Provide clear, actionable insights in a professional tone.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Analyze this workforce performance report:

Period: ${data.dateRange.from} to ${data.dateRange.to}

Key Metrics:
- Total Hours Worked: ${data.kpis.totalHours}
- Total Shifts: ${data.kpis.totalShifts} (${data.kpis.completedShifts} completed, ${data.kpis.cancelledShifts} cancelled)
- Completion Rate: ${data.kpis.completionRate}%
- Cancellation Rate: ${data.kpis.cancellationRate}%
- Efficiency: ${data.kpis.efficiency}%
- Average Hours per Shift: ${data.kpis.avgHoursPerShift}
- Average Hours per Employee: ${data.kpis.avgHoursPerEmployee}
- Approved Time Off: ${data.kpis.approvedTimeOffDays} days
- Pending Time Off Requests: ${data.kpis.pendingTimeOffRequests}

Top Performers:
${data.employees.slice(0, 5).map((e, i) => `${i + 1}. ${e.name} (${e.position}): ${e.hours} hours, ${e.shifts} shifts`).join('\n')}

Provide a comprehensive performance analysis with specific observations and insights.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content || 'Analysis could not be generated.';
}

async function generateRecommendations(data: ReportData): Promise<string> {
  const systemPrompt = `You are a workforce optimization specialist. Generate actionable recommendations to improve workforce performance, efficiency, and employee satisfaction.

Provide specific, prioritized recommendations in the following areas:
1. Scheduling optimization
2. Workload balancing
3. Efficiency improvements
4. Cost reduction opportunities
5. Employee engagement
6. Process improvements

Be specific and practical with your recommendations.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Based on this workforce data, provide prioritized recommendations:

Performance Metrics:
- Completion Rate: ${data.kpis.completionRate}%
- Cancellation Rate: ${data.kpis.cancellationRate}%
- Efficiency: ${data.kpis.efficiency}%
- Average Hours per Employee: ${data.kpis.avgHoursPerEmployee}
- Pending Time Off Requests: ${data.kpis.pendingTimeOffRequests}

Workforce Distribution:
- Total Employees: ${data.employees.length}
- Total Shifts: ${data.kpis.totalShifts}
- Average shifts per employee: ${(data.kpis.totalShifts / data.employees.length).toFixed(1)}

Identify the top 3-5 most impactful recommendations with clear action steps.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content || 'Recommendations could not be generated.';
}

async function generateInsights(data: ReportData): Promise<string> {
  const systemPrompt = `You are a data insights specialist. Extract meaningful patterns, trends, and hidden insights from workforce data.

Focus on:
1. Unusual patterns or anomalies
2. Efficiency opportunities
3. Risk factors
4. Staffing trends
5. Performance patterns
6. Potential bottlenecks

Provide insights that are surprising, actionable, and valuable.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Extract key insights from this workforce data:

Metrics:
- Total Hours: ${data.kpis.totalHours} over ${data.kpis.totalShifts} shifts
- Completion Rate: ${data.kpis.completionRate}%
- Cancellation Rate: ${data.kpis.cancellationRate}%
- Efficiency: ${data.kpis.efficiency}%
- Avg Hours/Employee: ${data.kpis.avgHoursPerEmployee}
- Avg Hours/Shift: ${data.kpis.avgHoursPerShift}

Employee Performance Variance:
${data.employees.slice(0, 3).map((e, i) => `Top ${i + 1}: ${e.hours} hours`).join(', ')}
${data.employees.length > 5 ? `Bottom: ${data.employees[data.employees.length - 1]?.hours || 0} hours` : ''}

Identify 3-5 key insights that reveal important patterns or opportunities.`,
      },
    ],
    temperature: 0.8,
    max_tokens: 800,
  });

  return response.choices[0]?.message?.content || 'Insights could not be generated.';
}

async function generateForecast(data: ReportData): Promise<string> {
  const systemPrompt = `You are a workforce planning and forecasting expert. Analyze historical data to predict future trends and staffing needs.

Focus on:
1. Future staffing requirements
2. Expected workload trends
3. Potential challenges
4. Resource allocation needs
5. Risk mitigation strategies
6. Growth planning

Provide practical forecasts with confidence levels.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Based on this historical performance data, provide workforce forecasts and projections:

Current Performance:
- Average Hours/Week: ${data.kpis.totalHours / Math.ceil((new Date(data.dateRange.to).getTime() - new Date(data.dateRange.from).getTime()) / (7 * 24 * 60 * 60 * 1000))}
- Average Shifts/Week: ${data.kpis.totalShifts / Math.ceil((new Date(data.dateRange.to).getTime() - new Date(data.dateRange.from).getTime()) / (7 * 24 * 60 * 60 * 1000))}
- Efficiency Rate: ${data.kpis.efficiency}%
- Cancellation Rate: ${data.kpis.cancellationRate}%
- Employees: ${data.employees.length}
- Avg Hours/Employee: ${data.kpis.avgHoursPerEmployee}

Predict:
1. Staffing needs for next 30-90 days
2. Expected workload trends
3. Potential bottlenecks or challenges
4. Recommendations for capacity planning`,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content || 'Forecast could not be generated.';
}
