"use client";

import * as React from "react";
import { createClient } from "@/lib/supabaseClient";
import { useOrg } from "@/components/providers/OrgProvider";
import { usePermissions } from "@/app/hooks/usePermissions";
import { format, startOfWeek, endOfWeek, addDays } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";

// Layout Components
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { StatCard } from "@/components/layout/StatCard";
import { EmptyState } from "@/components/layout/EmptyState";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Icons
import {
  Calendar,
  Clock,
  Users,
  RefreshCw,
  Coffee,
  ArrowRight,
  BarChart3,
  CheckCircle,
  AlertCircle,
  MapPin,
  Star,
  Sparkles,
  Lightbulb,
  Brain,
  Loader2,
  Zap,
  Target,
  Activity,
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

  // AI Insights state
  const [aiInsights, setAiInsights] = React.useState<string | null>(null);
  const [aiRecommendations, setAiRecommendations] = React.useState<string | null>(null);
  const [aiAlerts, setAiAlerts] = React.useState<string | null>(null);
  const [loadingAI, setLoadingAI] = React.useState(false);
  const [aiLoaded, setAiLoaded] = React.useState(false);
  const [pendingTimeOffCount, setPendingTimeOffCount] = React.useState(0);

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

  // Load data
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

      // Load pending time off requests
      const { data: timeOffData } = await sb
        .from("time_off_requests")
        .select("id")
        .eq("org_id", orgId)
        .eq("status", "pending");

      setShifts(weekShifts || []);
      setTodayShifts(todayShiftsData || []);
      setEmployees(employeesData || []);
      setPendingTimeOffCount(timeOffData?.length || 0);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [orgId, sb, weekStart, weekEnd]);

  React.useEffect(() => {
    if (orgId) {
      void loadData();
    }
  }, [orgId, loadData]);

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

    const avgHoursPerShift = totalShifts > 0 ? totalHours / totalShifts : 0;
    const avgShiftsPerEmployee = activeEmployees > 0 ? assignedShifts / activeEmployees : 0;
    const utilizationRate = employees.length > 0 ? (activeEmployees / employees.length) * 100 : 0;

    // Calculate trends
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

  // Load AI insights
  const loadAIInsights = React.useCallback(async () => {
    if (!isAdmin || !orgId) return;

    setLoadingAI(true);
    try {
      const dashboardData = {
        totalShifts: stats.totalShifts,
        assignedShifts: stats.assignedShifts,
        openShifts: stats.openShifts,
        totalHours: stats.totalHours,
        coverageRate: stats.coverageRate,
        activeEmployees: stats.activeEmployees,
        totalEmployees: employees.length,
        utilizationRate: stats.utilizationRate,
        avgHoursPerShift: stats.avgHoursPerShift,
        avgShiftsPerEmployee: stats.avgShiftsPerEmployee,
        hoursTrend: stats.hoursTrend,
        shiftsTrend: stats.shiftsTrend,
        todayShiftsCount: todayShifts.length,
        upcomingShiftsCount: shifts.filter(s => new Date(s.starts_at) > new Date()).length,
        pendingTimeOffCount: pendingTimeOffCount,
      };

      const [insightsRes, recommendationsRes, alertsRes] = await Promise.all([
        fetch('/api/ai/dashboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'insights', dashboardData }),
        }),
        fetch('/api/ai/dashboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'recommendations', dashboardData }),
        }),
        fetch('/api/ai/dashboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'alerts', dashboardData }),
        }),
      ]);

      if (insightsRes.ok) {
        const data = await insightsRes.json();
        setAiInsights(data.result);
      }

      if (recommendationsRes.ok) {
        const data = await recommendationsRes.json();
        setAiRecommendations(data.result);
      }

      if (alertsRes.ok) {
        const data = await alertsRes.json();
        setAiAlerts(data.result);
      }

      setAiLoaded(true);
      toast.success('AI insights loaded');
    } catch (error) {
      console.error('Failed to load AI insights:', error);
      toast.error('Failed to load AI insights');
    } finally {
      setLoadingAI(false);
    }
  }, [stats, employees.length, todayShifts.length, shifts, pendingTimeOffCount, isAdmin, orgId]);

  // Reset AI insights when org changes
  React.useEffect(() => {
    setAiInsights(null);
    setAiRecommendations(null);
    setAiAlerts(null);
    setAiLoaded(false);
  }, [orgId]);

  if (orgLoading || loading) {
    return (
      <PageContainer maxWidth="xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="xl">
      {/* Page Header */}
      <PageHeader
        icon={BarChart3}
        title={getGreeting(userEmail?.split('@')[0])}
        description={isAdmin
          ? "Monitor your workforce and manage operations at a glance"
          : "View your schedule and upcoming shifts"
        }
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              Updated {format(lastUpdate, "h:mm a")}
            </Badge>
            <Button onClick={loadData} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Stats Grid */}
      <Section spacing="lg" noPadding>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
          <StatCard
            title="Total Shifts"
            value={stats.totalShifts}
            icon={Calendar}
            trend={stats.shiftsTrend !== 0 ? { value: stats.shiftsTrend, label: "vs last week" } : undefined}
            subtitle="This week"
            gradient="from-blue-500 to-indigo-600"
            iconColor="text-blue-600"
            onClick={() => window.location.href = '/schedule'}
          />
          <StatCard
            title="Coverage Rate"
            value={`${stats.coverageRate}%`}
            icon={CheckCircle}
            subtitle={`${stats.assignedShifts} of ${stats.totalShifts}`}
            gradient="from-green-500 to-emerald-600"
            iconColor="text-green-600"
          />
          <StatCard
            title="Open Shifts"
            value={stats.openShifts}
            icon={AlertCircle}
            subtitle="Need assignment"
            gradient="from-orange-500 to-amber-600"
            iconColor="text-orange-600"
          />
          <StatCard
            title="Total Hours"
            value={stats.totalHours}
            icon={Clock}
            trend={stats.hoursTrend !== 0 ? { value: stats.hoursTrend, label: "vs last week" } : undefined}
            subtitle="Scheduled hours"
            gradient="from-purple-500 to-pink-600"
            iconColor="text-purple-600"
          />
          <StatCard
            title="Active Team"
            value={stats.activeEmployees}
            icon={Users}
            subtitle={`of ${employees.length} total`}
            gradient="from-cyan-500 to-blue-600"
            iconColor="text-cyan-600"
            onClick={() => window.location.href = '/employees'}
          />
          <StatCard
            title="Utilization"
            value={`${stats.utilizationRate}%`}
            icon={Activity}
            subtitle="Team capacity"
            gradient="from-rose-500 to-red-600"
            iconColor="text-rose-600"
          />
        </div>
      </Section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2">
          <Section
            title="Today's Schedule"
            description={`${todayShifts.length} ${todayShifts.length === 1 ? 'shift' : 'shifts'} scheduled for today`}
            spacing="md"
            noPadding
            actions={
              <Button variant="ghost" size="sm" asChild>
                <Link href="/schedule">
                  View Calendar <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            }
          >
            <Card className="glass-card">
              <CardContent className="p-5 sm:p-6">
                {todayShifts.length === 0 ? (
                  <EmptyState
                    icon={Coffee}
                    title="No shifts today"
                    description="Enjoy your day off! Check the schedule for upcoming shifts."
                  />
                ) : (
                  <div className="space-y-3">
                    {todayShifts.map((shift) => {
                      const startTime = new Date(shift.starts_at);
                      const endTime = new Date(shift.ends_at);
                      const employee = Array.isArray(shift.employees) ? shift.employees[0] : shift.employees;
                      const position = Array.isArray(shift.positions) ? shift.positions[0] : shift.positions;
                      const location = Array.isArray(shift.locations) ? shift.locations[0] : shift.locations;

                      return (
                        <div
                          key={shift.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gradient-to-r from-background/80 to-accent/10 rounded-xl border border-border/50 hover:border-primary/30 transition-all group"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="h-4 w-4 text-primary" />
                              <span className="font-semibold text-foreground text-sm">
                                {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                              {employee ? (
                                <span className="text-muted-foreground">{employee.full_name}</span>
                              ) : (
                                <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Open
                                </Badge>
                              )}
                              {position && (
                                <Badge className="gradient-primary">
                                  {position.name}
                                </Badge>
                              )}
                              {location && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span className="text-xs">{location.name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 sm:mt-0 text-xs text-muted-foreground">
                            {Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60) * 10) / 10}h
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </Section>
        </div>

        {/* Quick Actions / My Shifts */}
        <div>
          {isAdmin ? (
            <Section
              title="Quick Actions"
              spacing="md"
              noPadding
            >
              <Card className="glass-card">
                <CardContent className="p-5 sm:p-6 space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/schedule">
                      <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                      Manage Schedule
                      <ArrowRight className="h-3 w-3 ml-auto" />
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/employees">
                      <Users className="h-4 w-4 mr-2 text-green-600" />
                      Team Management
                      <ArrowRight className="h-3 w-3 ml-auto" />
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/time-off">
                      <Clock className="h-4 w-4 mr-2 text-orange-600" />
                      Time Off Requests
                      {pendingTimeOffCount > 0 && (
                        <Badge className="ml-auto bg-orange-100 text-orange-700 border-orange-200">
                          {pendingTimeOffCount}
                        </Badge>
                      )}
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/report">
                      <BarChart3 className="h-4 w-4 mr-2 text-purple-600" />
                      View Reports
                      <ArrowRight className="h-3 w-3 ml-auto" />
                    </Link>
                  </Button>

                  {/* Summary */}
                  <div className="mt-6 pt-4 border-t border-border">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      This Week Summary
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center justify-between p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                        <span className="text-blue-700 font-medium">Open</span>
                        <Badge className={`${stats.openShifts > 0 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'} text-xs`}>
                          {stats.openShifts}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                        <span className="text-green-700 font-medium">Coverage</span>
                        <Badge className={`${stats.coverageRate < 90 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'} text-xs`}>
                          {stats.coverageRate}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Section>
          ) : (
            <Section
              title="My Upcoming Shifts"
              spacing="md"
              noPadding
            >
              <Card className="glass-card">
                <CardContent className="p-5 sm:p-6">
                  {upcomingShifts.length === 0 ? (
                    <EmptyState
                      icon={Calendar}
                      title="No upcoming shifts"
                      description="Check back later for new assignments"
                    />
                  ) : (
                    <div className="space-y-3">
                      {upcomingShifts.map((shift) => {
                        const startTime = new Date(shift.starts_at);
                        const endTime = new Date(shift.ends_at);
                        const hours = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60) * 10) / 10;

                        return (
                          <div
                            key={shift.id}
                            className="p-4 border border-border rounded-xl bg-gradient-to-r from-background to-accent/10 hover:shadow-md transition-all"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-foreground">
                                {format(startTime, "EEE, MMM d")}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                              </span>
                              <span className="text-xs text-muted-foreground">{hours}h</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Personal Stats */}
                  <div className="mt-6 pt-4 border-t border-border">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-700">{upcomingShifts.length}</div>
                        <div className="text-xs text-blue-600">Upcoming</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                        <div className="text-lg font-bold text-green-700">
                          {upcomingShifts.reduce((sum, shift) => {
                            const start = new Date(shift.starts_at);
                            const end = new Date(shift.ends_at);
                            return sum + ((end.getTime() - start.getTime()) / (1000 * 60 * 60));
                          }, 0).toFixed(1)}h
                        </div>
                        <div className="text-xs text-green-600">Total Hours</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Section>
          )}
        </div>
      </div>

      {/* AI Insights (Admin only) */}
      {isAdmin && (
        <Section
          title="AI-Powered Analytics"
          description="Get intelligent insights and recommendations"
          spacing="md"
          noPadding
          actions={
            <Button onClick={loadAIInsights} disabled={loadingAI || !stats.totalShifts}>
              {loadingAI ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : aiLoaded ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Insights
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate Insights
                </>
              )}
            </Button>
          }
        >
          <Card className="glass-card">
            <CardContent className="p-5 sm:p-6">
              {!aiLoaded && !loadingAI ? (
                <EmptyState
                  icon={Sparkles}
                  title="AI Insights Ready"
                  description="Click 'Generate Insights' to get personalized recommendations and analytics powered by AI"
                />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Insights */}
                  <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Brain className="h-4 w-4 text-blue-600" />
                        AI Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingAI && !aiInsights ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                          {aiInsights || "Loading insights..."}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Lightbulb className="h-4 w-4 text-green-600" />
                        Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingAI && !aiRecommendations ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                          {aiRecommendations || "Loading recommendations..."}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Alerts */}
                  <Card className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-orange-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        Alerts & Priorities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingAI && !aiAlerts ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                          {aiAlerts || "Loading alerts..."}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </Section>
      )}

      {/* Quick Navigation */}
      <Section
        title="Quick Navigation"
        description="Access key areas of your workspace"
        spacing="md"
        noPadding
      >
        <Card className="glass-card">
          <CardContent className="p-5 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { href: "/schedule", icon: Calendar, label: "Schedule", color: "text-blue-600", bgColor: "from-blue-50 to-indigo-50" },
                { href: "/employees", icon: Users, label: "Employees", color: "text-green-600", bgColor: "from-green-50 to-emerald-50" },
                { href: "/time-off", icon: Clock, label: "Time Off", color: "text-orange-600", bgColor: "from-orange-50 to-amber-50" },
                { href: "/report", icon: BarChart3, label: "Reports", color: "text-purple-600", bgColor: "from-purple-50 to-pink-50" },
                { href: "/availability", icon: Target, label: "Availability", color: "text-cyan-600", bgColor: "from-cyan-50 to-blue-50" },
                { href: "/settings", icon: Zap, label: "Settings", color: "text-rose-600", bgColor: "from-rose-50 to-red-50" },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <div className="flex flex-col items-center justify-center h-20 sm:h-24 p-4 border border-border hover:border-primary/30 rounded-xl bg-gradient-to-br from-background to-accent/10 hover:shadow-md transition-all group cursor-pointer">
                    <item.icon className={`h-6 w-6 sm:h-7 sm:w-7 mb-2 ${item.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-xs font-medium text-foreground">{item.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </Section>
    </PageContainer>
  );
}
