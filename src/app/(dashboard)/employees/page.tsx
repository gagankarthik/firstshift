"use client";

import * as React from "react";
import { createClient } from "@/lib/supabaseClient";
import { useOrg } from "@/components/providers/OrgProvider";
import { usePermissions } from "@/app/hooks/usePermissions";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { NoSSR } from "@/components/ui/no-ssr";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmployeeHelpButton } from "@/components/ui/help-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Users,
  UserCheck,
  UserX,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Shield,
  Crown,
  User,
  FileText,
  Printer,
} from "lucide-react";

// Import layout components
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { StatCard } from "@/components/layout/StatCard";
import { EmptyState } from "@/components/layout/EmptyState";

import AddEmployeeDialog from "@/components/employees/AddEmployeeDialog";

/* ================== Types ================== */

type Row = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  active: boolean | null;
  position_id: string | null;
  positions?: { name: string } | null;
};

type Position = { id: string; name: string };

type RawEmployee = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  active: boolean | null;
  position_id: string | null;
  positions?: { name: string } | { name: string }[] | null;
};

/* ================== Role Icons Component ================== */
const getRoleIcon = (role: string | null) => {
  switch (role) {
    case 'admin':
      return <Crown className="h-3 w-3 text-amber-600" />;
    case 'manager':
      return <Shield className="h-3 w-3 text-blue-600" />;
    default:
      return <User className="h-3 w-3 text-slate-500" />;
  }
};

