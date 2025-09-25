import { Resend } from 'resend';
import { format, differenceInMinutes } from 'date-fns';

// Initialize Resend client only if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Email types
type Employee = {
  id: string;
  full_name: string;
  email?: string;
  avatar_url?: string | null;
};

type Shift = {
  id: string;
  starts_at: string;
  ends_at: string;
  break_minutes?: number | null;
  position?: { name: string; color?: string | null } | null;
  location?: { name: string } | null;
  status: string;
};

type SchedulePeriod = {
  name: string;
  start_date: string;
  end_date: string;
};

// Helper function to calculate shift duration
function getShiftDuration(startIso: string, endIso: string, breakMin?: number | null): string {
  const mins = differenceInMinutes(new Date(endIso), new Date(startIso));
  const netMins = Math.max(0, mins - (breakMin || 0));
  const hours = Math.floor(netMins / 60);
  const remainingMins = netMins % 60;

  if (hours === 0) return `${remainingMins}m`;
  if (remainingMins === 0) return `${hours}h`;
  return `${hours}h ${remainingMins}m`;
}

// Generate schedule email HTML template
function generateScheduleEmailHTML(
  employee: Employee,
  shifts: Shift[],
  period: SchedulePeriod,
  organizationName: string
): string {
  const totalShifts = shifts.length;
  const totalHours = shifts.reduce((acc, shift) => {
    const mins = differenceInMinutes(new Date(shift.ends_at), new Date(shift.starts_at));
    const netMins = Math.max(0, mins - (shift.break_minutes || 0));
    return acc + (netMins / 60);
  }, 0);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Schedule for ${period.name}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 2px solid #e5e7eb;
        }
        .logo {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          font-size: 24px;
          font-weight: bold;
        }
        .title {
          color: #1f2937;
          font-size: 28px;
          font-weight: bold;
          margin: 0 0 8px;
        }
        .subtitle {
          color: #6b7280;
          font-size: 16px;
          margin: 0;
        }
        .greeting {
          font-size: 18px;
          color: #374151;
          margin-bottom: 24px;
        }
        .summary {
          background: linear-gradient(135deg, #dbeafe, #e0e7ff);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 32px;
          border-left: 4px solid #3b82f6;
        }
        .summary-title {
          font-size: 16px;
          font-weight: 600;
          color: #1e40af;
          margin: 0 0 12px;
        }
        .summary-stats {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }
        .stat {
          text-align: center;
        }
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #1e40af;
          display: block;
        }
        .stat-label {
          font-size: 12px;
          color: #3730a3;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .shifts-section {
          margin-bottom: 32px;
        }
        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .shift-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
          background: #fafafa;
          transition: all 0.2s;
        }
        .shift-card:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }
        .shift-header {
          display: flex;
          justify-content: between;
          align-items: center;
          margin-bottom: 8px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .shift-date {
          font-weight: 600;
          color: #1f2937;
          font-size: 16px;
        }
        .shift-duration {
          background: #3b82f6;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          margin-left: auto;
        }
        .shift-time {
          font-size: 18px;
          font-weight: 500;
          color: #059669;
          margin-bottom: 4px;
        }
        .shift-details {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          font-size: 14px;
          color: #6b7280;
        }
        .shift-detail {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .position-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #6366f1;
        }
        .footer {
          text-align: center;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
        .footer-links {
          margin-top: 16px;
        }
        .footer-link {
          color: #3b82f6;
          text-decoration: none;
          margin: 0 12px;
        }
        .footer-link:hover {
          text-decoration: underline;
        }
        .no-shifts {
          text-align: center;
          padding: 40px 20px;
          color: #6b7280;
          background: #f9fafb;
          border-radius: 8px;
          border: 2px dashed #d1d5db;
        }
        @media (max-width: 600px) {
          body {
            padding: 12px;
          }
          .container {
            padding: 24px;
          }
          .title {
            font-size: 24px;
          }
          .summary-stats {
            justify-content: center;
          }
          .shift-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .shift-duration {
            margin-left: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">FS</div>
          <h1 class="title">${period.name}</h1>
          <p class="subtitle">${organizationName}</p>
        </div>

        <div class="greeting">
          Hi ${employee.full_name},
        </div>

        <div class="summary">
          <h3 class="summary-title">📅 Schedule Summary</h3>
          <div class="summary-stats">
            <div class="stat">
              <span class="stat-value">${totalShifts}</span>
              <span class="stat-label">Shifts</span>
            </div>
            <div class="stat">
              <span class="stat-value">${totalHours.toFixed(1)}</span>
              <span class="stat-label">Total Hours</span>
            </div>
            <div class="stat">
              <span class="stat-value">${format(new Date(period.start_date), 'MMM d')}</span>
              <span class="stat-label">Start Date</span>
            </div>
            <div class="stat">
              <span class="stat-value">${format(new Date(period.end_date), 'MMM d')}</span>
              <span class="stat-label">End Date</span>
            </div>
          </div>
        </div>

        <div class="shifts-section">
          <h2 class="section-title">
            🕐 Your Shifts
          </h2>

          ${shifts.length === 0 ? `
            <div class="no-shifts">
              <h3 style="margin: 0 0 8px; color: #374151;">No shifts scheduled</h3>
              <p style="margin: 0;">You don't have any shifts during this period. Contact your manager if you believe this is an error.</p>
            </div>
          ` : shifts.map(shift => `
            <div class="shift-card">
              <div class="shift-header">
                <div class="shift-date">${format(new Date(shift.starts_at), 'EEEE, MMMM d')}</div>
                <div class="shift-duration">${getShiftDuration(shift.starts_at, shift.ends_at, shift.break_minutes)}</div>
              </div>
              <div class="shift-time">
                ${format(new Date(shift.starts_at), 'h:mm a')} – ${format(new Date(shift.ends_at), 'h:mm a')}
              </div>
              <div class="shift-details">
                ${shift.position ? `
                  <div class="shift-detail">
                    <div class="position-dot" style="background: ${shift.position.color || '#6366f1'}"></div>
                    <span>${shift.position.name}</span>
                  </div>
                ` : ''}
                ${shift.location ? `
                  <div class="shift-detail">
                    <span>📍 ${shift.location.name}</span>
                  </div>
                ` : ''}
                ${shift.break_minutes ? `
                  <div class="shift-detail">
                    <span>☕ ${shift.break_minutes}m break</span>
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="footer">
          <p>This schedule was generated automatically by FirstShift.</p>
          <div class="footer-links">
            <a href="#" class="footer-link">View Full Schedule</a>
            <a href="#" class="footer-link">Request Time Off</a>
            <a href="#" class="footer-link">Update Availability</a>
          </div>
          <p style="margin-top: 16px; font-size: 12px;">
            Questions? Contact your manager or reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Generate plain text version
function generateScheduleEmailText(
  employee: Employee,
  shifts: Shift[],
  period: SchedulePeriod,
  organizationName: string
): string {
  const totalShifts = shifts.length;
  const totalHours = shifts.reduce((acc, shift) => {
    const mins = differenceInMinutes(new Date(shift.ends_at), new Date(shift.starts_at));
    const netMins = Math.max(0, mins - (shift.break_minutes || 0));
    return acc + (netMins / 60);
  }, 0);

  return `
${period.name} - ${organizationName}

Hi ${employee.full_name},

Here's your schedule for ${period.name}:

SUMMARY:
- ${totalShifts} shifts scheduled
- ${totalHours.toFixed(1)} total hours
- Period: ${format(new Date(period.start_date), 'MMM d')} - ${format(new Date(period.end_date), 'MMM d')}

YOUR SHIFTS:
${shifts.length === 0 ? 'No shifts scheduled for this period.' : shifts.map(shift => `
${format(new Date(shift.starts_at), 'EEEE, MMMM d')}
${format(new Date(shift.starts_at), 'h:mm a')} - ${format(new Date(shift.ends_at), 'h:mm a')} (${getShiftDuration(shift.starts_at, shift.ends_at, shift.break_minutes)})
${shift.position ? `Position: ${shift.position.name}` : ''}
${shift.location ? `Location: ${shift.location.name}` : ''}
${shift.break_minutes ? `Break: ${shift.break_minutes} minutes` : ''}
`).join('\n---\n')}

Questions? Contact your manager or reply to this email.

This message was sent automatically by FirstShift.
  `.trim();
}

// Main function to send schedule notifications
export async function sendScheduleNotifications(
  shifts: (Shift & { employee_id: string | null; employees?: Employee | null })[],
  employees: Employee[],
  period: SchedulePeriod,
  organizationName: string = 'Your Organization'
): Promise<{ success: boolean; sent: number; errors: string[] }> {
  if (!resend || !process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    return { success: false, sent: 0, errors: ['Email service not configured'] };
  }

  // Group shifts by employee
  const shiftsByEmployee = new Map<string, Shift[]>();
  const employeesWithShifts = new Set<string>();

  // Process shifts and group by employee
  shifts.forEach(shift => {
    if (shift.employee_id) {
      if (!shiftsByEmployee.has(shift.employee_id)) {
        shiftsByEmployee.set(shift.employee_id, []);
      }
      shiftsByEmployee.get(shift.employee_id)!.push(shift);
      employeesWithShifts.add(shift.employee_id);
    }
  });

  // Include employees with no shifts (they should get notification too)
  employees.forEach(employee => {
    if (!shiftsByEmployee.has(employee.id)) {
      shiftsByEmployee.set(employee.id, []);
    }
  });

  const results = await Promise.allSettled(
    Array.from(shiftsByEmployee.entries()).map(async ([employeeId, employeeShifts]) => {
      const employee = employees.find(emp => emp.id === employeeId);

      if (!employee?.email) {
        throw new Error(`No email found for employee ${employee?.full_name || employeeId}`);
      }

      const htmlContent = generateScheduleEmailHTML(employee, employeeShifts, period, organizationName);
      const textContent = generateScheduleEmailText(employee, employeeShifts, period, organizationName);

      return await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'FirstShift <noreply@firstshift.app>',
        to: employee.email,
        subject: `Your Schedule: ${period.name}`,
        html: htmlContent,
        text: textContent,
        headers: {
          'X-Entity-Ref-ID': `schedule-${period.name.replace(/\s+/g, '-').toLowerCase()}`,
        },
      });
    })
  );

  const errors: string[] = [];
  let sent = 0;

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      sent++;
      console.log(`Email sent successfully to ${Array.from(shiftsByEmployee.keys())[index]}`);
    } else {
      errors.push(result.reason.message || 'Unknown error');
      console.error(`Failed to send email:`, result.reason);
    }
  });

  return {
    success: errors.length === 0,
    sent,
    errors,
  };
}

// Function to send shift change notifications
export async function sendShiftChangeNotification(
  employee: Employee,
  oldShift: Shift | null,
  newShift: Shift | null,
  organizationName: string = 'Your Organization'
): Promise<{ success: boolean; error?: string }> {
  if (!resend || !process.env.RESEND_API_KEY || !employee.email) {
    return { success: false, error: 'Email service not configured or no employee email' };
  }

  let subject = '';
  let message = '';

  if (!oldShift && newShift) {
    // New shift added
    subject = 'New Shift Added to Your Schedule';
    message = `A new shift has been added to your schedule on ${format(new Date(newShift.starts_at), 'EEEE, MMMM d')} from ${format(new Date(newShift.starts_at), 'h:mm a')} to ${format(new Date(newShift.ends_at), 'h:mm a')}.`;
  } else if (oldShift && !newShift) {
    // Shift removed
    subject = 'Shift Removed from Your Schedule';
    message = `Your shift on ${format(new Date(oldShift.starts_at), 'EEEE, MMMM d')} from ${format(new Date(oldShift.starts_at), 'h:mm a')} to ${format(new Date(oldShift.ends_at), 'h:mm a')} has been removed.`;
  } else if (oldShift && newShift) {
    // Shift modified
    subject = 'Your Shift Has Been Updated';
    message = `Your shift on ${format(new Date(newShift.starts_at), 'EEEE, MMMM d')} has been updated. New time: ${format(new Date(newShift.starts_at), 'h:mm a')} to ${format(new Date(newShift.ends_at), 'h:mm a')}.`;
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'FirstShift <noreply@firstshift.app>',
      to: employee.email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">${subject}</h2>
          <p>Hi ${employee.full_name},</p>
          <p>${message}</p>
          <p>Please check your schedule for the latest updates.</p>
          <p>Best regards,<br>${organizationName}</p>
        </div>
      `,
      text: `Hi ${employee.full_name},\n\n${message}\n\nPlease check your schedule for the latest updates.\n\nBest regards,\n${organizationName}`,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send shift change notification:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Export types for use in other files
export type { Employee, Shift, SchedulePeriod };