// app/(dashboard)/time-off/page.tsx
"use client";

import * as React from "react";
import { createClient } from "@/lib/supabaseClient";
import { useOrg } from "@/components/providers/OrgProvider";
import { usePermissions } from "@/app/hooks/usePermissions";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { format } from "date-fns";
import { toast } from "sonner";
import { Loader2, Plus, Check, X, Trash2, Filter } from "lucide-react";

type Role = "admin" | "manager" | "employee";
type Row = {
  id: string;
  employee_id: string;
  starts_at: string; // 'YYYY-MM-DD' (date column)
  ends_at: string;   // 'YYYY-MM-DD' (date column)
  type: "vacation" | "sick" | "unpaid" | "other";
  reason: string | null;
  status: "pending" | "approved" | "denied";
  employees?: { full_name: string; avatar_url: string | null } | null;
};

type MaybeArray<T> = T | T[] | null | undefined;
function pickOne<T>(v: MaybeArray<T>): T | null {
  return Array.isArray(v) ? v[0] ?? null : v ?? null;
}

function StatusBadge({ status }: { status: Row["status"] }) {
  const map: Record<Row["status"], { label: string; cls: string }> = {
    pending: { label: "Pending", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    approved:{ label: "Approved", cls:"bg-emerald-50 text-emerald-700 border-emerald-200" },
    denied:  { label: "Denied", cls:  "bg-rose-50 text-rose-700 border-rose-200" },
  };
  const cfg = map[status];
  return <Badge variant="outline" className={cfg.cls}>{cfg.label}</Badge>;
}

function TypeBadge({ type }: { type: Row["type"] }) {
  const map: Record<Row["type"], string> = {
    vacation: "bg-teal-50 text-teal-700 border-teal-200",
    sick:     "bg-sky-50 text-sky-700 border-sky-200",
    unpaid:   "bg-slate-50 text-slate-700 border-slate-200",
    other:    "bg-indigo-50 text-indigo-700 border-indigo-200",
  };
  return <Badge variant="outline" className={map[type]}>{type}</Badge>;
}

export default function TimeOffPage() {
  const sb = React.useMemo(() => createClient(), []);
  const { orgId, role, loading } = useOrg();
  const perms = usePermissions(role as Role | null);

  // Data
  const [rows, setRows] = React.useState<Row[]>([]);
  const [busy, setBusy] = React.useState(true);
  const [myEmployeeId, setMyEmployeeId] = React.useState<string | null>(null);

  // Per-row update spinner
  const [updating, setUpdating] = React.useState<Record<string, boolean>>({});

  // Filters
  const [statusFilter, setStatusFilter] = React.useState<"all" | Row["status"]>("all");
  const [typeFilter, setTypeFilter] = React.useState<"all" | Row["type"]>("all");
  const [scope, setScope] = React.useState<"mine" | "all">(role === "admin" || role === "manager" ? "all" : "mine");
  const [search, setSearch] = React.useState("");

  // New request dialog
  const [open, setOpen] = React.useState(false);
  const [start, setStart] = React.useState<string>("");
  const [end, setEnd] = React.useState<string>("");
  const [type, setType] = React.useState<Row["type"]>("vacation");
  const [reason, setReason] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const canApprove = perms.canApproveTimeOff;
  const canSubmit = perms.canSubmitTimeOff;

  const load = React.useCallback(async () => {
    if (!orgId) return;
    setBusy(true);

    // Fetch my employee id
    const { data: u } = await sb.auth.getUser();
    const uid = u.user?.id ?? null;
    if (uid) {
      const { data: me, error: meErr } = await sb
        .from("employees")
        .select("id")
        .eq("org_id", orgId)
        .eq("profile_id", uid)
        .limit(1)
        .maybeSingle();
      if (!meErr) setMyEmployeeId(me?.id ?? null);
    }

    // Fetch time-off requests in org
    const { data, error } = await sb
      .from("time_off")
      .select(
        "id, employee_id, starts_at, ends_at, type, reason, status, employees:employee_id(full_name, avatar_url)"
      )
      .eq("org_id", orgId)
      .order("starts_at", { ascending: false });

    if (error) {
      toast.error("Failed to load time off", { description: error.message });
      setRows([]);
      setBusy(false);
      return;
    }

    // Normalize
    const normalized: Row[] = (data || []).map((r: any) => ({
      id: r.id,
      employee_id: r.employee_id,
      starts_at: r.starts_at,
      ends_at: r.ends_at,
      type: r.type,
      reason: r.reason,
      status: r.status,
      employees: pickOne(r.employees),
    }));

    setRows(normalized);
    setBusy(false);
  }, [sb, orgId]);

  React.useEffect(() => { void load(); }, [load]);

  // Realtime
  React.useEffect(() => {
    if (!orgId) return;
    const ch = sb
      .channel(`timeoff-${orgId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "time_off", filter: `org_id=eq.${orgId}` },
        load
      )
      .subscribe();
    return () => { sb.removeChannel(ch); };
  }, [sb, orgId, load]);

  // Derived
  const filtered = React.useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (scope === "mine" && myEmployeeId && r.employee_id !== myEmployeeId) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (needle) {
        const name = r.employees?.full_name?.toLowerCase() ?? "";
        const rsn = r.reason?.toLowerCase() ?? "";
        if (!name.includes(needle) && !rsn.includes(needle)) return false;
      }
      return true;
    });
  }, [rows, scope, myEmployeeId, statusFilter, typeFilter, search]);

  const pendingCount = rows.filter((r) => r.status === "pending").length;
  const mineCount = rows.filter((r) => r.employee_id === myEmployeeId).length;

  async function submitRequest() {
    if (!canSubmit) return;
    if (!myEmployeeId) {
      toast.error("No employee record found");
      return;
    }
    if (!start || !end) {
      toast.error("Please choose start and end dates");
      return;
    }
    if (end < start) {
      toast.error("End date must be after start date");
      return;
    }
    setSubmitting(true);
    const { error } = await sb.from("time_off").insert({
      org_id: orgId,
      employee_id: myEmployeeId,
      starts_at: start, // date column
      ends_at: end,     // date column
      type,
      reason: reason.trim() || null,
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Failed to submit", { description: error.message });
      return;
    }
    toast.success("Request submitted");
    setOpen(false);
    setStart(""); setEnd(""); setReason(""); setType("vacation");
  }

  // ------- Persist approval/deny under RLS & reflect immediately -------
  async function updateStatus(id: string, status: Row["status"]) {
    if (!canApprove) return;
    setUpdating((u) => ({ ...u, [id]: true }));

    // Optimistic: update locally for snappy UX
    const prev = [...rows];
    setRows((cur) => cur.map((r) => (r.id === id ? { ...r, status } : r)));

    // Force-return one row; use org filter so RLS matches
    const { data, error } = await sb
      .from("time_off")
      .update({ status })
      .eq("id", id)
      .eq("org_id", orgId!)
      .select("id, status")
      .maybeSingle(); // <-- avoids “Cannot coerce...” when 0 rows

    if (error || !data) {
      setRows(prev); // rollback
      toast.error("Failed to update", {
        description: error?.message || "No matching row updated (check RLS / org_id).",
      });
    } else {
      // If currently filtering by Pending, remove from view after approval/deny
      if (statusFilter === "pending") {
        setRows((cur) => cur.filter((r) => r.id !== id));
      } else {
        setRows((cur) => cur.map((r) => (r.id === id ? { ...r, status: data.status } : r)));
      }
      toast.success(`Request ${status}`);
    }

    setUpdating((u) => ({ ...u, [id]: false }));
  }

  async function cancelMine(id: string) {
    const target = rows.find((r) => r.id === id);
    if (!target || target.employee_id !== myEmployeeId || target.status !== "pending") return;
    const prev = [...rows];
    setRows((cur) => cur.filter((r) => r.id !== id));
    const { error } = await sb
      .from("time_off")
      .delete()
      .eq("id", id)
      .eq("org_id", orgId!); // scope delete for RLS
    if (error) {
      setRows(prev);
      toast.error("Failed to cancel", { description: error.message });
    } else {
      toast.success("Request canceled");
    }
  }

  if (loading || !orgId) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header / Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold">Time Off</h1>
        <div className="ml-auto" />
        {canSubmit && (
          <Button className="gap-2" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> New request
          </Button>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-4">
          <div className="text-sm text-slate-500">Pending requests</div>
          <div className="mt-1 text-2xl font-semibold">{pendingCount}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-500">My requests</div>
          <div className="mt-1 text-2xl font-semibold">{mineCount}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-500">Total in org</div>
          <div className="mt-1 text-2xl font-semibold">{rows.length}</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Filter className="h-4 w-4" /> Filters
          </div>

          {(role === "admin" || role === "manager") && (
            <Select value={scope} onValueChange={(v) => setScope(v as "mine" | "all")}>
              <SelectTrigger className="w-[168px] bg-white"><SelectValue placeholder="Scope" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All employees</SelectItem>
                <SelectItem value="mine">My requests</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)} >
            <SelectTrigger className="w-[168px] bg-white"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="denied">Denied</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
            <SelectTrigger className="w-[168px] bg-white"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="vacation">Vacation</SelectItem>
              <SelectItem value="sick">Sick</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <div className="md:ml-auto w-full md:w-[280px]">
            <Input
              placeholder="Search by name or reason…"
              className="bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Mobile cards */}
      <div className="grid gap-3 md:hidden">
        {busy && (
          <Card className="p-4 text-sm text-slate-500">
            <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
            Loading requests…
          </Card>
        )}
        {!busy && filtered.length === 0 && (
          <Card className="p-4 text-sm text-slate-500">No requests found.</Card>
        )}
        {!busy &&
          filtered.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start gap-3">
                <img
                  src={r.employees?.avatar_url || "/avatar.svg"}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover bg-slate-100"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-medium">{r.employees?.full_name || "Unknown"}</div>
                    <TypeBadge type={r.type} />
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {format(new Date(r.starts_at), "MMM d")} – {format(new Date(r.ends_at), "MMM d")}
                  </div>
                  {r.reason ? <div className="mt-2 text-sm text-slate-700">{r.reason}</div> : null}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-end gap-2">
                {canApprove && r.status === "pending" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatus(r.id, "approved")}
                      disabled={!!updating[r.id]}
                    >
                      {updating[r.id] ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Check className="mr-1 h-4 w-4" />} Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatus(r.id, "denied")}
                      disabled={!!updating[r.id]}
                    >
                      {updating[r.id] ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <X className="mr-1 h-4 w-4" />} Deny
                    </Button>
                  </>
                )}
                {!canApprove && myEmployeeId === r.employee_id && r.status === "pending" && (
                  <Button variant="outline" size="sm" onClick={() => cancelMine(r.id)} disabled={!!updating[r.id]}>
                    <Trash2 className="mr-1 h-4 w-4" /> Cancel
                  </Button>
                )}
              </div>
            </Card>
          ))}
      </div>

      {/* Desktop table */}
      <Card className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {busy && (
              <TableRow>
                <TableCell colSpan={6} className="text-sm text-slate-500">
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                  Loading requests…
                </TableCell>
              </TableRow>
            )}
            {!busy && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-sm text-slate-500">
                  No requests found.
                </TableCell>
              </TableRow>
            )}
            {!busy &&
              filtered.map((r) => (
                <TableRow key={r.id} className="align-middle">
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <img
                        src={r.employees?.avatar_url || "/avatar.svg"}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover bg-slate-100"
                      />
                      <span>{r.employees?.full_name || "Unknown"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(r.starts_at), "MMM d")} – {format(new Date(r.ends_at), "MMM d")}
                  </TableCell>
                  <TableCell className="capitalize">
                    <TypeBadge type={r.type} />
                  </TableCell>
                  <TableCell className="capitalize">
                    <StatusBadge status={r.status} />
                  </TableCell>
                  <TableCell className="max-w-[360px] truncate">{r.reason}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-2">
                      {canApprove && r.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateStatus(r.id, "approved")}
                            disabled={!!updating[r.id]}
                          >
                            {updating[r.id] ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Check className="mr-1 h-4 w-4" />} Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateStatus(r.id, "denied")}
                            disabled={!!updating[r.id]}
                          >
                            {updating[r.id] ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <X className="mr-1 h-4 w-4" />} Deny
                          </Button>
                        </>
                      )}
                      {!canApprove && myEmployeeId === r.employee_id && r.status === "pending" && (
                        <Button variant="outline" size="sm" onClick={() => cancelMine(r.id)} disabled={!!updating[r.id]}>
                          <Trash2 className="mr-1 h-4 w-4" /> Cancel
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>

      {/* Create Request Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Request time off</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Start date</label>
                <Input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium">End date</label>
                <Input
                  type="date"
                  value={end}
                  min={start || undefined}
                  onChange={(e) => setEnd(e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select value={type} onValueChange={(v) => setType(v as Row["type"])}>
                <SelectTrigger className="bg-white"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacation">Vacation</SelectItem>
                  <SelectItem value="sick">Sick</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Reason (optional)</label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., family event"
                className="bg-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submitRequest} disabled={submitting}>
              {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…</> : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
