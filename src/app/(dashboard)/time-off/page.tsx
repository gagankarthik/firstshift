"use client";

import * as React from "react";
import { createClient } from "@/lib/supabaseClient";
import { useOrg } from "@/components/providers/OrgProvider";
import { usePermissions } from "@/app/hooks/usePermissions";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";
import {
  Loader2, Plus, Check, X, Trash2, Filter, Calendar, Clock,
  User, Building, TrendingUp, AlertCircle, Eye, Search, CalendarDays,
  Briefcase, Heart, Users, FileText, Download
} from "lucide-react";

type Role = "admin" | "manager" | "employee";
type Row = {
  id: string;
  employee_id: string;
  starts_at: string;
  ends_at: string;
  type: "vacation" | "sick" | "unpaid" | "other";
  reason: string | null;
  status: "pending" | "approved" | "denied";
  employees?: { full_name: string; avatar_url: string | null };
};

type Employee = {
  id: string;
  full_name: string;
  avatar_url: string | null;
};

/* ================== Badge Components ================== */
const StatusBadge = ({ status }: { status: Row["status"] }) => {
  const config = {
    pending: { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
    approved: { label: "Approved", className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Check },
    denied: { label: "Denied", className: "bg-red-50 text-red-700 border-red-200", icon: X },
  };
  const { label, className, icon: Icon } = config[status];
  return (
    <Badge variant="outline" className={className}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
};

const TypeBadge = ({ type }: { type: Row["type"] }) => {
  const config = {
    vacation: { label: "Vacation", className: "bg-blue-50 text-blue-700 border-blue-200", icon: CalendarDays },
    sick: { label: "Sick Leave", className: "bg-red-50 text-red-700 border-red-200", icon: Heart },
    unpaid: { label: "Unpaid Leave", className: "bg-slate-50 text-slate-700 border-slate-200", icon: Briefcase },
    other: { label: "Other", className: "bg-orange-50 text-orange-700 border-orange-200", icon: AlertCircle },
  };
  const { label, className, icon: Icon } = config[type];
  return (
    <Badge variant="outline" className={className}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
};

/* ================== Stats Card Component ================== */
const StatsCard = ({ title, value, subtitle, icon: Icon, color, trend }: {
  title: string;
  value: number | string;
  subtitle: string;
  icon: any;
  color: string;
  trend?: { value: number; label: string };
}) => (
  <Card className="bg-white/95 border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">{title}</p>
          <p className={`text-2xl font-bold ${color} mt-1`}>{value}</p>
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        </div>
        <div className={`p-2 rounded-lg bg-white shadow-sm border border-slate-200`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </div>
      {trend && (
        <div className="mt-2 flex items-center text-xs">
          <span className={trend.value > 0 ? "text-green-600" : trend.value < 0 ? "text-red-600" : "text-slate-500"}>
            {trend.value > 0 ? '↗' : trend.value < 0 ? '↘' : '→'} {Math.abs(trend.value)}%
          </span>
          <span className="text-slate-500 ml-1">{trend.label}</span>
        </div>
      )}
    </CardContent>
  </Card>
);

/* ================== Request Form Component ================== */
const RequestForm = ({ open, onOpenChange, onSuccess, employees, canManage, myEmployeeId }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  employees: Employee[];
  canManage: boolean;
  myEmployeeId: string | null;
}) => {
  const sb = React.useMemo(() => createClient(), []);
  const { orgId } = useOrg();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    employee_id: '',
    start_date: '',
    end_date: '',
    type: 'vacation' as Row['type'],
    reason: '',
  });

  // Auto-select current user's employee ID if not admin/manager
  React.useEffect(() => {
    if (!canManage && myEmployeeId && formData.employee_id === '') {
      setFormData(prev => ({ ...prev, employee_id: myEmployeeId }));
    }
  }, [canManage, myEmployeeId, formData.employee_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.start_date || !formData.end_date || !formData.employee_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Security check: Regular employees can only request time off for themselves
    if (!canManage && formData.employee_id !== myEmployeeId) {
      toast.error("You can only request time off for yourself");
      return;
    }

    setLoading(true);

    // Get current user for created_by field
    const { data: { user } } = await sb.auth.getUser();

    const { error } = await sb.from("time_off").insert({
      org_id: orgId,
      employee_id: formData.employee_id,
      starts_at: formData.start_date,
      ends_at: formData.end_date,
      type: formData.type,
      reason: formData.reason.trim() || null,
      status: 'pending',
      created_by: user?.id || null
    });

    setLoading(false);
    if (error) {
      console.error("Time off submission error:", error);
      toast.error("Failed to submit request: " + error.message);
      return;
    }

    toast.success("Time off request submitted");
    onOpenChange(false);
    onSuccess();

    // Reset form
    setFormData({ employee_id: '', start_date: '', end_date: '', type: 'vacation', reason: '' });
  };

  const days = formData.start_date && formData.end_date ?
    differenceInDays(new Date(formData.end_date), new Date(formData.start_date)) + 1 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Time Off</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <div className="relative">
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({...prev, start_date: e.target.value}))}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="border-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <div className="relative">
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({...prev, end_date: e.target.value}))}
                  min={formData.start_date || format(new Date(), 'yyyy-MM-dd')}
                  className="border-slate-300"
                />
              </div>
            </div>
          </div>

          {days > 0 && (
            <div className="text-sm text-slate-600 bg-blue-50 p-2 rounded-lg">
              📅 Duration: <span className="font-medium">{days} day{days > 1 ? 's' : ''}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label>Employee</Label>
            <Select
              value={formData.employee_id}
              onValueChange={(v) => setFormData(prev => ({...prev, employee_id: v}))}
              disabled={!canManage}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!canManage && (
              <p className="text-xs text-slate-500">You can only request time off for yourself</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({...prev, type: v as Row['type']}))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vacation">🏖️ Vacation</SelectItem>
                <SelectItem value="sick">🤒 Sick Leave</SelectItem>
                <SelectItem value="unpaid">💼 Unpaid Leave</SelectItem>
                <SelectItem value="other">📋 Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Reason (Optional)</Label>
            <Textarea
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({...prev, reason: e.target.value}))}
              placeholder="Add any additional details..."
              className="resize-none"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-indigo-600">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/* ================== Main Component ================== */
