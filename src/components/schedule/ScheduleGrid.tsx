// components/schedule/ScheduleGrid.tsx
import React from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { CalendarIcon, Loader2, Search } from "lucide-react";
import { DraggableShift } from "./DraggableShift";
import { DroppableCell } from "./DroppableCell";
import { EmployeeAvatar } from "./EmployeeAvatar";
import { yyyyMmDd } from "./utils";
import type { Employee, Shift, Avail, TimeOff } from "./types";
import { OPEN_EMP_ID } from "./types";

interface ScheduleGridProps {
  weekDays: Date[];
  employees: Employee[];
  shiftsByEmpDay: Map<string, Shift[]>;
  availabilityByEmp: Map<string, Avail[]>;
  timeOffLabelFor: (empId: string, date: Date) => string | null;
  canManage: boolean;
  busy: boolean;
  onCreateShift: (empId: string, dateIso: string) => void;
  onEditShift: (shift: Shift) => void;
}

export function ScheduleGrid({
  weekDays,
  employees,
  shiftsByEmpDay,
  availabilityByEmp,
  timeOffLabelFor,
  canManage,
  busy,
  onCreateShift,
  onEditShift,
}: ScheduleGridProps) {
  // Helper function to generate cell IDs for drag & drop
  function cellId(empId: string, day: Date) {
    return `cell:${empId}:${format(day, "yyyy-MM-dd")}`;
  }

  return (
    <>
      {/* Desktop View */}
      <Card className="hidden lg:block overflow-hidden shadow-sm border">
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b-2">
                  <TableHead className="sticky left-0 z-20 bg-gray-50 w-[220px] font-semibold text-gray-900 py-4 border-r">
                    EMPLOYEE
                  </TableHead>
                  {weekDays.map((day) => (
                    <TableHead 
                      key={day.getTime()} 
                      className="text-center font-semibold text-gray-900 py-4 min-w-[160px] border-r last:border-r-0"
                    >
                      <div className="text-center">
                        <div className="font-semibold text-sm">
                          {format(day, "EEE").toUpperCase()}
                        </div>
                        <div className="text-xs text-gray-500 font-normal">
                          {format(day, "MMM d").toUpperCase()}
                        </div>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Open Shifts Row */}
                <TableRow className="border-b bg-orange-50/30 hover:bg-orange-50/50 transition-colors">
                  <TableCell className="sticky left-0 z-10 bg-orange-50/30 hover:bg-orange-50/50 py-4 border-r">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center">
                        <CalendarIcon className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Open Shifts</div>
                        <div className="text-xs text-gray-500">Unassigned</div>
                      </div>
                    </div>
                  </TableCell>
                  {weekDays.map((day) => {
                    const dayKey = `${OPEN_EMP_ID}_${format(day, "yyyy-MM-dd")}`;
                    const dayShifts = shiftsByEmpDay.get(dayKey) || [];
                    const id = cellId(OPEN_EMP_ID, day);
                    return (
                      <TableCell key={day.getTime()} className="p-3 align-top border-r last:border-r-0">
                        <DroppableCell
                          id={id}
                          onAdd={canManage ? () => onCreateShift(OPEN_EMP_ID, yyyyMmDd(day)) : undefined}
                        >
                          <div className="space-y-2">
                            {dayShifts.map((s) => (
                              <DraggableShift
                                key={s.id}
                                s={s}
                                disabled={!canManage}
                                onEdit={() => onEditShift(s)}
                              />
                            ))}
                            {dayShifts.length === 0 && (
                              <div className="text-xs text-gray-400 text-center py-3">
                                No open shifts
                              </div>
                            )}
                          </div>
                        </DroppableCell>
                      </TableCell>
                    );
                  })}
                </TableRow>

                {/* Employee Rows */}
                {employees.map((emp, index) => (
                  <TableRow 
                    key={emp.id} 
                    className={`border-b hover:bg-gray-50/50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/20"
                    }`}
                  >
                    <TableCell className="sticky left-0 z-10 bg-inherit py-4 border-r">
                      <div className="flex items-center gap-3">
                        <EmployeeAvatar employee={emp} size="md" />
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate">
                            {emp.full_name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {emp.position?.name || "No position"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    {weekDays.map((day) => {
                      const dayKey = `${emp.id}_${format(day, "yyyy-MM-dd")}`;
                      const dayShifts = shiftsByEmpDay.get(dayKey) || [];
                      const id = cellId(emp.id, day);
                      const weekday = day.getDay();
                      const ranges = availabilityByEmp.get(emp.id) || [];
                      const hasAvailability = ranges.some((r) => r.weekday === weekday);
                      const timeOffLabel = timeOffLabelFor(emp.id, day);

                      return (
                        <TableCell key={day.getTime()} className="p-3 align-top border-r last:border-r-0">
                          <DroppableCell
                            id={id}
                            unavailable={!hasAvailability}
                            timeOffLabel={timeOffLabel}
                            onAdd={canManage ? () => onCreateShift(emp.id, yyyyMmDd(day)) : undefined}
                          >
                            <div className="space-y-2">
                              {dayShifts.map((s) => (
                                <DraggableShift
                                  key={s.id}
                                  s={s}
                                  disabled={!canManage}
                                  onEdit={() => onEditShift(s)}
                                />
                              ))}
                              {dayShifts.length === 0 && !timeOffLabel && (
                                <div className="text-xs text-gray-400 text-center py-3">
                                  {hasAvailability ? "Available" : "Unavailable"}
                                </div>
                              )}
                            </div>
                          </DroppableCell>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}

                {/* Empty State - No Employees Found */}
                {!busy && employees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={weekDays.length + 1} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Search className="h-12 w-12 text-gray-300" />
                        <div className="text-center">
                          <div className="text-lg font-medium text-gray-900">
                            No employees found
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Try adjusting your search criteria
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Loading State */}
                {busy && (
                  <TableRow>
                    <TableCell colSpan={weekDays.length + 1} className="p-12 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <span className="text-gray-600 font-medium">Loading schedule...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      {/* Mobile/Tablet View */}
      <div className="lg:hidden space-y-4">
        {/* Open Shifts Card */}
        <Card className="overflow-hidden">
          <div className="p-4 bg-orange-50 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Open Shifts</div>
                <div className="text-xs text-gray-500">Unassigned</div>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {weekDays.map((day) => {
                const dayKey = `${OPEN_EMP_ID}_${format(day, "yyyy-MM-dd")}`;
                const dayShifts = shiftsByEmpDay.get(dayKey) || [];
                const id = cellId(OPEN_EMP_ID, day);
                
                return (
                  <div key={day.getTime()} className="space-y-2">
                    <div className="text-center">
                      <div className="font-medium text-sm text-gray-900">
                        {format(day, "EEE")}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(day, "MMM d")}
                      </div>
                    </div>
                    <DroppableCell
                      id={id}
                      onAdd={canManage ? () => onCreateShift(OPEN_EMP_ID, yyyyMmDd(day)) : undefined}
                      compact={true}
                    >
                      <div className="space-y-1">
                        {dayShifts.map((s) => (
                          <DraggableShift
                            key={s.id}
                            s={s}
                            disabled={!canManage}
                            onEdit={() => onEditShift(s)}
                            compact={true}
                          />
                        ))}
                        {dayShifts.length === 0 && (
                          <div className="text-xs text-gray-400 text-center py-2">
                            No shifts
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

        {/* Employee Cards */}
        {employees.map((emp) => (
          <Card key={emp.id} className="overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <div className="flex items-center gap-3">
                <EmployeeAvatar employee={emp} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 truncate">
                    {emp.full_name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {emp.position?.name || "No position"}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {weekDays.map((day) => {
                  const dayKey = `${emp.id}_${format(day, "yyyy-MM-dd")}`;
                  const dayShifts = shiftsByEmpDay.get(dayKey) || [];
                  const id = cellId(emp.id, day);
                  const weekday = day.getDay();
                  const ranges = availabilityByEmp.get(emp.id) || [];
                  const hasAvailability = ranges.some((r) => r.weekday === weekday);
                  const timeOffLabel = timeOffLabelFor(emp.id, day);

                  return (
                    <div key={day.getTime()} className="space-y-2">
                      <div className="text-center">
                        <div className="font-medium text-sm text-gray-900">
                          {format(day, "EEE")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(day, "MMM d")}
                        </div>
                      </div>
                      <DroppableCell
                        id={id}
                        unavailable={!hasAvailability}
                        timeOffLabel={timeOffLabel}
                        onAdd={canManage ? () => onCreateShift(emp.id, yyyyMmDd(day)) : undefined}
                        compact={true}
                      >
                        <div className="space-y-1">
                          {dayShifts.map((s) => (
                            <DraggableShift
                              key={s.id}
                              s={s}
                              disabled={!canManage}
                              onEdit={() => onEditShift(s)}
                              compact={true}
                            />
                          ))}
                          {dayShifts.length === 0 && !timeOffLabel && (
                            <div className="text-xs text-gray-400 text-center py-2">
                              {hasAvailability ? "Available" : "Unavailable"}
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
        ))}

        {/* Empty State - No Employees Found */}
        {!busy && employees.length === 1 && (
          <Card className="p-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <Search className="h-12 w-12 text-gray-300" />
              <div>
                <div className="text-lg font-medium text-gray-900">No employees found</div>
                <div className="text-sm text-gray-500 mt-1">Try adjusting your search criteria</div>
              </div>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {busy && (
          <Card className="p-12">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-gray-600 font-medium">Loading schedule...</span>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}