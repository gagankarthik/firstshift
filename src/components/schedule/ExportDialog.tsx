// components/schedule/ExportDialog.tsx
import React from "react";
import { format, addDays } from "date-fns";
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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, Clock, Users, FileText } from "lucide-react";
import { EmployeeAvatar } from "./EmployeeAvatar";
import { yyyyMmDd } from "./utils";
import type { Employee, Shift } from "./types";
import { OPEN_EMP_ID } from "./types";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exportStart: string;
  exportEnd: string;
  weekDays: Date[];
  employees: Employee[];
  onStartChange: (date: string) => void;
  onEndChange: (date: string) => void;
  onExport: () => void;
  getShiftsForEmployeeAndDay: (empId: string, dayISO: string) => Shift[];
  timeOffLabelFor: (empId: string, date: Date) => string | null;
}

// Helper function to generate date range
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

export function ExportDialog({
  open,
  onOpenChange,
  exportStart,
  exportEnd,
  weekDays,
  employees,
  onStartChange,
  onEndChange,
  onExport,
  getShiftsForEmployeeAndDay,
  timeOffLabelFor,
}: ExportDialogProps) {
  // Calculate some statistics for the export
  const dateRange = eachDayISO(exportStart, exportEnd);
  const totalDays = dateRange.length;
  
  const totalShifts = React.useMemo(() => {
    return dateRange.reduce((total, dayISO) => {
      const allEmployees = [OPEN_EMP_ID, ...employees.map(e => e.id)];
      return total + allEmployees.reduce((dayTotal, empId) => {
        return dayTotal + getShiftsForEmployeeAndDay(empId, dayISO).length;
      }, 0);
    }, 0);
  }, [dateRange, employees, getShiftsForEmployeeAndDay]);

  const totalOpenShifts = React.useMemo(() => {
    return dateRange.reduce((total, dayISO) => {
      return total + getShiftsForEmployeeAndDay(OPEN_EMP_ID, dayISO).length;
    }, 0);
  }, [dateRange, getShiftsForEmployeeAndDay]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Export Schedule
          </DialogTitle>
        </DialogHeader>

        {/* Export Configuration */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Start Date</label>
              <Input
                type="date"
                value={exportStart}
                onChange={(e) => onStartChange(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">End Date</label>
              <Input
                type="date"
                value={exportEnd}
                min={exportStart}
                onChange={(e) => onEndChange(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Quick Select</label>
              <Select
                onValueChange={(v) => {
                  if (v === "this") {
                    onStartChange(yyyyMmDd(weekDays[0]));
                    onEndChange(yyyyMmDd(weekDays[6]));
                  } else if (v === "next") {
                    const start = addDays(weekDays[0], 7);
                    const end = addDays(weekDays[6], 7);
                    onStartChange(yyyyMmDd(start));
                    onEndChange(yyyyMmDd(end));
                  } else if (v === "month") {
                    const start = new Date(weekDays[0]);
                    start.setDate(1);
                    const end = new Date(start);
                    end.setMonth(end.getMonth() + 1);
                    end.setDate(0);
                    onStartChange(yyyyMmDd(start));
                    onEndChange(yyyyMmDd(end));
                  }
                }}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select range..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this">This Week</SelectItem>
                  <SelectItem value="next">Next Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Export Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-3 bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-xs text-blue-600 font-medium">Days</div>
                  <div className="text-lg font-bold text-blue-900">{totalDays}</div>
                </div>
              </div>
            </Card>
            <Card className="p-3 bg-green-50 border-green-200">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-xs text-green-600 font-medium">Total Shifts</div>
                  <div className="text-lg font-bold text-green-900">{totalShifts}</div>
                </div>
              </div>
            </Card>
            <Card className="p-3 bg-orange-50 border-orange-200">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-600" />
                <div>
                  <div className="text-xs text-orange-600 font-medium">Open Shifts</div>
                  <div className="text-lg font-bold text-orange-900">{totalOpenShifts}</div>
                </div>
              </div>
            </Card>
            <Card className="p-3 bg-purple-50 border-purple-200">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <div>
                  <div className="text-xs text-purple-600 font-medium">Employees</div>
                  <div className="text-lg font-bold text-purple-900">{employees.length}</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Export Preview */}
        <div className="flex-1 overflow-hidden">
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
            <p className="text-sm text-gray-600">
              {format(new Date(exportStart), "MMM d, yyyy")} – {format(new Date(exportEnd), "MMM d, yyyy")}
            </p>
          </div>
          
          <div className="overflow-auto border rounded-lg bg-white max-h-[400px]">
            <Table className="text-sm">
              <TableHeader className="sticky top-0 bg-gray-50 z-10">
                <TableRow className="border-b-2">
                  <TableHead className="w-[180px] font-semibold text-gray-900 py-3 border-r">
                    Employee
                  </TableHead>
                  {dateRange.map((dayISO) => (
                    <TableHead 
                      key={dayISO} 
                      className="text-center font-semibold text-gray-900 py-3 min-w-[140px] border-r last:border-r-0"
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-semibold">{format(new Date(dayISO), "EEE")}</span>
                        <span className="text-xs text-gray-500 font-normal">
                          {format(new Date(dayISO), "MMM d")}
                        </span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Open Shifts Row */}
                <TableRow className="bg-orange-50/30 border-b">
                  <TableCell className="py-3 font-semibold border-r">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center">
                        <Calendar className="h-3 w-3 text-orange-600" />
                      </div>
                      <span>Open Shifts</span>
                    </div>
                  </TableCell>
                  {dateRange.map((dayISO) => {
                    const dayShifts = getShiftsForEmployeeAndDay(OPEN_EMP_ID, dayISO);
                    return (
                      <TableCell key={dayISO} className="py-3 text-center border-r last:border-r-0">
                        <div className="space-y-1">
                          {dayShifts.length > 0 ? (
                            dayShifts.map((s) => (
                              <div key={s.id} className="text-xs bg-white rounded border px-2 py-1">
                                <div className="font-medium">
                                  {format(new Date(s.starts_at), "h:mma")} - {format(new Date(s.ends_at), "h:mma")}
                                </div>
                                {s.position?.name && (
                                  <Badge variant="secondary" className="text-[9px] mt-1">
                                    {s.position.name}
                                  </Badge>
                                )}
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>

                {/* Employee Rows */}
                {employees.map((emp, idx) => (
                  <TableRow 
                    key={emp.id} 
                    className={`border-b ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                  >
                    <TableCell className="py-3 border-r">
                      <div className="flex items-center gap-2">
                        <EmployeeAvatar employee={emp} size="sm" />
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{emp.full_name}</div>
                          {emp.position && (
                            <div className="text-xs text-gray-500 truncate">{emp.position.name}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    {dateRange.map((dayISO) => {
                      const dayShifts = getShiftsForEmployeeAndDay(emp.id, dayISO);
                      const timeOffLabel = timeOffLabelFor(emp.id, new Date(dayISO));
                      return (
                        <TableCell key={dayISO} className="py-3 text-center border-r last:border-r-0">
                          <div className="space-y-1">
                            {timeOffLabel ? (
                              <div className="text-xs bg-red-50 text-red-700 rounded border border-red-200 px-2 py-1">
                                Time Off
                              </div>
                            ) : dayShifts.length > 0 ? (
                              dayShifts.map((s) => (
                                <div key={s.id} className="text-xs bg-white rounded border px-2 py-1">
                                  <div className="font-medium">
                                    {format(new Date(s.starts_at), "h:mma")} - {format(new Date(s.ends_at), "h:mma")}
                                  </div>
                                  {s.position?.name && (
                                    <Badge variant="secondary" className="text-[9px] mt-1">
                                      {s.position.name}
                                    </Badge>
                                  )}
                                </div>
                              ))
                            ) : (
                              <span className="text-gray-400 text-xs">—</span>
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}

                {/* Empty State */}
                {employees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={dateRange.length + 1} className="p-8 text-center">
                      <div className="text-gray-500">No employees to export</div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
          <div className="text-xs text-gray-500 sm:mr-auto">
            Export will include {employees.length} employees and {totalShifts} shifts across {totalDays} days.
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={onExport} className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}