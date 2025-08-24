// app/(dashboard)/page.tsx
"use client";

import * as React from "react";
import { createClient } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users2,
  Clock3,
  CalendarDays,
  ChevronRight,
  Loader2,
  Check,
  X,
  RefreshCw,
  Radio
} from "lucide-react";
import {
  addDays,
  startOfWeek,
  endOfWeek,
  format,
  differenceInMinutes,
  isToday,
} from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOrg } from "@/components/providers/OrgProvider";
import { usePermissions } from "@/app/hooks/usePermissions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ==== Types (with normalization helpers) ==== */
type Position = { name: string; color: string | null };
type EmployeeLite = { full_name: string; avatar_url: string | null };

type Shift = {
  id: string;
  employee_id: string | null;
  starts_at: string;
  ends_at: string;
  break_minutes: number | null;
  status: "scheduled" | "published" | "completed" | "cancelled";
  positions?: Position | null;
  employees?: EmployeeLite | null;
};
type TimeOff = {
  id: string;
  employee_id: string;
  starts_at: string;
  ends_at: string;
  type: "vacation" | "sick" | "unpaid" | "other";
  reason: string | null;
  status: "pending" | "approved" | "denied";
  employees?: EmployeeLite | null;
};

// What Supabase may actually return for joins (object OR array)
type MaybeArray<T> = T | T[] | null | undefined;
type RawShift = Omit<Shift, "positions" | "employees"> & {
  positions?: MaybeArray<Position>;
  employees?: MaybeArray<EmployeeLite>;
};
type RawTimeOff = Omit<TimeOff, "employees"> & {
  employees?: MaybeArray<EmployeeLite>;
};

function pickOne<T>(v: MaybeArray<T>): T | null {
  return Array.isArray(v) ? v[0] ?? null : v ?? null;
}

function hoursBetween(startIso: string, endIso: string, breakMin: number | null) {
  const mins = differenceInMinutes(new Date(endIso), new Date(startIso));
  const net = Math.max(0, mins - (breakMin || 0));
  return +(net / 60).toFixed(2);
}

