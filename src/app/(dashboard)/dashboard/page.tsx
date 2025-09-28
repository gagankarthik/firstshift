"use client";

import * as React from "react";
import { createClient } from "@/lib/supabaseClient";
import { useOrg } from "@/components/providers/OrgProvider";
import { usePermissions } from "@/app/hooks/usePermissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfWeek, endOfWeek, addDays, isToday, isTomorrow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Plus,
  MapPin,
  CheckCircle,
  AlertCircle,
  Coffee,
  ArrowRight,
  BarChart3,
  Activity,
  Award,
  Target,
  DollarSign,
  CalendarDays,
  Zap,
  Star,
} from "lucide-react";

// Types
type Shift = {
  id: string;
  employee_id: string | null;
  starts_at: string;
  ends_at: string;
  positions?: { name: string; color?: string | null } | { name: string; color?: string | null }[] | null;
  locations?: { name: string } | { name: string }[] | null;
  employees?: { full_name: string } | { full_name: string }[] | null;
};

type EmployeeLite = {
  id: string;
  full_name: string;
  role: string;
};

function getGreeting(name?: string) {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return name ? `${timeGreeting}, ${name}` : timeGreeting;
}

function TrendIcon({ trend, value }: { trend: "up" | "down" | "neutral"; value: number }) {
  if (trend === "neutral") return <Minus className="h-4 w-4 text-gray-400" />;
  return trend === "up" ? (
    <TrendingUp className="h-4 w-4 text-green-500" />
  ) : (
    <TrendingDown className="h-4 w-4 text-red-500" />
  );
}

