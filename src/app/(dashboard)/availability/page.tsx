"use client";

import * as React from "react";
import { createClient } from "@/lib/supabaseClient";
import { usePermissions } from "@/app/hooks/usePermissions";
import { useOrg } from "@/components/providers/OrgProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

type Employee = { id: string; full_name: string };
type Avail = {
  id: string;
  weekday: number;
  start_time: string; // "HH:MM:SS"
  end_time: string;   // "HH:MM:SS"
  employee_id: string;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AvailabilityPage() {
  const sb = React.useMemo(() => createClient(), []);
  const { orgId, role, loading } = useOrg();
  const perms = usePermissions(role);

  const [myEmployeeId, setMyEmployeeId] = React.useState<string | null>(null);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [targetEmpId, setTargetEmpId] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<Avail[]>([]);
  const [adding, setAdding] = React.useState<{
    weekday: number;
    start: string;
    end: string;
  }>({ weekday: 1, start: "09:00", end: "17:00" });
  const [busy, setBusy] = React.useState(false);

  // Fetch my employee id for this org
  React.useEffect(() => {
    (async () => {
      if (!orgId) return;
      const { data: u } = await sb.auth.getUser();
      const userId = u.user?.id || null;
      if (!userId) return;

      const { data: emp, error } = await sb
        .from("employees")
        .select("id")
        .eq("org_id", orgId)
        .eq("profile_id", userId)
        .limit(1)
        .maybeSingle();

      if (error) return;
      setMyEmployeeId(emp?.id ?? null);
    })();
  }, [sb, orgId]);

  // Employees list for the org
  React.useEffect(() => {
    if (!orgId) return;
    (async () => {
      const { data, error } = await sb
        .from("employees")
        .select("id, full_name")
        .eq("org_id", orgId)
        .order("full_name");

      if (error) {
        toast.error("Failed to load employees", { description: error.message });
        return;
      }
      setEmployees((data || []) as Employee[]);
    })();
  }, [sb, orgId]);

  // Default target employee:
  //  - employee role -> themselves
  //  - admin/manager -> first employee if none selected
  React.useEffect(() => {
    if (!orgId) return;

    if (!perms.canManageSchedule && myEmployeeId) {
      setTargetEmpId((prev) => prev ?? myEmployeeId);
    } else if (perms.canManageSchedule && employees.length && !targetEmpId) {
      setTargetEmpId(employees[0].id);
    }
  }, [orgId, perms.canManageSchedule, myEmployeeId, employees, targetEmpId]);

  // Loader for availability
  const loadAvail = React.useCallback(async () => {
    if (!orgId || !targetEmpId) return;

    const { data, error } = await sb
      .from("availability")
      .select("id, weekday, start_time, end_time, employee_id")
      .eq("org_id", orgId)
      .eq("employee_id", targetEmpId)
      .order("weekday, start_time");

    if (error) {
      toast.error("Failed to load availability", { description: error.message });
      return;
    }
    setRows((data || []) as Avail[]);
  }, [sb, orgId, targetEmpId]);

  React.useEffect(() => {
    void loadAvail();
  }, [loadAvail]);

  // Realtime updates
  React.useEffect(() => {
    if (!orgId) return;
    const ch = sb
      .channel(`availability-${orgId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "availability", filter: `org_id=eq.${orgId}` },
        () => loadAvail()
      )
      .subscribe();
    return () => {
      sb.removeChannel(ch);
    };
  }, [sb, orgId, loadAvail]);

  // ---- IMPORTANT: All hooks above this line. No early returns before finishing hooks. ----

  const canEditThis =
    !!targetEmpId && perms.canEditAvailabilityFor(targetEmpId, myEmployeeId);

  const byDay: Record<number, Avail[]> = React.useMemo(() => {
    const m: Record<number, Avail[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: []
    };
    for (const r of rows) {
      (m[r.weekday] ||= []).push(r);
    }
    return m;
  }, [rows]);

  // After all hooks: now we can safely branch on loading
  if (loading || !orgId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/30">
        <div className="mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6 max-w-6xl space-y-6">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex items-center gap-3 text-slate-600">
              <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-lg font-medium">Loading availability...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  async function addRange(dayIndex: number) {
    if (!targetEmpId) return;
    if (adding.start >= adding.end) {
      toast.error("Start time must be before end time");
      return;
    }
    setBusy(true);
    const { error } = await sb.from("availability").insert({
      org_id: orgId,
      employee_id: targetEmpId,
      weekday: dayIndex,
      start_time: `${adding.start}:00`,
      end_time: `${adding.end}:00`
    });
    setBusy(false);
    if (error) {
      toast.error("Failed to add range", { description: error.message });
      return;
    }
    toast.success("Availability added");
    void loadAvail();
  }

  async function removeRange(id: string) {
    setBusy(true);
    const { error } = await sb.from("availability").delete().eq("id", id);
    setBusy(false);
    if (error) {
      toast.error("Failed to remove range", { description: error.message });
      return;
    }
    toast.success("Availability removed");
    void loadAvail();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/30">
      <div className="mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6 max-w-6xl space-y-6">
        {/* Enhanced Page Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center shadow-md">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-green-700 to-emerald-700 bg-clip-text text-transparent">
                    Availability Management
                  </h1>
                  <p className="text-sm text-slate-600 mt-0.5">
                    Set and manage work availability schedules
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Employee Selector */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="p-4 lg:p-6">
            {perms.canManageSchedule ? (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Select Employee
                </label>
                <Select
                  value={targetEmpId ?? ""}
                  onValueChange={(v) => setTargetEmpId(v)}
                >
                  <SelectTrigger className="w-full sm:w-[320px] bg-white/80 border-slate-300 rounded-xl focus:border-green-500 focus:ring-green-500/20 transition-all duration-200">
                    <SelectValue placeholder="Choose an employee to manage..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 rounded-xl shadow-lg border-slate-200">
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={e.id} className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          {e.full_name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div>
                  <div className="font-semibold text-slate-800">Managing Your Availability</div>
                  <div className="text-sm text-slate-600">Set your weekly work schedule preferences</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Availability Table */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-lg">
          <div className="p-4 lg:p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Weekly Schedule
              </h2>
              <p className="text-sm text-slate-600 mt-1">Define available hours for each day of the week</p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50 via-green-50 to-emerald-50 border-b-2 border-slate-200">
                    <TableHead className="w-[140px] sm:w-[180px] font-bold text-slate-800 py-4">
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Day of Week
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-slate-800 py-4">
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Available Time Ranges
                      </div>
                    </TableHead>
                    {canEditThis && (
                      <TableHead className="hidden w-[380px] text-right md:table-cell font-bold text-slate-800 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add New Range
                        </div>
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {WEEKDAYS.map((name, dayIndex) => {
                    const ranges = byDay[dayIndex] || [];
                    const showMobileAdder = canEditThis;
                    const isToday = new Date().getDay() === dayIndex;

                    return (
                      <TableRow
                        key={dayIndex}
                        className={`align-top transition-colors hover:bg-slate-50/40 ${
                          dayIndex % 2 === 0 ? "bg-white" : "bg-slate-50/20"
                        } ${isToday ? "ring-2 ring-green-500/20 bg-green-50/30" : ""}`}
                      >
                        <TableCell className="py-6">
                          <div className="flex items-center gap-3">
                            <div className={`h-3 w-3 rounded-full ${
                              isToday ? 'bg-green-500' : 'bg-slate-400'
                            }`} />
                            <div>
                              <div className="font-bold text-slate-800">{name}</div>
                              {isToday && (
                                <div className="text-xs text-green-600 font-medium">Today</div>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-6">
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              {ranges.length > 0 ? (
                                ranges.map((r) => (
                                  <div
                                    key={r.id}
                                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 px-4 py-2 text-sm shadow-sm"
                                  >
                                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-medium text-slate-800">
                                      {r.start_time.slice(0, 5)} – {r.end_time.slice(0, 5)}
                                    </span>
                                    {canEditThis && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 hover:bg-red-100 hover:text-red-600 transition-colors"
                                        onClick={() => removeRange(r.id)}
                                        title="Remove this time range"
                                        aria-label="Remove this time range"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 text-slate-500">
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                  </svg>
                                  <span className="text-sm font-medium">Not available</span>
                                </div>
                              )}
                            </div>

                            {/* Mobile add controls (inline) */}
                            {showMobileAdder && (
                              <div className="flex items-center gap-2 md:hidden p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                <Input
                                  type="time"
                                  className="h-9 w-[120px] bg-white/80 border-slate-300 rounded-lg focus:border-green-500 focus:ring-green-500/20"
                                  value={
                                    dayIndex === adding.weekday ? adding.start : "09:00"
                                  }
                                  onChange={(e) =>
                                    setAdding((a) => ({
                                      ...a,
                                      weekday: dayIndex,
                                      start: e.target.value
                                    }))
                                  }
                                />
                                <span className="text-slate-600 font-medium">to</span>
                                <Input
                                  type="time"
                                  className="h-9 w-[120px] bg-white/80 border-slate-300 rounded-lg focus:border-green-500 focus:ring-green-500/20"
                                  value={
                                    dayIndex === adding.weekday ? adding.end : "17:00"
                                  }
                                  onChange={(e) =>
                                    setAdding((a) => ({
                                      ...a,
                                      weekday: dayIndex,
                                      end: e.target.value
                                    }))
                                  }
                                />
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setAdding((a) => ({ ...a, weekday: dayIndex }));
                                    void addRange(dayIndex);
                                  }}
                                  disabled={busy}
                                  className="gap-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all duration-200"
                                >
                                  <Plus className="h-4 w-4" />
                                  Add
                                </Button>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Desktop add controls */}
                        {canEditThis && (
                          <TableCell className="hidden text-right md:table-cell py-6">
                            <div className="ml-auto flex w-full items-center justify-end gap-3">
                              <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                <Input
                                  type="time"
                                  className="h-9 w-[130px] bg-white/80 border-slate-300 rounded-lg focus:border-green-500 focus:ring-green-500/20"
                                  value={
                                    dayIndex === adding.weekday ? adding.start : "09:00"
                                  }
                                  onChange={(e) =>
                                    setAdding((a) => ({
                                      ...a,
                                      weekday: dayIndex,
                                      start: e.target.value
                                    }))
                                  }
                                />
                                <span className="text-slate-600 font-medium">to</span>
                                <Input
                                  type="time"
                                  className="h-9 w-[130px] bg-white/80 border-slate-300 rounded-lg focus:border-green-500 focus:ring-green-500/20"
                                  value={
                                    dayIndex === adding.weekday ? adding.end : "17:00"
                                  }
                                  onChange={(e) =>
                                    setAdding((a) => ({
                                      ...a,
                                      weekday: dayIndex,
                                      end: e.target.value
                                    }))
                                  }
                                />
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setAdding((a) => ({ ...a, weekday: dayIndex }));
                                    void addRange(dayIndex);
                                  }}
                                  disabled={busy}
                                  className="gap-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all duration-200"
                                >
                                  {busy ? (
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                  ) : (
                                    <Plus className="h-4 w-4" />
                                  )}
                                  Add Range
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