/* ===================== Page ===================== */
export default function DashboardPage() {
  const sb = React.useMemo(() => createClient(), []);
  const { orgId, role, loading } = useOrg();
  const perms = usePermissions(role);

  const [weekStart, setWeekStart] = React.useState(
    startOfWeek(new Date(), { weekStartsOn: 1 }) // Monday-start
  );
  const weekEnd = React.useMemo(
    () => endOfWeek(weekStart, { weekStartsOn: 1 }),
    [weekStart]
  );
  const weekDays = React.useMemo(
    () => [...Array(7)].map((_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const [busy, setBusy] = React.useState(true);
  const [employeeCount, setEmployeeCount] = React.useState(0);
  const [shifts, setShifts] = React.useState<Shift[]>([]);
  const [pendingTO, setPendingTO] = React.useState<TimeOff[]>([]);
  const [upcoming, setUpcoming] = React.useState<Shift[]>([]);

  // Derived
  const weekHours = React.useMemo(
    () =>
      shifts.reduce(
        (acc, s) => acc + hoursBetween(s.starts_at, s.ends_at, s.break_minutes),
        0
      ),
    [shifts]
  );
  const openShifts = React.useMemo(
    () => shifts.filter((s) => !s.employee_id).length,
    [shifts]
  );
  const pendingCount = pendingTO.length;

  const TARGET_SHIFTS_PER_DAY = 8;

  async function load() {
    if (!orgId) return;
    setBusy(true);

    // Employees count
    const { count: empCount, error: empErr } = await sb
      .from("employees")
      .select("*", { count: "exact", head: true })
      .eq("org_id", orgId);
    if (empErr) toast.error("Failed to load employees", { description: empErr.message });
    setEmployeeCount(empCount || 0);

    // This week shifts
    const sRes = await sb
      .from("shifts")
      .select(
        "id, employee_id, starts_at, ends_at, break_minutes, status, positions:position_id(name,color), employees:employee_id(full_name, avatar_url)"
      )
      .eq("org_id", orgId)
      .gte("starts_at", weekStart.toISOString())
      .lt("starts_at", weekEnd.toISOString());
    if (sRes.error) {
      toast.error("Failed to load shifts", { description: sRes.error.message });
    } else {
      const raw = (sRes.data || []) as RawShift[];
      const mapped: Shift[] = raw.map((r) => ({
        id: r.id,
        employee_id: r.employee_id,
        starts_at: r.starts_at,
        ends_at: r.ends_at,
        break_minutes: r.break_minutes,
        status: r.status,
        positions: pickOne(r.positions),
        employees: pickOne(r.employees),
      }));
      setShifts(mapped);
    }

    // Upcoming (next 8)
    const upRes = await sb
      .from("shifts")
      .select(
        "id, employee_id, starts_at, ends_at, break_minutes, status, positions:position_id(name,color), employees:employee_id(full_name, avatar_url)"
      )
      .eq("org_id", orgId)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(8);
    if (upRes.error) {
      toast.error("Failed to load upcoming shifts", { description: upRes.error.message });
    } else {
      const raw = (upRes.data || []) as RawShift[];
      const mapped: Shift[] = raw.map((r) => ({
        id: r.id,
        employee_id: r.employee_id,
        starts_at: r.starts_at,
        ends_at: r.ends_at,
        break_minutes: r.break_minutes,
        status: r.status,
        positions: pickOne(r.positions),
        employees: pickOne(r.employees),
      }));
      setUpcoming(mapped);
    }

    // Pending time off
    const toRes = await sb
      .from("time_off")
      .select(
        "id, employee_id, starts_at, ends_at, type, reason, status, employees:employee_id(full_name, avatar_url)"
      )
      .eq("org_id", orgId)
      .eq("status", "pending")
      .order("starts_at", { ascending: true })
      .limit(10);
    if (toRes.error) {
      toast.error("Failed to load time off", { description: toRes.error.message });
    } else {
      const raw = (toRes.data || []) as RawTimeOff[];
      const mapped: TimeOff[] = raw.map((r) => ({
        id: r.id,
        employee_id: r.employee_id,
        starts_at: r.starts_at,
        ends_at: r.ends_at,
        type: r.type,
        reason: r.reason,
        status: r.status,
        employees: pickOne(r.employees),
      }));
      setPendingTO(mapped);
    }

    setBusy(false);
  }

  React.useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, weekStart]);

  React.useEffect(() => {
    if (!orgId) return;
    const ch1 = sb
      .channel(`shifts-${orgId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shifts", filter: `org_id=eq.${orgId}` },
        load
      )
      .subscribe();
    const ch2 = sb
      .channel(`timeoff-${orgId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "time_off", filter: `org_id=eq.${orgId}` },
        load
      )
      .subscribe();
    return () => {
      sb.removeChannel(ch1);
      sb.removeChannel(ch2);
    };
  }, [sb, orgId]);

  async function updateTOStatus(id: string, status: TimeOff["status"]) {
    const prev = [...pendingTO];
    // Optimistic UI
    setPendingTO((cur) => cur.map((r) => (r.id === id ? { ...r, status } : r)));
    const { error } = await sb.from("time_off").update({ status }).eq("id", id);
    if (error) {
      setPendingTO(prev);
      toast.error("Failed to update", { description: error.message });
    } else {
      setPendingTO((cur) => cur.filter((r) => r.id !== id));
      toast.success(`Request ${status}`);
    }
  }

  if (loading || !orgId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      </div>
    );
  }

  const coverage = weekDays.map((date) => {
    const key = format(date, "yyyy-MM-dd");
    const count = shifts.filter(
      (s) => format(new Date(s.starts_at), "yyyy-MM-dd") === key
    ).length;
    const bar = Math.min(100, (count / TARGET_SHIFTS_PER_DAY) * 100);
    return { date, count, bar };
  });

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-sm text-slate-600">
          Week of <span className="font-medium">{format(weekStart, "MMM d, yyyy")}</span>
        </div>
        <Badge variant="outline" className="ml-2 gap-1"> <Radio className="h-3.5 w-3.5 text-green-600"/> Live</Badge>
        <div className="ml-auto" />
        <Button variant="outline" onClick={() => setWeekStart(addDays(weekStart, -7))}>Previous</Button>
        <Button variant="outline" onClick={() => setWeekStart(addDays(weekStart, +7))}>Next</Button>
        <Button variant="outline" onClick={load} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
        <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white" asChild>
          <a href="/schedule"><CalendarDays className="h-4 w-4" /> Go to Schedule</a>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={<Users2 className="h-5 w-5" />} title="Employees" value={employeeCount} accent="from-indigo-50 to-white text-indigo-700" />
        <KpiCard icon={<Clock3 className="h-5 w-5" />} title="Hours scheduled (week)" value={weekHours.toFixed(1)} accent="from-fuchsia-50 to-white text-fuchsia-700" />
        <KpiCard icon={<CalendarDays className="h-5 w-5" />} title="Open shifts (week)" value={openShifts} accent="from-sky-50 to-white text-sky-700" />
        <KpiCard icon={<CalendarDays className="h-5 w-5" />} title="Pending time off" value={pendingCount} accent="from-amber-50 to-white text-amber-700" />
      </div>

      {/* Coverage + Pending Time Off */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="p-4 xl:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-semibold">Coverage this week</div>
            <Button variant="outline" size="sm" asChild>
              <a href="/schedule">View schedule <ChevronRight className="ml-1 h-4 w-4" /></a>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {coverage.map(({ date, count, bar }) => (
              <div key={+date} className={cn("rounded-xl border bg-white p-3", isToday(date) && "ring-1 ring-indigo-200") }>
                <div className="text-center text-xs text-slate-500">{format(date, "EEE")}</div>
                <div className="text-center text-sm text-slate-400">{format(date, "MMM d")}</div>
                <div className="mt-2 text-center"><span className="text-2xl font-semibold">{count}</span></div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" style={{ width: `${bar}%` }} />
                </div>
                <div className="mt-1 text-center text-[11px] text-slate-500">of {TARGET_SHIFTS_PER_DAY} shifts</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-semibold">Pending time off</div>
            <Button variant="outline" size="sm" asChild>
              <a href="/time-off">Manage <ChevronRight className="ml-1 h-4 w-4" /></a>
            </Button>
          </div>
          <div className="grid gap-2">
            {busy && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            )}
            {!busy && pendingTO.length === 0 && (
              <div className="rounded-lg border bg-white p-4 text-sm text-slate-500">No pending requests.</div>
            )}
            {!busy && pendingTO.map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-xl border bg-white p-3">
                {/* Avatar */}
                <img
                  src={r.employees?.avatar_url || "/avatar.svg"}
                  alt=""
                  className="h-9 w-9 rounded-full bg-slate-100 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{r.employees?.full_name || "Unknown"}</div>
                  <div className="text-xs text-slate-500">
                    {format(new Date(r.starts_at), "MMM d")} – {format(new Date(r.ends_at), "MMM d")} • {r.type}
                  </div>
                  {r.reason && (
                    <div className="mt-1 truncate text-xs text-slate-500">“{r.reason}”</div>
                  )}
                </div>
                {perms.canApproveTimeOff ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateTOStatus(r.id, "approved")}
                      className="gap-1 border-green-200 text-green-700 hover:bg-green-50"
                    >
                      <Check className="h-4 w-4" /> Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateTOStatus(r.id, "denied")}
                      className="gap-1 border-rose-200 text-rose-700 hover:bg-rose-50"
                    >
                      <X className="h-4 w-4" /> Deny
                    </Button>
                  </div>
                ) : (
                  <Badge variant="outline">View only</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Upcoming Shifts */}
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="font-semibold">Upcoming shifts</div>
          <Button variant="outline" size="sm" asChild>
            <a href="/schedule">See all <ChevronRight className="ml-1 h-4 w-4" /></a>
          </Button>
        </div>

        {/* Table on md+, cards on small screens */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcoming.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-sm text-slate-500">No upcoming shifts.</TableCell>
                </TableRow>
              ) : (
                upcoming.map((s) => (
                  <TableRow key={s.id} className="align-middle">
                    <TableCell className="whitespace-nowrap">
                      <div className="font-medium">{format(new Date(s.starts_at), "EEE, MMM d")}</div>
                      <div className="text-xs text-slate-500">
                        {format(new Date(s.starts_at), "h:mm a")} – {format(new Date(s.ends_at), "h:mm a")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <img
                          src={s.employees?.avatar_url || "/avatar.svg"}
                          className="h-7 w-7 rounded-full bg-slate-100 object-cover"
                          alt=""
                        />
                        <div>{s.employees?.full_name || "Unassigned"}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: s.positions?.color || "#6366F1" }}
                        />
                        {s.positions?.name ?? "Shift"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{hoursBetween(s.starts_at, s.ends_at, s.break_minutes)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile list */}
        <div className="grid gap-2 md:hidden">
          {upcoming.length === 0 ? (
            <div className="rounded-lg border bg-white p-4 text-sm text-slate-500">No upcoming shifts.</div>
          ) : (
            upcoming.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl border bg-white p-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">
                    {format(new Date(s.starts_at), "EEE, MMM d")} • {format(new Date(s.starts_at), "p")}–{format(new Date(s.ends_at), "p")}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                    <img src={s.employees?.avatar_url || "/avatar.svg"} className="h-5 w-5 rounded-full bg-slate-100 object-cover" alt="" />
                    <span>{s.employees?.full_name || "Unassigned"}</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.positions?.color || "#6366F1" }} />
                      {s.positions?.name ?? "Shift"}
                    </span>
                  </div>
                </div>
                <div className="text-right text-sm font-semibold">
                  {hoursBetween(s.starts_at, s.ends_at, s.break_minutes)}h
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

/* Small presentational component */
function KpiCard({
  icon,
  title,
  value,
  accent = "from-slate-50 to-white text-slate-700",
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={cn("grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br", accent)}>
          {icon}
        </div>
        <div>
          <div className="text-sm text-slate-500">{title}</div>
          <div className="text-xl font-semibold">{value}</div>
        </div>
      </div>
    </Card>
  );
}
