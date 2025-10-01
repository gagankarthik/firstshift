"use client";

import * as React from "react";
import { createClient } from "@/lib/supabaseClient";
import { useOrg } from "@/components/providers/OrgProvider";
import { usePermissions } from "@/app/hooks/usePermissions";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { addDays, format, parseISO } from "date-fns";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { AIReportsAssistant } from "@/components/reports/AIReportsAssistant";

type Role = "admin" | "manager" | "employee";

type PositionRow = { id: string; name: string; color: string | null };
type EmployeeRow = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  position_id: string | null;
  position?: { name: string; color: string | null } | null;
  profile_id: string | null;
};

type ShiftRow = {
  id: string;
  org_id: string | null;
  employee_id: string | null;
  position_id: string | null;
  starts_at: string; // ISO
  ends_at: string; // ISO
  break_minutes: number | null;
  status: "scheduled" | "published" | "completed" | "cancelled";
};

type TimeOffRow = {
  id: string;
  employee_id: string;
  starts_at: string; // date
  ends_at: string; // date
  status: "pending" | "approved" | "denied";
  type: "vacation" | "sick" | "unpaid" | "other";
};

function hoursForShift(s: ShiftRow): number {
  const start = new Date(s.starts_at).getTime();
  const end = new Date(s.ends_at).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;
  const mins = (end - start) / (1000 * 60);
  const breakMin = s.break_minutes ? Math.max(0, s.break_minutes) : 0;
  const net = Math.max(0, mins - breakMin);
  return +(net / 60).toFixed(2);
}

function clampISOEndExclusive(toISO: string): string {
  // Make "to" exclusive by adding 1 day at midnight
  const d = parseISO(toISO);
  const next = addDays(d, 1);
  // Keep date-only midnight to be exclusive upper bound
  return new Date(
    next.getFullYear(),
    next.getMonth(),
    next.getDate(),
    0, 0, 0, 0
  ).toISOString();
}

const COLORS = [
  "#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#84cc16", "#eab308", "#ec4899", "#10b981",
];

