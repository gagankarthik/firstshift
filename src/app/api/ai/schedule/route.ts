import { NextRequest, NextResponse } from 'next/server';
import { generateScheduleSuggestions, optimizeSchedule, analyzeCoverageGaps, type ScheduleData } from '@/lib/openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, scheduleData, prompt } = body;

    if (!scheduleData) {
      return NextResponse.json(
        { error: 'Schedule data is required' },
        { status: 400 }
      );
    }

    let result: string;

    switch (action) {
      case 'suggest':
        if (!prompt) {
          return NextResponse.json(
            { error: 'Prompt is required for suggestions' },
            { status: 400 }
          );
        }
        result = await generateScheduleSuggestions(scheduleData as ScheduleData, prompt);
        break;

      case 'optimize':
        result = await optimizeSchedule(scheduleData as ScheduleData);
        break;

      case 'analyze-coverage':
        result = await analyzeCoverageGaps(scheduleData as ScheduleData);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: suggest, optimize, or analyze-coverage' },
          { status: 400 }
        );
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('AI API Error:', error);

    // Handle OpenAI specific errors
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
