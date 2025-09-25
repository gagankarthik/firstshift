// app/(dashboard)/schedule/page.tsx
"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import {
  addDays,
  startOfWeek,
  endOfWeek,
  format,
  compareAsc,
  differenceInMinutes,
} from "date-fns";
import { createClient } from "@/lib/supabaseClient";
import { useOrg } from "@/components/providers/OrgProvider";
import { usePermissions } from "@/app/hooks/usePermissions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Plus,
  Eye,
  Download,
  ChevronDown,
  FileText,
  Printer,
  Filter,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

// Import our modular components
import { ShiftChip } from "@/components/schedule/ShiftChip";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";
import { ScheduleViewDialog } from "@/components/schedule/ScheduleViewDialog";
import { ShiftDialog } from "@/components/schedule/ShiftDialog";
import { ExportDialog } from "@/components/schedule/ExportDialog";
import { useOverrideConfirm } from "@/components/schedule/hooks/useOverrideConfirm";
import { useShiftDialog } from "@/components/schedule/hooks/useShiftDialog";

// Import types and utils
import type { 
  Role, 
  Employee, 
  Position, 
  Location, 
  Shift, 
  Avail, 
  TimeOff 
} from "@/components/schedule/types";
import {
  OPEN_EMP_ID,
  overlaps,
  preserveTime,
  withinAnyAvailability,
  pickOne,
  yyyyMmDd,
  toIso,
  toIsoWithOvernightHandling,
  fmtShort,
} from "@/components/schedule/utils";

