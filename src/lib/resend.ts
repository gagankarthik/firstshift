import { Resend } from 'resend';

if (!process.env.RESEND_TOKEN) {
  throw new Error('RESEND_TOKEN environment variable is required');
}

export const resend = new Resend(process.env.RESEND_TOKEN);

// Default email settings
export const EMAIL_CONFIG = {
  from: 'FirstShift <noreply@firstshift.app>', // Replace with your verified domain
  replyTo: 'support@firstshift.app', // Replace with your support email
} as const;

// Email templates
export const EMAIL_TEMPLATES = {
  // Shift notifications
  SHIFT_ASSIGNED: {
    subject: 'New Shift Assigned - FirstShift',
    template: 'shift-assigned',
  },
  SHIFT_CANCELLED: {
    subject: 'Shift Cancelled - FirstShift',
    template: 'shift-cancelled',
  },
  SHIFT_REMINDER: {
    subject: 'Shift Reminder - FirstShift',
    template: 'shift-reminder',
  },

  // Schedule notifications
  SCHEDULE_PUBLISHED: {
    subject: 'New Schedule Published - FirstShift',
    template: 'schedule-published',
  },

  // Time off notifications
  TIME_OFF_APPROVED: {
    subject: 'Time Off Request Approved - FirstShift',
    template: 'time-off-approved',
  },
  TIME_OFF_DENIED: {
    subject: 'Time Off Request Denied - FirstShift',
    template: 'time-off-denied',
  },
  TIME_OFF_SUBMITTED: {
    subject: 'New Time Off Request - FirstShift',
    template: 'time-off-submitted',
  },

  // General notifications
  WELCOME: {
    subject: 'Welcome to FirstShift!',
    template: 'welcome',
  },
  PASSWORD_RESET: {
    subject: 'Reset Your Password - FirstShift',
    template: 'password-reset',
  },
} as const;

// Type definitions
export interface EmailData {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface ShiftEmailData {
  employeeName: string;
  employeeEmail: string;
  shiftDate: string;
  shiftTime: string;
  position?: string;
  location?: string;
  organization: string;
}

export interface TimeOffEmailData {
  employeeName: string;
  employeeEmail: string;
  startDate: string;
  endDate: string;
  type: string;
  reason?: string;
  organization: string;
  managerEmail?: string;
}