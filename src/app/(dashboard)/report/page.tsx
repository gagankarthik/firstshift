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
    const approvedTO = scopedTimeOff.filter((t) => t.status === "approved");
    const approvedDays = approvedTO.reduce((acc, t) => {
      // rough whole-day count inclusive
      const a = new Date(t.starts_at);
      const b = new Date(t.ends_at);
      const diff = Math.max(0, Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      return acc + diff;
    }, 0);
    return {
      totalHours: +totalHours.toFixed(2),
      completedShifts: completed,
      totalShifts: scheduled,
      approvedTimeOffDays: approvedDays,
    };
  }, [scopedShifts, scopedTimeOff]);

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
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={applyDates} className="flex flex-wrap items-end gap-3">
            <div>
              <div className="mb-1 text-xs text-gray-500">From</div>
              <Input type="date" className="bg-white" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <div className="mb-1 text-xs text-gray-500">To</div>
              <Input type="date" className="bg-white" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading}>Apply</Button>
            {(role === "admin" || role === "manager") && (
              <Button type="button" variant="outline" onClick={exportCSV} disabled={loading}>
                Export CSV
              </Button>
            )}
            <div className="ml-auto text-xs text-gray-500">
              Range: {format(new Date(from), "MMM d, yyyy")} – {format(new Date(to), "MMM d, yyyy")}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm">Total Hours</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{kpis.totalHours}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm">Total Shifts</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{kpis.totalShifts}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm">Completed Shifts</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{kpis.completedShifts}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm">Approved Time Off (days)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{kpis.approvedTimeOffDays}</CardContent>
        </Card>
      </div>

      {/* Admin/Manager view */}
      {(role === "admin" || role === "manager") && (
        <>
          <div className="grid gap-4 xl:grid-cols-3">
            {/* Hours by employee (bar) */}
            <Card className="xl:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle>Hours by employee</CardTitle>
              </CardHeader>
              <CardContent className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={employeeTableRows}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" hide />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="hours" name="Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Hours by position (pie) */}
            <Card className="xl:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle>Hours by position</CardTitle>
              </CardHeader>
              <CardContent className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip />
                    <Legend />
                    <Pie
                      data={Array.from(totalsByPosition.entries()).map(([posId, rec]) => ({
                        id: posId,
                        name: rec.name,
                        value: rec.hours,
                      }))}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={100}
                    >
                      {Array.from(totalsByPosition.keys()).map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Trend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Hours over time</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTotals}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tickFormatter={(d) => format(parseISO(d), "MM/dd")} />
                  <YAxis />
                  <Tooltip labelFormatter={(d) => format(parseISO(d as string), "MMM d, yyyy")} />
                  <Legend />
                  <Line type="monotone" dataKey="hours" name="Hours" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Employee table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Employee summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto rounded-md border bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="border-b">
                      <th className="p-2 text-left">Employee</th>
                      <th className="p-2 text-left">Position</th>
                      <th className="p-2 text-right">Hours</th>
                      <th className="p-2 text-right">Shifts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeTableRows.map((r) => (
                      <tr key={r.id} className="border-b">
                        <td className="p-2">{r.name}</td>
                        <td className="p-2">
                          {r.position === "Unassigned" ? (
                            <Badge variant="outline">Unassigned</Badge>
                          ) : (
                            r.position
                          )}
                        </td>
                        <td className="p-2 text-right">{r.hours.toFixed(2)}</td>
                        <td className="p-2 text-right">{r.shifts}</td>
                      </tr>
                    ))}
                    {employeeTableRows.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-500">
                          No data in this range.
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

      {/* Employee view (only my data) */}
      {role === "employee" && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>My hours over time</CardTitle>
              </CardHeader>
              <CardContent className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyTotals}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tickFormatter={(d) => format(parseISO(d), "MM/dd")} />
                    <YAxis />
                    <Tooltip labelFormatter={(d) => format(parseISO(d as string), "MMM d, yyyy")} />
                    <Legend />
                    <Line type="monotone" dataKey="hours" name="Hours" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>My shift statuses</CardTitle>
              </CardHeader>
              <CardContent className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip />
                    <Legend />
                    <Pie
                      data={statusBreakdown}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={100}
                    >
                      {statusBreakdown.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* My time off list */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>My time off in range</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto rounded-md border bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="border-b">
                      <th className="p-2 text-left">Type</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">From</th>
                      <th className="p-2 text-left">To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scopedTimeOff.map((t) => (
                      <tr key={t.id} className="border-b">
                        <td className="p-2 capitalize">{t.type}</td>
                        <td className="p-2">
                          <Badge variant={t.status === "approved" ? "default" : "outline"}>
                            {t.status}
                          </Badge>
                        </td>
                        <td className="p-2">{format(new Date(t.starts_at), "MMM d, yyyy")}</td>
                        <td className="p-2">{format(new Date(t.ends_at), "MMM d, yyyy")}</td>
                      </tr>
                    ))}
                    {scopedTimeOff.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-500">
                          No time off in this range.
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
  );
}
