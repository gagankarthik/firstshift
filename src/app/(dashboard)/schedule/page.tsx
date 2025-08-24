// app/(dashboard)/schedule/page.tsx
"use client";

import * as React from "react";
import {
  DndContext, DragOverlay, PointerSensor, rectIntersection,
  useDroppable, useDraggable, useSensor, useSensors
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { addDays, startOfWeek, endOfWeek, format, isBefore, isAfter, compareAsc } from "date-fns";
import { createClient } from "@/lib/supabaseClient";
import { useOrg } from "@/components/providers/OrgProvider";
import { usePermissions } from "@/app/hooks/usePermissions";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarDays, Plus, Loader2, Trash2, Download, Eye } from "lucide-react";
import { toast } from "sonner";

/* ---------------- Types & helpers ---------------- */

type Role = "admin" | "manager" | "employee";
type Position = { id: string; name: string; color: string | null };
type Location = { id: string; name: string };
type Employee = { id: string; full_name: string; avatar_url: string | null; position?: Position | null };

type Shift = {
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

type Avail = { employee_id: string; weekday: number; start_time: string; end_time: string };

type TimeOff = { id: string; employee_id: string; starts_at: string; ends_at: string; type: "vacation" | "sick" | "unpaid" | "other" };

const OPEN_EMP_ID = "OPEN";

const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(" ");
const overlaps = (aS: Date, aE: Date, bS: Date, bE: Date) => isBefore(aS, bE) && isAfter(aE, bS);
const preserveTime = (targetDate: Date, from: Date) => {
  const d = new Date(targetDate);
  d.setHours(from.getHours(), from.getMinutes(), from.getSeconds(), from.getMilliseconds());
  return d;
};
function withinAnyAvailability(r: Avail[], wd: number, start: Date, end: Date) {
  const day = r.filter((x) => x.weekday === wd);
  if (!day.length) return false;
  const s = start.toTimeString().slice(0, 8);
  const e = end.toTimeString().slice(0, 8);
  return day.some((x) => x.start_time <= s && e <= x.end_time);
}
const pickOne = <T,>(v: T | T[] | null | undefined): T | null => (Array.isArray(v) ? v[0] ?? null : v ?? null);
const yyyyMmDd = (d: Date) => format(d, "yyyy-MM-dd");
const toIso = (date: string, time: string) => new Date(`${date}T${time}:00`).toISOString();
const addHoursStr = (hhmm: string, hours: number) => {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n || "0", 10));
  const d = new Date(2000, 0, 1, h, m, 0);
  d.setHours(d.getHours() + hours);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};
const fmtShort = (d: string) => format(new Date(d), "MMM d");

/* ---------------- Small UI blocks ---------------- */

function ShiftChip({ s, ghost = false, onDoubleClick }: { s: Shift; ghost?: boolean; onDoubleClick?: () => void }) {
  const st = new Date(s.starts_at), en = new Date(s.ends_at);
  return (
    <div
      onDoubleClick={onDoubleClick}
      className={cx(
        "rounded-md border bg-white px-3 py-2 shadow-sm",
        "cursor-grab active:cursor-grabbing select-none",
        "hover:shadow transition-shadow",
        ghost && "opacity-80"
      )}
      style={{ borderLeftWidth: 4, borderLeftColor: s.position?.color || "#94a3b8" }}
    >
      <div className="flex items-center justify-between text-sm">
        <div className="font-medium">{format(st, "HH:mm")} – {format(en, "HH:mm")}</div>
        <Badge variant="secondary" className="text-[10px] capitalize" title={s.position?.name ?? "Shift"}>
          {s.position?.name ?? "Shift"}
        </Badge>
      </div>
    </div>
  );
}

function DraggableShift({ s, disabled, onEdit }: { s: Shift; disabled: boolean; onEdit: () => void }) {
  const dnd = useDraggable({ id: s.id, disabled });
  const style: React.CSSProperties | undefined = dnd.transform
    ? { transform: `translate3d(${dnd.transform.x}px, ${dnd.transform.y}px, 0)` }
    : undefined;
  return (
    <div ref={dnd.setNodeRef} style={style} {...dnd.listeners} {...dnd.attributes} className={disabled ? "opacity-60" : ""}>
      <ShiftChip s={s} ghost={dnd.isDragging} onDoubleClick={onEdit} />
    </div>
  );
}

