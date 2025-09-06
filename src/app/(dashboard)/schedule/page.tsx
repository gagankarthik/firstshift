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
    const endIso = toIso(dlg.state.date, dlg.state.end);
    const dStart = new Date(startIso),
      dEnd = new Date(endIso);
    
    // Validation
    if (dEnd <= dStart) {
      toast.error("End must be after start");
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
    const endIso = toIso(dlg.state.date, dlg.state.end);
    const dStart = new Date(startIso),
      dEnd = new Date(endIso);
    
    // Validation
    if (dEnd <= dStart) {
      toast.error("End must be after start");
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

  // CSV export function
  function exportCSV() {
    const days = eachDayISO(exportStart, exportEnd);
    const rows: string[] = [];
    
    // Header row
    const headerRow = ["Employee", ...days.map(d => format(new Date(d), "EEE MMM d"))];
    rows.push(headerRow.join(","));

    // Open shifts row
    const openRow = ["Open Shifts"];
    days.forEach(day => {
      const dayShifts = getShiftsForEmployeeAndDay(OPEN_EMP_ID, day);
      const shiftText = dayShifts.map(s => {
        const st = format(new Date(s.starts_at), "h:mma");
        const en = format(new Date(s.ends_at), "h:mma");
        return `${st}-${en}`;
      }).join("; ") || "—";
      openRow.push(`"${shiftText}"`);
    });
    rows.push(openRow.join(","));

    // Employee rows
    employees.forEach(emp => {
      const empRow = [emp.full_name];
      days.forEach(day => {
        const dayShifts = getShiftsForEmployeeAndDay(emp.id, day);
        const shiftText = dayShifts.map(s => {
          const st = format(new Date(s.starts_at), "h:mma");
          const en = format(new Date(s.ends_at), "h:mma");
          const pos = s.position?.name ? ` (${s.position.name})` : "";
          return `${st}-${en}${pos}`;
        }).join("; ") || "—";
        empRow.push(`"${shiftText}"`);
      });
      rows.push(empRow.join(","));
    });

    // Download CSV
    const name = `schedule_${format(new Date(exportStart), "yyyyMMdd")}-${format(
      new Date(exportEnd),
      "yyyyMMdd"
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

  // Print function
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

  // Loading state
  if (loading || !orgId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">Loading schedule...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-6 py-6 max-w-7xl">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Schedule</h1>
            <p className="text-sm text-gray-600 mt-1">
              {format(weekDays[0], "MMM d")} - {format(weekDays[6], "MMM d, yyyy")}
            </p>
          </div>
          
          {/* Week Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekStart(addDays(weekStart, -7))}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium px-3 py-1 bg-white rounded border">
              {format(weekDays[0], "MMM d")} - {format(weekDays[6], "MMM d")}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekStart(addDays(weekStart, +7))}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search employees..."
                className="pl-10 w-64"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewOpen(true)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              View
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setExportOpen(true)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openPrintPreview}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Schedule
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {canManage && (
              <Button
                size="sm"
                onClick={() => {
                  dlg.reset({});
                  dlg.setOpen(true);
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Shift
              </Button>
            )}
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

        {/* Export Dialog */}
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
          getShiftsForEmployeeAndDay={getShiftsForEmployeeAndDay}
          timeOffLabelFor={timeOffLabelFor}
        />

        {/* Print View (Hidden) */}
        <div className={`print-only ${printMode ? "block" : "hidden"}`}>
          <div className="p-6">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold">Employee Schedule</h1>
              <p className="text-gray-600">
                {format(new Date(exportStart), "MMMM d")} – {format(new Date(exportEnd), "MMMM d, yyyy")}
              </p>
            </div>

            <table className="w-full text-sm border-collapse border">
              <thead>
                <tr>
                  <th className="border p-2 font-bold text-left w-[150px]">Employee</th>
                  {eachDayISO(exportStart, exportEnd).map((dayISO) => (
                    <th key={dayISO} className="border p-2 text-center font-bold">
                      <div>
                        <div>{format(new Date(dayISO), "EEE")}</div>
                        <div className="text-xs font-normal">{format(new Date(dayISO), "MMM d")}</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-orange-50">
                  <td className="border p-2 font-semibold">Open Shifts</td>
                  {eachDayISO(exportStart, exportEnd).map((dayISO) => {
                    const dayShifts = getShiftsForEmployeeAndDay(OPEN_EMP_ID, dayISO);
                    return (
                      <td key={dayISO} className="border p-2 text-center text-xs">
                        {dayShifts.length > 0 ? (
                          dayShifts.map((s) => (
                            <div key={s.id}>
                              {format(new Date(s.starts_at), "h:mma")}-{format(new Date(s.ends_at), "h:mma")}
                            </div>
                          ))
                        ) : (
                          "—"
                        )}
                      </td>
                    );
                  })}
                </tr>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td className="border p-2 font-medium">{emp.full_name}</td>
                    {eachDayISO(exportStart, exportEnd).map((dayISO) => {
                      const dayShifts = getShiftsForEmployeeAndDay(emp.id, dayISO);
                      const timeOffLabel = timeOffLabelFor(emp.id, new Date(dayISO));
                      return (
                        <td key={dayISO} className="border p-2 text-center text-xs">
                          {timeOffLabel ? (
                            "Time off"
                          ) : dayShifts.length > 0 ? (
                            dayShifts.map((s) => (
                              <div key={s.id}>
                                {format(new Date(s.starts_at), "h:mma")}-{format(new Date(s.ends_at), "h:mma")}
                              </div>
                            ))
                          ) : (
                            "—"
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Print Styles */}
        <style jsx global>{`
          @media print {
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
            }
            @page {
              margin: 0.5in;
              size: landscape;
            }
            table {
              page-break-inside: auto;
            }
            tr {
              page-break-inside: avoid;
            }
          }
        `}</style>

        {/* Override Confirmation Dialog */}
        {overrideConfirm.element}
      </div>
    </div>
  );
}