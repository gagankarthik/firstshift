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

  // Calculate stats
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

    return {
      totalShifts,
      assignedShifts,
      openShifts,
      activeEmployees,
      totalHours: Math.round(totalHours),
      coverageRate: totalShifts > 0 ? Math.round((assignedShifts / totalShifts) * 100) : 0,
    };
  }, [shifts]);

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
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        {[
          {
            title: "Total Shifts",
            value: stats.totalShifts,
            subtitle: "This week",
            icon: Calendar,
            color: "from-blue-500 to-indigo-600",
            bgColor: "from-blue-50 to-indigo-50",
            iconColor: "text-blue-600",
          },
          {
            title: "Coverage Rate",
            value: `${stats.coverageRate}%`,
            subtitle: `${stats.assignedShifts} of ${stats.totalShifts} assigned`,
            icon: CheckCircle,
            color: "from-emerald-500 to-green-600",
            bgColor: "from-emerald-50 to-green-50",
            iconColor: "text-emerald-600",
          },
          {
            title: "Open Shifts",
            value: stats.openShifts,
            subtitle: "Need assignment",
            icon: AlertCircle,
            color: "from-amber-500 to-orange-600",
            bgColor: "from-amber-50 to-orange-50",
            iconColor: "text-amber-600",
          },
          {
            title: "Total Hours",
            value: stats.totalHours,
            subtitle: "Scheduled hours",
            icon: Clock,
            color: "from-purple-500 to-fuchsia-600",
            bgColor: "from-purple-50 to-fuchsia-50",
            iconColor: "text-purple-600",
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
                  className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}
                >
                  {stat.value}
                </motion.div>
                <p className="text-xs text-slate-500">{stat.subtitle}</p>
              </CardContent>

              {/* Animated border on hover */}
              <motion.div
                className={`absolute inset-0 rounded-xl border-2 ${stat.color.includes('blue') ? 'border-blue-300/40' : stat.color.includes('emerald') ? 'border-emerald-300/40' : stat.color.includes('amber') ? 'border-amber-300/40' : 'border-purple-300/40'} opacity-0 group-hover:opacity-60 transition-opacity duration-300`}
              />
            </Card>
          </motion.div>
        ))}
      </motion.div>

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
                {todayShifts.map((shift) => {
                  const startTime = new Date(shift.starts_at);
                  const endTime = new Date(shift.ends_at);
                  const employee = Array.isArray(shift.employees) ? shift.employees[0] : shift.employees;
                  const position = Array.isArray(shift.positions) ? shift.positions[0] : shift.positions;
                  const location = Array.isArray(shift.locations) ? shift.locations[0] : shift.locations;

                  return (
                    <div key={shift.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-gray-900">
                          {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {employee ? (
                            <span>{employee.full_name}</span>
                          ) : (
                            <Badge variant="outline" className="text-orange-600 border-orange-200">
                              Open
                            </Badge>
                          )}
                          {position && (
                            <Badge variant="secondary">{position.name}</Badge>
                          )}
                          {location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {location.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
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
                  <Coffee className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <div className="text-sm font-medium text-slate-800">No upcoming shifts</div>
                  <div className="text-xs text-slate-500 mt-1">Check back later</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingShifts.map((shift) => {
                    const startTime = new Date(shift.starts_at);
                    const endTime = new Date(shift.ends_at);
                    const isToday = format(startTime, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                    const isTomorrow = format(startTime, "yyyy-MM-dd") === format(addDays(new Date(), 1), "yyyy-MM-dd");

                    return (
                      <div key={shift.id} className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-slate-800">
                            {isToday ? "Today" : isTomorrow ? "Tomorrow" : format(startTime, "EEE, MMM d")}
                          </div>
                          {isToday && <Badge className="bg-blue-100 text-blue-700">Today</Badge>}
                        </div>
                        <div className="text-sm text-slate-600">
                          {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions for Admin */}
        {isAdmin && (
          <Card className="bg-white/90 border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Users className="h-5 w-5 text-blue-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start border-slate-200 hover:bg-slate-50 text-slate-700" size="sm">
                <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                View Schedule
              </Button>
              <Button variant="outline" className="w-full justify-start border-slate-200 hover:bg-slate-50 text-slate-700" size="sm">
                <Plus className="h-4 w-4 mr-2 text-emerald-600" />
                Add Shift
              </Button>
              <Button variant="outline" className="w-full justify-start border-slate-200 hover:bg-slate-50 text-slate-700" size="sm">
                <Users className="h-4 w-4 mr-2 text-indigo-600" />
                Manage Employees
              </Button>
              <Button variant="outline" className="w-full justify-start border-slate-200 hover:bg-slate-50 text-slate-700" size="sm">
                <Clock className="h-4 w-4 mr-2 text-orange-600" />
                Time Off Requests
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Navigation */}
      <Card className="bg-white/90 border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <ArrowRight className="h-5 w-5 text-blue-600" />
            Quick Navigation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button variant="outline" className="h-16 flex-col border-slate-200 hover:bg-slate-50 text-slate-700" asChild>
              <a href="/schedule">
                <Calendar className="h-6 w-6 mb-1 text-blue-600" />
                <span className="text-xs">Schedule</span>
              </a>
            </Button>
            <Button variant="outline" className="h-16 flex-col border-slate-200 hover:bg-slate-50 text-slate-700" asChild>
              <a href="/employees">
                <Users className="h-6 w-6 mb-1 text-indigo-600" />
                <span className="text-xs">Employees</span>
              </a>
            </Button>
            <Button variant="outline" className="h-16 flex-col border-slate-200 hover:bg-slate-50 text-slate-700" asChild>
              <a href="/time-off">
                <Clock className="h-6 w-6 mb-1 text-orange-600" />
                <span className="text-xs">Time Off</span>
              </a>
            </Button>
            <Button variant="outline" className="h-16 flex-col border-slate-200 hover:bg-slate-50 text-slate-700" asChild>
              <a href="/report">
                <TrendingUp className="h-6 w-6 mb-1 text-emerald-600" />
                <span className="text-xs">Reports</span>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}