export default function ReportPage() {
  const supabase = React.useMemo(() => createClient(), []);
  const { orgId, role } = useOrg();
  const perms = usePermissions(role as Role);
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  // Date filters (default last 30 days)
  const initialFrom = search.get("from") || format(addDays(new Date(), -30), "yyyy-MM-dd");
  const initialTo = search.get("to") || format(new Date(), "yyyy-MM-dd");
  const [from, setFrom] = React.useState(initialFrom);
  const [to, setTo] = React.useState(initialTo);

  const [loading, setLoading] = React.useState(true);
  const [meUserId, setMeUserId] = React.useState<string | null>(null);
  const [myEmployeeId, setMyEmployeeId] = React.useState<string | null>(null);

  const [positions, setPositions] = React.useState<PositionRow[]>([]);
  const [employees, setEmployees] = React.useState<EmployeeRow[]>([]);
  const [shifts, setShifts] = React.useState<ShiftRow[]>([]);
  const [timeOff, setTimeOff] = React.useState<TimeOffRow[]>([]);

  // Sync URL with filters
  function updateQuery(nextFrom: string, nextTo: string) {
    const sp = new URLSearchParams(search.toString());
    sp.set("from", nextFrom);
    sp.set("to", nextTo);
    router.replace(`${pathname}?${sp.toString()}`);
  }

  React.useEffect(() => {
    setFrom(initialFrom);
    setTo(initialTo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFrom, initialTo]);

  React.useEffect(() => {
    (async () => {
      if (!orgId) return;

      setLoading(true);

      // get current user for employee scoping
      const { data: u } = await supabase.auth.getUser();
      const userId = u.user?.id || null;
      setMeUserId(userId);

      // find my employee row
      let myEmpId: string | null = null;
      if (userId) {
        const { data: mine } = await supabase
          .from("employees")
          .select("id")
          .eq("org_id", orgId)
          .eq("profile_id", userId)
          .maybeSingle();
        myEmpId = mine?.id ?? null;
      }
      setMyEmployeeId(myEmpId);

      // positions
      const { data: pos, error: ePos } = await supabase
        .from("positions")
        .select("id, name, color")
        .eq("org_id", orgId)
        .order("name");
      if (ePos) {
        toast.error("Failed to load positions", { description: ePos.message });
        setLoading(false);
        return;
      }
      setPositions((pos || []) as PositionRow[]);

      // employees (all)
      const { data: emps, error: eEmp } = await supabase
        .from("employees")
        .select("id, full_name, avatar_url, position_id, profile_id, positions:position_id(name,color)")
        .eq("org_id", orgId)
        .order("full_name");
      if (eEmp) {
        toast.error("Failed to load employees", { description: eEmp.message });
        setLoading(false);
        return;
      }
      setEmployees(
        (emps || []).map((e: any) => ({
          id: e.id,
          full_name: e.full_name,
          avatar_url: e.avatar_url,
          position_id: e.position_id,
          position: e.positions ?? null,
          profile_id: e.profile_id,
        }))
      );

      // shifts in range
      const toExclusive = clampISOEndExclusive(to);
      const { data: sh, error: eSh } = await supabase
        .from("shifts")
        .select("id, org_id, employee_id, position_id, starts_at, ends_at, break_minutes, status")
        .eq("org_id", orgId)
        .gte("starts_at", new Date(from).toISOString())
        .lt("starts_at", toExclusive);
      if (eSh) {
        toast.error("Failed to load shifts", { description: eSh.message });
        setLoading(false);
        return;
      }
      setShifts((sh || []) as ShiftRow[]);

      // time off overlapping range (simple: starts within range OR ends within range)
      const { data: toff, error: eTo } = await supabase
        .from("time_off")
        .select("id, employee_id, starts_at, ends_at, status, type")
        .eq("org_id", orgId)
        .lte("starts_at", to)       // starts on/before end
        .gte("ends_at", from);      // ends on/after start
      if (eTo) {
        toast.error("Failed to load time off", { description: eTo.message });
        setLoading(false);
        return;
      }
      setTimeOff((toff || []) as TimeOffRow[]);

      setLoading(false);
    })();
  }, [supabase, orgId, from, to]);

  // Scope data for employees: if employee role, they should only see their own data
  const scopedEmployeeIds = React.useMemo(() => {
    if (role === "employee" && myEmployeeId) return new Set<string>([myEmployeeId]);
    // admin/manager see all
    return new Set<string>(employees.map((e) => e.id));
  }, [role, myEmployeeId, employees]);

  const scopedShifts = React.useMemo(
    () => shifts.filter((s) => !s.employee_id || scopedEmployeeIds.has(s.employee_id)),
    [shifts, scopedEmployeeIds]
  );
  const scopedTimeOff = React.useMemo(
    () => timeOff.filter((t) => scopedEmployeeIds.has(t.employee_id)),
    [timeOff, scopedEmployeeIds]
  );

  // ---- Aggregations ----
  const totalsByEmployee = React.useMemo(() => {
    const map = new Map<string, { name: string; hours: number; shifts: number }>();
    for (const s of scopedShifts) {
      const empId = s.employee_id;
      if (!empId) continue; // unassigned shift
      const hrs = hoursForShift(s);
      if (!map.has(empId)) {
        const emp = employees.find((e) => e.id === empId);
        map.set(empId, { name: emp?.full_name || "Unknown", hours: 0, shifts: 0 });
      }
      const rec = map.get(empId)!;
      rec.hours += hrs;
      rec.shifts += 1;
    }
    // Round hours
    for (const k of map.keys()) {
      const v = map.get(k)!;
      v.hours = +v.hours.toFixed(2);
    }
    return map;
  }, [scopedShifts, employees]);

  const totalsByPosition = React.useMemo(() => {
    const map = new Map<string, { name: string; hours: number }>();
    for (const s of scopedShifts) {
      const posId = s.position_id || "_none";
      const hrs = hoursForShift(s);
      if (!map.has(posId)) {
        const pos = positions.find((p) => p.id === s.position_id);
        map.set(posId, { name: pos?.name || "Unassigned", hours: 0 });
      }
      map.get(posId)!.hours += hrs;
    }
    for (const k of map.keys()) {
      const v = map.get(k)!;
      v.hours = +v.hours.toFixed(2);
    }
    return map;
  }, [scopedShifts, positions]);

  const dailyTotals = React.useMemo(() => {
    // Line chart by day: sum hours for that day (by shift start date)
    const map = new Map<string, number>();
    for (const s of scopedShifts) {
      const dayKey = format(new Date(s.starts_at), "yyyy-MM-dd");
      map.set(dayKey, (map.get(dayKey) || 0) + hoursForShift(s));
    }
    const days: { day: string; hours: number }[] = [];
    // fill range with zeroes for nicer chart
    const start = new Date(from);
    const end = new Date(to);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = format(d, "yyyy-MM-dd");
      days.push({ day: key, hours: +(map.get(key) || 0).toFixed(2) });
    }
    return days;
  }, [scopedShifts, from, to]);

  const statusBreakdown = React.useMemo(() => {
    // for employee view; if admin, still show total
    const counts: Record<ShiftRow["status"], number> = {
      scheduled: 0,
      published: 0,
      completed: 0,
      cancelled: 0,
    };
    for (const s of scopedShifts) {
      counts[s.status] += 1;
    }
    const data = Object.entries(counts).map(([k, v]) => ({ name: k, value: v }));
    return data;
  }, [scopedShifts]);

  const kpis = React.useMemo(() => {
    const totalHours = scopedShifts.reduce((acc, s) => acc + hoursForShift(s), 0);
    const completed = scopedShifts.filter((s) => s.status === "completed").length;
    const scheduled = scopedShifts.length;
    const cancelled = scopedShifts.filter((s) => s.status === "cancelled").length;
    const approvedTO = scopedTimeOff.filter((t) => t.status === "approved");
    const pendingTO = scopedTimeOff.filter((t) => t.status === "pending");

    const approvedDays = approvedTO.reduce((acc, t) => {
      // rough whole-day count inclusive
      const a = new Date(t.starts_at);
      const b = new Date(t.ends_at);
      const diff = Math.max(0, Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      return acc + diff;
    }, 0);

    // Advanced metrics
    const avgHoursPerShift = scheduled > 0 ? totalHours / scheduled : 0;
    const completionRate = scheduled > 0 ? (completed / scheduled) * 100 : 0;
    const cancellationRate = scheduled > 0 ? (cancelled / scheduled) * 100 : 0;
    const avgHoursPerEmployee = employees.length > 0 ? totalHours / employees.length : 0;

    // Productivity metrics
    const productiveHours = scopedShifts
      .filter(s => s.status === "completed")
      .reduce((acc, s) => acc + hoursForShift(s), 0);

    return {
      totalHours: +totalHours.toFixed(2),
      completedShifts: completed,
      totalShifts: scheduled,
      cancelledShifts: cancelled,
      approvedTimeOffDays: approvedDays,
      pendingTimeOffRequests: pendingTO.length,
      avgHoursPerShift: +avgHoursPerShift.toFixed(2),
      completionRate: +completionRate.toFixed(1),
      cancellationRate: +cancellationRate.toFixed(1),
      avgHoursPerEmployee: +avgHoursPerEmployee.toFixed(2),
      productiveHours: +productiveHours.toFixed(2),
      efficiency: totalHours > 0 ? +(productiveHours / totalHours * 100).toFixed(1) : 0,
    };
  }, [scopedShifts, scopedTimeOff, employees]);

  // ---- UI helpers ----
  const employeeTableRows = React.useMemo(() => {
    // For admin/manager
    const rows = employees
      .filter((e) => scopedEmployeeIds.has(e.id))
      .map((e) => {
        const t = totalsByEmployee.get(e.id);
        return {
          id: e.id,
          name: e.full_name,
          position: e.position?.name || "—",
          hours: t?.hours || 0,
          shifts: t?.shifts || 0,
        };
      })
      .sort((a, b) => b.hours - a.hours);
    return rows;
  }, [employees, scopedEmployeeIds, totalsByEmployee]);

  function exportCSV() {
    // Admin/manager: export employee summary
    const header = ["Employee", "Position", "Hours", "Shifts"];
    const lines = [header.join(",")].concat(
      employeeTableRows.map((r) => [escapeCSV(r.name), escapeCSV(r.position), r.hours, r.shifts].join(","))
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report_${format(new Date(from), "yyyyMMdd")}_${format(new Date(to), "yyyyMMdd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  function escapeCSV(s: string) {
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }

  function applyDates(e: React.FormEvent) {
    e.preventDefault();
    if (!from || !to) {
      toast.error("Please pick a valid date range.");
      return;
    }
    if (new Date(from) > new Date(to)) {
      toast.error("The 'from' date must be before the 'to' date.");
      return;
    }
    updateQuery(from, to);
  }

  if (!orgId) {
    return <div className="text-sm text-gray-500">Loading organization…</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6 max-w-7xl space-y-6">
        {/* Enhanced Page Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center shadow-md">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 via-purple-700 to-indigo-700 bg-clip-text text-transparent">
                    Analytics & Reports
                  </h1>
                  <p className="text-sm text-slate-600 mt-0.5">
                    Comprehensive workforce insights and performance metrics
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters Card */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              Date Range & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={applyDates} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Start Date</label>
                  <Input
                    type="date"
                    className="bg-white/80 border-slate-300 rounded-xl focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">End Date</label>
                  <Input
                    type="date"
                    className="bg-white/80 border-slate-300 rounded-xl focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {loading ? (
                      <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                    Apply Filters
                  </Button>
                </div>
                {(role === "admin" || role === "manager") && (
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={exportCSV}
                      disabled={loading}
                      className="w-full h-10 border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export CSV
                    </Button>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">
                      Reporting Period: {format(new Date(from), "MMM d, yyyy")} – {format(new Date(to), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-slate-600">
                      {Math.ceil((new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24))} days
                    </div>
                    <div className="text-xs px-2 py-1 bg-white rounded-md text-slate-600 font-medium">
                      {loading ? "Loading..." : `${scopedEmployeeIds.size} employee${scopedEmployeeIds.size !== 1 ? 's' : ''}`}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Enhanced KPI Dashboard with More Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white rounded-2xl overflow-hidden">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs lg:text-sm font-medium">Total Hours</p>
                  <p className="text-2xl lg:text-3xl font-bold mt-1 lg:mt-2">{kpis.totalHours}</p>
                  <p className="text-blue-200 text-xs mt-1">
                    {kpis.avgHoursPerShift}h avg/shift
                  </p>
                </div>
                <div className="h-10 w-10 lg:h-12 lg:w-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="h-5 w-5 lg:h-6 lg:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white rounded-2xl overflow-hidden">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs lg:text-sm font-medium">Total Shifts</p>
                  <p className="text-2xl lg:text-3xl font-bold mt-1 lg:mt-2">{kpis.totalShifts}</p>
                  <p className="text-green-200 text-xs mt-1">
                    {kpis.avgHoursPerEmployee}h per employee
                  </p>
                </div>
                <div className="h-10 w-10 lg:h-12 lg:w-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="h-5 w-5 lg:h-6 lg:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white rounded-2xl overflow-hidden">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs lg:text-sm font-medium">Completion Rate</p>
                  <p className="text-2xl lg:text-3xl font-bold mt-1 lg:mt-2">{kpis.completionRate}%</p>
                  <p className="text-purple-200 text-xs mt-1">
                    {kpis.completedShifts} completed
                  </p>
                </div>
                <div className="h-10 w-10 lg:h-12 lg:w-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="h-5 w-5 lg:h-6 lg:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white rounded-2xl overflow-hidden">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-xs lg:text-sm font-medium">Efficiency</p>
                  <p className="text-2xl lg:text-3xl font-bold mt-1 lg:mt-2">{kpis.efficiency}%</p>
                  <p className="text-orange-200 text-xs mt-1">
                    {kpis.productiveHours}h productive
                  </p>
                </div>
                <div className="h-10 w-10 lg:h-12 lg:w-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="h-5 w-5 lg:h-6 lg:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-cyan-500 via-cyan-600 to-cyan-700 text-white rounded-2xl overflow-hidden">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100 text-xs lg:text-sm font-medium">Time Off Days</p>
                  <p className="text-2xl lg:text-3xl font-bold mt-1 lg:mt-2">{kpis.approvedTimeOffDays}</p>
                  <p className="text-cyan-200 text-xs mt-1">
                    {kpis.pendingTimeOffRequests} pending
                  </p>
                </div>
                <div className="h-10 w-10 lg:h-12 lg:w-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="h-5 w-5 lg:h-6 lg:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 text-white rounded-2xl overflow-hidden">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-rose-100 text-xs lg:text-sm font-medium">Cancellation Rate</p>
                  <p className="text-2xl lg:text-3xl font-bold mt-1 lg:mt-2">{kpis.cancellationRate}%</p>
                  <p className="text-rose-200 text-xs mt-1">
                    {kpis.cancelledShifts} cancelled
                  </p>
                </div>
                <div className="h-10 w-10 lg:h-12 lg:w-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="h-5 w-5 lg:h-6 lg:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI-Powered Analytics Assistant */}
        {(role === "admin" || role === "manager") && (
          <AIReportsAssistant
            reportData={{
              kpis,
              employees: employeeTableRows,
              dateRange: { from, to },
            }}
          />
        )}

        {/* Comprehensive Insights Section */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Performance Insights & Recommendations
            </CardTitle>
            <p className="text-sm text-slate-600">AI-powered analysis of your workforce performance</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Performance Score */}
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-green-800">Overall Performance</div>
                  <div className="text-2xl font-bold text-green-700">
                    {Math.round((kpis.completionRate + kpis.efficiency) / 2)}%
                  </div>
                </div>
                <div className="text-xs text-green-600">
                  {kpis.completionRate >= 90 ? "Excellent completion rate" :
                   kpis.completionRate >= 75 ? "Good completion rate" : "Needs improvement"}
                </div>
              </div>

              {/* Workload Distribution */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-blue-800">Workload Balance</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {employees.length > 0 ? Math.round((kpis.totalShifts / employees.length) * 10) / 10 : 0}
                  </div>
                </div>
                <div className="text-xs text-blue-600">
                  {kpis.avgHoursPerEmployee >= 40 ? "High workload" :
                   kpis.avgHoursPerEmployee >= 20 ? "Balanced workload" : "Light workload"}
                </div>
              </div>

              {/* Resource Utilization */}
              <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-purple-800">Resource Efficiency</div>
                  <div className="text-2xl font-bold text-purple-700">{kpis.efficiency}%</div>
                </div>
                <div className="text-xs text-purple-600">
                  {kpis.efficiency >= 85 ? "Highly efficient" :
                   kpis.efficiency >= 70 ? "Good efficiency" : "Optimize scheduling"}
                </div>
              </div>
            </div>

            {/* Action Items */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="text-sm font-semibold text-slate-800 mb-3">📊 Key Recommendations</div>
              <div className="grid gap-3 sm:grid-cols-2">
                {kpis.cancellationRate > 5 && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-sm font-medium text-red-800">Reduce Cancellations</div>
                    <div className="text-xs text-red-600 mt-1">High cancellation rate ({kpis.cancellationRate}%) detected</div>
                  </div>
                )}
                {kpis.avgHoursPerEmployee < 20 && (
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-sm font-medium text-yellow-800">Increase Utilization</div>
                    <div className="text-xs text-yellow-600 mt-1">Employees averaging only {kpis.avgHoursPerEmployee}h</div>
                  </div>
                )}
                {kpis.pendingTimeOffRequests > 3 && (
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="text-sm font-medium text-orange-800">Review Time Off Requests</div>
                    <div className="text-xs text-orange-600 mt-1">{kpis.pendingTimeOffRequests} requests awaiting approval</div>
                  </div>
                )}
                {kpis.efficiency > 85 && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-sm font-medium text-green-800">Great Performance!</div>
                    <div className="text-xs text-green-600 mt-1">Team operating at {kpis.efficiency}% efficiency</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Admin/Manager Analytics */}
        {(role === "admin" || role === "manager") && (
          <>
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {/* Enhanced Hours by Employee Chart */}
              <Card className="xl:col-span-2 shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Employee Performance Overview
                  </CardTitle>
                  <p className="text-sm text-slate-600">Total hours worked by each team member</p>
                </CardHeader>
                <CardContent className="h-[300px] sm:h-[380px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={employeeTableRows} margin={{ top: 20, right: 15, left: 15, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                        stroke="#64748b"
                        interval={0}
                      />
                      <YAxis fontSize={12} stroke="#64748b" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                        }}
                        labelStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                      />
                      <Legend />
                      <Bar
                        dataKey="hours"
                        name="Hours Worked"
                        fill="url(#colorGradient1)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="shifts"
                        name="Total Shifts"
                        fill="url(#colorGradient2)"
                        radius={[4, 4, 0, 0]}
                      />
                      <defs>
                        <linearGradient id="colorGradient1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#1e40af" stopOpacity={0.8} />
                        </linearGradient>
                        <linearGradient id="colorGradient2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Enhanced Position Distribution Chart */}
              <Card className="xl:col-span-1 shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
                    <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                    Position Distribution
                  </CardTitle>
                  <p className="text-sm text-slate-600">Hours allocation by role</p>
                </CardHeader>
                <CardContent className="h-[300px] sm:h-[380px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                          fontSize: '12px'
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }}
                        iconSize={12}
                      />
                      <Pie
                        data={Array.from(totalsByPosition.entries()).map(([posId, rec]) => ({
                          id: posId,
                          name: rec.name,
                          value: rec.hours,
                          percentage: totalsByPosition.size > 0 ?
                            ((rec.hours / Array.from(totalsByPosition.values()).reduce((sum, p) => sum + p.hours, 0)) * 100).toFixed(1) : 0
                        }))}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        outerRadius="80%"
                        innerRadius="40%"
                        paddingAngle={3}
                      >
                        {Array.from(totalsByPosition.keys()).map((_, idx) => (
                          <Cell
                            key={idx}
                            fill={COLORS[idx % COLORS.length]}
                            stroke="white"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>\n                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Trend Analysis */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
                  <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Workforce Trends & Patterns
                </CardTitle>
                <p className="text-sm text-slate-600">Daily hours progression and workload distribution</p>
              </CardHeader>
              <CardContent className="h-[300px] sm:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyTotals} margin={{ top: 20, right: 15, left: 15, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="day"
                      tickFormatter={(d) => format(parseISO(d), "MM/dd")}
                      fontSize={11}
                      stroke="#64748b"
                      interval="preserveStartEnd"
                    />
                    <YAxis fontSize={12} stroke="#64748b" />
                    <Tooltip
                      labelFormatter={(d) => format(parseISO(d as string), "EEEE, MMMM d, yyyy")}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="hours"
                      name="Daily Hours"
                      stroke="url(#lineGradient)"
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
                    />
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Enhanced Employee Performance Table */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Detailed Employee Performance
                </CardTitle>
                <p className="text-sm text-slate-600">Comprehensive breakdown of individual contributions</p>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 border-b-2 border-slate-200">
                        <th className="p-4 text-left font-bold text-slate-800">
                          <div className="flex items-center gap-2">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Employee
                          </div>
                        </th>
                        <th className="p-4 text-left font-bold text-slate-800">
                          <div className="flex items-center gap-2">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                            </svg>
                            Position
                          </div>
                        </th>
                        <th className="p-4 text-right font-bold text-slate-800">
                          <div className="flex items-center justify-end gap-2">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Total Hours
                          </div>
                        </th>
                        <th className="p-4 text-right font-bold text-slate-800">
                          <div className="flex items-center justify-end gap-2">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Total Shifts
                          </div>
                        </th>
                        <th className="p-4 text-right font-bold text-slate-800">
                          <div className="flex items-center justify-end gap-2">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Avg Hours/Shift
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeeTableRows.map((r, index) => (
                        <tr
                          key={r.id}
                          className={`border-b border-slate-100 transition-colors hover:bg-slate-50/50 ${
                            index % 2 === 0 ? "bg-white" : "bg-slate-50/20"
                          }`}
                        >
                          <td className="p-4">
                            <div className="font-semibold text-slate-800">{r.name}</div>
                          </td>
                          <td className="p-4">
                            {r.position === "Unassigned" ? (
                              <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-300">
                                Unassigned
                              </Badge>
                            ) : (
                              <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200">
                                {r.position}
                              </Badge>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <div className="font-bold text-slate-800 text-lg">{r.hours.toFixed(1)}</div>
                            <div className="text-xs text-slate-500">hours</div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="font-bold text-slate-800 text-lg">{r.shifts}</div>
                            <div className="text-xs text-slate-500">shifts</div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="font-bold text-slate-800 text-lg">
                              {r.shifts > 0 ? (r.hours / r.shifts).toFixed(1) : "0.0"}
                            </div>
                            <div className="text-xs text-slate-500">hrs/shift</div>
                          </td>
                        </tr>
                      ))}
                      {employeeTableRows.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-12 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <div>
                                <div className="text-lg font-medium text-slate-600">No performance data available</div>
                                <div className="text-sm text-slate-500 mt-1">Try adjusting your date range or check if employees have scheduled shifts.</div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
        </>
      )}

        {/* Enhanced Employee Personal Dashboard */}
        {role === "employee" && (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    My Work Hours Timeline
                  </CardTitle>
                  <p className="text-sm text-slate-600">Your daily hours worked over the selected period</p>
                </CardHeader>
                <CardContent className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyTotals} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="day"
                        tickFormatter={(d) => format(parseISO(d), "MM/dd")}
                        fontSize={12}
                        stroke="#64748b"
                      />
                      <YAxis fontSize={12} stroke="#64748b" />
                      <Tooltip
                        labelFormatter={(d) => format(parseISO(d as string), "EEEE, MMMM d, yyyy")}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                        }}
                        labelStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="hours"
                        name="Hours Worked"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
                    <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    My Shift Status Breakdown
                  </CardTitle>
                  <p className="text-sm text-slate-600">Distribution of your shift statuses</p>
                </CardHeader>
                <CardContent className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                      <Pie
                        data={statusBreakdown}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={40}
                        paddingAngle={2}
                      >
                        {statusBreakdown.map((_, idx) => (
                          <Cell
                            key={idx}
                            fill={COLORS[idx % COLORS.length]}
                            stroke="white"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Time Off Summary */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
                  <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  My Time Off Summary
                </CardTitle>
                <p className="text-sm text-slate-600">Your approved and pending time off requests</p>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-slate-50 via-orange-50 to-amber-50 border-b-2 border-slate-200">
                        <th className="p-4 text-left font-bold text-slate-800">Type</th>
                        <th className="p-4 text-left font-bold text-slate-800">Status</th>
                        <th className="p-4 text-left font-bold text-slate-800">Start Date</th>
                        <th className="p-4 text-left font-bold text-slate-800">End Date</th>
                        <th className="p-4 text-left font-bold text-slate-800">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scopedTimeOff.map((t, index) => {
                        const duration = Math.ceil((new Date(t.ends_at).getTime() - new Date(t.starts_at).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                        return (
                          <tr
                            key={t.id}
                            className={`border-b border-slate-100 transition-colors hover:bg-slate-50/50 ${
                              index % 2 === 0 ? "bg-white" : "bg-slate-50/20"
                            }`}
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${
                                  t.type === 'vacation' ? 'bg-blue-500' :
                                  t.type === 'sick' ? 'bg-red-500' :
                                  t.type === 'unpaid' ? 'bg-gray-500' : 'bg-purple-500'
                                }`} />
                                <span className="capitalize font-medium text-slate-800">{t.type}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge
                                variant={t.status === "approved" ? "default" : "outline"}
                                className={`capitalize ${
                                  t.status === "approved"
                                    ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                                    : t.status === "pending"
                                    ? "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200"
                                    : "bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
                                }`}
                              >
                                {t.status}
                              </Badge>
                            </td>
                            <td className="p-4 font-medium text-slate-800">
                              {format(new Date(t.starts_at), "MMM d, yyyy")}
                            </td>
                            <td className="p-4 font-medium text-slate-800">
                              {format(new Date(t.ends_at), "MMM d, yyyy")}
                            </td>
                            <td className="p-4">
                              <div className="font-bold text-slate-800">
                                {duration} {duration === 1 ? 'day' : 'days'}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {scopedTimeOff.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-12 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <div>
                                <div className="text-lg font-medium text-slate-600">No time off requests found</div>
                                <div className="text-sm text-slate-500 mt-1">You haven't requested any time off in this date range.</div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