function DroppableCell({
  id, unavailable, timeOffLabel, children, onAdd,
}: { id: string; unavailable?: boolean; timeOffLabel?: string | null; children: React.ReactNode; onAdd?: () => void }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  const highlightClass = timeOffLabel
    ? "bg-rose-50 border-rose-200"
    : unavailable
    ? "bg-red-50/60"
    : "bg-white";

  return (
    <div
      ref={setNodeRef}
      onClick={(e) => { if (e.target === e.currentTarget) onAdd?.(); }}
      className={cx(
        "relative min-h-[92px] rounded-md border p-2 transition-colors",
        highlightClass,
        isOver && !timeOffLabel && "bg-teal-50/70"
      )}
    >
      {onAdd && (
        <button
          onClick={(e) => { e.stopPropagation(); onAdd(); }}
          className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-md border bg-white text-xs hover:bg-gray-50"
          aria-label="Add shift"
          title="Add shift"
        >
          +
        </button>
      )}
      {timeOffLabel && (
        <div className="mb-1 inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[11px] font-medium text-rose-700">
          • {timeOffLabel}
        </div>
      )}
      {children}
      {!timeOffLabel && unavailable && <div className="mt-1 text-[11px] text-red-600">No availability</div>}
    </div>
  );
}

/* ---------------- Override confirm ---------------- */

