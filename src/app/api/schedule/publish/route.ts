import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseClient';
import { sendScheduleNotifications } from '@/lib/email';
import { format } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { periodName, startDate, endDate, orgId, userId } = body;

    if (!periodName || !startDate || !endDate || !orgId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Verify user has permission to publish schedules
    const { data: userCheck, error: userError } = await supabase
      .from('employees')
      .select('role')
      .eq('id', userId)
      .eq('org_id', orgId)
      .single();

    if (userError || !userCheck || !['admin', 'manager'].includes(userCheck.role)) {
      return NextResponse.json(
        { error: 'Unauthorized to publish schedules' },
        { status: 403 }
      );
    }

    // Get organization details
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', orgId)
      .single();

    if (orgError || !orgData) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Create schedule period record
    const { data: periodData, error: periodError } = await supabase
      .from('schedule_periods')
      .insert({
        org_id: orgId,
        name: periodName,
        start_date: startDate,
        end_date: endDate,
        status: 'published',
        created_by: userId,
        published_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (periodError || !periodData) {
      return NextResponse.json(
        { error: 'Failed to create schedule period' },
        { status: 500 }
      );
    }

    // Get all shifts for the period
    const { data: shifts, error: shiftsError } = await supabase
      .from('shifts')
      .select(`
        id, employee_id, starts_at, ends_at, break_minutes, status,
        positions:position_id(name, color),
        locations:location_id(name),
        employees:employee_id(id, full_name, email, avatar_url)
      `)
      .eq('org_id', orgId)
      .gte('starts_at', startDate)
      .lt('starts_at', endDate);

    if (shiftsError) {
      return NextResponse.json(
        { error: 'Failed to fetch shifts' },
        { status: 500 }
      );
    }

    // Get all employees in the organization
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('id, full_name, email, avatar_url')
      .eq('org_id', orgId)
      .not('email', 'is', null); // Only employees with email addresses

    if (employeesError) {
      return NextResponse.json(
        { error: 'Failed to fetch employees' },
        { status: 500 }
      );
    }

    // Update shifts status to published
    const shiftIds = shifts?.map(s => s.id) || [];
    if (shiftIds.length > 0) {
      const { error: updateError } = await supabase
        .from('shifts')
        .update({
          status: 'published',
          schedule_period_id: periodData.id
        })
        .in('id', shiftIds);

      if (updateError) {
        console.error('Failed to update shift statuses:', updateError);
      }
    }

    // Process shifts data for email
    const processedShifts = (shifts || []).map(shift => ({
      id: shift.id,
      employee_id: shift.employee_id,
      starts_at: shift.starts_at,
      ends_at: shift.ends_at,
      break_minutes: shift.break_minutes,
      status: shift.status,
      position: Array.isArray(shift.positions) ? shift.positions[0] : shift.positions,
      location: Array.isArray(shift.locations) ? shift.locations[0] : shift.locations,
      employees: Array.isArray(shift.employees) ? shift.employees[0] : shift.employees,
    }));

    // Send email notifications
    try {
      const emailResult = await sendScheduleNotifications(
        processedShifts,
        employees || [],
        {
          name: periodName,
          start_date: startDate,
          end_date: endDate,
        },
        orgData.name
      );

      if (!emailResult.success) {
        console.error('Email notifications failed:', emailResult.errors);
        // Don't fail the entire request if emails fail
      }

      return NextResponse.json({
        success: true,
        message: 'Schedule published successfully',
        periodId: periodData.id,
        emailsSent: emailResult.sent,
        emailErrors: emailResult.errors,
      });

    } catch (emailError) {
      console.error('Email service error:', emailError);

      // Schedule was published successfully, but emails failed
      return NextResponse.json({
        success: true,
        message: 'Schedule published successfully, but email notifications failed',
        periodId: periodData.id,
        emailsSent: 0,
        emailError: emailError instanceof Error ? emailError.message : 'Unknown email error',
      });
    }

  } catch (error) {
    console.error('Error publishing schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get published schedule periods
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data: periods, error } = await supabase
      .from('schedule_periods')
      .select(`
        id, name, start_date, end_date, status, published_at, created_at,
        created_by_employee:created_by(full_name)
      `)
      .eq('org_id', orgId)
      .order('published_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch schedule periods' },
        { status: 500 }
      );
    }

    return NextResponse.json({ periods: periods || [] });

  } catch (error) {
    console.error('Error fetching schedule periods:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}