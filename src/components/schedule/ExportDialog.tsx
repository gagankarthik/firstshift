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
import { Download, Calendar, Clock, Users, FileText, CalendarDays, Printer } from "lucide-react";
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
  onPrint: () => void;
  onCalendarExport: () => void;
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
  onPrint,
  onCalendarExport,
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
      <DialogContent className="max-w-[95vw] lg:max-w-5xl max-h-[90vh] flex flex-col border-0 rounded-lg shadow-xl bg-white print:max-w-full print:max-h-full print:shadow-none print:border-none print:rounded-none print:p-0">
        <DialogHeader className="pb-2 px-4 border-b border-slate-200 print:pb-1 print:px-2 print:border-black print:text-center flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold print:flex-col print:gap-0">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-md print:hidden">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-slate-800 text-lg font-bold print:text-black print:text-sm">
                Schedule Report
              </div>
              <div className="text-xs text-slate-600 mt-0.5 print:text-black print:text-[10px] print:mt-0">
                {format(new Date(exportStart), "MMMM d, yyyy")} – {format(new Date(exportEnd), "MMMM d, yyyy")}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Compact Export Configuration */}
        <div className="bg-slate-50 rounded-md border border-slate-200 p-3 space-y-3 mx-4 print:hidden flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 text-indigo-600" />
            <h3 className="text-sm font-semibold text-slate-800">Date Range</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="space-y-0.5">
              <label className="text-xs font-medium text-slate-600">Start Date</label>
              <Input
                type="date"
                value={exportStart}
                onChange={(e) => onStartChange(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-0.5">
              <label className="text-xs font-medium text-slate-600">End Date</label>
              <Input
                type="date"
                value={exportEnd}
                min={exportStart}
                onChange={(e) => onEndChange(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-0.5">
              <label className="text-xs font-medium text-slate-600">Quick Select</label>
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
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Choose preset..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this">📅 This Week</SelectItem>
                  <SelectItem value="next">⏭️ Next Week</SelectItem>
                  <SelectItem value="month">🗓️ Current Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Compact Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-2 text-center">
              <div className="text-xs text-blue-600 font-medium">Days</div>
              <div className="text-lg font-bold text-blue-700">{totalDays}</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-md p-2 text-center">
              <div className="text-xs text-green-600 font-medium">Shifts</div>
              <div className="text-lg font-bold text-green-700">{totalShifts}</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-md p-2 text-center">
              <div className="text-xs text-orange-600 font-medium">Open</div>
              <div className="text-lg font-bold text-orange-700">{totalOpenShifts}</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-md p-2 text-center">
              <div className="text-xs text-purple-600 font-medium">Staff</div>
              <div className="text-lg font-bold text-purple-700">{employees.length}</div>
            </div>
          </div>
        </div>


        {/* Compact Footer */}
        <DialogFooter className="pt-3 pb-3 px-4 border-t border-slate-200 print:hidden flex-shrink-0">
          <div className="w-full space-y-2">
            <div className="text-center text-xs text-slate-600">
              {employees.length} employees • {totalShifts} shifts • {totalDays} days
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button onClick={onExport} className="h-8 text-xs gap-1 bg-blue-600 hover:bg-blue-700">
                <Download className="h-3 w-3" />
                CSV
              </Button>
              <Button onClick={onPrint} variant="outline" className="h-8 text-xs gap-1">
                <Printer className="h-3 w-3" />
                Print
              </Button>
              <Button onClick={onCalendarExport} variant="outline" className="h-8 text-xs gap-1">
                <CalendarDays className="h-3 w-3" />
                Calendar
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}