export default function DashboardPage() {
  const sb = React.useMemo(() => createClient(), []);
  const { orgId, role, loading: orgLoading } = useOrg();
  const perms = usePermissions(role);

  const [userId, setUserId] = React.useState<string | null>(null);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [weekStart, setWeekStart] = React.useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [shifts, setShifts] = React.useState<Shift[]>([]);
  const [todayShifts, setTodayShifts] = React.useState<Shift[]>([]);
  const [employees, setEmployees] = React.useState<EmployeeLite[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [lastUpdate, setLastUpdate] = React.useState(new Date());

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const isAdmin = perms.canManageSchedule;

  // Get user ID and email
  React.useEffect(() => {
    (async () => {
      const { data: { user } } = await sb.auth.getUser();
      setUserId(user?.id ?? null);
      setUserEmail(user?.email ?? null);
    })();
  }, [sb]);

  // Load data - Fixed to prevent infinite loops
  const loadData = React.useCallback(async () => {
    if (!orgId) return;
    setLoading(true);

    try {
      const today = new Date();
      const todayStr = format(today, "yyyy-MM-dd");

      // Load shifts for current week
      const { data: weekShifts } = await sb
        .from("shifts")
        .select(`
          id, employee_id, starts_at, ends_at,
          employees:employee_id(full_name),
          positions:position_id(name, color),
          locations:location_id(name)
        `)
        .eq("org_id", orgId)
        .gte("starts_at", weekStart.toISOString())
        .lte("starts_at", weekEnd.toISOString())
        .order("starts_at");

      // Load today's shifts
      const { data: todayShiftsData } = await sb
        .from("shifts")
        .select(`
          id, employee_id, starts_at, ends_at,
          employees:employee_id(full_name),
          positions:position_id(name, color),
          locations:location_id(name)
        `)
        .eq("org_id", orgId)
        .gte("starts_at", `${todayStr}T00:00:00`)
        .lt("starts_at", `${todayStr}T23:59:59`)
        .order("starts_at");

      // Load employees
      const { data: employeesData } = await sb
        .from("employees")
        .select("id, full_name, role")
        .eq("org_id", orgId);

      setShifts(weekShifts || []);
      setTodayShifts(todayShiftsData || []);
      setEmployees(employeesData || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [orgId, sb]); // Removed weekStart and weekEnd from dependencies

  React.useEffect(() => {
    if (orgId) {
      void loadData();
    }
  }, [orgId]); // Only depend on orgId

  // Auto-refresh every 5 minutes
  React.useEffect(() => {
    if (!orgId) return;

    const interval = setInterval(() => {
      void loadData();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [orgId, loadData]);

  // Enhanced stats calculation
  const stats = React.useMemo(() => {
    const totalShifts = shifts.length;
    const assignedShifts = shifts.filter(s => s.employee_id).length;
    const openShifts = shifts.filter(s => !s.employee_id).length;
    const activeEmployees = new Set(shifts.filter(s => s.employee_id).map(s => s.employee_id)).size;

    const totalHours = shifts.reduce((sum, shift) => {
      const start = new Date(shift.starts_at);
      const end = new Date(shift.ends_at);
      return sum + ((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    }, 0);

    // Calculate efficiency metrics
    const avgHoursPerShift = totalShifts > 0 ? totalHours / totalShifts : 0;
    const avgShiftsPerEmployee = activeEmployees > 0 ? assignedShifts / activeEmployees : 0;
    const utilizationRate = employees.length > 0 ? (activeEmployees / employees.length) * 100 : 0;

    // Calculate trends (compare with last week)
    const lastWeekStart = addDays(weekStart, -7);
    const lastWeekEnd = addDays(weekEnd, -7);
    const lastWeekShifts = shifts.filter(s => {
      const shiftDate = new Date(s.starts_at);
      return shiftDate >= lastWeekStart && shiftDate <= lastWeekEnd;
    });

    const lastWeekTotalHours = lastWeekShifts.reduce((sum, shift) => {
      const start = new Date(shift.starts_at);
      const end = new Date(shift.ends_at);
      return sum + ((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    }, 0);

    const hoursTrend = lastWeekTotalHours > 0 ? ((totalHours - lastWeekTotalHours) / lastWeekTotalHours) * 100 : 0;
    const shiftsTrend = lastWeekShifts.length > 0 ? ((totalShifts - lastWeekShifts.length) / lastWeekShifts.length) * 100 : 0;

    return {
      totalShifts,
      assignedShifts,
      openShifts,
      activeEmployees,
      totalHours: Math.round(totalHours * 10) / 10,
      coverageRate: totalShifts > 0 ? Math.round((assignedShifts / totalShifts) * 100) : 0,
      avgHoursPerShift: Math.round(avgHoursPerShift * 10) / 10,
      avgShiftsPerEmployee: Math.round(avgShiftsPerEmployee * 10) / 10,
      utilizationRate: Math.round(utilizationRate),
      hoursTrend: Math.round(hoursTrend * 10) / 10,
      shiftsTrend: Math.round(shiftsTrend * 10) / 10,
    };
  }, [shifts, employees, weekStart, weekEnd]);

  const upcomingShifts = React.useMemo(() => {
    if (!userId) return [];
    return shifts
      .filter(s => s.employee_id === userId && new Date(s.starts_at) > new Date())
      .slice(0, 3);
  }, [shifts, userId]);

  if (orgLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 text-gray-300"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <RefreshCw className="h-6 w-6" />
          </motion.div>
          <span className="text-lg font-medium">Loading dashboard...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Enhanced Welcome Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-xl p-4 sm:p-6 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent"
            >
              {getGreeting(userEmail?.split('@')[0])}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-slate-600 mt-1 text-sm sm:text-base"
            >
              {isAdmin
                ? "Manage your team's schedule and keep operations running smoothly."
                : "Stay updated with your shifts and team schedule."}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-2 mt-3 flex-wrap"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-200 backdrop-blur-xl">
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-emerald-700">Live data</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>Updated {format(lastUpdate, "h:mm a")}</span>
              </div>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={loadData}
                disabled={loading}
                className="rounded-xl border-slate-200/60 hover:bg-slate-50/80 hover:border-slate-300/60 transition-all duration-200"
              >
                <motion.div
                  animate={{ rotate: loading ? 360 : 0 }}
                  transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                </motion.div>
                Refresh
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced Stats Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.2,
            },
          },
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4"
      >
        {[
          {
            title: "Total Shifts",
            value: stats.totalShifts,
            subtitle: "This week",
            trend: stats.shiftsTrend,
            icon: Calendar,
            color: "from-blue-500 to-indigo-600",
            bgColor: "from-blue-50 to-indigo-50",
            iconColor: "text-blue-600",
          },
          {
            title: "Coverage Rate",
            value: `${stats.coverageRate}%`,
            subtitle: `${stats.assignedShifts} of ${stats.totalShifts} assigned`,
            trend: null,
            icon: CheckCircle,
            color: "from-emerald-500 to-green-600",
            bgColor: "from-emerald-50 to-green-50",
            iconColor: "text-emerald-600",
          },
          {
            title: "Open Shifts",
            value: stats.openShifts,
            subtitle: "Need assignment",
            trend: null,
            icon: AlertCircle,
            color: "from-amber-500 to-orange-600",
            bgColor: "from-amber-50 to-orange-50",
            iconColor: "text-amber-600",
          },
          {
            title: "Total Hours",
            value: stats.totalHours,
            subtitle: "Scheduled hours",
            trend: stats.hoursTrend,
            icon: Clock,
            color: "from-purple-500 to-fuchsia-600",
            bgColor: "from-purple-50 to-fuchsia-50",
            iconColor: "text-purple-600",
          },
          {
            title: "Avg Hours/Shift",
            value: stats.avgHoursPerShift,
            subtitle: "Per shift",
            trend: null,
            icon: Activity,
            color: "from-cyan-500 to-blue-600",
            bgColor: "from-cyan-50 to-blue-50",
            iconColor: "text-cyan-600",
          },
          {
            title: "Team Utilization",
            value: `${stats.utilizationRate}%`,
            subtitle: `${stats.activeEmployees} of ${employees.length} active`,
            trend: null,
            icon: Users,
            color: "from-rose-500 to-pink-600",
            bgColor: "from-rose-50 to-pink-50",
            iconColor: "text-rose-600",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ y: -2, scale: 1.01 }}
            className="group"
          >
            <Card className={`relative overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white/95 backdrop-blur-sm`}>
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-200`} />

              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  {stat.title}
                </CardTitle>
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  className={`p-1.5 rounded-lg bg-white/80 shadow-sm border border-slate-200`}
                >
                  <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                </motion.div>
              </CardHeader>
              <CardContent>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
                  className={`text-xl xl:text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}
                >
                  {stat.value}
                </motion.div>
                <p className="text-xs text-slate-500 mb-2">{stat.subtitle}</p>
                {stat.trend !== null && (
                  <div className="flex items-center gap-1 text-xs">
                    {stat.trend > 0 ? (
                      <>
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span className="text-green-600 font-medium">+{stat.trend}%</span>
                      </>
                    ) : stat.trend < 0 ? (
                      <>
                        <TrendingDown className="h-3 w-3 text-red-500" />
                        <span className="text-red-600 font-medium">{stat.trend}%</span>
                      </>
                    ) : (
                      <>
                        <Minus className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-500 font-medium">0%</span>
                      </>
                    )}
                    <span className="text-slate-400 ml-1">vs last week</span>
                  </div>
                )}
              </CardContent>

              {/* Animated border on hover */}
              <motion.div
                className={`absolute inset-0 rounded-xl border-2 ${stat.color.includes('blue') ? 'border-blue-300/40' : stat.color.includes('emerald') ? 'border-emerald-300/40' : stat.color.includes('amber') ? 'border-amber-300/40' : 'border-purple-300/40'} opacity-0 group-hover:opacity-60 transition-opacity duration-300`}
              />
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Performance Insights for Admins */}
      {isAdmin && (
        <Card className="bg-white/95 border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-slate-800 text-base">
              <BarChart3 className="h-4 w-4 text-indigo-600" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <div className="text-2xl font-bold text-blue-700">{stats.avgShiftsPerEmployee}</div>
                <div className="text-xs text-blue-600 font-medium">Avg Shifts per Employee</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border border-emerald-100">
                <div className="text-2xl font-bold text-emerald-700">{stats.avgHoursPerShift}h</div>
                <div className="text-xs text-emerald-600 font-medium">Avg Hours per Shift</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-100">
                <div className="text-2xl font-bold text-purple-700">{stats.utilizationRate}%</div>
                <div className="text-xs text-purple-600 font-medium">Team Utilization</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                <div className="text-2xl font-bold text-amber-700">{((stats.totalHours / 7) || 0).toFixed(1)}h</div>
                <div className="text-xs text-amber-600 font-medium">Daily Avg Hours</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2 bg-white/95 border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-slate-800 text-base">
              <Calendar className="h-4 w-4 text-blue-600" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayShifts.length === 0 ? (
              <div className="text-center py-8">
                <Coffee className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <div className="text-sm font-medium text-slate-800">No shifts today</div>
                <div className="text-xs text-slate-500 mt-1">Enjoy your day off!</div>
              </div>
            ) : (
              <div className="space-y-3">
                {todayShifts.map((shift, index) => {
                  const startTime = new Date(shift.starts_at);
                  const endTime = new Date(shift.ends_at);
                  const employee = Array.isArray(shift.employees) ? shift.employees[0] : shift.employees;
                  const position = Array.isArray(shift.positions) ? shift.positions[0] : shift.positions;
                  const location = Array.isArray(shift.locations) ? shift.locations[0] : shift.locations;

                  return (
                    <motion.div
                      key={shift.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <div className="text-sm font-bold text-slate-900">
                            {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          {employee ? (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="font-medium text-slate-700">{employee.full_name}</span>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Open
                            </Badge>
                          )}
                          {position && (
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                              {position.name}
                            </Badge>
                          )}
                          {location && (
                            <div className="flex items-center gap-1 text-slate-600">
                              <MapPin className="h-3 w-3" />
                              <span className="text-xs">{location.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-0 text-xs text-slate-500">
                        {Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60) * 10) / 10}h
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Upcoming Shifts (for employees) */}
        {!isAdmin && (
          <Card className="bg-white/90 border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Clock className="h-5 w-5 text-blue-600" />
                My Upcoming Shifts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingShifts.length === 0 ? (
                <div className="text-center py-6">
                  <Coffee className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <div className="text-sm font-medium text-slate-800 mb-1">No upcoming shifts</div>
                  <div className="text-xs text-slate-500">Check back later for new assignments</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingShifts.map((shift, index) => {
                    const startTime = new Date(shift.starts_at);
                    const endTime = new Date(shift.ends_at);
                    const isToday = format(startTime, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                    const isTomorrow = format(startTime, "yyyy-MM-dd") === format(addDays(new Date(), 1), "yyyy-MM-dd");
                    const hours = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60) * 10) / 10;

                    return (
                      <motion.div
                        key={shift.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 border border-slate-200 rounded-xl bg-gradient-to-r from-slate-50 to-white hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm font-bold text-slate-800">
                            {isToday ? "Today" : isTomorrow ? "Tomorrow" : format(startTime, "EEE, MMM d")}
                          </div>
                          {isToday && (
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              <Star className="h-3 w-3 mr-1" />
                              Today
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-slate-600 font-medium">
                            {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                          </div>
                          <div className="text-xs text-slate-500">
                            {hours}h
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Personal Stats for Employee */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-700">{upcomingShifts.length}</div>
                    <div className="text-xs text-blue-600">Upcoming</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg">
                    <div className="text-lg font-bold text-emerald-700">
                      {upcomingShifts.reduce((sum, shift) => {
                        const start = new Date(shift.starts_at);
                        const end = new Date(shift.ends_at);
                        return sum + ((end.getTime() - start.getTime()) / (1000 * 60 * 60));
                      }, 0).toFixed(1)}h
                    </div>
                    <div className="text-xs text-emerald-600">Total Hours</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions for Admin */}
        {isAdmin && (
          <Card className="bg-white/90 border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Zap className="h-5 w-5 text-indigo-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="w-full justify-start border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-slate-700 transition-all duration-200"
                  size="sm"
                  asChild
                >
                  <a href="/schedule">
                    <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                    View Schedule
                    <ArrowRight className="h-3 w-3 ml-auto" />
                  </a>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="w-full justify-start border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 transition-all duration-200"
                  size="sm"
                  asChild
                >
                  <a href="/employees">
                    <Users className="h-4 w-4 mr-2 text-emerald-600" />
                    Manage Employees
                    <ArrowRight className="h-3 w-3 ml-auto" />
                  </a>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="w-full justify-start border-slate-200 hover:bg-orange-50 hover:border-orange-300 text-slate-700 transition-all duration-200"
                  size="sm"
                  asChild
                >
                  <a href="/time-off">
                    <Clock className="h-4 w-4 mr-2 text-orange-600" />
                    Time Off Requests
                    <ArrowRight className="h-3 w-3 ml-auto" />
                  </a>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="w-full justify-start border-slate-200 hover:bg-purple-50 hover:border-purple-300 text-slate-700 transition-all duration-200"
                  size="sm"
                  asChild
                >
                  <a href="/report">
                    <BarChart3 className="h-4 w-4 mr-2 text-purple-600" />
                    View Reports
                    <ArrowRight className="h-3 w-3 ml-auto" />
                  </a>
                </Button>
              </motion.div>

              {/* Performance Summary */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">
                  This Week Summary
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <span className="text-blue-700">Open Shifts</span>
                    <Badge className={`${stats.openShifts > 0 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'} text-xs px-1.5 py-0.5`}>
                      {stats.openShifts}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg">
                    <span className="text-emerald-700">Coverage</span>
                    <Badge className={`${stats.coverageRate < 90 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'} text-xs px-1.5 py-0.5`}>
                      {stats.coverageRate}%
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Enhanced Quick Navigation */}
      <Card className="bg-white/95 border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Target className="h-5 w-5 text-blue-600" />
            Quick Navigation
          </CardTitle>
          <p className="text-sm text-slate-600 mt-1">Access key areas of your workspace</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { href: "/schedule", icon: Calendar, label: "Schedule", color: "text-blue-600", bgColor: "hover:bg-blue-50", borderColor: "hover:border-blue-300" },
              { href: "/employees", icon: Users, label: "Employees", color: "text-indigo-600", bgColor: "hover:bg-indigo-50", borderColor: "hover:border-indigo-300" },
              { href: "/time-off", icon: Clock, label: "Time Off", color: "text-orange-600", bgColor: "hover:bg-orange-50", borderColor: "hover:border-orange-300" },
              { href: "/report", icon: BarChart3, label: "Reports", color: "text-emerald-600", bgColor: "hover:bg-emerald-50", borderColor: "hover:border-emerald-300" },
              { href: "/availability", icon: CalendarDays, label: "Availability", color: "text-purple-600", bgColor: "hover:bg-purple-50", borderColor: "hover:border-purple-300" },
              { href: "/news", icon: Activity, label: "News", color: "text-cyan-600", bgColor: "hover:bg-cyan-50", borderColor: "hover:border-cyan-300" },
            ].map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  className={`h-20 sm:h-24 flex-col border-slate-200 ${item.bgColor} ${item.borderColor} text-slate-700 transition-all duration-200 hover:shadow-md`}
                  asChild
                >
                  <a href={item.href}>
                    <item.icon className={`h-6 w-6 sm:h-7 sm:w-7 mb-2 ${item.color}`} />
                    <span className="text-xs font-medium">{item.label}</span>
                  </a>
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Usage Tips */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Star className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800 mb-1">Pro Tip</div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  {isAdmin
                    ? "Keep track of open shifts and team utilization from your dashboard. Check reports regularly to optimize scheduling."
                    : "View your upcoming shifts and request time off easily. Check the schedule regularly for any updates."}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}