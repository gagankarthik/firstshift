// components/schedule/types.ts
export type Role = "admin" | "manager" | "employee";

export type Position = { 
  id: string; 
  name: string; 
  color: string | null; 
};

export type Location = { 
  id: string; 
  name: string; 
};

export type Employee = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  position?: Position | null;
};

export type Shift = {
  id: string;
  employee_id: string | null;
  position_id: string | null;
  location_id: string | null;
  starts_at: string;
  ends_at: string;
  break_minutes: number | null;
  status: "scheduled" | "published" | "completed" | "cancelled";
  position?: Position | null;
};

export type Avail = {
  employee_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
};

export type TimeOff = {
  id: string;
  employee_id: string;
  starts_at: string;
  ends_at: string;
  type: "vacation" | "sick" | "unpaid" | "other";
};

export const OPEN_EMP_ID = "OPEN";