export default function SchedulePage() {
  const supabase = React.useMemo(() => createClient(), []);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );
  const { orgId, role, loading } = useOrg();
  const perms = usePermissions(role as Role | null);

  // Week navigation state
  const [weekStart, setWeekStart] = React.useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const weekDays = React.useMemo(
    () => [...Array(7)].map((_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  // Data state
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [positions, setPositions] = React.useState<Position[]>([]);
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [shifts, setShifts] = React.useState<Shift[]>([]);
  const [availability, setAvailability] = React.useState<Avail[]>([]);
  const [timeOff, setTimeOff] = React.useState<TimeOff[]>([]);
  
  // UI state
  const [q, setQ] = React.useState("");
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(true);

  // Dialog states
  const [viewOpen, setViewOpen] = React.useState(false);
  const [exportOpen, setExportOpen] = React.useState(false);
  const [printMode, setPrintMode] = React.useState(false);

  // Export range state
  const [exportStart, setExportStart] = React.useState(yyyyMmDd(weekDays[0] || new Date()));
  const [exportEnd, setExportEnd] = React.useState(yyyyMmDd(weekDays[6] || new Date()));

  // Custom hooks
  const dlg = useShiftDialog();
  const overrideConfirm = useOverrideConfirm();

  // Computed state
  const filteredEmployees = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle
      ? employees.filter((e) => e.full_name.toLowerCase().includes(needle))
      : employees;
  }, [employees, q]);

  const shiftsByEmpDay = React.useMemo(() => {
    const map = new Map<string, Shift[]>();
    for (const s of shifts) {
      const empKey = s.employee_id ?? OPEN_EMP_ID;
      const key = `${empKey}_${format(new Date(s.starts_at), "yyyy-MM-dd")}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    for (const [k, arr] of map) {
      arr.sort((a, b) =>
        compareAsc(new Date(a.starts_at), new Date(b.starts_at))
      );
      map.set(k, arr);
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

  // Helper functions
  function findShift(id: string | null) {
    return shifts.find((s) => s.id === id) || null;
  }

  function timeOffLabelFor(empId: string, date: Date): string | null {
    const items = timeOffByEmp.get(empId);
    if (!items || !items.length) return null;
    const d = yyyyMmDd(date);
    for (const t of items) {
      if (t.starts_at <= d && d <= t.ends_at) return `Time off • ${t.type}`;
    }
    return null;
  }

  // Update export dates when week changes
  React.useEffect(() => {
    if (weekDays.length > 0) {
      setExportStart(yyyyMmDd(weekDays[0]));
      setExportEnd(yyyyMmDd(weekDays[6]));
    }
  }, [weekDays]);

  // Data fetching
  async function fetchData() {
    if (!orgId) return;
    setBusy(true);

    const weekStartStr = yyyyMmDd(startOfWeek(weekStart, { weekStartsOn: 1 }));
    const weekEndStr = yyyyMmDd(endOfWeek(weekStart, { weekStartsOn: 1 }));

    try {
      // Fetch employees, positions, and locations in parallel
      const [{ data: emps }, { data: pos }, { data: loc }] = await Promise.all([
        supabase
          .from("employees")
          .select(
            "id, full_name, avatar_url, positions:position_id(id,name,color)"
          )
          .eq("org_id", orgId)
          .order("full_name"),
        supabase.from("positions").select("id,name,color").eq("org_id", orgId),
        supabase.from("locations").select("id,name").eq("org_id", orgId),
      ]);

      // Process employees data
      setEmployees(
        (emps || []).map((e: any) => ({
          id: e.id,
          full_name: e.full_name,
          avatar_url: e.avatar_url,
          position: pickOne<Position>(e.positions),
        }))
      );
      setPositions((pos || []) as Position[]);
      setLocations((loc || []) as Location[]);

      // Fetch shifts for the current week
      const { data: s } = await supabase
        .from("shifts")
        .select(
          "id, employee_id, position_id, location_id, starts_at, ends_at, break_minutes, status, positions:position_id(id,name,color)"
        )
        .eq("org_id", orgId)
        .gte(
          "starts_at",
          startOfWeek(weekStart, { weekStartsOn: 1 }).toISOString()
        )
        .lt("starts_at", endOfWeek(weekStart, { weekStartsOn: 1 }).toISOString());

      // Process shifts data
      setShifts(
        (s || []).map((x: any) => ({
          id: x.id,
          employee_id: x.employee_id,
          position_id: x.position_id,
          location_id: x.location_id,
          starts_at: x.starts_at,
          ends_at: x.ends_at,
          break_minutes: x.break_minutes,
          status: x.status,
          position: pickOne<Position>(x.positions),
        }))
      );

      // Fetch availability and time off
      const [{ data: av }, { data: to }] = await Promise.all([
        supabase
          .from("availability")
          .select("employee_id, weekday, start_time, end_time")
          .eq("org_id", orgId),
        supabase
          .from("time_off")
          .select("id, employee_id, starts_at, ends_at, type")
          .eq("org_id", orgId)
          .eq("status", "approved")
          .lte("starts_at", weekEndStr)
          .gte("ends_at", weekStartStr),
      ]);

      setAvailability((av || []) as Avail[]);
      setTimeOff((to || []) as TimeOff[]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load schedule data");
    } finally {
      setBusy(false);
    }
  }

  // Fetch data when orgId or week changes
  React.useEffect(() => {
    void fetchData();
  }, [orgId, weekStart]); // eslint-disable-line

  // Real-time subscriptions
  React.useEffect(() => {
    if (!orgId) return;
    
    const ch1 = supabase
      .channel(`shifts-${orgId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shifts", filter: `org_id=eq.${orgId}` },
        fetchData
      )
      .subscribe();
    
    const ch2 = supabase
      .channel(`availability-${orgId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "availability",
          filter: `org_id=eq.${orgId}`,
        },
        fetchData
      )
      .subscribe();
    
    const ch3 = supabase
      .channel(`timeoff-${orgId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "time_off", filter: `org_id=eq.${orgId}` },
        fetchData
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(ch1);
      supabase.removeChannel(ch2);
      supabase.removeChannel(ch3);
    };
  }, [supabase, orgId]); // eslint-disable-line

  // Drag and drop handler
  async function onDropToCell(
    shiftId: string,
    targetEmpIdRaw: string,
    targetDateISO: string
  ) {
    if (!perms.canManageSchedule) return;
    const s = findShift(shiftId);
    if (!s) return;

    const start = new Date(s.starts_at),
      end = new Date(s.ends_at);
    const targetDate = new Date(targetDateISO);
    const newStart = preserveTime(targetDate, start);
    const newEnd = preserveTime(targetDate, end);
    const targetEmpId = targetEmpIdRaw === OPEN_EMP_ID ? null : targetEmpIdRaw;

    // Check for conflicts if assigning to an employee
    if (targetEmpId) {
      const key = `${targetEmpId}_${format(targetDate, "yyyy-MM-dd")}`;
      const sameDay = (shiftsByEmpDay.get(key) || []).filter((x) => x.id !== s.id);
      
      // Check for overlapping shifts
      if (
        sameDay.some((x) =>
          overlaps(
            newStart,
            newEnd,
            new Date(x.starts_at),
            new Date(x.ends_at)
          )
        )
      ) {
        toast.error("Overlap detected", {
          description: "Conflicts with another shift.",
        });
        return;
      }

      // Check availability
      const weekday = newStart.getDay();
      const ranges = availabilityByEmp.get(targetEmpId) || [];
      const isAvailable = withinAnyAvailability(
        ranges,
        weekday,
        newStart,
        newEnd
      );

      // Check for time off
      const offLabel = timeOffLabelFor(targetEmpId, targetDate);
      if (offLabel) {
        const ok = await overrideConfirm.request(
          `This employee has approved ${offLabel.toLowerCase()} on ${fmtShort(
            yyyyMmDd(targetDate)
          )}. Override and schedule anyway?`
        );
        if (!ok) return;
      } else if (!isAvailable) {
        const ok = await overrideConfirm.request(
          "This employee is marked unavailable at that time. Override?"
        );
        if (!ok) return;
      }
    }

    // Optimistic update
    const old = { ...s };
    setShifts((prev) =>
      prev.map((x) =>
        x.id === s.id
          ? {
              ...x,
              employee_id: targetEmpId,
              starts_at: newStart.toISOString(),
              ends_at: newEnd.toISOString(),
            }
          : x
      )
    );

    // Update in database
    const { error } = await supabase
      .from("shifts")
      .update({
        employee_id: targetEmpId,
        starts_at: newStart.toISOString(),
        ends_at: newEnd.toISOString(),
      })
      .eq("id", s.id);

    // Rollback on error
    if (error) {
      setShifts((prev) => prev.map((x) => (x.id === old.id ? old : x)));
      toast.error("Failed to move shift", { description: error.message });
    }
  }

  // Shift creation handler
  function openCreateAtCell(empId: string, dateIso: string) {
    if (!perms.canManageSchedule) return;

    // Check for time off before opening dialog
    if (empId !== OPEN_EMP_ID) {
      const d = new Date(dateIso);
      const offLabel = timeOffLabelFor(empId, d);
      if (offLabel) {
        overrideConfirm
          .request(
            `This employee has approved ${offLabel.toLowerCase()} on ${fmtShort(
              dateIso
            )}. Create shift anyway?`
          )
          .then((ok: any) => {
            if (!ok) return;
            dlg.reset({
              mode: "create",
              employeeId: empId === OPEN_EMP_ID ? "none" : empId,
              date: dateIso,
              start: "08:00",
              end: "16:00",
            });
            dlg.setOpen(true);
          });
        return;
      }
    }

    // Open dialog with pre-filled data
    dlg.reset({
      mode: "create",
      employeeId: empId === OPEN_EMP_ID ? "none" : empId,
      date: dateIso,
      start: "08:00",
      end: "16:00",
    });
    dlg.setOpen(true);
  }

  // Shift editing handler
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

  // Shift creation function
  async function createShift() {
    if (!perms.canManageSchedule) return;

    const empId = dlg.state.employeeId === "none" ? null : dlg.state.employeeId;
    const posId = dlg.state.positionId === "none" ? null : dlg.state.positionId;
    const locId = dlg.state.locationId === "none" ? null : dlg.state.locationId;
    const startIso = toIso(dlg.state.date, dlg.state.start);
    const endIso = toIsoWithOvernightHandling(dlg.state.date, dlg.state.end, true, dlg.state.start);
    const dStart = new Date(startIso),
      dEnd = new Date(endIso);

    // Validation - allow overnight shifts, only reject if times are identical
    if (dStart.getTime() === dEnd.getTime()) {
      toast.error("Start and end time cannot be the same");
      return;
    }

    // Check conflicts for assigned employees
    if (empId) {
      const key = `${empId}_${dlg.state.date}`;
      const sameDay = shiftsByEmpDay.get(key) || [];
      
      if (
        sameDay.some((x) =>
          overlaps(dStart, dEnd, new Date(x.starts_at), new Date(x.ends_at))
        )
      ) {
        toast.error("Overlap detected", {
          description: "Conflicts with another shift.",
        });
        return;
      }
      
      const weekday = dStart.getDay();
      const ranges = availabilityByEmp.get(empId) || [];
      const isAvailable = withinAnyAvailability(
        ranges,
        weekday,
        dStart,
        dEnd
      );
      const offLabel = timeOffLabelFor(empId, new Date(dlg.state.date));

      if (offLabel) {
        const ok = await overrideConfirm.request(
          `This employee has approved ${offLabel.toLowerCase()} on ${fmtShort(
            dlg.state.date
          )}. Create shift anyway?`
        );
        if (!ok) return;
      } else if (!isAvailable) {
        const ok = await overrideConfirm.request(
          "This employee is marked unavailable at that time. Create anyway?"
        );
        if (!ok) return;
      }
    }

    // Create shift
    dlg.setSaving(true);
    const { error } = await supabase.from("shifts").insert({
      org_id: orgId,
      employee_id: empId,
      position_id: posId,
      location_id: locId,
      starts_at: startIso,
      ends_at: endIso,
      break_minutes: Number.parseInt(dlg.state.breakMin || "0", 10) || 0,
      status: "scheduled",
    });
    dlg.setSaving(false);
    
    if (error) {
      toast.error("Failed to create shift", { description: error.message });
      return;
    }
    
    toast.success("Shift created");
    dlg.setOpen(false);
    void fetchData();
  }

  // Shift update function
  async function updateShift() {
    if (!dlg.state.shiftId) return;

    const empId = dlg.state.employeeId === "none" ? null : dlg.state.employeeId;
    const posId = dlg.state.positionId === "none" ? null : dlg.state.positionId;
    const locId = dlg.state.locationId === "none" ? null : dlg.state.locationId;
    const startIso = toIso(dlg.state.date, dlg.state.start);
    const endIso = toIsoWithOvernightHandling(dlg.state.date, dlg.state.end, true, dlg.state.start);
    const dStart = new Date(startIso),
      dEnd = new Date(endIso);

    // Validation - allow overnight shifts, only reject if times are identical
    if (dStart.getTime() === dEnd.getTime()) {
      toast.error("Start and end time cannot be the same");
      return;
    }

    // Check conflicts for assigned employees
    if (empId) {
      const key = `${empId}_${dlg.state.date}`;
      const sameDay = (shiftsByEmpDay.get(key) || []).filter(
        (x) => x.id !== dlg.state.shiftId
      );
      
      if (
        sameDay.some((x) =>
          overlaps(dStart, dEnd, new Date(x.starts_at), new Date(x.ends_at))
        )
      ) {
        toast.error("Overlap detected", {
          description: "Conflicts with another shift.",
        });
        return;
      }
      
      const weekday = dStart.getDay();
      const ranges = availabilityByEmp.get(empId) || [];
      const isAvailable = withinAnyAvailability(
        ranges,
        weekday,
        dStart,
        dEnd
      );
      const offLabel = timeOffLabelFor(empId, new Date(dlg.state.date));
      
      if (offLabel) {
        const ok = await overrideConfirm.request(
          `This employee has approved ${offLabel.toLowerCase()} on ${fmtShort(
            dlg.state.date
          )}. Save anyway?`
        );
        if (!ok) return;
      } else if (!isAvailable) {
        const ok = await overrideConfirm.request(
          "This employee is marked unavailable at that time. Save anyway?"
        );
        if (!ok) return;
      }
    }

    // Update shift
    dlg.setSaving(true);
    const { error } = await supabase
      .from("shifts")
      .update({
        employee_id: empId,
        position_id: posId,
        location_id: locId,
        starts_at: startIso,
        ends_at: endIso,
        break_minutes: Number.parseInt(dlg.state.breakMin || "0", 10) || 0,
      })
      .eq("id", dlg.state.shiftId);
    dlg.setSaving(false);
    
    if (error) {
      toast.error("Failed to update shift", { description: error.message });
      return;
    }
    
    toast.success("Shift saved");
    dlg.setOpen(false);
    void fetchData();
  }

  // Shift deletion function
  async function deleteShift() {
    if (!dlg.state.shiftId) return;
    
    dlg.setSaving(true);
    const { error } = await supabase
      .from("shifts")
      .delete()
      .eq("id", dlg.state.shiftId);
    dlg.setSaving(false);
    
    if (error) {
      toast.error("Failed to delete shift", { description: error.message });
      return;
    }
    
    toast.success("Shift deleted");
    dlg.setOpen(false);
    void fetchData();
  }

  const canManage = perms.canManageSchedule;

  // Export helper functions
  function eachDayISO(startISO: string, endISO: string) {
    const out: string[] = [];
    let d = new Date(startISO + "T00:00:00");
    const end = new Date(endISO + "T00:00:00");
    while (d <= end) {
      out.push(yyyyMmDd(d));
      d = addDays(d, 1);
    }
    return out;
  }

  function getShiftsForEmployeeAndDay(empId: string, dayISO: string) {
    const key = `${empId}_${dayISO}`;
    return shiftsByEmpDay.get(key) || [];
  }

  // Enhanced CSV export function with better formatting
  function exportCSV() {
    const days = eachDayISO(exportStart, exportEnd);
    const rows: string[] = [];

    // Enhanced header with metadata
    rows.push(`"Schedule Export - ${format(new Date(exportStart), "MMMM d, yyyy")} to ${format(new Date(exportEnd), "MMMM d, yyyy")}"`);
    rows.push(`"Generated on ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}"`);
    rows.push(`"Total Employees: ${employees.length}, Total Days: ${days.length}"`);
    rows.push(""); // Empty row

    // Header row with enhanced formatting
    const headerRow = ["Employee", "Position", ...days.map(d => {
      const date = new Date(d);
      return `"${format(date, "EEEE")}\n${format(date, "MMM d, yyyy")}"`;
    })];
    rows.push(headerRow.join(","));

    // Open shifts row with enhanced info
    const openRow = ["Open Shifts", "Unassigned"];
    days.forEach(day => {
      const dayShifts = getShiftsForEmployeeAndDay(OPEN_EMP_ID, day);
      const shiftText = dayShifts.map(s => {
        const st = format(new Date(s.starts_at), "h:mm a");
        const en = format(new Date(s.ends_at), "h:mm a");
        const duration = Math.round((new Date(s.ends_at).getTime() - new Date(s.starts_at).getTime()) / (1000 * 60 * 60 * 100)) / 10;
        const pos = s.position?.name ? ` (${s.position.name})` : "";
        return `${st} - ${en}${pos} [${duration}h]`;
      }).join("; ") || "No shifts";
      openRow.push(`"${shiftText}"`);
    });
    rows.push(openRow.join(","));

    // Employee rows with enhanced details
    employees.forEach(emp => {
      const empRow = [`"${emp.full_name}"`, `"${emp.position?.name || "No position"}"`];
      days.forEach(day => {
        const dayShifts = getShiftsForEmployeeAndDay(emp.id, day);
        const timeOffLabel = timeOffLabelFor(emp.id, new Date(day));

        let shiftText;
        if (timeOffLabel) {
          shiftText = "Time Off";
        } else if (dayShifts.length > 0) {
          shiftText = dayShifts.map(s => {
            const st = format(new Date(s.starts_at), "h:mm a");
            const en = format(new Date(s.ends_at), "h:mm a");
            const duration = Math.round((new Date(s.ends_at).getTime() - new Date(s.starts_at).getTime()) / (1000 * 60 * 60 * 100)) / 10;
            const pos = s.position?.name ? ` (${s.position.name})` : "";
            return `${st} - ${en}${pos} [${duration}h]`;
          }).join("; ");
        } else {
          shiftText = "Off";
        }
        empRow.push(`"${shiftText}"`);
      });
      rows.push(empRow.join(","));
    });

    // Enhanced footer with summary
    rows.push(""); // Empty row
    const totalShiftsCount = days.reduce((total, day) => {
      return total + [...employees, { id: OPEN_EMP_ID }].reduce((dayTotal, emp) => {
        return dayTotal + getShiftsForEmployeeAndDay(emp.id, day).length;
      }, 0);
    }, 0);
    rows.push(`"Summary: ${totalShiftsCount} total shifts scheduled"`);
    rows.push(`"FirstShift Schedule Management System"`);

    // Download CSV with enhanced naming
    const name = `FirstShift_Schedule_${format(new Date(exportStart), "yyyy-MM-dd")}_to_${format(
      new Date(exportEnd),
      "yyyy-MM-dd"
    )}.csv`;
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 0);
  }

  // Enhanced Print function
  function openPrintPreview() {
    setExportOpen(false);
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      window.addEventListener(
        "afterprint",
        () => setPrintMode(false),
        { once: true }
      );
    }, 150);
  }

  // Calendar export function (ICS format)
  function exportToCalendar() {
    const days = eachDayISO(exportStart, exportEnd);
    const icsEvents: string[] = [];

    // ICS header
    icsEvents.push("BEGIN:VCALENDAR");
    icsEvents.push("VERSION:2.0");
    icsEvents.push("PRODID:-//FirstShift//Schedule Export//EN");
    icsEvents.push("CALSCALE:GREGORIAN");
    icsEvents.push("METHOD:PUBLISH");
    icsEvents.push("X-WR-CALNAME:FirstShift Schedule");
    icsEvents.push("X-WR-CALDESC:Work Schedule from FirstShift");

    // Generate events for each shift
    days.forEach(day => {
      employees.forEach(emp => {
        const dayShifts = getShiftsForEmployeeAndDay(emp.id, day);
        dayShifts.forEach(shift => {
          const startDate = new Date(shift.starts_at);
          const endDate = new Date(shift.ends_at);

          // Format dates for ICS (YYYYMMDDTHHMMSSZ)
          const formatICSDate = (date: Date) => {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
          };

          const uid = `shift-${shift.id}@firstshift.app`;
          const summary = `${emp.full_name} - ${shift.position?.name || 'Work Shift'}`;
          const description = `Employee: ${emp.full_name}\nPosition: ${shift.position?.name || 'No position'}\nDuration: ${Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 100)) / 10} hours`;

          icsEvents.push("BEGIN:VEVENT");
          icsEvents.push(`UID:${uid}`);
          icsEvents.push(`DTSTART:${formatICSDate(startDate)}`);
          icsEvents.push(`DTEND:${formatICSDate(endDate)}`);
          icsEvents.push(`SUMMARY:${summary}`);
          icsEvents.push(`DESCRIPTION:${description}`);
          icsEvents.push(`CATEGORIES:Work,Schedule`);
          icsEvents.push(`STATUS:CONFIRMED`);
          icsEvents.push(`TRANSP:OPAQUE`);
          icsEvents.push(`CREATED:${formatICSDate(new Date())}`);
          icsEvents.push(`LAST-MODIFIED:${formatICSDate(new Date())}`);
          icsEvents.push("END:VEVENT");
        });
      });

      // Add open shifts as well
      const openShifts = getShiftsForEmployeeAndDay(OPEN_EMP_ID, day);
      openShifts.forEach(shift => {
        const startDate = new Date(shift.starts_at);
        const endDate = new Date(shift.ends_at);

        const formatICSDate = (date: Date) => {
          return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        const uid = `open-shift-${shift.id}@firstshift.app`;
        const summary = `Open Shift - ${shift.position?.name || 'Available Position'}`;
        const description = `Open shift available for assignment\nPosition: ${shift.position?.name || 'No position specified'}\nDuration: ${Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 100)) / 10} hours`;

        icsEvents.push("BEGIN:VEVENT");
        icsEvents.push(`UID:${uid}`);
        icsEvents.push(`DTSTART:${formatICSDate(startDate)}`);
        icsEvents.push(`DTEND:${formatICSDate(endDate)}`);
        icsEvents.push(`SUMMARY:${summary}`);
        icsEvents.push(`DESCRIPTION:${description}`);
        icsEvents.push(`CATEGORIES:Work,Schedule,Open`);
        icsEvents.push(`STATUS:TENTATIVE`);
        icsEvents.push(`TRANSP:TRANSPARENT`);
        icsEvents.push(`CREATED:${formatICSDate(new Date())}`);
        icsEvents.push(`LAST-MODIFIED:${formatICSDate(new Date())}`);
        icsEvents.push("END:VEVENT");
      });
    });

    // ICS footer
    icsEvents.push("END:VCALENDAR");

    // Download ICS file
    const icsContent = icsEvents.join("\r\n");
    const fileName = `FirstShift_Calendar_${format(new Date(exportStart), "yyyy-MM-dd")}_to_${format(new Date(exportEnd), "yyyy-MM-dd")}.ics`;
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 0);

    toast.success("Calendar events exported!", {
      description: `Downloaded ${fileName} - Import into your calendar app.`
    });
  }

  // Loading state
  if (loading || !orgId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg font-medium">Loading schedule...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6 max-w-7xl">
        {/* Modern Page Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
                    Schedule Management
                  </h1>
                  <p className="text-sm text-slate-600 mt-0.5">
                    {format(weekDays[0], "MMMM d")} - {format(weekDays[6], "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Week Navigation */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWeekStart(addDays(weekStart, -7))}
                className="h-9 px-3 border-slate-300 hover:bg-slate-50 text-slate-700 shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
                <div className="text-sm font-semibold text-slate-800">
                  {format(weekDays[0], "MMM d")} - {format(weekDays[6], "MMM d")}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setWeekStart(addDays(weekStart, +7))}
                className="h-9 px-3 border-slate-300 hover:bg-slate-50 text-slate-700 shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <span className="hidden sm:inline">Next</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Action Bar */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm mb-6">
          <div className="p-4 lg:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Search and Filter Section */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="Search employees..."
                    className="pl-10 pr-4 h-10 w-full sm:w-80 bg-white/80 border-slate-300 rounded-xl focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 shadow-sm"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>

                <Button
                  variant="outline"
                  className="gap-2 h-10 px-4 bg-white/80 border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </Button>
              </div>

              {/* Action Buttons Section */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setViewOpen(true)}
                  className="gap-2 h-10 px-4 bg-white/80 border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">Schedule View</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 h-10 px-4 bg-white/80 border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
                    >
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Export</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-slate-200">
                    <DropdownMenuItem onClick={() => setExportOpen(true)} className="gap-3 p-3 rounded-lg">
                      <FileText className="h-4 w-4" />
                      Export & Print Options
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setExportOpen(false);
                        exportToCalendar();
                      }}
                      className="gap-3 p-3 rounded-lg"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Download Calendar Events
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {canManage && (
                  <Button
                    onClick={() => {
                      dlg.reset({});
                      dlg.setOpen(true);
                    }}
                    className="gap-2 h-10 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Shift</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="mt-4 pt-4 border-t border-slate-200/60">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3">
                  <div className="text-lg font-bold text-blue-700">{employees.length}</div>
                  <div className="text-xs text-slate-600 mt-1">Employees</div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3">
                  <div className="text-lg font-bold text-green-700">{shifts.length}</div>
                  <div className="text-xs text-slate-600 mt-1">Total Shifts</div>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-3">
                  <div className="text-lg font-bold text-orange-700">{shifts.filter(s => !s.employee_id).length}</div>
                  <div className="text-xs text-slate-600 mt-1">Open Shifts</div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3">
                  <div className="text-lg font-bold text-purple-700">{shifts.filter(s => s.status === 'completed').length}</div>
                  <div className="text-xs text-slate-600 mt-1">Completed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        

        {/* Main Schedule Grid with Drag & Drop */}
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
          <ScheduleGrid
            weekDays={weekDays}
            employees={filteredEmployees}
            shiftsByEmpDay={shiftsByEmpDay}
            availabilityByEmp={availabilityByEmp}
            timeOffLabelFor={timeOffLabelFor}
            canManage={canManage}
            busy={busy}
            onCreateShift={openCreateAtCell}
            onEditShift={openEditShift}
          />

          <DragOverlay>
            {activeId ? <ShiftChip s={findShift(activeId)!} ghost /> : null}
          </DragOverlay>
        </DndContext>

        {/* Schedule View Dialog */}
        <ScheduleViewDialog
          open={viewOpen}
          onOpenChange={setViewOpen}
          shifts={shifts}
          employees={employees}
          weekDays={weekDays}
          shiftsByEmpDay={shiftsByEmpDay}
          timeOffByEmp={timeOffByEmp}
          availabilityByEmp={availabilityByEmp}
          timeOffLabelFor={timeOffLabelFor}
        />

        {/* Shift Create/Edit Dialog */}
        <ShiftDialog
          open={dlg.state.open}
          onOpenChange={dlg.setOpen}
          mode={dlg.state.mode}
          shiftId={dlg.state.shiftId}
          employeeId={dlg.state.employeeId}
          date={dlg.state.date}
          start={dlg.state.start}
          end={dlg.state.end}
          positionId={dlg.state.positionId}
          locationId={dlg.state.locationId}
          breakMin={dlg.state.breakMin}
          saving={dlg.state.saving}
          employees={employees}
          positions={positions}
          locations={locations}
          onEmployeeChange={dlg.setEmployeeId}
          onDateChange={dlg.setDate}
          onStartChange={dlg.onStartChange}
          onEndChange={(time: any) => {
            dlg.setEnd(time);
            dlg.setAutoEnd(false);
          }}
          onPositionChange={dlg.setPositionId}
          onLocationChange={dlg.setLocationId}
          onBreakChange={dlg.setBreakMin}
          onSave={dlg.state.mode === "create" ? createShift : updateShift}
          onDelete={dlg.state.mode === "edit" ? deleteShift : undefined}
        />

        {/* Enhanced Export Dialog */}
        <ExportDialog
          open={exportOpen}
          onOpenChange={setExportOpen}
          exportStart={exportStart}
          exportEnd={exportEnd}
          weekDays={weekDays}
          employees={employees}
          onStartChange={setExportStart}
          onEndChange={setExportEnd}
          onExport={exportCSV}
          onPrint={openPrintPreview}
          onCalendarExport={exportToCalendar}
          getShiftsForEmployeeAndDay={getShiftsForEmployeeAndDay}
          timeOffLabelFor={timeOffLabelFor}
        />

        {/* Enhanced Print View (Hidden) */}
        <div className={`print-only ${printMode ? "block" : "hidden"} bg-white`}>
          <div className="p-6">
            {/* Professional Print Header */}
            <div className="mb-8 text-center border-b-2 border-slate-300 pb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Employee Schedule Report</h1>
                  <p className="text-slate-600 text-lg mt-1">
                    {format(new Date(exportStart), "MMMM d")} – {format(new Date(exportEnd), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm text-slate-500">
                <div>Generated on {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}</div>
                <div>{employees.length} employees • {eachDayISO(exportStart, exportEnd).reduce((total, day) => {
                  return total + [...employees, { id: OPEN_EMP_ID }].reduce((dayTotal, emp) => {
                    return dayTotal + getShiftsForEmployeeAndDay(emp.id, day).length;
                  }, 0);
                }, 0)} shifts in date range</div>
              </div>
            </div>

            {/* Minimal Print Table */}
            <div className="border border-slate-300">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-slate-300 p-2 font-bold text-left text-slate-800">
                      Employee
                    </th>
                    {eachDayISO(exportStart, exportEnd).map((dayISO) => (
                      <th key={dayISO} className="border border-slate-300 p-1 text-center font-bold text-slate-800">
                        <div>
                          <div className="text-xs">{format(new Date(dayISO), "EEE")}</div>
                          <div className="text-xs">{format(new Date(dayISO), "M/d")}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Minimal Open Shifts Row */}
                  <tr>
                    <td className="border border-slate-300 p-1 font-bold text-slate-800 text-xs">
                      Open Shifts
                    </td>
                    {eachDayISO(exportStart, exportEnd).map((dayISO) => {
                      const dayShifts = getShiftsForEmployeeAndDay(OPEN_EMP_ID, dayISO);
                      return (
                        <td key={dayISO} className="border border-slate-300 p-3 text-center">
                          {dayShifts.length > 0 ? (
                            <div className="space-y-1">
                              {dayShifts.map((s) => (
                                <div key={s.id} className="bg-white/60 rounded px-2 py-1 text-sm font-medium">
                                  <div>{format(new Date(s.starts_at), "h:mm a")}</div>
                                  <div className="text-xs text-slate-600">to {format(new Date(s.ends_at), "h:mm a")}</div>
                                  {s.position?.name && (
                                    <div className="text-xs text-orange-700 font-medium">{s.position.name}</div>
                                  )}
                                </div>
                              ))}\n                            </div>
                          ) : (
                            <div className="text-slate-500 text-sm">No open shifts</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Enhanced Employee Rows */}
                  {employees.map((emp, index) => (
                    <tr key={emp.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/40"}>
                      <td className="border border-slate-300 p-4">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-800">{emp.full_name}</div>
                          <div className="text-sm text-slate-600 flex items-center gap-2">
                            {emp.position?.name || "No position"}
                            {emp.position?.color && (
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: emp.position.color }}
                              />
                            )}
                          </div>
                        </div>
                      </td>
                      {eachDayISO(exportStart, exportEnd).map((dayISO) => {
                        const dayShifts = getShiftsForEmployeeAndDay(emp.id, dayISO);
                        const timeOffLabel = timeOffLabelFor(emp.id, new Date(dayISO));
                        return (
                          <td key={dayISO} className="border border-slate-300 p-3 text-center">
                            {timeOffLabel ? (
                              <div className="bg-red-100 text-red-700 rounded px-2 py-1 text-sm font-medium">
                                Time Off
                              </div>
                            ) : dayShifts.length > 0 ? (
                              <div className="space-y-1">
                                {dayShifts.map((s) => (
                                  <div key={s.id} className="bg-blue-50 border border-blue-200 rounded px-2 py-1 text-sm">
                                    <div className="font-medium text-slate-800">
                                      {format(new Date(s.starts_at), "h:mm a")}
                                    </div>
                                    <div className="text-xs text-slate-600">
                                      to {format(new Date(s.ends_at), "h:mm a")}
                                    </div>
                                    {s.position?.name && (
                                      <div className="text-xs font-medium" style={{ color: s.position.color || "#64748b" }}>
                                        {s.position.name}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-slate-400 text-sm">—</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Print Footer */}
            <div className="mt-6 pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
              <div>FirstShift Schedule Management System • Confidential Document</div>
            </div>
          </div>
        </div>

        {/* Enhanced Print Styles */}
        <style jsx global>{`
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            body * {
              visibility: hidden;
            }
            .print-only, .print-only * {
              visibility: visible;
            }
            .print-only {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              background: white !important;
            }
            @page {
              margin: 0.3in;
              size: landscape;
            }
            table {
              page-break-inside: avoid !important;
              border-collapse: collapse;
              width: 100% !important;
              table-layout: fixed !important;
              font-size: 7px !important;
            }
            th, td {
              border: 1px solid #999 !important;
              padding: 2px !important;
              word-wrap: break-word;
              overflow: hidden;
            }
            th {
              background: #f5f5f5 !important;
              font-weight: bold !important;
              font-size: 8px !important;
            }
            tr {
              page-break-inside: avoid !important;
              height: auto !important;
            }
            .print-only h1 {
              font-size: 14px !important;
              margin: 5px 0 !important;
            }
            .print-only p {
              font-size: 10px !important;
              margin: 2px 0 !important;
            }
          }
        `}</style>

        {/* Override Confirmation Dialog */}
        {overrideConfirm.element}
      </div>
    </div>
  );
}