function useOverrideConfirm() {
  const [ask, setAsk] = React.useState<{ open: boolean; message: string; resolve?: (ok: boolean) => void }>({ open: false, message: "" });
  function request(message: string) { return new Promise<boolean>((resolve) => setAsk({ open: true, message, resolve })); }
  function onClose(ok: boolean) { ask.resolve?.(ok); setAsk({ open: false, message: "", resolve: undefined }); }
  const element = (
    <AlertDialog open={ask.open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Proceed anyway?</AlertDialogTitle>
          <AlertDialogDescription>{ask.message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onClose(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => onClose(true)}>Override</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
  return { request, element };
}

/* ---------------- Dialog model ---------------- */

type DialogMode = "create" | "edit";
function useShiftDialog() {
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<DialogMode>("create");
  const [shiftId, setShiftId] = React.useState<string | null>(null);

  const [employeeId, setEmployeeId] = React.useState<string>("none");
  const [date, setDate] = React.useState<string>(yyyyMmDd(new Date()));
  const [start, setStart] = React.useState<string>("08:00");
  const [end, setEnd] = React.useState<string>("16:00");
  const [positionId, setPositionId] = React.useState<string>("none");
  const [locationId, setLocationId] = React.useState<string>("none");
  const [breakMin, setBreakMin] = React.useState<string>("0");
  const [saving, setSaving] = React.useState(false);
  const [autoEnd, setAutoEnd] = React.useState(true);

  const reset = (d: Partial<{
    mode: DialogMode; shiftId: string | null; employeeId: string; date: string;
    start: string; end: string; positionId: string; locationId: string; breakMin: string;
  }> = {}) => {
    setMode(d.mode ?? "create");
    setShiftId(d.shiftId ?? null);
    setEmployeeId(d.employeeId ?? "none");
    setDate(d.date ?? yyyyMmDd(new Date()));
    setStart(d.start ?? "08:00");
    setEnd(d.end ?? "16:00");
    setPositionId(d.positionId ?? "none");
    setLocationId(d.locationId ?? "none");
    setBreakMin(d.breakMin ?? "0");
    setAutoEnd(true);
  };

  const onStartChange = (next: string) => { setStart(next); if (autoEnd) setEnd(addHoursStr(next, 8)); };

  return {
    state: { open, mode, shiftId, employeeId, date, start, end, positionId, locationId, breakMin, saving, autoEnd },
    setOpen, setMode, setShiftId,
    setEmployeeId, setDate, onStartChange, setEnd, setPositionId, setLocationId, setBreakMin, setSaving, setAutoEnd,
    reset,
  };
}

/* ---------------- Page ---------------- */

export default function SchedulePage() {
  const supabase = React.useMemo(() => createClient(), []);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const { orgId, role, loading } = useOrg();
  const perms = usePermissions(role as Role | null);

  const [weekStart, setWeekStart] = React.useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const weekDays = React.useMemo(() => [...Array(7)].map((_, i) => addDays(weekStart, i)), [weekStart]);

  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [positions, setPositions] = React.useState<Position[]>([]);
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [shifts, setShifts] = React.useState<Shift[]>([]);
  const [availability, setAvailability] = React.useState<Avail[]>([]);
  const [timeOff, setTimeOff] = React.useState<TimeOff[]>([]);
  const [q, setQ] = React.useState("");
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(true);

  // Export dialog / print
  const [exportOpen, setExportOpen] = React.useState(false);
  const [printMode, setPrintMode] = React.useState(false);

  const dlg = useShiftDialog();
  const overrideConfirm = useOverrideConfirm();

  const filteredEmployees = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle ? employees.filter((e) => e.full_name.toLowerCase().includes(needle)) : employees;
  }, [employees, q]);

  const shiftsByEmpDay = React.useMemo(() => {
    const map = new Map<string, Shift[]>();
    for (const s of shifts) {
      const empKey = s.employee_id ?? OPEN_EMP_ID;
      const key = `${empKey}_${format(new Date(s.starts_at), "yyyy-MM-dd")}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return map;
  }, [shifts]);

  const availabilityByEmp = React.useMemo(() => {
    const m = new Map<string, Avail[]>();
    for (const a of availability) {
      if (!m.has(a.employee_id)) m.set(a.employee_id, []);
      m.get(a.employee_id)!.push(a);
    }
    return m;
  }, [availability]);

  const timeOffByEmp = React.useMemo(() => {
    const m = new Map<string, TimeOff[]>();
    for (const t of timeOff) {
      if (!m.has(t.employee_id)) m.set(t.employee_id, []);
      m.get(t.employee_id)!.push(t);
    }
    return m;
  }, [timeOff]);

  function cellId(empId: string, day: Date) { return `cell:${empId}:${format(day, "yyyy-MM-dd")}`; }
  function findShift(id: string | null) { return shifts.find((s) => s.id === id) || null; }

  function timeOffLabelFor(empId: string, date: Date): string | null {
    const items = timeOffByEmp.get(empId);
    if (!items || !items.length) return null;
    const d = yyyyMmDd(date);
    for (const t of items) {
      if (t.starts_at <= d && d <= t.ends_at) return `Time off • ${t.type}`;
    }
    return null;
  }

  async function fetchData() {
    if (!orgId) return;
    setBusy(true);

    const weekStartStr = yyyyMmDd(startOfWeek(weekStart, { weekStartsOn: 1 }));
    const weekEndStr = yyyyMmDd(endOfWeek(weekStart, { weekStartsOn: 1 }));

    const [{ data: emps }, { data: pos }, { data: loc }] = await Promise.all([
      supabase.from("employees").select("id, full_name, avatar_url, positions:position_id(id,name,color)").eq("org_id", orgId).order("full_name"),
      supabase.from("positions").select("id,name,color").eq("org_id", orgId),
      supabase.from("locations").select("id,name").eq("org_id", orgId),
    ]);

    setEmployees((emps || []).map((e: any) => ({ id: e.id, full_name: e.full_name, avatar_url: e.avatar_url, position: pickOne<Position>(e.positions) })));
    setPositions((pos || []) as Position[]);
    setLocations((loc || []) as Location[]);

    const { data: s } = await supabase
      .from("shifts")
      .select("id, employee_id, position_id, location_id, starts_at, ends_at, break_minutes, status, positions:position_id(id,name,color)")
      .eq("org_id", orgId)
      .gte("starts_at", startOfWeek(weekStart, { weekStartsOn: 1 }).toISOString())
      .lt("starts_at", endOfWeek(weekStart, { weekStartsOn: 1 }).toISOString());

    setShifts((s || []).map((x: any) => ({
      id: x.id, employee_id: x.employee_id, position_id: x.position_id, location_id: x.location_id,
      starts_at: x.starts_at, ends_at: x.ends_at, break_minutes: x.break_minutes, status: x.status,
      position: pickOne<Position>(x.positions),
    })));

    const { data: av } = await supabase.from("availability").select("employee_id, weekday, start_time, end_time").eq("org_id", orgId);
    setAvailability((av || []) as Avail[]);

    const { data: to } = await supabase
      .from("time_off")
      .select("id, employee_id, starts_at, ends_at, type")
      .eq("org_id", orgId)
      .eq("status", "approved")
      .lte("starts_at", weekEndStr)
      .gte("ends_at", weekStartStr);
    setTimeOff((to || []) as TimeOff[]);

    setBusy(false);
  }

  React.useEffect(() => { void fetchData(); }, [orgId, weekStart]); // eslint-disable-line
  React.useEffect(() => {
    if (!orgId) return;
    const ch1 = supabase.channel(`shifts-${orgId}`).on("postgres_changes", { event: "*", schema: "public", table: "shifts", filter: `org_id=eq.${orgId}` }, fetchData).subscribe();
    const ch2 = supabase.channel(`availability-${orgId}`).on("postgres_changes", { event: "*", schema: "public", table: "availability", filter: `org_id=eq.${orgId}` }, fetchData).subscribe();
    const ch3 = supabase.channel(`timeoff-${orgId}`).on("postgres_changes", { event: "*", schema: "public", table: "time_off", filter: `org_id=eq.${orgId}` }, fetchData).subscribe();
    return () => { supabase.removeChannel(ch1); supabase.removeChannel(ch2); supabase.removeChannel(ch3); };
  }, [supabase, orgId]); // eslint-disable-line

  async function onDropToCell(shiftId: string, targetEmpIdRaw: string, targetDateISO: string) {
    if (!perms.canManageSchedule) return;
    const s = findShift(shiftId); if (!s) return;

    const start = new Date(s.starts_at), end = new Date(s.ends_at);
    const targetDate = new Date(targetDateISO);
    const newStart = preserveTime(targetDate, start);
    const newEnd = preserveTime(targetDate, end);
    const targetEmpId = targetEmpIdRaw === OPEN_EMP_ID ? null : targetEmpIdRaw;

    if (targetEmpId) {
      const key = `${targetEmpId}_${format(targetDate, "yyyy-MM-dd")}`;
      const sameDay = (shiftsByEmpDay.get(key) || []).filter((x) => x.id !== s.id);
      if (sameDay.some((x) => overlaps(newStart, newEnd, new Date(x.starts_at), new Date(x.ends_at)))) {
        toast.error("Overlap detected", { description: "Conflicts with another shift." });
        return;
      }

      const weekday = newStart.getDay();
      const ranges = availabilityByEmp.get(targetEmpId) || [];
      const isAvailable = withinAnyAvailability(ranges, weekday, newStart, newEnd);

      const offLabel = timeOffLabelFor(targetEmpId, targetDate);
      if (offLabel) {
        const ok = await overrideConfirm.request(`This employee has approved ${offLabel.toLowerCase()} on ${fmtShort(yyyyMmDd(targetDate))}. Override and schedule anyway?`);
        if (!ok) return;
      } else if (!isAvailable) {
        const ok = await overrideConfirm.request("This employee is marked unavailable at that time. Override?");
        if (!ok) return;
      }
    }

    const old = { ...s };
    setShifts((prev) =>
      prev.map((x) => (x.id === s.id ? { ...x, employee_id: targetEmpId, starts_at: newStart.toISOString(), ends_at: newEnd.toISOString() } : x))
    );

    const { error } = await supabase
      .from("shifts")
      .update({ employee_id: targetEmpId, starts_at: newStart.toISOString(), ends_at: newEnd.toISOString() })
      .eq("id", s.id);

    if (error) {
      setShifts((prev) => prev.map((x) => (x.id === old.id ? old : x)));
      toast.error("Failed to move shift", { description: error.message });
    }
  }

  /* ---------- create/edit helpers ---------- */

  function openCreateAtCell(empId: string, dateIso: string) {
    if (!perms.canManageSchedule) return;

    if (empId !== OPEN_EMP_ID) {
      const d = new Date(dateIso);
      const offLabel = timeOffLabelFor(empId, d);
      if (offLabel) {
        overrideConfirm.request(`This employee has approved ${offLabel.toLowerCase()} on ${fmtShort(dateIso)}. Create shift anyway?`)
          .then((ok) => {
            if (!ok) return;
            dlg.reset({ mode: "create", employeeId: empId === OPEN_EMP_ID ? "none" : empId, date: dateIso, start: "08:00", end: "16:00" });
            dlg.setOpen(true);
          });
        return;
      }
    }

    dlg.reset({ mode: "create", employeeId: empId === OPEN_EMP_ID ? "none" : empId, date: dateIso, start: "08:00", end: "16:00" });
    dlg.setOpen(true);
  }

  function openEditShift(s: Shift) {
    if (!perms.canManageSchedule) return;
    const d = yyyyMmDd(new Date(s.starts_at));
    dlg.reset({
      mode: "edit",
      shiftId: s.id,
      employeeId: s.employee_id ?? "none",
      date: d,
      start: format(new Date(s.starts_at), "HH:mm"),
      end: format(new Date(s.ends_at), "HH:mm"),
      positionId: s.position_id ?? "none",
      locationId: s.location_id ?? "none",
      breakMin: String(s.break_minutes || 0),
    });
    dlg.setOpen(true);
  }

  async function createShift() {
    if (!perms.canManageSchedule) return;
    const empId = dlg.state.employeeId === "none" ? null : dlg.state.employeeId;
    const posId = dlg.state.positionId === "none" ? null : dlg.state.positionId;
    const locId = dlg.state.locationId === "none" ? null : dlg.state.locationId;
    const startIso = toIso(dlg.state.date, dlg.state.start);
    const endIso = toIso(dlg.state.date, dlg.state.end);
    const dStart = new Date(startIso), dEnd = new Date(endIso);
    if (dEnd <= dStart) { toast.error("End must be after start"); return; }

    if (empId) {
      const key = `${empId}_${dlg.state.date}`;
      const sameDay = shiftsByEmpDay.get(key) || [];
      if (sameDay.some((x) => overlaps(dStart, dEnd, new Date(x.starts_at), new Date(x.ends_at)))) {
        toast.error("Overlap detected", { description: "Conflicts with another shift." });
        return;
      }
      const weekday = dStart.getDay();
      const ranges = availabilityByEmp.get(empId) || [];
      const isAvailable = withinAnyAvailability(ranges, weekday, dStart, dEnd);
      const offLabel = timeOffLabelFor(empId, new Date(dlg.state.date));

      if (offLabel) {
        const ok = await overrideConfirm.request(`This employee has approved ${offLabel.toLowerCase()} on ${fmtShort(dlg.state.date)}. Create shift anyway?`);
        if (!ok) return;
      } else if (!isAvailable) {
        const ok = await overrideConfirm.request("This employee is marked unavailable at that time. Create anyway?");
        if (!ok) return;
      }
    }

    dlg.setSaving(true);
    const { error } = await supabase.from("shifts").insert({
      org_id: orgId, employee_id: empId, position_id: posId, location_id: locId,
      starts_at: startIso, ends_at: endIso, break_minutes: Number.parseInt(dlg.state.breakMin || "0", 10) || 0,
      status: "scheduled",
    });
    dlg.setSaving(false);
    if (error) { toast.error("Failed to create shift", { description: error.message }); return; }
    toast.success("Shift created");
    dlg.setOpen(false);
    void fetchData();
  }

  async function updateShift() {
    if (!dlg.state.shiftId) return;
    const empId = dlg.state.employeeId === "none" ? null : dlg.state.employeeId;
    const posId = dlg.state.positionId === "none" ? null : dlg.state.positionId;
    const locId = dlg.state.locationId === "none" ? null : dlg.state.locationId;
    const startIso = toIso(dlg.state.date, dlg.state.start);
    const endIso = toIso(dlg.state.date, dlg.state.end);
    const dStart = new Date(startIso), dEnd = new Date(endIso);
    if (dEnd <= dStart) { toast.error("End must be after start"); return; }

    if (empId) {
      const key = `${empId}_${dlg.state.date}`;
      const sameDay = (shiftsByEmpDay.get(key) || []).filter((x) => x.id !== dlg.state.shiftId);
      if (sameDay.some((x) => overlaps(dStart, dEnd, new Date(x.starts_at), new Date(x.ends_at)))) {
        toast.error("Overlap detected", { description: "Conflicts with another shift." });
        return;
      }
      const weekday = dStart.getDay();
      const ranges = availabilityByEmp.get(empId) || [];
      const isAvailable = withinAnyAvailability(ranges, weekday, dStart, dEnd);
      const offLabel = timeOffLabelFor(empId, new Date(dlg.state.date));
      if (offLabel) {
        const ok = await overrideConfirm.request(`This employee has approved ${offLabel.toLowerCase()} on ${fmtShort(dlg.state.date)}. Save anyway?`);
        if (!ok) return;
      } else if (!isAvailable) {
        const ok = await overrideConfirm.request("This employee is marked unavailable at that time. Save anyway?");
        if (!ok) return;
      }
    }

    dlg.setSaving(true);
    const { error } = await supabase.from("shifts").update({
      employee_id: empId, position_id: posId, location_id: locId,
      starts_at: startIso, ends_at: endIso, break_minutes: Number.parseInt(dlg.state.breakMin || "0", 10) || 0,
    }).eq("id", dlg.state.shiftId);
    dlg.setSaving(false);
    if (error) { toast.error("Failed to update shift", { description: error.message }); return; }
    toast.success("Shift saved");
    dlg.setOpen(false);
    void fetchData();
  }

  async function deleteShift() {
    if (!dlg.state.shiftId) return;
    dlg.setSaving(true);
    const { error } = await supabase.from("shifts").delete().eq("id", dlg.state.shiftId);
    dlg.setSaving(false);
    if (error) { toast.error("Failed to delete shift", { description: error.message }); return; }
    toast.success("Shift deleted");
    dlg.setOpen(false);
    void fetchData();
  }

  const canManage = perms.canManageSchedule;

  // -------- Export helpers --------
  const empMap = React.useMemo(() => Object.fromEntries(employees.map(e => [e.id, e.full_name])), [employees]);
  const locMap = React.useMemo(() => Object.fromEntries(locations.map(l => [l.id, l.name])), [locations]);

  type RowOut = { date: string; employee: string; start: string; end: string; position: string; location: string; breakMin: number; status: string; };
  function collectRows(): RowOut[] {
    const rows: RowOut[] = [...shifts]
      .sort((a, b) => compareAsc(new Date(a.starts_at), new Date(b.starts_at)))
      .map(s => ({
        date: yyyyMmDd(new Date(s.starts_at)),
        employee: s.employee_id ? (empMap[s.employee_id] || "Unassigned") : "Unassigned",
        start: format(new Date(s.starts_at), "HH:mm"),
        end: format(new Date(s.ends_at), "HH:mm"),
        position: s.position?.name ?? "",
        location: s.location_id ? (locMap[s.location_id] || "") : "",
        breakMin: s.break_minutes || 0,
        status: s.status,
      }));
    return rows;
  }

  function downloadText(filename: string, text: string, mime = "text/plain;charset=utf-8") {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
  }

  function exportCSV() {
    const rows = collectRows();
    const headers = ["Date","Employee","Start","End","Position","Location","Break (min)","Status"];
    const esc = (v: any) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [headers.join(",")].concat(rows.map(r =>
      [r.date, r.employee, r.start, r.end, r.position, r.location, r.breakMin, r.status].map(esc).join(",")
    ));
    const name = `schedule_${format(weekDays[0], "yyyyMMdd")}-${format(weekDays[6], "yyyyMMdd")}.csv`;
    downloadText(name, lines.join("\n"), "text/csv;charset=utf-8");
  }

  const toICSDate = (d: Date) => {
    const z = new Date(d); // to UTC
    const y = z.getUTCFullYear();
    const m = String(z.getUTCMonth()+1).padStart(2,"0");
    const dd = String(z.getUTCDate()).padStart(2,"0");
    const hh = String(z.getUTCHours()).padStart(2,"0");
    const mm = String(z.getUTCMinutes()).padStart(2,"0");
    const ss = String(z.getUTCSeconds()).padStart(2,"0");
    return `${y}${m}${dd}T${hh}${mm}${ss}Z`;
  };

  function exportICS() {
    const lines: string[] = [];
    lines.push("BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//FirstShift//Schedule//EN");
    for (const s of [...shifts].sort((a,b)=>compareAsc(new Date(a.starts_at), new Date(b.starts_at)))) {
      const start = new Date(s.starts_at), end = new Date(s.ends_at);
      const employee = s.employee_id ? (empMap[s.employee_id] || "Unassigned") : "Unassigned";
      const summary = `${employee}${s.position?.name ? " • " + s.position.name : ""}`;
      const location = s.location_id ? (locMap[s.location_id] || "") : "";
      lines.push(
        "BEGIN:VEVENT",
        `UID:${s.id}@firstshift`,
        `DTSTAMP:${toICSDate(new Date())}`,
        `DTSTART:${toICSDate(start)}`,
        `DTEND:${toICSDate(end)}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:Break ${s.break_minutes || 0} min${location ? `\\nLocation: ${location}` : ""}`,
        location ? `LOCATION:${location}` : `LOCATION:`,
        "END:VEVENT"
      );
    }
    lines.push("END:VCALENDAR");
    const name = `schedule_${format(weekDays[0], "yyyyMMdd")}-${format(weekDays[6], "yyyyMMdd")}.ics`;
    downloadText(name, lines.join("\r\n"), "text/calendar;charset=utf-8");
  }

  function openPrintPreview() {
    setExportOpen(false);
    setPrintMode(true);
    // wait for DOM to render hidden section then print
    setTimeout(() => {
      window.print();
      window.addEventListener("afterprint", () => setPrintMode(false), { once: true });
    }, 200);
  }

  if (loading || !orgId) {
    return <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>;
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={() => setWeekStart(addDays(weekStart, -7))}>‹</Button>
        <Card className="flex items-center gap-2 px-3 py-2">
          <CalendarDays className="h-4 w-4" />
          <span className="text-sm">{format(weekDays[0], "d MMM")} – {format(weekDays[6], "d MMM")}</span>
        </Card>
        <Button variant="outline" onClick={() => setWeekStart(addDays(weekStart, +7))}>›</Button>
        <div className="ml-auto" />
        <Input placeholder="Search employee" className="w-[220px] bg-white" onChange={(e) => setQ(e.target.value)} />
        <Button variant="outline" className="gap-2" onClick={() => setExportOpen(true)}>
          <Eye className="h-4 w-4" /> View / Export
        </Button>
        {canManage && (
          <Button className="gap-2" onClick={() => { dlg.reset({}); dlg.setOpen(true); }}>
            <Plus className="h-4 w-4" /> New shift
          </Button>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
        <div className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded bg-rose-200 border border-rose-300" /> Approved time off</div>
        <div className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded bg-red-100 border border-red-200" /> No availability</div>
        <div className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded bg-teal-100 border border-teal-200" /> Drop target highlight</div>
      </div>

      {/* Grid (same as before) */}
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        modifiers={[restrictToWindowEdges]}
        onDragStart={(e) => setActiveId(String(e.active.id))}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={(e) => {
          setActiveId(null);
          if (!e.active || !e.over) return;
          const [, empId, dateStr] = String(e.over.id).split(":");
          if (empId && dateStr) void onDropToCell(String(e.active.id), empId, dateStr);
        }}
      >
        <div className="overflow-auto rounded-xl border bg-muted/30">
          <Table className="w-full text-sm">
            <TableHeader className="sticky top-0 z-[30] bg-white/95 backdrop-blur">
              <TableRow>
                <TableHead className="sticky left-0 z-[31] bg-white">Employee</TableHead>
                {weekDays.map((d) => (
                  <TableHead key={+d} className="text-center">
                    <div className="flex flex-col items-center">
                      <span>{format(d, "EEEE").split(" ")[0]}</span>
                      <span className="text-xs text-gray-400">{format(d, "dd.MM")}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* Open row */}
              <TableRow className="align-top">
                <TableCell className="sticky left-0 z-[20] bg-white font-medium text-gray-700">Open shifts</TableCell>
                {weekDays.map((day) => {
                  const key = `${OPEN_EMP_ID}_${format(day, "yyyy-MM-dd")}`;
                  const dayShifts = shiftsByEmpDay.get(key) || [];
                  const id = cellId(OPEN_EMP_ID, day);
                  return (
                    <TableCell key={id} className="p-2 align-top">
                      <DroppableCell id={id} onAdd={canManage ? () => openCreateAtCell(OPEN_EMP_ID, yyyyMmDd(day)) : undefined}>
                        <div className="space-y-2">
                          {dayShifts.map((s) => (
                            <DraggableShift key={s.id} s={s} disabled={!canManage} onEdit={() => openEditShift(s)} />
                          ))}
                        </div>
                      </DroppableCell>
                    </TableCell>
                  );
                })}
              </TableRow>

              {/* Employees */}
              {filteredEmployees.map((emp) => (
                <TableRow key={emp.id} className="align-top">
                  <TableCell className="sticky left-0 z-[10] bg-white p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 overflow-hidden rounded-full bg-gray-200">
                        {emp.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={emp.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div>
                        <div className="font-medium">{emp.full_name}</div>
                        {emp.position && <div className="text-xs text-gray-500">{emp.position.name}</div>}
                      </div>
                    </div>
                  </TableCell>

                  {weekDays.map((day) => {
                    const key = `${emp.id}_${format(day, "yyyy-MM-dd")}`;
                    const dayShifts = shiftsByEmpDay.get(key) || [];
                    const id = cellId(emp.id, day);
                    const weekday = day.getDay();
                    const ranges = availabilityByEmp.get(emp.id) || [];
                    const hasAnyRangeToday = ranges.some((r) => r.weekday === weekday);
                    const offLabel = timeOffLabelFor(emp.id, day);

                    return (
                      <TableCell key={id} className="p-2 align-top">
                        <DroppableCell
                          id={id}
                          unavailable={!hasAnyRangeToday}
                          timeOffLabel={offLabel}
                          onAdd={canManage ? () => openCreateAtCell(emp.id, yyyyMmDd(day)) : undefined}
                        >
                          <div className="space-y-2">
                            {dayShifts.map((s) => (
                              <DraggableShift key={s.id} s={s} disabled={!canManage} onEdit={() => openEditShift(s)} />
                            ))}
                          </div>
                        </DroppableCell>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}

              {!busy && filteredEmployees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="p-6 text-center text-sm text-gray-500">No employees found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DragOverlay>{activeId ? <ShiftChip s={findShift(activeId)!} ghost /> : null}</DragOverlay>
      </DndContext>

      {/* Create/Edit shift dialog (unchanged core) */}
      <Dialog open={dlg.state.open} onOpenChange={dlg.setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{dlg.state.mode === "create" ? "Create shift" : "Edit shift"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-sm font-medium">Employee</div>
                <Select value={dlg.state.employeeId} onValueChange={dlg.setEmployeeId}>
                  <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-sm font-medium">Date</div>
                <Input type="date" value={dlg.state.date} onChange={(e) => dlg.setDate(e.target.value)} className="bg-white" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-sm font-medium">Start</div>
                <Input type="time" value={dlg.state.start} onChange={(e) => dlg.onStartChange(e.target.value)} className="bg-white" />
                <div className="mt-1 text-[11px] text-gray-500">End auto-fills to +8h. You can change it.</div>
              </div>
              <div>
                <div className="text-sm font-medium">End</div>
                <Input type="time" value={dlg.state.end} onChange={(e) => { dlg.setEnd(e.target.value); dlg.setAutoEnd(false); }} className="bg-white" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-sm font-medium">Position</div>
                <Select value={dlg.state.positionId} onValueChange={dlg.setPositionId}>
                  <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {positions.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-sm font-medium">Location</div>
                <Select value={dlg.state.locationId} onValueChange={dlg.setLocationId}>
                  <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium">Break (minutes)</div>
              <Input type="number" min={0} value={dlg.state.breakMin} onChange={(e) => dlg.setBreakMin(e.target.value)} className="bg-white" />
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between gap-2">
            {dlg.state.mode === "edit" ? (
              <Button variant="destructive" onClick={deleteShift} disabled={dlg.state.saving} className="gap-2">
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            ) : <div />}

            <div className="ml-auto flex gap-2">
              <Button variant="outline" onClick={() => dlg.setOpen(false)}>Cancel</Button>
              {dlg.state.mode === "create" ? (
                <Button onClick={createShift} disabled={dlg.state.saving}>
                  {dlg.state.saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…</> : "Create"}
                </Button>
              ) : (
                <Button onClick={updateShift} disabled={dlg.state.saving}>
                  {dlg.state.saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : "Save"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share / Export dialog */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Share & Export — Week of {format(weekDays[0], "MMM d")} – {format(weekDays[6], "MMM d")}</DialogTitle>
          </DialogHeader>

          {/* Preview list (compact, good for a quick check) */}
          <div className="max-h-[50vh] overflow-auto rounded-lg border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collectRows().map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="whitespace-nowrap">{format(new Date(r.date), "EEE, MMM d")}</TableCell>
                    <TableCell className="whitespace-nowrap">{r.employee}</TableCell>
                    <TableCell className="whitespace-nowrap">{r.start}–{r.end}</TableCell>
                    <TableCell className="whitespace-nowrap">{r.position || "-"}</TableCell>
                    <TableCell className="whitespace-nowrap">{r.location || "-"}</TableCell>
                  </TableRow>
                ))}
                {shifts.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-sm text-slate-500">No shifts this week.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">Tip: Use “Print / Save as PDF” to share a nicely formatted copy.</div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="gap-2" onClick={openPrintPreview}><Eye className="h-4 w-4" /> Print / Save PDF</Button>
              <Button variant="outline" className="gap-2" onClick={exportCSV}><Download className="h-4 w-4" /> Download CSV</Button>
              <Button className="gap-2" onClick={exportICS}><Download className="h-4 w-4" /> Download ICS</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Printable, clean view (hidden until printing) */}
      <div id="printable" className={printMode ? "block" : "hidden"}>
        <div className="p-6">
          <div className="mb-4">
            <div className="text-xl font-semibold">Schedule — {format(weekDays[0], "MMM d")} – {format(weekDays[6], "MMM d, yyyy")}</div>
            <div className="text-sm text-slate-600">Generated from FirstShift</div>
          </div>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collectRows().map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{format(new Date(r.date), "EEE, MMM d")}</TableCell>
                    <TableCell>{r.employee}</TableCell>
                    <TableCell>{r.start}</TableCell>
                    <TableCell>{r.end}</TableCell>
                    <TableCell>{r.position || "-"}</TableCell>
                    <TableCell>{r.location || "-"}</TableCell>
                  </TableRow>
                ))}
                {shifts.length === 0 && (
                  <TableRow><TableCell colSpan={6}>No shifts this week.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Print CSS to only show #printable */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          #printable, #printable * { visibility: visible !important; }
          #printable { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      {/* Global override confirm */}
      {overrideConfirm.element}
    </div>
  );
}
