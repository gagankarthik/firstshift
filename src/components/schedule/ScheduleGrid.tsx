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
      {/* Enhanced Desktop View */}
      <div className="hidden lg:block">
        <Card className="overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
          {/* Fixed container to prevent horizontal overflow */}
          <div className="w-full overflow-hidden">
            <div className="overflow-x-auto">
              {/* Set a fixed minimum width for the table */}
              <div style={{ minWidth: `${240 + (weekDays.length * 200)}px` }}>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 border-b-2 border-slate-200">
                      <TableHead
                        className="sticky left-0 z-20 bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 font-bold text-slate-800 py-6 border-r border-slate-200 shadow-sm"
                        style={{ width: '240px', minWidth: '240px', maxWidth: '240px' }}
                      >
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                          EMPLOYEES
                        </div>
                      </TableHead>
                      {weekDays.map((day, index) => (
                        <TableHead
                          key={day.getTime()}
                          className="text-center font-bold text-slate-800 py-6 border-r border-slate-200 last:border-r-0"
                          style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}
                        >
                          <div className="text-center space-y-1">
                            <div className="font-bold text-sm tracking-wide">
                              {format(day, "EEE").toUpperCase()}
                            </div>
                            <div className="text-xs text-slate-600 font-medium bg-white/60 rounded-lg px-2 py-1 inline-block">
                              {format(day, "MMM d")}
                            </div>
                            {/* Today indicator */}
                            {format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1"></div>
                            )}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Enhanced Open Shifts Row */}
                    <TableRow className="border-b border-slate-200 bg-gradient-to-r from-orange-50/40 via-amber-50/40 to-yellow-50/40 hover:from-orange-50/60 hover:via-amber-50/60 hover:to-yellow-50/60 transition-all duration-200">
                      <TableCell
                        className="sticky left-0 z-10 bg-gradient-to-r from-orange-50/40 via-amber-50/40 to-yellow-50/40 hover:from-orange-50/60 hover:via-amber-50/60 hover:to-yellow-50/60 py-6 border-r border-slate-200 shadow-sm"
                        style={{ width: '240px', minWidth: '240px', maxWidth: '240px' }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-md">
                            <CalendarIcon className="h-5 w-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-900 text-base">Open Shifts</div>
                            <div className="text-sm text-slate-600 mt-0.5">Available positions</div>
                          </div>
                        </div>
                      </TableCell>
                      {weekDays.map((day) => {
                        const dayKey = `${OPEN_EMP_ID}_${format(day, "yyyy-MM-dd")}`;
                        const dayShifts = shiftsByEmpDay.get(dayKey) || [];
                        const id = cellId(OPEN_EMP_ID, day);
                        return (
                          <TableCell
                            key={day.getTime()}
                            className="p-4 align-top border-r border-slate-200 last:border-r-0"
                            style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}
                          >
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

                    {/* Enhanced Employee Rows */}
                    {employees.map((emp, index) => (
                      <TableRow
                        key={emp.id}
                        className={`border-b border-slate-200 hover:bg-slate-50/40 transition-all duration-200 ${
                          index % 2 === 0 ? "bg-white/40" : "bg-slate-50/20"
                        }`}
                      >
                        <TableCell
                          className="sticky left-0 z-10 bg-inherit py-6 border-r border-slate-200 shadow-sm"
                          style={{ width: '240px', minWidth: '240px', maxWidth: '240px' }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              <EmployeeAvatar employee={emp} size="lg" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-slate-900 text-base truncate">
                                {emp.full_name}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="text-sm text-slate-600 truncate">
                                  {emp.position?.name || "No position"}
                                </div>
                                {emp.position?.color && (
                                  <div
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: emp.position.color }}
                                  />
                                )}
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
                            <TableCell
                              key={day.getTime()}
                              className="p-4 align-top border-r border-slate-200 last:border-r-0"
                              style={{ width: '200px', minWidth: '200px', maxWidth: '200px' }}
                            >
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
          </div>
        </Card>
      </div>

      {/* Enhanced Mobile/Tablet View */}
      <div className="lg:hidden space-y-6">
        {/* Enhanced Open Shifts Card */}
        <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 rounded-2xl">
          <div className="p-6 bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 border-b border-orange-200/50">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center shadow-md">
                <CalendarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-lg">Open Shifts</div>
                <div className="text-sm text-slate-600 mt-0.5">Available positions</div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {weekDays.map((day) => {
                const dayKey = `${OPEN_EMP_ID}_${format(day, "yyyy-MM-dd")}`;
                const dayShifts = shiftsByEmpDay.get(dayKey) || [];
                const id = cellId(OPEN_EMP_ID, day);
                
                return (
                  <div key={day.getTime()} className="space-y-3">
                    <div className="text-center">
                      <div className="font-bold text-sm text-slate-900">
                        {format(day, "EEE").toUpperCase()}
                      </div>
                      <div className="text-xs text-slate-600 bg-white/60 rounded-lg px-2 py-1 mt-1 inline-block">
                        {format(day, "MMM d")}
                      </div>
                      {format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1"></div>
                      )}
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

        {/* Enhanced Employee Cards */}
        {employees.map((emp) => (
          <Card key={emp.id} className="overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
            <div className="p-6 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200/50">
              <div className="flex items-center gap-4">
                <EmployeeAvatar employee={emp} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 text-base truncate">
                    {emp.full_name}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="text-sm text-slate-600 truncate">
                      {emp.position?.name || "No position"}
                    </div>
                    {emp.position?.color && (
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: emp.position.color }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {weekDays.map((day) => {
                  const dayKey = `${emp.id}_${format(day, "yyyy-MM-dd")}`;
                  const dayShifts = shiftsByEmpDay.get(dayKey) || [];
                  const id = cellId(emp.id, day);
                  const weekday = day.getDay();
                  const ranges = availabilityByEmp.get(emp.id) || [];
                  const hasAvailability = ranges.some((r) => r.weekday === weekday);
                  const timeOffLabel = timeOffLabelFor(emp.id, day);

                  return (
                    <div key={day.getTime()} className="space-y-3">
                      <div className="text-center">
                        <div className="font-bold text-sm text-slate-900">
                          {format(day, "EEE").toUpperCase()}
                        </div>
                        <div className="text-xs text-slate-600 bg-white/60 rounded-lg px-2 py-1 mt-1 inline-block">
                          {format(day, "MMM d")}
                        </div>
                        {format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1"></div>
                        )}
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
        {!busy && employees.length === 0 && (
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