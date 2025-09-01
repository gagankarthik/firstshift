// app/(dashboard)/page.tsx
"use client";

import * as React from "react";
import { createClient } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users2,
  Clock3,
  CalendarDays,
  ChevronRight,
  Loader2,
  Check,
  X,
  RefreshCw,
  Radio,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  UserCheck,
  UserX,
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Star,
  Activity,
  Target,
  BarChart3,
  Plus,
} from "lucide-react";
import {
  addDays,
  startOfWeek,
  endOfWeek,
  format,
  differenceInMinutes,
  isToday,
  isTomorrow,
  isYesterday,
  startOfDay,
  endOfDay,
  subWeeks,
} from "date-fns";
import { useOrg } from "@/components/providers/OrgProvider";
import { usePermissions } from "@/app/hooks/usePermissions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ==== Enhanced Types ==== */
type Position = { id: string; name: string; color: string | null };
type Location = { id: string; name: string };
type EmployeeLite = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  position?: Position | null;
};

type Shift = {
  id: string;
  employee_id: string | null;
  position_id: string | null;
  location_id: string | null;
  starts_at: string;
  ends_at: string;
  break_minutes: number | null;
  status: "scheduled" | "published" | "completed" | "cancelled";
  positions?: Position | null;
  employees?: EmployeeLite | null;
  locations?: Location | null;
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

type DashboardStats = {
  totalEmployees: number;
  weekHours: number;
  openShifts: number;
  pendingTimeOff: number;
  completionRate: number;
  avgShiftLength: number;
  mostActiveEmployee: string | null;
  busyDays: string[];
};

// Normalization helpers
type MaybeArray<T> = T | T[] | null | undefined;
function pickOne<T>(v: MaybeArray<T>): T | null {
  return Array.isArray(v) ? v[0] ?? null : v ?? null;
}

function hoursBetween(startIso: string, endIso: string, breakMin: number | null) {
  const mins = differenceInMinutes(new Date(endIso), new Date(startIso));
  const net = Math.max(0, mins - (breakMin || 0));
  return +(net / 60).toFixed(2);
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

/* ==== UI Components ==== */

function EmployeeAvatar({
  employee,
  size = "md",
  showStatus = false,
}: {
  employee: EmployeeLite;
  size?: "xs" | "sm" | "md" | "lg";
  showStatus?: boolean;
}) {
  const sizeClasses = {
    xs: "h-4 w-4",
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const textSizes = {
    xs: "text-[8px]",
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const initials = employee.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full flex items-center justify-center",
        sizeClasses[size]
      )}
    >
      {employee.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={employee.avatar_url} alt={employee.full_name} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center">
          <span className={cn("font-medium text-blue-700", textSizes[size])}>{initials}</span>
        </div>
      )}
      {showStatus && (
        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-400" />
      )}
      {employee.position?.color && (
        <div
          className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-white"
          style={{ backgroundColor: employee.position.color }}
          title={employee.position.name}
        />
      )}
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
  trend,
  trendValue,
  gradient = "from-blue-500 to-purple-600",
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  gradient?: string;
  onClick?: () => void;
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Activity;
  const trendColor = trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-500";

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200 hover:shadow-lg",
        onClick && "cursor-pointer hover:scale-[1.02]"
      )}
      onClick={onClick}
    >
      <div className="p-4 sm:p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1.5">
            <div className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</div>
            {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
            {trend && trendValue && (
              <div className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
                <TrendIcon className="h-3.5 w-3.5" />
                {trendValue} vs last week
              </div>
            )}
          </div>
          <div className={cn("rounded-xl p-3 bg-gradient-to-br text-white", gradient)}>{icon}</div>
        </div>
      </div>
      <div className={cn("absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r", gradient)} />
    </Card>
  );
}

