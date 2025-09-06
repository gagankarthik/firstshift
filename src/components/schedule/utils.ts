// components/schedule/utils.ts
import { format, isBefore, isAfter } from "date-fns";
import type { Avail } from "./types";

// Constants
export const OPEN_EMP_ID = "OPEN";

// Utility functions
export const cx = (...xs: (string | false | null | undefined)[]) =>
  xs.filter(Boolean).join(" ");

export const overlaps = (aS: Date, aE: Date, bS: Date, bE: Date) =>
  isBefore(aS, bE) && isAfter(aE, bS);

export const preserveTime = (targetDate: Date, from: Date) => {
  const d = new Date(targetDate);
  d.setHours(
    from.getHours(),
    from.getMinutes(),
    from.getSeconds(),
    from.getMilliseconds()
  );
  return d;
};

export function withinAnyAvailability(
  r: Avail[],
  wd: number,
  start: Date,
  end: Date
) {
  const day = r.filter((x) => x.weekday === wd);
  if (!day.length) return false;
  const s = start.toTimeString().slice(0, 8);
  const e = end.toTimeString().slice(0, 8);
  return day.some((x) => x.start_time <= s && e <= x.end_time);
}

export const pickOne = <T,>(v: T | T[] | null | undefined): T | null =>
  Array.isArray(v) ? v[0] ?? null : v ?? null;

export const yyyyMmDd = (d: Date) => format(d, "yyyy-MM-dd");

export const toIso = (date: string, time: string) =>
  new Date(`${date}T${time}:00`).toISOString();

export const addHoursStr = (hhmm: string, hours: number) => {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n || "0", 10));
  const d = new Date(2000, 0, 1, h, m, 0);
  d.setHours(d.getHours() + hours);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

export const fmtShort = (d: string) => format(new Date(d), "MMM d");

export function minutesToHM(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h${m ? ` ${m}m` : ""}`;
}

// Date range helper
export function eachDayISO(startISO: string, endISO: string) {
  const out: string[] = [];
  let d = new Date(startISO + "T00:00:00");
  const end = new Date(endISO + "T00:00:00");
  while (d <= end) {
    out.push(yyyyMmDd(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

// Time formatting helpers
export function formatTime12Hour(time: string) {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export function formatTimeRange(start: string, end: string) {
  return `${formatTime12Hour(start)} - ${formatTime12Hour(end)}`;
}

// Validation helpers
export function isValidTimeRange(start: string, end: string) {
  const startTime = new Date(`2000-01-01T${start}:00`);
  const endTime = new Date(`2000-01-01T${end}:00`);
  return endTime > startTime;
}

export function calculateShiftDuration(start: string, end: string, breakMinutes: number = 0) {
  const startTime = new Date(`2000-01-01T${start}:00`);
  const endTime = new Date(`2000-01-01T${end}:00`);
  const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
  return Math.max(0, totalMinutes - breakMinutes);
}