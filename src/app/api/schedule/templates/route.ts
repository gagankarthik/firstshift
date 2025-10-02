import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ShiftPattern = {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  position_id?: string;
  position_name?: string;
  location_id?: string;
  location_name?: string;
  frequency: number;
  duration_hours: number;
};

export async function GET(request: NextRequest) {
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
    const { data: activeOrgData, error: orgError } = await supabase.rpc('active_org_id');

    if (orgError || !activeOrgData) {
      return NextResponse.json(
        { error: 'No active organization found' },
        { status: 400 }
      );
    }

    const orgId = activeOrgData;

    // Fetch all shifts from the last 90 days for pattern analysis
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: shifts, error: shiftsError } = await supabase
      .from('shifts')
      .select(`
        id,
        starts_at,
        ends_at,
        break_minutes,
        position_id,
        location_id,
        positions:position_id(id, name),
        locations:location_id(id, name)
      `)
      .eq('org_id', orgId)
      .gte('starts_at', ninetyDaysAgo.toISOString())
      .not('status', 'eq', 'cancelled');

    if (shiftsError) {
      console.error('Error fetching shifts:', shiftsError);
      return NextResponse.json({ error: shiftsError.message }, { status: 500 });
    }

    // Analyze shift patterns
    const patterns = analyzeShiftPatterns(shifts || []);

    return NextResponse.json({ templates: patterns });
  } catch (error: any) {
    console.error('Templates API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch shift templates' },
      { status: 500 }
    );
  }
}

function analyzeShiftPatterns(shifts: any[]): ShiftPattern[] {
  // Group shifts by time pattern
  const patternMap = new Map<string, {
    count: number;
    start_time: string;
    end_time: string;
    break_minutes: number;
    position_id?: string;
    position_name?: string;
    location_id?: string;
    location_name?: string;
    duration_hours: number;
  }>();

  shifts.forEach((shift) => {
    const startDate = new Date(shift.starts_at);
    const endDate = new Date(shift.ends_at);

    // Extract time in HH:MM format
    const startTime = startDate.toTimeString().slice(0, 5);
    const endTime = endDate.toTimeString().slice(0, 5);
    const breakMinutes = shift.break_minutes || 0;

    // Calculate duration
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationHours = parseFloat((durationMs / (1000 * 60 * 60)).toFixed(1));

    // Create pattern key: start-end-break-position-location
    const positionId = shift.position_id || 'none';
    const locationId = shift.location_id || 'none';
    const patternKey = `${startTime}-${endTime}-${breakMinutes}-${positionId}-${locationId}`;

    if (patternMap.has(patternKey)) {
      const existing = patternMap.get(patternKey)!;
      existing.count++;
    } else {
      patternMap.set(patternKey, {
        count: 1,
        start_time: startTime,
        end_time: endTime,
        break_minutes: breakMinutes,
        position_id: shift.position_id,
        position_name: shift.positions?.name,
        location_id: shift.location_id,
        location_name: shift.locations?.name,
        duration_hours: durationHours,
      });
    }
  });

  // Convert to array and sort by frequency
  const patterns = Array.from(patternMap.entries())
    .map(([key, value]) => ({
      id: key,
      name: generatePatternName(value),
      start_time: value.start_time,
      end_time: value.end_time,
      break_minutes: value.break_minutes,
      position_id: value.position_id,
      position_name: value.position_name,
      location_id: value.location_id,
      location_name: value.location_name,
      frequency: value.count,
      duration_hours: value.duration_hours,
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 12); // Return top 12 most frequent patterns

  return patterns;
}

function generatePatternName(pattern: {
  start_time: string;
  end_time: string;
  break_minutes: number;
  position_name?: string;
  location_name?: string;
  duration_hours: number;
}): string {
  // Convert 24h to 12h format
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}${minutes > 0 ? ':' + minutes.toString().padStart(2, '0') : ''}${period}`;
  };

  const start = formatTime(pattern.start_time);
  const end = formatTime(pattern.end_time);
  const duration = `${pattern.duration_hours}h`;

  let name = `${start}-${end} (${duration})`;

  // Add position if available
  if (pattern.position_name) {
    name += ` - ${pattern.position_name}`;
  }

  // Add location if available
  if (pattern.location_name) {
    name += ` @ ${pattern.location_name}`;
  }

  // Add break info if significant
  if (pattern.break_minutes >= 30) {
    name += ` [${pattern.break_minutes}m break]`;
  }

  return name;
}
