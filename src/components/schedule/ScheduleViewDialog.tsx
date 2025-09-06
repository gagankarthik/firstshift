// components/schedule/ScheduleViewDialog.tsx
import React from "react";
import { format, differenceInMinutes } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, CalendarIcon } from "lucide-react";
import { EmployeeAvatar } from "./EmployeeAvatar";
import { yyyyMmDd, minutesToHM } from "./utils";
import type { Shift, Employee, TimeOff, Avail } from "./types";
import { OPEN_EMP_ID } from "./types";

interface ScheduleViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shifts: Shift[];
  employees: Employee[];
  weekDays: Date[];
  shiftsByEmpDay: Map<string, Shift[]>;
  timeOffByEmp: Map<string, TimeOff[]>;
  availabilityByEmp: Map<string, Avail[]>;
  timeOffLabelFor: (empId: string, date: Date) => string | null;
}

export function ScheduleViewDialog({ 
  open, 
  onOpenChange, 
  shifts, 
  employees, 
  weekDays,
  shiftsByEmpDay,
  timeOffByEmp,
  availabilityByEmp,
  timeOffLabelFor 
}: ScheduleViewDialogProps) {
  const [viewType, setViewType] = React.useState<"week" | "day">("week");
  const [selectedDate, setSelectedDate] = React.useState(yyyyMmDd(weekDays[0] || new Date()));

  const dayToView = viewType === "day" ? new Date(selectedDate) : null;
  const daysToShow = viewType === "week" ? weekDays : dayToView ? [dayToView] : weekDays;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Schedule View
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Select value={viewType} onValueChange={(v) => setViewType(v as "week" | "day")}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                </SelectContent>
              </Select>
              {viewType === "day" && (
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-auto"
                />
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto border rounded-lg bg-white">
          <Table>
            <TableHeader className="sticky top-0 bg-gray-50 z-10">
              <TableRow>
                <TableHead className="w-[180px] font-semibold">Employee</TableHead>
                {daysToShow.map((day) => (
                  <TableHead key={day.getTime()} className="text-center font-semibold min-w-[160px]">
                    <div className="text-center">
                      <div className="font-semibold">{format(day, "EEEE")}</div>
                      <div className="text-xs text-gray-500 font-normal">{format(day, "MMM d")}</div>
                    </div>
                  </TableHead>
                ))}
                <TableHead className="text-center font-semibold w-[100px]">Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Open Shifts */}
              <TableRow className="bg-orange-50/50">
                <TableCell className="font-medium py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <CalendarIcon className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium">Open Shifts</div>
                      <div className="text-xs text-gray-500">Unassigned</div>
                    </div>
                  </div>
                </TableCell>
                {daysToShow.map((day) => {
                  const dayKey = `${OPEN_EMP_ID}_${format(day, "yyyy-MM-dd")}`;
                  const dayShifts = shiftsByEmpDay.get(dayKey) || [];
                  return (
                    <TableCell key={day.getTime()} className="py-3">
                      <div className="space-y-1">
                        {dayShifts.map((shift) => (
                          <div key={shift.id} className="text-xs bg-white rounded border px-2 py-1">
                            <div className="font-medium">
                              {format(new Date(shift.starts_at), "h:mm a")} - {format(new Date(shift.ends_at), "h:mm a")}
                            </div>
                            {shift.position?.name && (
                              <div className="text-gray-500">{shift.position.name}</div>
                            )}
                          </div>
                        ))}
                        {dayShifts.length === 0 && (
                          <div className="text-xs text-gray-400 text-center py-2">—</div>
                        )}
                      </div>
                    </TableCell>
                  );
                })}
                <TableCell className="text-center text-gray-500">—</TableCell>
              </TableRow>

              {/* Employees */}
              {employees.map((emp, idx) => {
                const totalMinutes = shifts
                  .filter(s => s.employee_id === emp.id)
                  .reduce((sum, s) => {
                    const diff = differenceInMinutes(new Date(s.ends_at), new Date(s.starts_at));
                    return sum + Math.max(0, diff - (s.break_minutes || 0));
                  }, 0);

                return (
                  <TableRow key={emp.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"}>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <EmployeeAvatar employee={emp} size="sm" />
                        <div>
                          <div className="font-medium">{emp.full_name}</div>
                          {emp.position && (
                            <div className="text-xs text-gray-500">{emp.position.name}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    {daysToShow.map((day) => {
                      const dayKey = `${emp.id}_${format(day, "yyyy-MM-dd")}`;
                      const dayShifts = shiftsByEmpDay.get(dayKey) || [];
                      const weekday = day.getDay();
                      const ranges = availabilityByEmp.get(emp.id) || [];
                      const hasAvailability = ranges.some((r) => r.weekday === weekday);
                      const timeOffLabel = timeOffLabelFor(emp.id, day);

                      return (
                        <TableCell key={day.getTime()} className="py-3">
                          <div className="space-y-1">
                            {timeOffLabel ? (
                              <div className="text-xs bg-red-50 text-red-700 rounded border border-red-200 px-2 py-1 text-center">
                                Time Off
                              </div>
                            ) : dayShifts.length > 0 ? (
                              dayShifts.map((shift) => (
                                <div key={shift.id} className="text-xs bg-white rounded border px-2 py-1">
                                  <div className="font-medium">
                                    {format(new Date(shift.starts_at), "h:mm a")} - {format(new Date(shift.ends_at), "h:mm a")}
                                  </div>
                                  {shift.position?.name && (
                                    <div className="text-gray-500">{shift.position.name}</div>
                                  )}
                                </div>
                              ))
                            ) : !hasAvailability ? (
                              <div className="text-xs text-gray-400 text-center py-2">Unavailable</div>
                            ) : (
                              <div className="text-xs text-gray-400 text-center py-2">—</div>
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center font-medium">
                      {minutesToHM(totalMinutes)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
