// app/(dashboard)/employees/page.tsx
"use client";

import * as React from "react";
import { createClient } from "@/lib/supabaseClient";
import { useOrg } from "@/components/providers/OrgProvider";
import { usePermissions } from "@/app/hooks/usePermissions";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmployeeHelpButton } from "@/components/ui/help-button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MoreHorizontal, Plus } from "lucide-react";

import AddEmployeeDialog from "@/components/employees/AddEmployeeDialog";

/* ================== Types ================== */

// UI row
type Row = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  active: boolean | null;
  position_id: string | null;           // <-- added
  positions?: { name: string } | null;  // joined lookup for current name
};

type Position = { id: string; name: string };

// Raw from Supabase (joins may be object or array)
type RawEmployee = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  active: boolean | null;
  position_id: string | null;
  positions?: { name: string } | { name: string }[] | null;
};

/* ================== Page ================== */

export default function EmployeesPage() {
  const sb = React.useMemo(() => createClient(), []);
  const { orgId, role, loading } = useOrg();
  const perms = usePermissions(role);

  const [rows, setRows] = React.useState<Row[]>([]);
  const [positions, setPositions] = React.useState<Position[]>([]);
  const [posFilter, setPosFilter] = React.useState<string>("all");
  const [q, setQ] = React.useState("");
  const [openAdd, setOpenAdd] = React.useState(false);

  // delete / deactivate dialog state
  const [confirmId, setConfirmId] = React.useState<string | null>(null);
  const [confirmName, setConfirmName] = React.useState<string>("");
  const [busy, setBusy] = React.useState(false);

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
    const { data, error } = await sb
      .from("employees")
      .select("id, full_name, avatar_url, active, position_id, positions:position_id(name)")
      .eq("org_id", orgId)
      .order("full_name");
    if (error) {
      toast.error("Failed to load employees", { description: error.message });
      return;
    }
    const mapped: Row[] = ((data || []) as RawEmployee[]).map(normalizeEmployee);
    setRows(mapped);
  }, [sb, orgId]);

  const loadPositions = React.useCallback(async () => {
    if (!orgId) return;
    const { data, error } = await sb
      .from("positions")
      .select("id, name")
      .eq("org_id", orgId)
      .order("name");
    if (error) {
      toast.error("Failed to load positions", { description: error.message });
      return;
    }
    setPositions((data || []) as Position[]);
  }, [sb, orgId]);

  React.useEffect(() => {
    void loadEmployees();
    void loadPositions();
  }, [loadEmployees, loadPositions]);

  // Realtime updates
  React.useEffect(() => {
    if (!orgId) return;
    const ch = sb
      .channel(`employees-${orgId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "employees", filter: `org_id=eq.${orgId}` },
        loadEmployees
      )
      .subscribe();
    return () => { sb.removeChannel(ch); };
  }, [sb, orgId, loadEmployees]);

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesText = !needle || r.full_name.toLowerCase().includes(needle);
      const matchesPos = posFilter === "all" || (r.positions?.name ?? "") === posFilter;
      return matchesText && matchesPos;
    });
  }, [rows, q, posFilter]);

  if (loading || !orgId) return <div className="text-sm text-gray-500">Loading…</div>;

  function openConfirm(row: Row) {
    setConfirmId(row.id);
    setConfirmName(row.full_name);
  }

  async function onDelete() {
    if (!confirmId) return;
    setBusy(true);
    // Try hard delete first
    const del = await sb.from("employees").delete().eq("id", confirmId).eq("org_id", orgId);
    if (del.error) {
      // likely blocked by FKs -> soft delete (deactivate)
      const soft = await sb.from("employees").update({ active: false }).eq("id", confirmId).eq("org_id", orgId);
      setBusy(false);
      setConfirmId(null);
      if (soft.error) {
        toast.error("Could not remove employee", { description: soft.error.message });
      } else {
        toast.success("Employee deactivated");
        void loadEmployees();
      }
      return;
    }
    setBusy(false);
    setConfirmId(null);
    toast.success("Employee deleted");
    void loadEmployees();
  }

  // --- Update position (inline) ---
  async function changePosition(empId: string, nextId: string) {
    const newPositionId = nextId === "none" ? null : nextId;

    // optimistic UI
    const prev = [...rows];
    const nextName = newPositionId ? positions.find((p) => p.id === newPositionId)?.name ?? null : null;
    setUpdatingPos((m) => ({ ...m, [empId]: true }));
    setRows((cur) =>
      cur.map((r) =>
        r.id === empId ? { ...r, position_id: newPositionId, positions: nextName ? { name: nextName } : null } : r
      )
    );

    const { data, error } = await sb
      .from("employees")
      .update({ position_id: newPositionId })
      .eq("id", empId)
      .eq("org_id", orgId)
      .select("id, position_id")
      .maybeSingle();

    setUpdatingPos((m) => ({ ...m, [empId]: false }));

    if (error || !data) {
      setRows(prev); // rollback
      toast.error("Failed to update position", { description: error?.message || "No matching row" });
      return;
    }
    toast.success("Position updated");
  }

  return (
    <div className="space-y-4">
      {/* Header / toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Employees</h1>
          <EmployeeHelpButton variant="icon" size="sm" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search by name…"
            className="w-[220px] bg-white"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Select value={posFilter} onValueChange={setPosFilter}>
            <SelectTrigger className="w-[200px] bg-white">
              <SelectValue placeholder="Filter by position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All positions</SelectItem>
              {positions.map((p) => (
                <SelectItem key={p.id} value={p.name}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {canManage && (
            <Button onClick={() => setOpenAdd(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Add employee
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[280px]">Employee</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-gray-500">
                    {rows.length === 0 ? "No employees yet." : "No matches."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((e) => {
                  const initials =
                    e.full_name
                      .split(" ")
                      .map((s) => s[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() || "U";
                  return (
                    <TableRow key={e.id} className="align-middle">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            {e.avatar_url ? <AvatarImage src={e.avatar_url} alt="" /> : null}
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="truncate font-medium">{e.full_name}</div>
                            <div className="text-xs text-gray-500">ID: {e.id.slice(0, 8)}…</div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        {canManage ? (
                          <div className="flex items-center gap-2">
                            <Select
                              value={e.position_id ?? "none"}
                              onValueChange={(val) => changePosition(e.id, val)}
                              disabled={!!updatingPos[e.id]}
                            >
                              <SelectTrigger className="w-[220px] bg-white">
                                <SelectValue placeholder="Assign position" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Unassigned</SelectItem>
                                {positions.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {updatingPos[e.id] ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" /> : null}
                          </div>
                        ) : e.positions?.name ? (
                          <Badge variant="secondary">{e.positions.name}</Badge>
                        ) : (
                          <span className="text-xs text-gray-500">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        {e.active === false ? (
                          <Badge variant="outline" className="text-gray-600">
                            Inactive
                          </Badge>
                        ) : (
                          <Badge className="bg-teal-600/10 text-teal-700 hover:bg-teal-600/10">Active</Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        {canManage ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label="Actions">
                                <MoreHorizontal className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => openConfirm(e)}
                                className="text-red-600"
                              >
                                {e.active === false ? "Delete permanently" : "Remove (deactivate / delete)"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <span className="text-xs text-gray-400">View only</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Empty state suggestion */}
      {rows.length === 0 && canManage && (
        <Card className="mt-2 p-4 text-sm text-gray-600">
          No employees yet. Click <span className="font-medium">Add employee</span> to create your first team member.
        </Card>
      )}

      {/* Add employee dialog */}
      <AddEmployeeDialog
        orgId={orgId}
        open={openAdd}
        onOpenChange={(v: boolean) => {
          setOpenAdd(v);
          if (!v) void loadEmployees();
        }}
      />

      {/* Confirm delete / deactivate */}
      <AlertDialog
        open={!!confirmId}
        onOpenChange={(open: boolean) => {
          if (!open) setConfirmId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove employee?</AlertDialogTitle>
            <AlertDialogDescription>
              {`You are about to remove ${confirmName}. We’ll try to delete this employee; if the record is referenced by shifts or time-off, we’ll deactivate instead.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} disabled={busy} className="bg-red-600 hover:bg-red-700">
              {busy ? "Working…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
