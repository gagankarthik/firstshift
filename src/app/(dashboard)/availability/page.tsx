"use client";

import * as React from "react";
import { createClient } from "@/lib/supabaseClient";
import { usePermissions } from "@/app/hooks/usePermissions";
import { useOrg } from "@/components/providers/OrgProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

type Employee = { id: string; full_name: string };
type Avail = {
  id: string;
  weekday: number;
  start_time: string; // "HH:MM:SS"
  end_time: string;   // "HH:MM:SS"
  employee_id: string;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AvailabilityPage() {
  const sb = React.useMemo(() => createClient(), []);
  const { orgId, role, loading } = useOrg();
  const perms = usePermissions(role);

  const [myEmployeeId, setMyEmployeeId] = React.useState<string | null>(null);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [targetEmpId, setTargetEmpId] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<Avail[]>([]);
  const [adding, setAdding] = React.useState<{
    weekday: number;
    start: string;
    end: string;
  }>({ weekday: 1, start: "09:00", end: "17:00" });
  const [busy, setBusy] = React.useState(false);

  // Fetch my employee id for this org
  React.useEffect(() => {
    (async () => {
      if (!orgId) return;
      const { data: u } = await sb.auth.getUser();
      const userId = u.user?.id || null;
      if (!userId) return;

      const { data: emp, error } = await sb
        .from("employees")
        .select("id")
        .eq("org_id", orgId)
        .eq("profile_id", userId)
        .limit(1)
        .maybeSingle();

      if (error) return;
      setMyEmployeeId(emp?.id ?? null);
    })();
  }, [sb, orgId]);

  // Employees list for the org
  React.useEffect(() => {
    if (!orgId) return;
    (async () => {
      const { data, error } = await sb
        .from("employees")
        .select("id, full_name")
        .eq("org_id", orgId)
        .order("full_name");

      if (error) {
        toast.error("Failed to load employees", { description: error.message });
        return;
      }
      setEmployees((data || []) as Employee[]);
    })();
  }, [sb, orgId]);

  // Default target employee:
  //  - employee role -> themselves
  //  - admin/manager -> first employee if none selected
  React.useEffect(() => {
    if (!orgId) return;

    if (!perms.canManageSchedule && myEmployeeId) {
      setTargetEmpId((prev) => prev ?? myEmployeeId);
    } else if (perms.canManageSchedule && employees.length && !targetEmpId) {
      setTargetEmpId(employees[0].id);
    }
  }, [orgId, perms.canManageSchedule, myEmployeeId, employees, targetEmpId]);

  // Loader for availability
  const loadAvail = React.useCallback(async () => {
    if (!orgId || !targetEmpId) return;

    const { data, error } = await sb
      .from("availability")
      .select("id, weekday, start_time, end_time, employee_id")
      .eq("org_id", orgId)
      .eq("employee_id", targetEmpId)
      .order("weekday, start_time");

    if (error) {
      toast.error("Failed to load availability", { description: error.message });
      return;
    }
    setRows((data || []) as Avail[]);
  }, [sb, orgId, targetEmpId]);

  React.useEffect(() => {
    void loadAvail();
  }, [loadAvail]);

  // Realtime updates
  React.useEffect(() => {
    if (!orgId) return;
    const ch = sb
      .channel(`availability-${orgId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "availability", filter: `org_id=eq.${orgId}` },
        () => loadAvail()
      )
      .subscribe();
    return () => {
      sb.removeChannel(ch);
    };
  }, [sb, orgId, loadAvail]);

  // ---- IMPORTANT: All hooks above this line. No early returns before finishing hooks. ----

  const canEditThis =
    !!targetEmpId && perms.canEditAvailabilityFor(targetEmpId, myEmployeeId);

  const byDay: Record<number, Avail[]> = React.useMemo(() => {
    const m: Record<number, Avail[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: []
    };
    for (const r of rows) {
      (m[r.weekday] ||= []).push(r);
    }
    return m;
  }, [rows]);

  // After all hooks: now we can safely branch on loading
  if (loading || !orgId) {
    return (
      <div className="space-y-3">
        <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-64 w-full animate-pulse rounded-xl bg-gray-200" />
      </div>
    );
  }

  async function addRange(dayIndex: number) {
    if (!targetEmpId) return;
    if (adding.start >= adding.end) {
      toast.error("Start time must be before end time");
      return;
    }
    setBusy(true);
    const { error } = await sb.from("availability").insert({
      org_id: orgId,
      employee_id: targetEmpId,
      weekday: dayIndex,
      start_time: `${adding.start}:00`,
      end_time: `${adding.end}:00`
    });
    setBusy(false);
    if (error) {
      toast.error("Failed to add range", { description: error.message });
      return;
    }
    toast.success("Availability added");
    void loadAvail();
  }

  async function removeRange(id: string) {
    setBusy(true);
    const { error } = await sb.from("availability").delete().eq("id", id);
    setBusy(false);
    if (error) {
      toast.error("Failed to remove range", { description: error.message });
      return;
    }
    toast.success("Availability removed");
    void loadAvail();
  }

  return (
    <div className="space-y-4">
      {/* Header / picker */}
      <div className="flex flex-wrap items-center gap-2">
        {perms.canManageSchedule ? (
          <Select
            value={targetEmpId ?? ""}
            onValueChange={(v) => setTargetEmpId(v)}
          >
            <SelectTrigger className="w-full bg-white sm:w-[280px]">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {employees.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="text-sm text-gray-600">Editing your availability</div>
        )}
      </div>

      {/* Table (mobile scrolls horizontally) */}
      <div className="overflow-x-auto rounded-xl border bg-white">
        <Table>
          <TableHeader className="sticky top-0 z-[1] bg-white">
            <TableRow>
              <TableHead className="w-[120px] sm:w-[160px]">Day</TableHead>
              <TableHead>Ranges</TableHead>
              {canEditThis && (
                <TableHead className="hidden w-[360px] text-right md:table-cell">
                  Add range
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {WEEKDAYS.map((name, dayIndex) => {
              const ranges = byDay[dayIndex] || [];
              const showMobileAdder = canEditThis; // show adder inline for mobile
              return (
                <TableRow key={dayIndex} className="align-top">
                  <TableCell className="font-medium">{name}</TableCell>

                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      {ranges.length > 0 ? (
                        ranges.map((r) => (
                          <div
                            key={r.id}
                            className="flex items-center gap-2 rounded-lg border bg-white px-2 py-1 text-sm"
                          >
                            <span>
                              {r.start_time.slice(0, 5)}–{r.end_time.slice(0, 5)}
                            </span>
                            {canEditThis && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => removeRange(r.id)}
                                title="Delete range"
                                aria-label="Delete range"
                              >
                                <Trash2 className="h-4 w-4 text-gray-500" />
                              </Button>
                            )}
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">
                          No availability set
                        </span>
                      )}
                    </div>

                    {/* Mobile add controls (inline) */}
                    {showMobileAdder && (
                      <div className="mt-2 flex items-center gap-2 md:hidden">
                        <Input
                          type="time"
                          className="h-9 w-[120px] bg-white"
                          value={
                            dayIndex === adding.weekday ? adding.start : "09:00"
                          }
                          onChange={(e) =>
                            setAdding((a) => ({
                              ...a,
                              weekday: dayIndex,
                              start: e.target.value
                            }))
                          }
                        />
                        <Input
                          type="time"
                          className="h-9 w-[120px] bg-white"
                          value={
                            dayIndex === adding.weekday ? adding.end : "17:00"
                          }
                          onChange={(e) =>
                            setAdding((a) => ({
                              ...a,
                              weekday: dayIndex,
                              end: e.target.value
                            }))
                          }
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            setAdding((a) => ({ ...a, weekday: dayIndex }));
                            void addRange(dayIndex);
                          }}
                          disabled={busy}
                          className="gap-1"
                        >
                          <Plus className="h-4 w-4" /> Add
                        </Button>
                      </div>
                    )}
                  </TableCell>

                  {/* Desktop add controls */}
                  {canEditThis && (
                    <TableCell className="hidden text-right md:table-cell">
                      <div className="ml-auto flex w-full items-center justify-end gap-2">
                        <Input
                          type="time"
                          className="h-9 w-[130px] bg-white"
                          value={
                            dayIndex === adding.weekday ? adding.start : "09:00"
                          }
                          onChange={(e) =>
                            setAdding((a) => ({
                              ...a,
                              weekday: dayIndex,
                              start: e.target.value
                            }))
                          }
                        />
                        <Input
                          type="time"
                          className="h-9 w-[130px] bg-white"
                          value={
                            dayIndex === adding.weekday ? adding.end : "17:00"
                          }
                          onChange={(e) =>
                            setAdding((a) => ({
                              ...a,
                              weekday: dayIndex,
                              end: e.target.value
                            }))
                          }
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            setAdding((a) => ({ ...a, weekday: dayIndex }));
                            void addRange(dayIndex);
                          }}
                          disabled={busy}
                          className="gap-1"
                        >
                          <Plus className="h-4 w-4" /> Add
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