export default function TimeOffPage() {
  const sb = React.useMemo(() => createClient(), []);
  const { orgId, role, loading } = useOrg();
  const perms = usePermissions(role);

  const [rows, setRows] = React.useState<Row[]>([]);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [requestDialogOpen, setRequestDialogOpen] = React.useState(false);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const [myEmployeeId, setMyEmployeeId] = React.useState<string | null>(null);

  const canManage = perms.canManageSchedule;

  // Get current user's employee ID
  React.useEffect(() => {
    (async () => {
      if (!orgId) return;
      const { data: u } = await sb.auth.getUser();
      const userId = u.user?.id || null;
      setCurrentUserId(userId);
      if (!userId) return;

      const { data: emp, error } = await sb
        .from("employees")
        .select("id")
        .eq("org_id", orgId)
        .eq("profile_id", userId)
        .limit(1)
        .maybeSingle();

      if (!error && emp) {
        setMyEmployeeId(emp.id);
      }
    })();
  }, [sb, orgId]);

  const loadData = React.useCallback(async () => {
    if (!orgId) return;

    // For employees, we must have their employee ID to proceed
    if (!canManage && !myEmployeeId) {
      console.log("Employee role detected but no employee ID found, skipping data load");
      return;
    }

    // Build queries based on role permissions
    let timeOffQuery = sb.from("time_off")
      .select(`
        id, employee_id, starts_at, ends_at, type, reason, status,
        employees!employee_id(full_name, avatar_url)
      `)
      .eq("org_id", orgId);

    let employeesQuery = sb.from("employees")
      .select("id, full_name, avatar_url")
      .eq("org_id", orgId)
      .eq("active", true);

    // If user is employee (not admin/manager), only show their own requests
    if (!canManage) {
      timeOffQuery = timeOffQuery.eq("employee_id", myEmployeeId!);
      employeesQuery = employeesQuery.eq("id", myEmployeeId!);
    }

    const [{ data: timeOffData, error: timeOffError }, { data: employeesData, error: employeesError }] = await Promise.all([
      timeOffQuery.order("starts_at", { ascending: false }),
      employeesQuery.order("full_name")
    ]);

    if (timeOffError) {
      console.error("Error loading time off data:", timeOffError);
    }
    if (employeesError) {
      console.error("Error loading employees data:", employeesError);
    }

    if (timeOffData) {
      console.log("Loaded time off data:", timeOffData);
      setRows(timeOffData as any);
    } else {
      console.log("No time off data returned");
    }
    if (employeesData) setEmployees(employeesData as Employee[]);
  }, [orgId, sb, canManage, myEmployeeId]);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  // Real-time updates
  React.useEffect(() => {
    if (!orgId) return;
    const ch = sb
      .channel(`time-off-${orgId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "time_off", filter: `org_id=eq.${orgId}` }, loadData)
      .subscribe();
    return () => { sb.removeChannel(ch); };
  }, [sb, orgId, loadData]);

  const filteredRows = React.useMemo(() => {
    let filtered = rows;

    if (statusFilter !== "all") {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    if (typeFilter !== "all") {
      filtered = filtered.filter(r => r.type === typeFilter);
    }
    if (employeeFilter !== "all") {
      filtered = filtered.filter(r => r.employee_id === employeeFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.employees?.full_name?.toLowerCase().includes(query) ||
        r.reason?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [rows, statusFilter, typeFilter, employeeFilter, searchQuery]);

  // Statistics
  const stats = React.useMemo(() => {
    const total = rows.length;
    const pending = rows.filter(r => r.status === 'pending').length;
    const approved = rows.filter(r => r.status === 'approved').length;
    const denied = rows.filter(r => r.status === 'denied').length;

    const thisMonth = rows.filter(r => {
      const requestDate = new Date(r.starts_at);
      const now = new Date();
      return requestDate.getMonth() === now.getMonth() && requestDate.getFullYear() === now.getFullYear();
    }).length;

    return { total, pending, approved, denied, thisMonth };
  }, [rows]);

  async function updateRequestStatus(requestId: string, status: 'approved' | 'denied') {
    if (!canManage) return;

    const { error } = await sb
      .from("time_off")
      .update({ status })
      .eq("id", requestId);

    if (error) {
      toast.error(`Failed to ${status === 'approved' ? 'approve' : 'deny'} request`);
      return;
    }

    toast.success(`Request ${status === 'approved' ? 'approved' : 'denied'}`);
    void loadData();
  }

  if (loading || !orgId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg font-medium">Loading time off requests...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
            Time Off Management
          </h1>
          <p className="text-slate-600 mt-1">Manage employee time off requests and approvals</p>
        </div>

        <div className="flex items-center gap-3">
          {canManage && (
            <Button variant="outline" className="border-slate-300">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          {(canManage || myEmployeeId) && (
            <Button
              onClick={() => setRequestDialogOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          )}
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatsCard
          title="Total Requests"
          value={stats.total}
          subtitle="All time requests"
          icon={FileText}
          color="text-blue-700"
          trend={{ value: 12, label: "vs last month" }}
        />
        <StatsCard
          title="Pending Approval"
          value={stats.pending}
          subtitle="Awaiting review"
          icon={Clock}
          color="text-amber-700"
        />
        <StatsCard
          title="Approved"
          value={stats.approved}
          subtitle="Approved requests"
          icon={Check}
          color="text-emerald-700"
        />
        <StatsCard
          title="This Month"
          value={stats.thisMonth}
          subtitle="Current month"
          icon={Calendar}
          color="text-purple-700"
        />
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4 bg-white/95 p-4 rounded-xl border border-slate-200 shadow-sm"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-slate-300"
          />
        </div>

        <div className="flex overflow-auto gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] border-slate-300">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="denied">Denied</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px] border-slate-300">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="vacation">Vacation</SelectItem>
              <SelectItem value="sick">Sick Leave</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          {canManage && (
            <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
              <SelectTrigger className="w-[160px] border-slate-300">
                <SelectValue placeholder="Employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </motion.div>

      {/* Requests Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-white/95 border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Users className="h-5 w-5" />
              Time Off Requests ({filteredRows.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredRows.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-slate-700 mb-2">No requests found</p>
                <p className="text-slate-500">
                  {searchQuery.trim() ? "Try adjusting your search terms" : "No time off requests yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200">
                      <TableHead className="text-slate-700 font-semibold">Employee</TableHead>
                      <TableHead className="text-slate-700 font-semibold">Dates</TableHead>
                      <TableHead className="text-slate-700 font-semibold">Type</TableHead>
                      <TableHead className="text-slate-700 font-semibold">Duration</TableHead>
                      <TableHead className="text-slate-700 font-semibold">Status</TableHead>
                      <TableHead className="text-slate-700 font-semibold">Reason</TableHead>
                      {canManage && <TableHead className="text-slate-700 font-semibold text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredRows.map((row, index) => {
                        const employee = row.employees;
                        const days = differenceInDays(new Date(row.ends_at), new Date(row.starts_at)) + 1;

                        return (
                          <motion.tr
                            key={row.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-slate-200 hover:bg-slate-50"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 border border-slate-200">
                                  {employee?.avatar_url && <AvatarImage src={employee.avatar_url} />}
                                  <AvatarFallback className="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 text-xs font-semibold">
                                    {employee?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-slate-900">{employee?.full_name || 'Unknown'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="font-medium text-slate-900">
                                  {format(new Date(row.starts_at), 'MMM d')} - {format(new Date(row.ends_at), 'MMM d, yyyy')}
                                </div>
                                <div className="text-slate-500 text-xs">
                                  {format(new Date(row.starts_at), 'MMM d, yyyy')} • Requested
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <TypeBadge type={row.type} />
                            </TableCell>
                            <TableCell>
                              <span className="font-medium text-slate-900">
                                {days} day{days > 1 ? 's' : ''}
                              </span>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={row.status} />
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <div className="text-sm text-slate-600 truncate" title={row.reason || ''}>
                                {row.reason || <span className="italic text-slate-400">No reason provided</span>}
                              </div>
                            </TableCell>
                            {canManage && (
                              <TableCell className="text-right">
                                {row.status === 'pending' && (
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateRequestStatus(row.id, 'approved')}
                                      className="h-8 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                    >
                                      <Check className="h-3 w-3 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateRequestStatus(row.id, 'denied')}
                                      className="h-8 border-red-300 text-red-700 hover:bg-red-50"
                                    >
                                      <X className="h-3 w-3 mr-1" />
                                      Deny
                                    </Button>
                                  </div>
                                )}
                              </TableCell>
                            )}
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Request Form Dialog */}
      <RequestForm
        open={requestDialogOpen}
        onOpenChange={setRequestDialogOpen}
        onSuccess={loadData}
        employees={employees}
        canManage={canManage}
        myEmployeeId={myEmployeeId}
      />
    </div>
  );
}