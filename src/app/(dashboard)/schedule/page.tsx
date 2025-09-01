// app/(dashboard)/schedule/page.tsx
"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  rectIntersection,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import {
  addDays,
  startOfWeek,
  endOfWeek,
  format,
  isBefore,
  isAfter,
  compareAsc,
  differenceInMinutes,
} from "date-fns";
import { createClient } from "@/lib/supabaseClient";
import { useOrg } from "@/components/providers/OrgProvider";
import { usePermissions } from "@/app/hooks/usePermissions";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  CalendarDays,
  Plus,
  Loader2,
  Trash2,
  Download,
  Eye,
  ArrowLeft,
  ArrowRight,
  Grid3X3,
  List,
  Search,
  Calendar as CalendarIcon,
  Clock,
  Users,
} from "lucide-react";
import { toast } from "sonner";

/* ---------------- Types & helpers ---------------- */

type Role = "admin" | "manager" | "employee";
type Position = { id: string; name: string; color: string | null };
type Location = { id: string; name: string };
type Employee = {
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
  position?: Position | null;
};

type Avail = {
  employee_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
};

type TimeOff = {
  id: string;
  employee_id: string;
  starts_at: string; // YYYY-MM-DD
  ends_at: string;   // YYYY-MM-DD
  type: "vacation" | "sick" | "unpaid" | "other";
};

const OPEN_EMP_ID = "OPEN";

const cx = (...xs: (string | false | null | undefined)[]) =>
  xs.filter(Boolean).join(" ");
const overlaps = (aS: Date, aE: Date, bS: Date, bE: Date) =>
  isBefore(aS, bE) && isAfter(aE, bS);
const preserveTime = (targetDate: Date, from: Date) => {
  const d = new Date(targetDate);
  d.setHours(
    from.getHours(),
    from.getMinutes(),
    from.getSeconds(),
    from.getMilliseconds()
  );
  return d;
};
function withinAnyAvailability(
  r: Avail[],
  wd: number,
  start: Date,
  end: Date
) {
  const day = r.filter((x) => x.weekday === wd);
  if (!day.length) return false;
  const s = start.toTimeString().slice(0, 8);
  const e = end.toTimeString().slice(0, 8);
  return day.some((x) => x.start_time <= s && e <= x.end_time);
}
const pickOne = <T,>(v: T | T[] | null | undefined): T | null =>
  Array.isArray(v) ? v[0] ?? null : v ?? null;
const yyyyMmDd = (d: Date) => format(d, "yyyy-MM-dd");
const toIso = (date: string, time: string) =>
  new Date(`${date}T${time}:00`).toISOString();
const addHoursStr = (hhmm: string, hours: number) => {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n || "0", 10));
  const d = new Date(2000, 0, 1, h, m, 0);
  d.setHours(d.getHours() + hours);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};
const fmtShort = (d: string) => format(new Date(d), "MMM d");

function minutesToHM(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h${m ? ` ${m}m` : ""}`;
}

/* ---------------- Enhanced UI Components ---------------- */

function ShiftChip({
  s,
  ghost = false,
  onDoubleClick,
  compact = false,
}: {
  s: Shift;
  ghost?: boolean;
  onDoubleClick?: () => void;
  compact?: boolean;
}) {
  const st = new Date(s.starts_at),
    en = new Date(s.ends_at);

  return (
    <div
      onDoubleClick={onDoubleClick}
      className={cx(
        "rounded-lg border bg-white shadow-sm transition-all duration-200",
        "cursor-grab active:cursor-grabbing select-none",
        "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        ghost && "opacity-80 shadow-lg",
        compact ? "px-2 py-1" : "px-3 py-2"
      )}
      style={{
        borderLeftWidth: 4,
        borderLeftColor: s.position?.color || "#64748b",
        background: ghost ? "rgba(255,255,255,0.95)" : "white",
      }}
    >
      <div className={cx("flex items-center justify-between", compact ? "text-xs" : "text-sm")}>
        <div className="font-medium text-gray-900">
          {format(st, "HH:mm")} – {format(en, "HH:mm")}
        </div>
        <Badge
          variant="secondary"
          className={cx("capitalize font-medium", compact ? "text-[9px] px-1 py-0" : "text-[10px]")}
          style={{
            backgroundColor: s.position?.color ? `${s.position.color}20` : undefined,
            color: s.position?.color || "#64748b",
          }}
          title={s.position?.name ?? "Shift"}
        >
          {s.position?.name ?? "Shift"}
        </Badge>
      </div>
    </div>
  );
}

function DraggableShift({
  s,
  disabled,
  onEdit,
  compact = false,
}: {
  s: Shift;
  disabled: boolean;
  onEdit: () => void;
  compact?: boolean;
}) {
  const dnd = useDraggable({ id: s.id, disabled });
  const style: React.CSSProperties | undefined = dnd.transform
    ? {
        transform: `translate3d(${dnd.transform.x}px, ${dnd.transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined;

  return (
    <div
      ref={dnd.setNodeRef}
      style={style}
      {...dnd.listeners}
      {...dnd.attributes}
      className={cx(disabled && "opacity-60", "relative")}
    >
      <ShiftChip s={s} ghost={dnd.isDragging} onDoubleClick={onEdit} compact={compact} />
    </div>
  );
}

function DroppableCell({
  id,
  unavailable,
  timeOffLabel,
  children,
  onAdd,
  compact = false,
}: {
  id: string;
  unavailable?: boolean;
  timeOffLabel?: string | null;
  children: React.ReactNode;
  onAdd?: () => void;
  compact?: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });

  const highlightClass = timeOffLabel
    ? "bg-gradient-to-br from-rose-50 to-rose-100/50 border-rose-200"
    : unavailable
    ? "bg-gradient-to-br from-red-50 to-red-100/30 border-red-200"
    : "bg-white hover:bg-gray-50/50";

  return (
    <div
      ref={setNodeRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) onAdd?.();
      }}
      className={cx(
        "relative rounded-lg border p-2 transition-all duration-200",
        "ring-offset-1 focus-within:ring-2 focus-within:ring-blue-200/50",
        highlightClass,
        isOver && !timeOffLabel && "bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-300 shadow-sm",
        compact ? "min-h-[80px]" : "min-h-[108px]",
        onAdd && "cursor-pointer"
      )}
    >
      {onAdd && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          className={cx(
            "absolute right-1 top-1 inline-flex items-center justify-center rounded-md",
            "border bg-white/90 backdrop-blur-sm hover:bg-white hover:shadow-sm",
            "transition-all duration-200 text-gray-600 hover:text-blue-600",
            "hover:scale-105 active:scale-95",
            compact ? "h-5 w-5 text-xs" : "h-6 w-6 text-xs"
          )}
          aria-label="Add shift"
          title="Add shift"
        >
          <Plus className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
        </button>
      )}
      {timeOffLabel && (
        <div className="mb-1 inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50/80 px-1.5 py-0.5 text-[11px] font-medium text-rose-700 backdrop-blur-sm">
          <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          {timeOffLabel}
        </div>
      )}
      {children}
      {!timeOffLabel && unavailable && (
        <div className="mt-1 text-[11px] font-medium text-red-600 opacity-70">
          No availability
        </div>
      )}
    </div>
  );
}

