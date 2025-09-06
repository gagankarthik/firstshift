// components/schedule/hooks/useShiftDialog.tsx
import React from "react";
import { yyyyMmDd, addHoursStr } from "../utils";

type DialogMode = "create" | "edit";

export function useShiftDialog() {
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