function CoverageChart({
  coverage,
  target,
}: {
  coverage: Array<{ date: Date; count: number; bar: number }>;
  target: number;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {coverage.map(({ date, count, bar }) => {
          const isT = isToday(date);
          const isTm = isTomorrow(date);
          const isY = isYesterday(date);

          let dayLabel = format(date, "EEE");
          if (isT) dayLabel = "Today";
          else if (isTm) dayLabel = "Tomorrow";
          else if (isY) dayLabel = "Yesterday";

          const pct = Math.min(100, (count / target) * 100);
          const well = pct >= 80;
          const under = pct < 50;

          return (
            <div
              key={+date}
              className={cn(
                "rounded-xl border p-3 transition-all duration-200",
                isT ? "ring-2 ring-blue-200 bg-blue-50/60" : "bg-white hover:shadow-sm"
              )}
            >
              <div className="text-center">
                <div className={cn("text-xs font-medium", isT ? "text-blue-700" : "text-gray-700")}>{dayLabel}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{format(date, "MMM d")}</div>
              </div>

              <div className="mt-3 text-center">
                <div
                  className={cn(
                    "text-xl font-bold",
                    well ? "text-green-600" : under ? "text-red-600" : "text-amber-600"
                  )}
                >
                  {count}
                </div>
                <div className="text-[11px] text-gray-500">shifts</div>
              </div>

              <div className="mt-3">
                <Progress value={pct} className="h-2" />
                <div className="mt-1 text-center text-[11px] text-gray-500">{Math.round(pct)}%</div>
              </div>

              {under && (
                <div className="mt-2 flex justify-center">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuickActionCard({
  title,
  description,
  icon,
  action,
  href,
  variant = "default",
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  href: string;
  variant?: "default" | "primary" | "success" | "warning";
}) {
  const variants = {
    default: "from-gray-50 to-white border-gray-200 hover:from-gray-100",
    primary: "from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100",
    success: "from-green-50 to-emerald-50 border-green-200 hover:from-green-100",
    warning: "from-amber-50 to-orange-50 border-amber-200 hover:from-amber-100",
  };

  return (
    <Card
      className={cn(
        "p-4 transition-all duration-200 hover:shadow-md cursor-pointer bg-gradient-to-br border",
        variants[variant]
      )}
    >
      <a href={href} className="block">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 rounded-lg p-2 bg-white/90 shadow-sm">{icon}</div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-gray-900">{title}</div>
            <div className="text-sm text-gray-600 mt-1">{description}</div>
            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-blue-600">
              {action} <ChevronRight className="h-3 w-3" />
            </div>
          </div>
        </div>
      </a>
    </Card>
  );
}

/* ===================== Main Dashboard ===================== */
export default function DashboardPage() {
  const sb = React.useMemo(() => createClient(), []);
  const { orgId, role, loading } = useOrg();
  const perms = usePermissions(role);

  const [weekStart, setWeekStart] = React.useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [lastWeekStart] = React.useState(startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }));

  const weekEnd = React.useMemo(() => endOfWeek(weekStart, { weekStartsOn: 1 }), [weekStart]);
  const weekDays = React.useMemo(() => [...Array(7)].map((_, i) => addDays(weekStart, i)), [weekStart]);

  const [busy, setBusy] = React.useState(true);
  const [lastUpdate, setLastUpdate] = React.useState<Date>(new Date());
  const [stats, setStats] = React.useState<DashboardStats>({
    totalEmployees: 0,
    weekHours: 0,
    openShifts: 0,
    pendingTimeOff: 0,
    completionRate: 0,
    avgShiftLength: 0,
    mostActiveEmployee: null,
    busyDays: [],
  });

  const [shifts, setShifts] = React.useState<Shift[]>([]);
  const [lastWeekShifts, setLastWeekShifts] = React.useState<Shift[]>([]);
  const [pendingTO, setPendingTO] = React.useState<TimeOff[]>([]);
  const [upcoming, setUpcoming] = React.useState<Shift[]>([]);
  const [todayShifts, setTodayShifts] = React.useState<Shift[]>([]);
  const [employees, setEmployees] = React.useState<EmployeeLite[]>([]);

  const TARGET_SHIFTS_PER_DAY = 8;

  // Real-time auto-refresh
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!busy) void load();
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy, orgId, weekStart]);

  async function load() {
    if (!orgId) return;
    setBusy(true);
    setLastUpdate(new Date());

    try {
      const [employeesRes, currentWeekRes, lastWeekRes, upcomingRes, todayRes, timeOffRes] = await Promise.all([
        sb
          .from("employees")
          .select("id, full_name, avatar_url, positions:position_id(id,name,color)")
          .eq("org_id", orgId)
          .order("full_name"),

        sb
          .from("shifts")
          .select(
            `
            id, employee_id, position_id, location_id, starts_at, ends_at, break_minutes, status,
            positions:position_id(id,name,color),
            employees:employee_id(id,full_name,avatar_url),
            locations:location_id(id,name)
          `
          )
          .eq("org_id", orgId)
          .gte("starts_at", weekStart.toISOString())
          .lt("starts_at", weekEnd.toISOString())
          .order("starts_at"),

        sb
          .from("shifts")
          .select("id, starts_at, ends_at, break_minutes, employee_id")
          .eq("org_id", orgId)
          .gte("starts_at", lastWeekStart.toISOString())
          .lt("starts_at", startOfWeek(weekStart, { weekStartsOn: 1 }).toISOString()),

        sb
          .from("shifts")
          .select(
            `
            id, employee_id, starts_at, ends_at, break_minutes, status,
            positions:position_id(id,name,color),
            employees:employee_id(id,full_name,avatar_url),
            locations:location_id(id,name)
          `
          )
          .eq("org_id", orgId)
          .gte("starts_at", new Date().toISOString())
          .order("starts_at", { ascending: true })
          .limit(10),

        sb
          .from("shifts")
          .select(
            `
            id, employee_id, starts_at, ends_at, status,
            positions:position_id(id,name,color),
            employees:employee_id(id,full_name,avatar_url)
          `
          )
          .eq("org_id", orgId)
          .gte("starts_at", startOfDay(new Date()).toISOString())
          .lt("starts_at", endOfDay(new Date()).toISOString())
          .order("starts_at"),

        sb
          .from("time_off")
          .select(
            `
            id, employee_id, starts_at, ends_at, type, reason, status,
            employees:employee_id(id,full_name,avatar_url)
          `
          )
          .eq("org_id", orgId)
          .eq("status", "pending")
          .order("starts_at", { ascending: true })
          .limit(15),
      ]);

      const employeesData = (employeesRes.data || []).map((e: any) => ({
        id: e.id,
        full_name: e.full_name,
        avatar_url: e.avatar_url,
        position: pickOne(e.positions),
      }));
      setEmployees(employeesData);

      const processShifts = (data: any[]): Shift[] =>
        (data || []).map((r: any) => ({
          id: r.id,
          employee_id: r.employee_id,
          position_id: r.position_id,
          location_id: r.location_id,
          starts_at: r.starts_at,
          ends_at: r.ends_at,
          break_minutes: r.break_minutes,
          status: r.status,
          positions: pickOne(r.positions),
          employees: pickOne(r.employees),
          locations: pickOne(r.locations),
        }));

      const currentShifts = processShifts(currentWeekRes.data || []);
      const lastShifts = processShifts(lastWeekRes.data || []);
      const upcomingShifts = processShifts(upcomingRes.data || []);
      const todayShiftsData = processShifts(todayRes.data || []);

      setShifts(currentShifts);
      setLastWeekShifts(lastShifts);
      setUpcoming(upcomingShifts);
      setTodayShifts(todayShiftsData);

      const timeOffData: TimeOff[] = (timeOffRes.data || []).map((r: any) => ({
        id: r.id,
        employee_id: r.employee_id,
        starts_at: r.starts_at,
        ends_at: r.ends_at,
        type: r.type,
        reason: r.reason,
        status: r.status,
        employees: pickOne(r.employees),
      }));
      setPendingTO(timeOffData);

      const weekHours = currentShifts.reduce(
        (acc, s) => acc + hoursBetween(s.starts_at, s.ends_at, s.break_minutes),
        0
      );
      const lastWeekHours = lastShifts.reduce(
        (acc, s) => acc + hoursBetween(s.starts_at, s.ends_at, s.break_minutes),
        0
      );
      const openShifts = currentShifts.filter((s) => !s.employee_id).length;
      const completedShifts = currentShifts.filter((s) => s.status === "completed").length;
      const completionRate = currentShifts.length > 0 ? (completedShifts / currentShifts.length) * 100 : 0;

      const avgShiftLength =
        currentShifts.length > 0
          ? currentShifts.reduce((acc, s) => acc + hoursBetween(s.starts_at, s.ends_at, s.break_minutes), 0) /
            currentShifts.length
          : 0;

      const employeeShiftCounts = currentShifts.reduce((acc, s) => {
        if (s.employee_id) acc[s.employee_id] = (acc[s.employee_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const mostActiveEmployeeId = Object.entries(employeeShiftCounts).sort(([, a], [, b]) => b - a)[0]?.[0];
      const mostActiveEmployee = mostActiveEmployeeId
        ? employeesData.find((e) => e.id === mostActiveEmployeeId)?.full_name || null
        : null;

      const avgDailyShifts = currentShifts.length / 7;
      const busyDays = weekDays
        .filter((day) => {
          const dayShifts = currentShifts.filter(
            (s) => format(new Date(s.starts_at), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
          );
          return dayShifts.length > avgDailyShifts * 1.2;
        })
        .map((day) => format(day, "EEEE"));

      setStats({
        totalEmployees: employeesData.length,
        weekHours,
        openShifts,
        pendingTimeOff: timeOffData.length,
        completionRate,
        avgShiftLength,
        mostActiveEmployee,
        busyDays,
      });
    } catch (error) {
      toast.error("Failed to load dashboard data");
      console.error(error);
    } finally {
      setBusy(false);
    }
  }

  React.useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, weekStart]);

  React.useEffect(() => {
    if (!orgId) return;
    const channels = [
      sb
        .channel(`shifts-${orgId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "shifts", filter: `org_id=eq.${orgId}` },
          () => void load()
        ),
      sb
        .channel(`timeoff-${orgId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "time_off", filter: `org_id=eq.${orgId}` },
          () => void load()
        ),
      sb
        .channel(`employees-${orgId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "employees", filter: `org_id=eq.${orgId}` },
          () => void load()
        ),
    ];

    channels.forEach((ch) => ch.subscribe());
    return () => channels.forEach((ch) => sb.removeChannel(ch));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sb, orgId]);

  async function updateTOStatus(id: string, status: TimeOff["status"]) {
    if (!perms.canApproveTimeOff) return;

    const prev = [...pendingTO];
    setPendingTO((cur) => cur.filter((r) => r.id !== id));

    const { error } = await sb.from("time_off").update({ status }).eq("id", id);
    if (error) {
      setPendingTO(prev);
      toast.error("Failed to update request", { description: error.message });
    } else {
      toast.success(`Time off request ${status}`, {
        description: `Successfully ${status} the request`,
      });
    }
  }

  if (loading || !orgId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <div>
            <div className="text-lg font-medium">Loading dashboard...</div>
            <div className="text-sm text-gray-400">Fetching real-time data</div>
          </div>
        </div>
      </div>
    );
  }

  const coverage = weekDays.map((date) => {
    const key = format(date, "yyyy-MM-dd");
    const count = shifts.filter((s) => format(new Date(s.starts_at), "yyyy-MM-dd") === key).length;
    const bar = Math.min(100, (count / TARGET_SHIFTS_PER_DAY) * 100);
    return { date, count, bar };
  });

  const lastWeekHours = lastWeekShifts.reduce(
    (acc, s) => acc + hoursBetween(s.starts_at, s.ends_at, s.break_minutes),
    0
  );
  const hoursTrend = stats.weekHours > lastWeekHours ? "up" : stats.weekHours < lastWeekHours ? "down" : "neutral";
  const hoursChange = stats.weekHours - lastWeekHours;

  const lastWeekOpenShifts = lastWeekShifts.filter((s) => !s.employee_id).length;
  const openShiftsTrend =
    stats.openShifts < lastWeekOpenShifts ? "up" : stats.openShifts > lastWeekOpenShifts ? "down" : "neutral";

  return (
    <div className="space-y-6 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Good {getTimeOfDay()}! Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 flex items-center gap-2">
            <Radio className="h-3 w-3 text-green-500" />
            Live data • Last updated {format(lastUpdate, "h:mm a")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            className="flex-shrink-0"
            aria-label="Previous week"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Card className="px-3 py-2 text-sm font-medium text-gray-700">
            {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d")}
          </Card>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekStart(addDays(weekStart, +7))}
            className="flex-shrink-0"
            aria-label="Next week"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={load} disabled={busy} className="gap-2">
            <RefreshCw className={cn("h-4 w-4", busy && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={<Users2 className="h-5 w-5" />}
          title="Total Employees"
          value={stats.totalEmployees}
          subtitle="Active team members"
          gradient="from-blue-500 to-cyan-500"
          onClick={() => (window.location.href = "/employees")}
        />

        <StatCard
          icon={<Clock className="h-5 w-5" />}
          title="Hours This Week"
          value={`${stats.weekHours.toFixed(1)}h`}
          trend={hoursTrend}
          trendValue={hoursChange > 0 ? `+${hoursChange.toFixed(1)}h` : `${hoursChange.toFixed(1)}h`}
          gradient="from-purple-500 to-pink-500"
        />

        <StatCard
          icon={<Calendar className="h-5 w-5" />}
          title="Open Shifts"
          value={stats.openShifts}
          subtitle="Need assignment"
          trend={openShiftsTrend}
          trendValue={`${stats.openShifts - lastWeekOpenShifts > 0 ? "+" : ""}${
            stats.openShifts - lastWeekOpenShifts
          }`}
          gradient="from-amber-500 to-orange-500"
          onClick={() => (window.location.href = "/schedule")}
        />

        <StatCard
          icon={<AlertTriangle className="h-5 w-5" />}
          title="Pending Requests"
          value={stats.pendingTimeOff}
          subtitle="Time off requests"
          gradient="from-red-500 to-rose-500"
          onClick={() => (window.location.href = "/time-off")}
        />
      </div>

      {/* Today's Overview & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Activity */}
        <div className="lg:col-span-2">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Today's Activity</h2>
              <Badge variant="outline" className="gap-1">
                <Activity className="h-3 w-3" />
                {todayShifts.length} shifts today
              </Badge>
            </div>

            <div className="w-full">
              <div className="flex rounded-md bg-gray-100 p-1 text-sm">
                {/* Simple tabs without external component for small footprint */}
                {/* Active Shifts / Coverage */}
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-3">
              <div className="grid grid-cols-2 w-full rounded-lg bg-gray-100 p-1 text-sm">
                <button
                  className="tabbtn peer relative rounded-md bg-white py-2 font-medium shadow"
                  onClick={() => document.getElementById("tab-shifts")?.scrollIntoView({ behavior: "smooth", block: "nearest" })}
                >
                  Active Shifts
                </button>
                <button
                  className="rounded-md py-2 font-medium hover:bg-white/60"
                  onClick={() =>
                    document.getElementById("tab-coverage")?.scrollIntoView({ behavior: "smooth", block: "nearest" })
                  }
                >
                  Coverage
                </button>
              </div>

              {/* Shifts */}
              <div id="tab-shifts" className="mt-4">
                <div className="space-y-3">
                  {todayShifts.length === 0 ? (
                    <div className="text-center py-10">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <div className="text-sm font-medium text-gray-900">No shifts scheduled for today</div>
                      <div className="text-xs text-gray-500 mt-1">Check back tomorrow or create new shifts</div>
                    </div>
                  ) : (
                    todayShifts.map((shift) => {
                      const startTime = new Date(shift.starts_at);
                      const endTime = new Date(shift.ends_at);
                      const now = new Date();
                      const isActive = now >= startTime && now <= endTime;
                      const isUpcoming = now < startTime;
                      const isCompleted = now > endTime || shift.status === "completed";

                      return (
                        <div
                          key={shift.id}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-lg border transition-all duration-200",
                            isActive && "bg-green-50 border-green-200 shadow-sm",
                            isUpcoming && "bg-blue-50 border-blue-200",
                            isCompleted && "bg-gray-50 border-gray-200 opacity-75"
                          )}
                        >
                          <div className="flex-shrink-0">
                            {shift.employees ? (
                              <EmployeeAvatar employee={shift.employees} size="md" showStatus={isActive} />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <UserX className="h-4 w-4 text-gray-500" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="font-medium text-gray-900">
                                {shift.employees?.full_name || "Unassigned"}
                              </div>
                              {isActive && <Badge className="bg-green-600 text-white">Active</Badge>}
                              {isUpcoming && (
                                <Badge variant="outline" className="border-blue-300 text-blue-700">
                                  Upcoming
                                </Badge>
                              )}
                              {isCompleted && (
                                <Badge variant="outline" className="border-gray-300 text-gray-600">
                                  Completed
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mt-1 flex flex-wrap items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(startTime, "h:mm a")} – {format(endTime, "h:mm a")}
                              </span>
                              {shift.positions && (
                                <span className="flex items-center gap-1">
                                  <div
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: shift.positions.color || "#6366f1" }}
                                  />
                                  {shift.positions.name}
                                </span>
                              )}
                              {shift.locations && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {shift.locations.name}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right text-sm">
                            <div className="font-medium text-gray-900">
                              {hoursBetween(shift.starts_at, shift.ends_at, shift.break_minutes)}h
                            </div>
                            <div className="text-xs text-gray-500">
                              {shift.break_minutes ? `${shift.break_minutes}m break` : "No break"}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Coverage */}
              <div id="tab-coverage" className="mt-6">
                <CoverageChart coverage={coverage} target={TARGET_SHIFTS_PER_DAY} />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions & Insights */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <QuickActionCard
                title="Create Shift"
                description="Schedule a new shift for any employee"
                icon={<Plus className="h-4 w-4 text-blue-600" />}
                action="Create now"
                href="/schedule"
                variant="primary"
              />

              <QuickActionCard
                title="Manage Employees"
                description="Add, edit, or view employee details"
                icon={<Users2 className="h-4 w-4 text-green-600" />}
                action="Manage team"
                href="/employees"
                variant="success"
              />

              {stats.openShifts > 0 && (
                <QuickActionCard
                  title="Fill Open Shifts"
                  description={`${stats.openShifts} shifts need assignment`}
                  icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
                  action="Assign now"
                  href="/schedule"
                  variant="warning"
                />
              )}

              <QuickActionCard
                title="Time Off Requests"
                description="Review and approve pending requests"
                icon={<Calendar className="h-4 w-4 text-gray-600" />}
                action="Review"
                href="/time-off"
              />
            </div>
          </Card>

          {/* Insights */}
          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Insights</h3>
            <div className="space-y-3 sm:space-y-4">
              {stats.mostActiveEmployee && (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Star className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-sm font-medium text-green-900">Top Performer</div>
                    <div className="text-xs text-green-700">{stats.mostActiveEmployee} has the most shifts</div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-sm font-medium text-blue-900">Avg Shift Length</div>
                  <div className="text-xs text-blue-700">{stats.avgShiftLength.toFixed(1)} hours per shift</div>
                </div>
              </div>

              {stats.completionRate > 0 && (
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <Target className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="text-sm font-medium text-purple-900">Completion Rate</div>
                    <div className="text-xs text-purple-700">{stats.completionRate.toFixed(1)}% of shifts completed</div>
                  </div>
                </div>
              )}

              {stats.busyDays.length > 0 && (
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                  <div>
                    <div className="text-sm font-medium text-amber-900">Busy Days</div>
                    <div className="text-xs text-amber-700">{stats.busyDays.join(", ")}</div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Coverage Analysis */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Weekly Coverage Analysis</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Target: {TARGET_SHIFTS_PER_DAY} shifts per day</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="/schedule" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              Full Schedule
            </a>
          </Button>
        </div>

        <CoverageChart coverage={coverage} target={TARGET_SHIFTS_PER_DAY} />
      </Card>

      {/* Time Off & Upcoming */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Pending Time Off Requests */}
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Time Off Requests</h2>
            <div className="flex items-center gap-2">
              {stats.pendingTimeOff > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {stats.pendingTimeOff} pending
                </Badge>
              )}
              <Button variant="outline" size="sm" asChild>
                <a href="/time-off" className="gap-1">
                  Manage <ChevronRight className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>

          {/* Height-bounded scroll with stable gutter on all screens */}
          <div className="space-y-3 max-h-80 md:max-h-96 overflow-y-auto [scrollbar-gutter:stable]">
            {busy && (
              <div className="flex items-center gap-2 text-sm text-gray-500 justify-center py-8">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading requests...
              </div>
            )}

            {!busy && pendingTO.length === 0 && (
              <div className="text-center py-10">
                <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <div className="text-sm font-medium text-gray-900">All caught up!</div>
                <div className="text-xs text-gray-500 mt-1">No pending time off requests</div>
              </div>
            )}

            {!busy &&
              pendingTO.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-white hover:shadow-sm transition-shadow"
                >
                  <div className="flex-shrink-0">
                    {request.employees ? (
                      <EmployeeAvatar employee={request.employees} size="md" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserX className="h-4 w-4 text-gray-500" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{request.employees?.full_name || "Unknown Employee"}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {format(new Date(request.starts_at), "MMM d")} – {format(new Date(request.ends_at), "MMM d")}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs capitalize">
                        {request.type}
                      </Badge>
                      {request.reason && <div className="text-xs text-gray-500 truncate">"{request.reason}"</div>}
                    </div>
                  </div>

                  {perms.canApproveTimeOff ? (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateTOStatus(request.id, "approved")}
                        className="gap-1 text-green-700 border-green-200 hover:bg-green-50"
                        aria-label="Approve"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateTOStatus(request.id, "denied")}
                        className="gap-1 text-red-700 border-red-200 hover:bg-red-50"
                        aria-label="Deny"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      View only
                    </Badge>
                  )}
                </div>
              ))}
          </div>
        </Card>

        {/* Upcoming Shifts */}
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Upcoming Shifts</h2>
            <Button variant="outline" size="sm" asChild>
              <a href="/schedule" className="gap-1">
                View all <ChevronRight className="h-3 w-3" />
              </a>
            </Button>
          </div>

          <div className="space-y-3 max-h-80 md:max-h-96 overflow-y-auto [scrollbar-gutter:stable]">
            {upcoming.length === 0 ? (
              <div className="text-center py-10">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <div className="text-sm font-medium text-gray-900">No upcoming shifts</div>
                <div className="text-xs text-gray-500 mt-1">Schedule shifts to see them here</div>
              </div>
            ) : (
              upcoming.map((shift) => {
                const startTime = new Date(shift.starts_at);
                const isT = isToday(startTime);
                const isTm = isTomorrow(startTime);

                let timeLabel = format(startTime, "MMM d");
                if (isT) timeLabel = "Today";
                else if (isTm) timeLabel = "Tomorrow";

                return (
                  <div
                    key={shift.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-sm",
                      isT ? "bg-blue-50 border-blue-200" : "bg-white"
                    )}
                  >
                    <div className="flex-shrink-0">
                      {shift.employees ? (
                        <EmployeeAvatar employee={shift.employees} size="sm" />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserX className="h-3 w-3 text-gray-500" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900">{shift.employees?.full_name || "Unassigned"}</div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {timeLabel} • {format(startTime, "h:mm a")}–{format(new Date(shift.ends_at), "h:mm a")}
                      </div>
                      {shift.positions && (
                        <div className="flex items-center gap-1 mt-1">
                          <div
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: shift.positions.color || "#6366f1" }}
                          />
                          <span className="text-xs text-gray-500">{shift.positions.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {hoursBetween(shift.starts_at, shift.ends_at, shift.break_minutes)}h
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Performance */}
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Employee Overview</h2>
            <Button variant="outline" size="sm" asChild>
              <a href="/employees" className="gap-1">
                Manage <ChevronRight className="h-3 w-3" />
              </a>
            </Button>
          </div>

          <div className="space-y-3">
            {employees.slice(0, 5).map((emp) => {
              const empShifts = shifts.filter((s) => s.employee_id === emp.id);
              const totalHours = empShifts.reduce(
                (acc, s) => acc + hoursBetween(s.starts_at, s.ends_at, s.break_minutes),
                0
              );
              const completedShifts = empShifts.filter((s) => s.status === "completed").length;
              const completionRate = empShifts.length > 0 ? (completedShifts / empShifts.length) * 100 : 0;

              return (
                <div
                  key={emp.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-gray-50/60 hover:bg-gray-100/60 transition-colors"
                >
                  <EmployeeAvatar employee={emp} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{emp.full_name}</div>
                    <div className="text-sm text-gray-600 mt-0.5">
                      {empShifts.length} shifts • {totalHours.toFixed(1)}h
                    </div>
                    {emp.position && <div className="text-xs text-gray-500 mt-0.5">{emp.position.name}</div>}
                  </div>
                  <div className="text-right">
                    <div
                      className={cn(
                        "text-sm font-medium",
                        completionRate >= 90 ? "text-green-600" : completionRate >= 70 ? "text-amber-600" : "text-red-600"
                      )}
                    >
                      {completionRate.toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-500">completion</div>
                  </div>
                </div>
              );
            })}

            {employees.length === 0 && (
              <div className="text-center py-10">
                <Users2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <div className="text-sm font-medium text-gray-900">No employees found</div>
                <div className="text-xs text-gray-500 mt-1">Add employees to see analytics</div>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Badge variant="outline" className="gap-1">
              <Activity className="h-3 w-3" />
              Live updates
            </Badge>
          </div>

          <div className="space-y-3">
            {shifts
              .slice()
              .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime())
              .slice(0, 6)
              .map((shift) => {
                const startTime = new Date(shift.starts_at);
                const isRecent = differenceInMinutes(new Date(), startTime) < 1440;

                return (
                  <div
                    key={shift.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white border hover:shadow-sm transition-shadow"
                  >
                    <div className="flex-shrink-0">
                      {shift.employees ? (
                        <EmployeeAvatar employee={shift.employees} size="sm" />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
                          <UserX className="h-3 w-3 text-amber-600" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{shift.employees?.full_name || "Open shift"}</div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {isToday(startTime) ? "Today" : format(startTime, "MMM d")} • {format(startTime, "h:mm a")}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {shift.positions && (
                        <Badge variant="outline" className="text-xs">
                          {shift.positions.name}
                        </Badge>
                      )}
                      {isRecent && (
                        <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" title="Recently updated" />
                      )}
                    </div>
                  </div>
                );
              })}

            {shifts.length === 0 && (
              <div className="text-center py-10">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <div className="text-sm font-medium text-gray-900">No recent activity</div>
                <div className="text-xs text-gray-500 mt-1">Activity will appear here as shifts are created</div>
              </div>
            )}
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Performance Metrics</h2>
            <Button variant="outline" size="sm" asChild>
              <a href="/analytics" className="gap-1">
                Details <ChevronRight className="h-3 w-3" />
              </a>
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Schedule Completion</span>
                <span className="font-medium text-gray-900">{stats.completionRate.toFixed(0)}%</span>
              </div>
              <Progress value={stats.completionRate} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Coverage Rate</span>
                <span className="font-medium text-gray-900">
                  {((shifts.length / (TARGET_SHIFTS_PER_DAY * 7)) * 100).toFixed(0)}%
                </span>
              </div>
              <Progress value={(shifts.length / (TARGET_SHIFTS_PER_DAY * 7)) * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Shift Assignment</span>
                <span className="font-medium text-gray-900">
                  {shifts.length > 0 ? (((shifts.length - stats.openShifts) / shifts.length) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <Progress
                value={shifts.length > 0 ? ((shifts.length - stats.openShifts) / shifts.length) * 100 : 0}
                className="h-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.avgShiftLength.toFixed(1)}h</div>
                <div className="text-xs text-gray-500">Avg Shift</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {shifts.filter((s) => s.status === "completed").length}
                </div>
                <div className="text-xs text-gray-500">Completed</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* System Status */}
      <Card className="p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <div className="text-sm font-medium text-green-900">System Status: All services operational</div>
          <div className="ml-auto text-xs text-green-700">Last sync: {format(lastUpdate, "h:mm:ss a")}</div>
        </div>
      </Card>
    </div>
  );
}

/* ============== Optional helper (unused in main layout) ============== */
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
        <div className={cn("grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br", accent)}>{icon}</div>
        <div>
          <div className="text-sm text-slate-500">{title}</div>
          <div className="text-xl font-semibold">{value}</div>
        </div>
      </div>
    </Card>
  );
}