/* ---------------- Enhanced Employee Avatar ---------------- */
function EmployeeAvatar({ employee, size = "md" }: { employee: Employee; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-9 w-9",
    lg: "h-12 w-12"
  };

  const initials = employee.full_name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cx(
      "relative overflow-hidden rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center",
      sizeClasses[size]
    )}>
      {employee.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={employee.avatar_url}
          alt={employee.full_name}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className={cx(
          "font-medium text-blue-700",
          size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"
        )}>
          {initials}
        </span>
      )}
      {employee.position?.color && (
        <div
          className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white"
          style={{ backgroundColor: employee.position.color }}
          title={employee.position.name}
        />
      )}
    </div>
  );
}

/* ---------------- Stats Cards ---------------- */
function StatsCards({
  shifts,
  employees,
}: {
  shifts: Shift[];
  employees: Employee[];
}) {
  const totalShifts = shifts.length;
  const openShifts = shifts.filter(s => !s.employee_id).length;
  const totalHours = shifts.reduce((sum, s) => {
    const diff = differenceInMinutes(new Date(s.ends_at), new Date(s.starts_at));
    const breakMin = s.break_minutes || 0;
    return sum + Math.max(0, diff - breakMin);
  }, 0) / 60;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      <Card className="p-3 lg:p-4 bg-gradient-to-br from-blue-50 to-blue-100/50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <CalendarIcon className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-xs text-blue-600 font-medium">Total Shifts</div>
            <div className="text-lg font-bold text-blue-900">{totalShifts}</div>
          </div>
        </div>
      </Card>

      <Card className="p-3 lg:p-4 bg-gradient-to-br from-amber-50 to-amber-100/50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <div className="text-xs text-amber-600 font-medium">Open Shifts</div>
            <div className="text-lg font-bold text-amber-900">{openShifts}</div>
          </div>
        </div>
      </Card>

      <Card className="p-3 lg:p-4 bg-gradient-to-br from-green-50 to-green-100/50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
            <Users className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <div className="text-xs text-green-600 font-medium">Employees</div>
            <div className="text-lg font-bold text-green-900">{employees.length}</div>
          </div>
        </div>
      </Card>

      <Card className="p-3 lg:p-4 bg-gradient-to-br from-purple-50 to-purple-100/50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <Clock className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <div className="text-xs text-purple-600 font-medium">Total Hours</div>
            <div className="text-lg font-bold text-purple-900">{Math.round(totalHours)}h</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Override confirm ---------------- */
function useOverrideConfirm() {
  const [ask, setAsk] = React.useState<{
    open: boolean;
    message: string;
    resolve?: (ok: boolean) => void;
  }>({ open: false, message: "" });

  function request(message: string) {
    return new Promise<boolean>((resolve) =>
      setAsk({ open: true, message, resolve })
    );
  }

  function onClose(ok: boolean) {
    ask.resolve?.(ok);
    setAsk({ open: false, message: "", resolve: undefined });
  }

  const element = (
    <AlertDialog open={ask.open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Proceed anyway?</AlertDialogTitle>
          <AlertDialogDescription>{ask.message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onClose(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => onClose(true)}>
            Override
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { request, element };
}

/* ---------------- Dialog model ---------------- */
type DialogMode = "create" | "edit";
function useShiftDialog() {
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<DialogMode>("create");
  const [shiftId, setShiftId] = React.useState<string | null>(null);

  const [employeeId, setEmployeeId] = React.useState<string>("none");
  const [date, setDate] = React.useState<string>(yyyyMmDd(new Date()));
  const [start, setStart] = React.useState<string>("08:00");
  const [end, setEnd] = React.useState<string>("16:00");
  const [positionId, setPositionId] = React.useState<string>("none");
  const [locationId, setLocationId] = React.useState<string>("none");
  const [breakMin, setBreakMin] = React.useState<string>("0");
  const [saving, setSaving] = React.useState(false);
  const [autoEnd, setAutoEnd] = React.useState(true);

  const reset = (
    d: Partial<{
      mode: DialogMode;
      shiftId: string | null;
      employeeId: string;
      date: string;
      start: string;
      end: string;
      positionId: string;
      locationId: string;
      breakMin: string;
    }> = {}
  ) => {
    setMode(d.mode ?? "create");
    setShiftId(d.shiftId ?? null);
    setEmployeeId(d.employeeId ?? "none");
    setDate(d.date ?? yyyyMmDd(new Date()));
    setStart(d.start ?? "08:00");
    setEnd(d.end ?? "16:00");
    setPositionId(d.positionId ?? "none");
    setLocationId(d.locationId ?? "none");
    setBreakMin(d.breakMin ?? "0");
    setAutoEnd(true);
  };

  const onStartChange = (next: string) => {
    setStart(next);
    if (autoEnd) setEnd(addHoursStr(next, 8));
  };

  return {
    state: {
      open,
      mode,
      shiftId,
      employeeId,
      date,
      start,
      end,
      positionId,
      locationId,
      breakMin,
      saving,
      autoEnd,
    },
    setOpen,
    setMode,
    setShiftId,
    setEmployeeId,
    setDate,
    onStartChange,
    setEnd,
    setPositionId,
    setLocationId,
    setBreakMin,
    setSaving,
    setAutoEnd,
    reset,
  };
}

/* ---------------- Main Page Component ---------------- */
export default function SchedulePage() {
  const supabase = React.useMemo(() => createClient(), []);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );
  const { orgId, role, loading } = useOrg();
  const perms = usePermissions(role as Role | null);

  const [weekStart, setWeekStart] = React.useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const weekDays = React.useMemo(
    () => [...Array(7)].map((_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [positions, setPositions] = React.useState<Position[]>([]);
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [shifts, setShifts] = React.useState<Shift[]>([]);
  const [availability, setAvailability] = React.useState<Avail[]>([]);
  const [timeOff, setTimeOff] = React.useState<TimeOff[]>([]);
  const [q, setQ] = React.useState("");
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(true);
  const [viewMode, setViewMode] = React.useState<"grid" | "cards">("grid");

  // Export dialog / print
  const [exportOpen, setExportOpen] = React.useState(false);
  const [printMode, setPrintMode] = React.useState(false);

  // Simple export range + DOM ref for image export
  const [exportStart, setExportStart] = React.useState(yyyyMmDd(weekDays[0]));
  const [exportEnd, setExportEnd] = React.useState(yyyyMmDd(weekDays[6]));
  const exportTableRef = React.useRef<HTMLDivElement | null>(null);

  const dlg = useShiftDialog();
  const overrideConfirm = useOverrideConfirm();

  const filteredEmployees = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle
      ? employees.filter((e) => e.full_name.toLowerCase().includes(needle))
      : employees;
  }, [employees, q]);

  const shiftsByEmpDay = React.useMemo(() => {
    const map = new Map<string, Shift[]>();
    for (const s of shifts) {
      const empKey = s.employee_id ?? OPEN_EMP_ID;
      const key = `${empKey}_${format(new Date(s.starts_at), "yyyy-MM-dd")}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    for (const [k, arr] of map) {
      arr.sort((a, b) =>
        compareAsc(new Date(a.starts_at), new Date(b.starts_at))
      );
      map.set(k, arr);
    }
    return map;
  }, [shifts]);

  const availabilityByEmp = React.useMemo(() => {
    const m = new Map<string, Avail[]>();
    for (const a of availability) {
      if (!m.has(a.employee_id)) m.set(a.employee_id, []);
      m.get(a.employee_id)!.push(a);
    }
    return m;
  }, [availability]);

  const timeOffByEmp = React.useMemo(() => {
    const m = new Map<string, TimeOff[]>();
    for (const t of timeOff) {
      if (!m.has(t.employee_id)) m.set(t.employee_id, []);
      m.get(t.employee_id)!.push(t);
    }
    return m;
  }, [timeOff]);

  function cellId(empId: string, day: Date) {
    return `cell:${empId}:${format(day, "yyyy-MM-dd")}`;
  }

  function findShift(id: string | null) {
    return shifts.find((s) => s.id === id) || null;
  }

  function timeOffLabelFor(empId: string, date: Date): string | null {
    const items = timeOffByEmp.get(empId);
    if (!items || !items.length) return null;
    const d = yyyyMmDd(date);
    for (const t of items) {
      if (t.starts_at <= d && d <= t.ends_at) return `Time off • ${t.type}`;
    }
    return null;
  }

  async function fetchData() {
    if (!orgId) return;
    setBusy(true);

    const weekStartStr = yyyyMmDd(startOfWeek(weekStart, { weekStartsOn: 1 }));
    const weekEndStr = yyyyMmDd(endOfWeek(weekStart, { weekStartsOn: 1 }));

    const [{ data: emps }, { data: pos }, { data: loc }] = await Promise.all([
      supabase
        .from("employees")
        .select(
          "id, full_name, avatar_url, positions:position_id(id,name,color)"
        )
        .eq("org_id", orgId)
        .order("full_name"),
      supabase.from("positions").select("id,name,color").eq("org_id", orgId),
      supabase.from("locations").select("id,name").eq("org_id", orgId),
    ]);

    setEmployees(
      (emps || []).map((e: any) => ({
        id: e.id,
        full_name: e.full_name,
        avatar_url: e.avatar_url,
        position: pickOne<Position>(e.positions),
      }))
    );
    setPositions((pos || []) as Position[]);
    setLocations((loc || []) as Location[]);

    const { data: s } = await supabase
      .from("shifts")
      .select(
        "id, employee_id, position_id, location_id, starts_at, ends_at, break_minutes, status, positions:position_id(id,name,color)"
      )
      .eq("org_id", orgId)
      .gte(
        "starts_at",
        startOfWeek(weekStart, { weekStartsOn: 1 }).toISOString()
      )
      .lt("starts_at", endOfWeek(weekStart, { weekStartsOn: 1 }).toISOString());

    setShifts(
      (s || []).map((x: any) => ({
        id: x.id,
        employee_id: x.employee_id,
        position_id: x.position_id,
        location_id: x.location_id,
        starts_at: x.starts_at,
        ends_at: x.ends_at,
        break_minutes: x.break_minutes,
        status: x.status,
        position: pickOne<Position>(x.positions),
      }))
    );

    const { data: av } = await supabase
      .from("availability")
      .select("employee_id, weekday, start_time, end_time")
      .eq("org_id", orgId);
    setAvailability((av || []) as Avail[]);

    const { data: to } = await supabase
      .from("time_off")
      .select("id, employee_id, starts_at, ends_at, type")
      .eq("org_id", orgId)
      .eq("status", "approved")
      .lte("starts_at", weekEndStr)
      .gte("ends_at", weekStartStr);
    setTimeOff((to || []) as TimeOff[]);

    setBusy(false);
  }

  React.useEffect(() => {
    void fetchData();
  }, [orgId, weekStart]); // eslint-disable-line

  React.useEffect(() => {
    if (!orgId) return;
    const ch1 = supabase
      .channel(`shifts-${orgId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shifts", filter: `org_id=eq.${orgId}` },
        fetchData
      )
      .subscribe();
    const ch2 = supabase
      .channel(`availability-${orgId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "availability",
          filter: `org_id=eq.${orgId}`,
        },
        fetchData
      )
      .subscribe();
    const ch3 = supabase
      .channel(`timeoff-${orgId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "time_off", filter: `org_id=eq.${orgId}` },
        fetchData
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch1);
      supabase.removeChannel(ch2);
      supabase.removeChannel(ch3);
    };
  }, [supabase, orgId]); // eslint-disable-line

  async function onDropToCell(
    shiftId: string,
    targetEmpIdRaw: string,
    targetDateISO: string
  ) {
    if (!perms.canManageSchedule) return;
    const s = findShift(shiftId);
    if (!s) return;

    const start = new Date(s.starts_at),
      end = new Date(s.ends_at);
    const targetDate = new Date(targetDateISO);
    const newStart = preserveTime(targetDate, start);
    const newEnd = preserveTime(targetDate, end);
    const targetEmpId = targetEmpIdRaw === OPEN_EMP_ID ? null : targetEmpIdRaw;

    if (targetEmpId) {
      const key = `${targetEmpId}_${format(targetDate, "yyyy-MM-dd")}`;
      const sameDay = (shiftsByEmpDay.get(key) || []).filter((x) => x.id !== s.id);
      if (
        sameDay.some((x) =>
          overlaps(
            newStart,
            newEnd,
            new Date(x.starts_at),
            new Date(x.ends_at)
          )
        )
      ) {
        toast.error("Overlap detected", {
          description: "Conflicts with another shift.",
        });
        return;
      }

      const weekday = newStart.getDay();
      const ranges = availabilityByEmp.get(targetEmpId) || [];
      const isAvailable = withinAnyAvailability(
        ranges,
        weekday,
        newStart,
        newEnd
      );

      const offLabel = timeOffLabelFor(targetEmpId, targetDate);
      if (offLabel) {
        const ok = await overrideConfirm.request(
          `This employee has approved ${offLabel.toLowerCase()} on ${fmtShort(
            yyyyMmDd(targetDate)
          )}. Override and schedule anyway?`
        );
        if (!ok) return;
      } else if (!isAvailable) {
        const ok = await overrideConfirm.request(
          "This employee is marked unavailable at that time. Override?"
        );
        if (!ok) return;
      }
    }

    const old = { ...s };
    setShifts((prev) =>
      prev.map((x) =>
        x.id === s.id
          ? {
              ...x,
              employee_id: targetEmpId,
              starts_at: newStart.toISOString(),
              ends_at: newEnd.toISOString(),
            }
          : x
      )
    );

    const { error } = await supabase
      .from("shifts")
      .update({
        employee_id: targetEmpId,
        starts_at: newStart.toISOString(),
        ends_at: newEnd.toISOString(),
      })
      .eq("id", s.id);

    if (error) {
      setShifts((prev) => prev.map((x) => (x.id === old.id ? old : x)));
      toast.error("Failed to move shift", { description: error.message });
    }
  }

  /* ---------- create/edit helpers ---------- */

  function openCreateAtCell(empId: string, dateIso: string) {
    if (!perms.canManageSchedule) return;

    if (empId !== OPEN_EMP_ID) {
      const d = new Date(dateIso);
      const offLabel = timeOffLabelFor(empId, d);
      if (offLabel) {
        overrideConfirm
          .request(
            `This employee has approved ${offLabel.toLowerCase()} on ${fmtShort(
              dateIso
            )}. Create shift anyway?`
          )
          .then((ok) => {
            if (!ok) return;
            dlg.reset({
              mode: "create",
              employeeId: empId === OPEN_EMP_ID ? "none" : empId,
              date: dateIso,
              start: "08:00",
              end: "16:00",
            });
            dlg.setOpen(true);
          });
        return;
      }
    }

    dlg.reset({
      mode: "create",
      employeeId: empId === OPEN_EMP_ID ? "none" : empId,
      date: dateIso,
      start: "08:00",
      end: "16:00",
    });
    dlg.setOpen(true);
  }

  function openEditShift(s: Shift) {
    if (!perms.canManageSchedule) return;
    const d = yyyyMmDd(new Date(s.starts_at));
    dlg.reset({
      mode: "edit",
      shiftId: s.id,
      employeeId: s.employee_id ?? "none",
      date: d,
      start: format(new Date(s.starts_at), "HH:mm"),
      end: format(new Date(s.ends_at), "HH:mm"),
      positionId: s.position_id ?? "none",
      locationId: s.location_id ?? "none",
      breakMin: String(s.break_minutes || 0),
    });
    dlg.setOpen(true);
  }

  async function createShift() {
    if (!perms.canManageSchedule) return;
    const empId = dlg.state.employeeId === "none" ? null : dlg.state.employeeId;
    const posId = dlg.state.positionId === "none" ? null : dlg.state.positionId;
    const locId = dlg.state.locationId === "none" ? null : dlg.state.locationId;
    const startIso = toIso(dlg.state.date, dlg.state.start);
    const endIso = toIso(dlg.state.date, dlg.state.end);
    const dStart = new Date(startIso),
      dEnd = new Date(endIso);
    if (dEnd <= dStart) {
      toast.error("End must be after start");
      return;
    }

    if (empId) {
      const key = `${empId}_${dlg.state.date}`;
      const sameDay = shiftsByEmpDay.get(key) || [];
      if (
        sameDay.some((x) =>
          overlaps(dStart, dEnd, new Date(x.starts_at), new Date(x.ends_at))
        )
      ) {
        toast.error("Overlap detected", {
          description: "Conflicts with another shift.",
        });
        return;
      }
      const weekday = dStart.getDay();
      const ranges = availabilityByEmp.get(empId) || [];
      const isAvailable = withinAnyAvailability(
        ranges,
        weekday,
        dStart,
        dEnd
      );
      const offLabel = timeOffLabelFor(empId, new Date(dlg.state.date));

      if (offLabel) {
        const ok = await overrideConfirm.request(
          `This employee has approved ${offLabel.toLowerCase()} on ${fmtShort(
            dlg.state.date
          )}. Create shift anyway?`
        );
        if (!ok) return;
      } else if (!isAvailable) {
        const ok = await overrideConfirm.request(
          "This employee is marked unavailable at that time. Create anyway?"
        );
        if (!ok) return;
      }
    }

    dlg.setSaving(true);
    const { error } = await supabase.from("shifts").insert({
      org_id: orgId,
      employee_id: empId,
      position_id: posId,
      location_id: locId,
      starts_at: startIso,
      ends_at: endIso,
      break_minutes: Number.parseInt(dlg.state.breakMin || "0", 10) || 0,
      status: "scheduled",
    });
    dlg.setSaving(false);
    if (error) {
      toast.error("Failed to create shift", { description: error.message });
      return;
    }
    toast.success("Shift created");
    dlg.setOpen(false);
    void fetchData();
  }

  async function updateShift() {
    if (!dlg.state.shiftId) return;
    const empId = dlg.state.employeeId === "none" ? null : dlg.state.employeeId;
    const posId = dlg.state.positionId === "none" ? null : dlg.state.positionId;
    const locId = dlg.state.locationId === "none" ? null : dlg.state.locationId;
    const startIso = toIso(dlg.state.date, dlg.state.start);
    const endIso = toIso(dlg.state.date, dlg.state.end);
    const dStart = new Date(startIso),
      dEnd = new Date(endIso);
    if (dEnd <= dStart) {
      toast.error("End must be after start");
      return;
    }

    if (empId) {
      const key = `${empId}_${dlg.state.date}`;
      const sameDay = (shiftsByEmpDay.get(key) || []).filter(
        (x) => x.id !== dlg.state.shiftId
      );
      if (
        sameDay.some((x) =>
          overlaps(dStart, dEnd, new Date(x.starts_at), new Date(x.ends_at))
        )
      ) {
        toast.error("Overlap detected", {
          description: "Conflicts with another shift.",
        });
        return;
      }
      const weekday = dStart.getDay();
      const ranges = availabilityByEmp.get(empId) || [];
      const isAvailable = withinAnyAvailability(
        ranges,
        weekday,
        dStart,
        dEnd
      );
      const offLabel = timeOffLabelFor(empId, new Date(dlg.state.date));
      if (offLabel) {
        const ok = await overrideConfirm.request(
          `This employee has approved ${offLabel.toLowerCase()} on ${fmtShort(
            dlg.state.date
          )}. Save anyway?`
        );
        if (!ok) return;
      } else if (!isAvailable) {
        const ok = await overrideConfirm.request(
          "This employee is marked unavailable at that time. Save anyway?"
        );
        if (!ok) return;
      }
    }

    dlg.setSaving(true);
    const { error } = await supabase
      .from("shifts")
      .update({
        employee_id: empId,
        position_id: posId,
        location_id: locId,
        starts_at: startIso,
        ends_at: endIso,
        break_minutes: Number.parseInt(dlg.state.breakMin || "0", 10) || 0,
      })
      .eq("id", dlg.state.shiftId);
    dlg.setSaving(false);
    if (error) {
      toast.error("Failed to update shift", { description: error.message });
      return;
    }
    toast.success("Shift saved");
    dlg.setOpen(false);
    void fetchData();
  }

  async function deleteShift() {
    if (!dlg.state.shiftId) return;
    dlg.setSaving(true);
    const { error } = await supabase
      .from("shifts")
      .delete()
      .eq("id", dlg.state.shiftId);
    dlg.setSaving(false);
    if (error) {
      toast.error("Failed to delete shift", { description: error.message });
      return;
    }
    toast.success("Shift deleted");
    dlg.setOpen(false);
    void fetchData();
  }

  const canManage = perms.canManageSchedule;

  // -------- totals for cards/list --------
  function calcTotalMinutesFor(employeeId?: string) {
    const all = shifts.filter((s) =>
      employeeId ? s.employee_id === employeeId : true
    );
    return all.reduce((sum, s) => {
      const diff = differenceInMinutes(
        new Date(s.ends_at),
        new Date(s.starts_at)
      );
      const b = s.break_minutes || 0;
      return sum + Math.max(0, diff - b);
    }, 0);
  }

  // ---------- Simple export helpers ----------
  function eachDayISO(startISO: string, endISO: string) {
    const out: string[] = [];
    let d = new Date(startISO + "T00:00:00");
    const end = new Date(endISO + "T00:00:00");
    while (d <= end) {
      out.push(yyyyMmDd(d));
      d = addDays(d, 1);
    }
    return out;
  }

  function summarizeShiftsFor(empId: string, dayKeys: string[]) {
    const lines: string[] = [];
    dayKeys.forEach((day) => {
      const list =
        shiftsByEmpDay.get(`${empId}_${day}`) ||
        shiftsByEmpDay.get(`${empId}:${day}`) ||
        [];
      if (!list.length) return;

      const labelPerDay = list
        .map((s) => {
          const st = format(new Date(s.starts_at), "h:mm a");
          const en = format(new Date(s.ends_at), "h:mm a");
          const pos = s.position?.name ? ` • ${s.position.name}` : "";
          return `${st}–${en}${pos}`;
        })
        .join(", ");
      lines.push(`${format(new Date(day), "EEE MMM d")}: ${labelPerDay}`);
    });
    return lines.join("\n"); // newline-separated for readability
  }

  function exportSimpleCSV() {
    const days = eachDayISO(exportStart, exportEnd);
    const rows: string[] = [];
    rows.push(
      `Schedule ${format(new Date(exportStart), "MM/dd/yyyy")} - ${format(
        new Date(exportEnd),
        "MM/dd/yyyy"
      )}`
    );
    rows.push(["Employee Name", "Shifts"].join(","));

    const employeesPlusOpen = [{ id: OPEN_EMP_ID, full_name: "Open shifts" }, ...employees];
    for (const emp of employeesPlusOpen) {
      const text = summarizeShiftsFor(emp.id, days);
      const safe = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
      rows.push([safe(emp.full_name), safe(text || "—")].join(","));
    }

    const name = `schedule_simple_${format(new Date(exportStart), "yyyyMMdd")}-${format(
      new Date(exportEnd),
      "yyyyMMdd"
    )}.csv`;
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 0);
  }

  async function exportPNG() {
    if (!exportTableRef.current) return;
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(exportTableRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `schedule_${format(new Date(exportStart), "yyyyMMdd")}-${format(
        new Date(exportEnd),
        "yyyyMMdd"
      )}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e: any) {
      toast.error("PNG export failed", {
        description: "Install the dependency with: npm i html-to-image",
      });
    }
  }

  function openPrintPreviewSimple() {
    setExportOpen(false);
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      window.addEventListener(
        "afterprint",
        () => setPrintMode(false),
        { once: true }
      );
    }, 150);
  }

  if (loading || !orgId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">Loading schedule...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Employee Schedule</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage shifts for {format(weekDays[0], "MMM d")} – {format(weekDays[6], "MMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Card className="flex items-center gap-2 px-3 py-2">
            <CalendarDays className="h-4 w-4" />
            <span className="text-sm">
              {format(weekDays[0], "d MMM")} – {format(weekDays[6], "d MMM")}
            </span>
          </Card>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekStart(addDays(weekStart, +7))}
            className="flex-shrink-0"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards shifts={shifts} employees={employees} />

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search employees..."
            className="pl-10 bg-white"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "cards")} className="lg:hidden">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grid" className="text-xs">
                <Grid3X3 className="h-3 w-3 mr-1" />
                Grid
              </TabsTrigger>
              <TabsTrigger value="cards" className="text-xs">
                <List className="h-3 w-3 mr-1" />
                Cards
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button variant="outline" size="sm" className="gap-2" onClick={() => {
            setExportStart(yyyyMmDd(weekDays[0]));
            setExportEnd(yyyyMmDd(weekDays[6]));
            setExportOpen(true);
          }}>
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">View / Export</span>
          </Button>

          {canManage && (
            <Button
              size="sm"
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                dlg.reset({});
                dlg.setOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New shift</span>
            </Button>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200" />
          <span>Approved time off</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-gradient-to-br from-red-50 to-red-100 border border-red-200" />
          <span>No availability</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200" />
          <span>Drop target</span>
        </div>
      </div>

      {/* --- Desktop Grid View (only calendar scrolls) --- */}
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        modifiers={[restrictToWindowEdges]}
        onDragStart={(e) => setActiveId(String(e.active.id))}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={(e) => {
          setActiveId(null);
          if (!e.active || !e.over) return;
          const [, empId, dateStr] = String(e.over.id).split(":");
          if (empId && dateStr) void onDropToCell(String(e.active.id), empId, dateStr);
        }}
      >
        <div className={cx("hidden lg:block", viewMode === "cards" && "lg:hidden")}>
          {/* Height-bounded shell so only the calendar scrolls */}
          <div className="relative h-[calc(100vh-220px)] min-h-[480px]">
            {/* Single scroll layer */}
            <div className="absolute inset-0 overflow-auto overscroll-contain [scrollbar-gutter:stable] rounded-xl border bg-white shadow-sm">
              {/* Width guard keeps horizontal scroll inside this box */}
              <div className="min-w-[1400px]">
                <Table className="w-full">
                  <TableHeader className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm">
                    <TableRow className="border-b-2">
                      <TableHead className="sticky left-0 z-50 bg-white/95 backdrop-blur-sm min-w-[280px] font-semibold">
                        Employee
                      </TableHead>
                      {weekDays.map((d) => (
                        <TableHead key={+d} className="text-center min-w-[200px] font-semibold">
                          <div className="flex flex-col items-center py-1">
                            <span className="font-semibold text-gray-900">{format(d, "EEEE")}</span>
                            <span className="text-xs text-gray-500 font-normal">{format(d, "MMM d")}</span>
                          </div>
                        </TableHead>
                      ))}
                      <TableHead className="text-center min-w-[120px] font-semibold">
                        Total Hours
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {/* Open shifts row */}
                    <TableRow className="align-top bg-gradient-to-r from-amber-50/30 to-orange-50/30 border-b">
                      <TableCell className="sticky left-0 z-30 bg-gradient-to-r from-amber-50/50 to-orange-50/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3 py-2">
                          <div className="h-5 w-5 rounded-full bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center">
                            <CalendarIcon className="h-5 w-5 text-amber-700" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Open Shifts</div>
                            <div className="text-xs text-gray-500">Unassigned</div>
                          </div>
                        </div>
                      </TableCell>
                      {weekDays.map((day) => {
                        const key = `${OPEN_EMP_ID}_${format(day, "yyyy-MM-dd")}`;
                        const dayShifts = shiftsByEmpDay.get(key) || [];
                        const id = cellId(OPEN_EMP_ID, day);
                        return (
                          <TableCell key={id} className="p-2 align-top">
                            <DroppableCell
                              id={id}
                              onAdd={canManage ? () => openCreateAtCell(OPEN_EMP_ID, yyyyMmDd(day)) : undefined}
                            >
                              <div className="space-y-2">
                                {dayShifts.map((s) => (
                                  <DraggableShift
                                    key={s.id}
                                    s={s}
                                    disabled={!canManage}
                                    onEdit={() => openEditShift(s)}
                                  />
                                ))}
                              </div>
                            </DroppableCell>
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center text-sm font-medium text-gray-500">—</TableCell>
                    </TableRow>

                    {/* Employees */}
                    {filteredEmployees.map((emp, idx) => (
                      <TableRow
                        key={emp.id}
                        className={cx(
                          "align-top border-b transition-colors hover:bg-gray-50/50",
                          idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                        )}
                      >
                        {/* sticky first column must always have a background */}
                        <TableCell className="sticky left-0 z-20 bg-inherit backdrop-blur-sm">
                          <div className="flex items-center gap-3 py-2">
                            <EmployeeAvatar employee={emp} size="md" />
                            <div>
                              <div className="font-semibold text-gray-900">{emp.full_name}</div>
                              {emp.position && (
                                <div className="text-xs text-gray-500">{emp.position.name}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {weekDays.map((day) => {
                          const key = `${emp.id}_${format(day, "yyyy-MM-dd")}`;
                          const dayShifts = shiftsByEmpDay.get(key) || [];
                          const id = cellId(emp.id, day);
                          const weekday = day.getDay();
                          const ranges = availabilityByEmp.get(emp.id) || [];
                          const hasAnyRangeToday = ranges.some((r) => r.weekday === weekday);
                          const offLabel = timeOffLabelFor(emp.id, day);

                          return (
                            <TableCell key={id} className="p-2 align-top">
                              <DroppableCell
                                id={id}
                                unavailable={!hasAnyRangeToday}
                                timeOffLabel={offLabel}
                                onAdd={canManage ? () => openCreateAtCell(emp.id, yyyyMmDd(day)) : undefined}
                              >
                                <div className="space-y-2">
                                  {dayShifts.map((s) => (
                                    <DraggableShift
                                      key={s.id}
                                      s={s}
                                      disabled={!canManage}
                                      onEdit={() => openEditShift(s)}
                                    />
                                  ))}
                                </div>
                              </DroppableCell>
                            </TableCell>
                          );
                        })}

                        <TableCell className="text-center font-semibold bg-inherit">
                          <div className="text-sm text-gray-900">
                            {minutesToHM(calcTotalMinutesFor(emp.id))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}

                    {!busy && filteredEmployees.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="p-8 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Search className="h-8 w-8 text-gray-400" />
                            <div className="text-sm font-medium text-gray-900">No employees found</div>
                            <div className="text-xs text-gray-500">Try adjusting your search criteria</div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {busy && (
                      <TableRow>
                        <TableCell colSpan={9} className="p-8 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                            <span className="text-sm text-gray-600">Loading schedule...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="grid gap-4 lg:hidden">
          {[{ id: OPEN_EMP_ID, full_name: "Open shifts", position: null, avatar_url: null }, ...filteredEmployees].map(
            (emp) => (
              <Card key={emp.id} className="overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {emp.id === OPEN_EMP_ID ? (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center">
                          <CalendarIcon className="h-5 w-5 text-amber-700" />
                        </div>
                      ) : (
                        <EmployeeAvatar employee={emp as Employee} size="md" />
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">{emp.full_name}</div>
                        {(emp as any).position && (
                          <div className="text-xs text-gray-500">{(emp as any).position.name}</div>
                        )}
                      </div>
                    </div>
                    {emp.id !== OPEN_EMP_ID && (
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {minutesToHM(calcTotalMinutesFor(emp.id))}
                        </div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {weekDays.map((d, i) => {
                      const key = `${emp.id}_${format(d, "yyyy-MM-dd")}`;
                      const dayShifts = shiftsByEmpDay.get(key) || [];
                      const id = cellId(emp.id, d);
                      const weekday = d.getDay();
                      const ranges = emp.id !== OPEN_EMP_ID ? availabilityByEmp.get(emp.id) || [] : [];
                      const hasAnyRangeToday = ranges.some((r) => r.weekday === weekday);
                      const offLabel = emp.id !== OPEN_EMP_ID ? timeOffLabelFor(emp.id, d) : null;

                      return (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-sm text-gray-900">
                              {format(d, "EEE")} • {format(d, "MMM d")}
                            </div>
                            {canManage && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
                                onClick={() => openCreateAtCell(emp.id, yyyyMmDd(d))}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <DroppableCell
                            id={id}
                            unavailable={emp.id !== OPEN_EMP_ID && !hasAnyRangeToday}
                            timeOffLabel={offLabel}
                            compact={true}
                          >
                            <div className="space-y-1.5">
                              {dayShifts.map((s) => (
                                <DraggableShift
                                  key={s.id}
                                  s={s}
                                  disabled={!canManage}
                                  onEdit={() => openEditShift(s)}
                                  compact={true}
                                />
                              ))}
                              {dayShifts.length === 0 && (
                                <div className="text-xs text-gray-400 text-center py-2">
                                  {offLabel ? "Time off" : !hasAnyRangeToday && emp.id !== OPEN_EMP_ID ? "Unavailable" : "No shifts"}
                                </div>
                              )}
                            </div>
                          </DroppableCell>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            )
          )}

          {!busy && filteredEmployees.length === 0 && (
            <Card className="p-8">
              <div className="flex flex-col items-center gap-3 text-center">
                <Search className="h-12 w-12 text-gray-300" />
                <div>
                  <div className="font-medium text-gray-900">No employees found</div>
                  <div className="text-sm text-gray-500 mt-1">Try adjusting your search criteria</div>
                </div>
              </div>
            </Card>
          )}
        </div>

        <DragOverlay>
          {activeId ? <ShiftChip s={findShift(activeId)!} ghost /> : null}
        </DragOverlay>
      </DndContext>

      {/* Create/Edit shift dialog */}
      <Dialog open={dlg.state.open} onOpenChange={dlg.setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {dlg.state.mode === "create" ? (
                <>
                  <Plus className="h-5 w-5 text-blue-600" />
                  Create shift
                </>
              ) : (
                <>
                  <CalendarIcon className="h-5 w-5 text-blue-600" />
                  Edit shift
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Employee</label>
                <Select value={dlg.state.employeeId} onValueChange={dlg.setEmployeeId}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-gray-200" />
                        Unassigned
                      </div>
                    </SelectItem>
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        <div className="flex items-center gap-2">
                          <EmployeeAvatar employee={e} size="sm" />
                          {e.full_name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date</label>
                <Input
                  type="date"
                  value={dlg.state.date}
                  onChange={(e) => dlg.setDate(e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Start time</label>
                <Input
                  type="time"
                  value={dlg.state.start}
                  onChange={(e) => dlg.onStartChange(e.target.value)}
                  className="bg-white"
                />
                <div className="text-xs text-gray-500">
                  End time auto-fills to +8h. You can change it.
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">End time</label>
                <Input
                  type="time"
                  value={dlg.state.end}
                  onChange={(e) => {
                    dlg.setEnd(e.target.value);
                    dlg.setAutoEnd(false);
                  }}
                  className="bg-white"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Position</label>
                <Select value={dlg.state.positionId} onValueChange={dlg.setPositionId}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {positions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded"
                            style={{ backgroundColor: p.color || "#94a3b8" }}
                          />
                          {p.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Location</label>
                <Select value={dlg.state.locationId} onValueChange={dlg.setLocationId}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {locations.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Break time (minutes)</label>
              <Input
                type="number"
                min={0}
                value={dlg.state.breakMin}
                onChange={(e) => dlg.setBreakMin(e.target.value)}
                className="bg-white"
                placeholder="0"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            {dlg.state.mode === "edit" ? (
              <Button
                variant="destructive"
                onClick={deleteShift}
                disabled={dlg.state.saving}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete shift
              </Button>
            ) : (
              <div className="flex-1" />
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => dlg.setOpen(false)} disabled={dlg.state.saving}>
                Cancel
              </Button>
              {dlg.state.mode === "create" ? (
                <Button onClick={createShift} disabled={dlg.state.saving} className="gap-2">
                  {dlg.state.saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create shift
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={updateShift} disabled={dlg.state.saving} className="gap-2">
                  {dlg.state.saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="h-4 w-4" />
                      Save changes
                    </>
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export dialog (Simple table) */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Simple Schedule — {format(new Date(exportStart), "MMM d")} – {format(new Date(exportEnd), "MMM d, yyyy")}
            </DialogTitle>
          </DialogHeader>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Start date</label>
              <Input
                type="date"
                className="bg-white"
                value={exportStart}
                max={exportEnd}
                onChange={(e) => setExportStart(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600">End date</label>
              <Input
                type="date"
                className="bg-white"
                value={exportEnd}
                min={exportStart}
                onChange={(e) => setExportEnd(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Quick range</label>
              <Select
                onValueChange={(v) => {
                  if (v === "this") {
                    setExportStart(yyyyMmDd(weekDays[0]));
                    setExportEnd(yyyyMmDd(weekDays[6]));
                  } else if (v === "next") {
                    const start = addDays(weekDays[0], 7);
                    const end = addDays(weekDays[6], 7);
                    setExportStart(yyyyMmDd(start));
                    setExportEnd(yyyyMmDd(end));
                  }
                }}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Pick a range..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this">This week</SelectItem>
                  <SelectItem value="next">Next week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Simple table preview */}
          <div ref={exportTableRef} className="mt-4 rounded-lg border bg-white">
            <Table className="text-sm">
              <TableHeader className="sticky top-0 bg-white">
                <TableRow className="border-b-2">
                  <TableHead className="w-[260px] font-semibold">Employee</TableHead>
                  <TableHead className="font-semibold">Shifts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[{ id: OPEN_EMP_ID, full_name: "Open shifts" }, ...employees].map((emp) => (
                  <TableRow key={emp.id} className="border-b align-top">
                    <TableCell className="py-3">
                      {emp.id === OPEN_EMP_ID ? (
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-amber-600" />
                          {emp.full_name}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <EmployeeAvatar employee={emp as Employee} size="sm" />
                          {emp.full_name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="text-xs sm:text-sm leading-6 whitespace-pre-wrap">
                        {(() => {
                          const text = summarizeShiftsFor(
                            emp.id,
                            eachDayISO(exportStart, exportEnd)
                          );
                          return text || "—";
                        })()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
            <div className="text-xs text-gray-500 sm:mr-auto">
              Tip: Use “Print / PDF” for a clean one-page export.
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="gap-2" onClick={openPrintPreviewSimple}>
                <Eye className="h-4 w-4" />
                Print / PDF
              </Button>
              <Button variant="outline" className="gap-2" onClick={exportPNG}>
                <Download className="h-4 w-4" />
                Export PNG
              </Button>
              <Button className="gap-2" onClick={exportSimpleCSV}>
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Printable (simple) version */}
      <div id="printable" className={printMode ? "block" : "hidden"}>
        <div className="p-8 bg-white">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Employee Schedule</h1>
            <p className="text-gray-600">
              {format(new Date(exportStart), "MMMM d")} – {format(new Date(exportEnd), "MMMM d, yyyy")}
            </p>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <Table className="text-sm">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-900 py-3 w-[280px]">Employee</TableHead>
                  <TableHead className="font-semibold text-gray-900 py-3">Shifts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[{ id: OPEN_EMP_ID, full_name: "Open shifts" }, ...employees].map((emp) => (
                  <TableRow key={emp.id} className="border-b">
                    <TableCell className="font-medium py-3 text-gray-900">
                      {emp.full_name}
                    </TableCell>
                    <TableCell className="py-3 text-sm whitespace-pre-wrap">
                      {summarizeShiftsFor(emp.id, eachDayISO(exportStart, exportEnd)) || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable, #printable * {
            visibility: visible !important;
          }
          #printable {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
          }
          @page {
            margin: 0.5in;
            size: portrait;
          }
          table {
            page-break-inside: auto !important;
          }
          tr {
            page-break-inside: avoid !important;
            page-break-after: auto !important;
          }
          thead {
            display: table-header-group !important;
          }
        }
      `}</style>

      {/* Override confirmation dialog */}
      {overrideConfirm.element}
    </div>
  );
}