const getRoleBadgeColor = (role: string | null) => {
  switch (role) {
    case "admin":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "manager":
      return "bg-blue-50 text-blue-700 border-blue-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
};

/* ================== Main Page Component ================== */

export default function EmployeesPage() {
  const sb = React.useMemo(() => createClient(), []);
  const { orgId, role, loading } = useOrg();
  const perms = usePermissions(role);

  const [rows, setRows] = React.useState<Row[]>([]);
  const [positions, setPositions] = React.useState<Position[]>([]);
  const [posFilter, setPosFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [q, setQ] = React.useState("");
  const [openAdd, setOpenAdd] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'table' | 'grid'>('table');
  const [isLoading, setIsLoading] = React.useState(true);

  // delete / deactivate dialog state
  const [confirmId, setConfirmId] = React.useState<string | null>(null);
  const [confirmName, setConfirmName] = React.useState<string>("");
  const [busy, setBusy] = React.useState(false);
  const [lastUpdate, setLastUpdate] = React.useState(new Date());

  // per-row spinner for position change
  const [updatingPos, setUpdatingPos] = React.useState<Record<string, boolean>>({});

  const canManage = perms.canManageEmployees;

  const normalizeEmployee = (r: RawEmployee): Row => {
    let pos: { name: string } | null = null;
    if (Array.isArray(r.positions)) pos = r.positions[0] ?? null;
    else if (r.positions && typeof r.positions === "object") pos = r.positions;

    return {
      id: r.id,
      full_name: r.full_name,
      avatar_url: r.avatar_url,
      active: r.active ?? true,
      position_id: r.position_id ?? null,
      positions: pos,
    };
  };

  const loadEmployees = React.useCallback(async () => {
    if (!orgId) return;
    setIsLoading(true);

    const { data, error } = await sb
      .from("employees")
      .select("id, full_name, avatar_url, active, position_id, positions:position_id(name)")
      .eq("org_id", orgId)
      .order("full_name");

    if (error) {
      console.error("Error loading employees:", error);
      toast.error("Failed to load employees");
      setIsLoading(false);
      return;
    }

    setRows((data || []).map(normalizeEmployee));
    setLastUpdate(new Date());
    setIsLoading(false);
  }, [orgId, sb]);

  const loadPositions = React.useCallback(async () => {
    if (!orgId) return;
    const { data, error } = await sb
      .from("positions")
      .select("id, name")
      .eq("org_id", orgId)
      .order("name");
    if (error) {
      console.error("Error loading positions:", error);
      return;
    }
    setPositions(data || []);
  }, [orgId, sb]);

  React.useEffect(() => {
    void loadEmployees();
    void loadPositions();
  }, [loadEmployees, loadPositions]);

  // Real-time updates
  React.useEffect(() => {
    if (!orgId) return;
    const ch = sb
      .channel(`employees-${orgId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "employees", filter: `org_id=eq.${orgId}` }, loadEmployees)
      .subscribe();
    return () => { sb.removeChannel(ch); };
  }, [sb, orgId, loadEmployees]);

  const filteredRows = React.useMemo(() => {
    let filtered = rows;

    // Search filter
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      filtered = filtered.filter(r => r.full_name.toLowerCase().includes(needle));
    }

    // Position filter
    if (posFilter !== "all") {
      filtered = filtered.filter(r => r.position_id === posFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      const active = statusFilter === "active";
      filtered = filtered.filter(r => r.active === active);
    }

    return filtered;
  }, [rows, q, posFilter, statusFilter]);

  // Statistics
  const stats = React.useMemo(() => {
    const total = rows.length;
    const active = rows.filter(r => r.active).length;
    const inactive = total - active;
    const withPositions = rows.filter(r => r.position_id).length;

    return {
      total,
      active,
      inactive,
      withPositions,
      coverageRate: total > 0 ? Math.round((withPositions / total) * 100) : 0
    };
  }, [rows]);

  async function updatePosition(empId: string, positionId: string | null) {
    if (!canManage) return;
    setUpdatingPos(prev => ({ ...prev, [empId]: true }));

    const { error } = await sb
      .from("employees")
      .update({ position_id: positionId === "none" ? null : positionId })
      .eq("id", empId);

    setUpdatingPos(prev => ({ ...prev, [empId]: false }));

    if (error) {
      console.error("Error updating position:", error);
      toast.error("Failed to update position");
    } else {
      toast.success("Position updated");
      void loadEmployees();
    }
  }

  async function deactivateEmployee(empId: string) {
    if (!canManage || !confirmId) return;
    setBusy(true);

    const { error } = await sb
      .from("employees")
      .update({ active: false })
      .eq("id", empId);

    setBusy(false);
    setConfirmId(null);

    if (error) {
      console.error("Error deactivating employee:", error);
      toast.error("Failed to deactivate employee");
    } else {
      toast.success("Employee deactivated");
      void loadEmployees();
    }
  }

  if (loading || !orgId) {
    return (
      <NoSSR showLoader>
        <PageContainer maxWidth="xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-lg font-medium">Loading employees...</span>
            </div>
          </div>
        </PageContainer>
      </NoSSR>
    );
  }

  return (
    <NoSSR>
      <PageContainer maxWidth="xl">
        {/* Page Header */}
        <PageHeader
          icon={Users}
          title="Team Management"
          description={`${stats.total} team members • ${stats.active} active`}
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Employees" },
          ]}
          actions={
            <>
              <EmployeeHelpButton />
              {canManage && (
                <Button onClick={() => setOpenAdd(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Employee</span>
                </Button>
              )}
            </>
          }
        />

        {/* Statistics Cards */}
        <Section spacing="lg" noPadding>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title="Total Employees"
              value={stats.total.toString()}
              icon={Users}
              trend={{ value: 5, label: "vs last month" }}
              subtitle="All team members"
              gradient="from-blue-500 to-indigo-600"
              iconColor="text-blue-600"
            />
            <StatCard
              title="Active Members"
              value={stats.active.toString()}
              icon={UserCheck}
              subtitle="Currently working"
              gradient="from-green-500 to-emerald-600"
              iconColor="text-green-600"
            />
            <StatCard
              title="Inactive Members"
              value={stats.inactive.toString()}
              icon={UserX}
              subtitle="Not currently active"
              gradient="from-orange-500 to-red-600"
              iconColor="text-orange-600"
            />
            <StatCard
              title="Position Coverage"
              value={`${stats.coverageRate}%`}
              icon={Shield}
              subtitle={`${stats.withPositions} assigned`}
              gradient="from-purple-500 to-pink-600"
              iconColor="text-purple-600"
            />
          </div>
        </Section>

        {/* Filters and Search */}
        <Section spacing="sm" noPadding>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={posFilter} onValueChange={setPosFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Positions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {positions.map((pos) => (
                  <SelectItem key={pos.id} value={pos.id}>
                    {pos.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">
                {viewMode === "table" ? "Grid" : "Table"}
              </span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" />
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Results summary */}
          {(q || posFilter !== "all" || statusFilter !== "all") && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-semibold">{filteredRows.length}</span> of{" "}
                <span className="font-semibold">{rows.length}</span> employees
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQ("");
                  setPosFilter("all");
                  setStatusFilter("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </Section>

        {/* Employee List */}
        <Section spacing="md" noPadding>
          {filteredRows.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No employees found"
              description={
                q.trim()
                  ? "Try adjusting your search terms"
                  : "Add your first employee to get started"
              }
              action={
                canManage && !q.trim()
                  ? {
                      label: "Add Employee",
                      onClick: () => setOpenAdd(true),
                      icon: Plus,
                    }
                  : undefined
              }
            />
          ) : viewMode === "table" ? (
            <Card className="glass-card">
              <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200">
                      <TableHead className="text-slate-700 font-semibold">Employee</TableHead>
                      <TableHead className="text-slate-700 font-semibold">Position</TableHead>
                      <TableHead className="text-slate-700 font-semibold">Status</TableHead>
                      <TableHead className="text-slate-700 font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredRows.map((row, index) => (
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
                              <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                {row.avatar_url && <AvatarImage src={row.avatar_url} />}
                                <AvatarFallback className="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 font-semibold">
                                  {row.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-slate-900">{row.full_name}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  {getRoleIcon('employee')}
                                  <span className="text-xs text-slate-500">Employee</span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {canManage ? (
                              <Select
                                value={row.position_id || "none"}
                                onValueChange={(val) => updatePosition(row.id, val)}
                                disabled={updatingPos[row.id]}
                              >
                                <SelectTrigger className="w-[140px] h-8 text-sm border-slate-300">
                                  {updatingPos[row.id] ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <SelectValue placeholder="No position" />
                                  )}
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">No position</SelectItem>
                                  {positions.map(pos => (
                                    <SelectItem key={pos.id} value={pos.id}>{pos.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge variant="outline" className={row.positions?.name ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-600"}>
                                {row.positions?.name || "No position"}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={row.active
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-red-200 bg-red-50 text-red-700"
                              }
                            >
                              {row.active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {canManage && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Details
                                  </DropdownMenuItem>
                                  {row.active && (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setConfirmId(row.id);
                                        setConfirmName(row.full_name);
                                      }}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Deactivate
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <AnimatePresence>
                  {filteredRows.map((row, index) => (
                    <motion.div
                      key={row.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-all duration-200 bg-white"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                            {row.avatar_url && <AvatarImage src={row.avatar_url} />}
                            <AvatarFallback className="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 font-semibold">
                              {row.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium text-slate-900">{row.full_name}</h3>
                            <div className="flex items-center gap-1 mt-1">
                              {getRoleIcon('employee')}
                              <span className="text-xs text-slate-500">Employee</span>
                            </div>
                          </div>
                        </div>
                        {canManage && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Details
                              </DropdownMenuItem>
                              {row.active && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setConfirmId(row.id);
                                    setConfirmName(row.full_name);
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Deactivate
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Position:</span>
                          <Badge variant="outline" className={row.positions?.name ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-600"}>
                            {row.positions?.name || "No position"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Status:</span>
                          <Badge
                            variant="outline"
                            className={row.active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-red-200 bg-red-50 text-red-700"
                            }
                          >
                            {row.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
          )}
        </Section>

        {/* Add Employee Dialog */}
        <AddEmployeeDialog
          orgId={orgId!}
          open={openAdd}
          onOpenChange={setOpenAdd}
        />

        {/* Confirmation Dialog */}
        <AlertDialog open={!!confirmId} onOpenChange={() => setConfirmId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deactivate Employee</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to deactivate <strong>{confirmName}</strong>? They
                will no longer appear in active employee lists and cannot be assigned to
                shifts.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deactivateEmployee(confirmId!)}
                disabled={busy}
                className="bg-red-600 hover:bg-red-700"
              >
                {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Deactivate
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PageContainer>
    </NoSSR>
  );
}