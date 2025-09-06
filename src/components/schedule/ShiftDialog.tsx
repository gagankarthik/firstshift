// components/schedule/ShiftDialog.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Plus, 
  CalendarIcon, 
  Trash2, 
  Loader2, 
  Clock, 
  MapPin, 
  User,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { EmployeeAvatar } from "./EmployeeAvatar";
import { formatTimeRange, isValidTimeRange, calculateShiftDuration } from "./utils";
import type { Employee, Position, Location } from "./types";

interface ShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  shiftId: string | null;
  employeeId: string;
  date: string;
  start: string;
  end: string;
  positionId: string;
  locationId: string;
  breakMin: string;
  saving: boolean;
  employees: Employee[];
  positions: Position[];
  locations: Location[];
  onEmployeeChange: (id: string) => void;
  onDateChange: (date: string) => void;
  onStartChange: (time: string) => void;
  onEndChange: (time: string) => void;
  onPositionChange: (id: string) => void;
  onLocationChange: (id: string) => void;
  onBreakChange: (minutes: string) => void;
  onSave: () => void;
  onDelete?: () => void;
}

export function ShiftDialog({
  open,
  onOpenChange,
  mode,
  employeeId,
  date,
  start,
  end,
  positionId,
  locationId,
  breakMin,
  saving,
  employees,
  positions,
  locations,
  onEmployeeChange,
  onDateChange,
  onStartChange,
  onEndChange,
  onPositionChange,
  onLocationChange,
  onBreakChange,
  onSave,
  onDelete,
}: ShiftDialogProps) {
  // Validation
  const isValidTime = isValidTimeRange(start, end);
  const shiftDuration = calculateShiftDuration(start, end, parseInt(breakMin) || 0);
  const selectedEmployee = employees.find(e => e.id === employeeId);
  const selectedPosition = positions.find(p => p.id === positionId);
  const selectedLocation = locations.find(l => l.id === locationId);

  // Calculate some shift info
  const totalMinutes = calculateShiftDuration(start, end);
  const workingMinutes = Math.max(0, totalMinutes - (parseInt(breakMin) || 0));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "create" ? (
              <>
                <Plus className="h-5 w-5 text-blue-600" />
                Create New Shift
              </>
            ) : (
              <>
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                Edit Shift
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Shift Summary Card */}
          {isValidTime && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-blue-900">
                      {formatTimeRange(start, end)}
                    </div>
                    <div className="text-sm text-blue-700">
                      {Math.floor(workingMinutes / 60)}h {workingMinutes % 60}m working time
                    </div>
                  </div>
                </div>
                {isValidTime ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
            </Card>
          )}

          {/* Employee and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="h-4 w-4" />
                Employee
              </label>
              <Select value={employeeId} onValueChange={onEmployeeChange}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <div className="flex items-center gap-2 py-1">
                      <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-3 w-3 text-gray-500" />
                      </div>
                      <span>Unassigned (Open Shift)</span>
                    </div>
                  </SelectItem>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      <div className="flex items-center gap-2 py-1">
                        <EmployeeAvatar employee={e} size="sm" />
                        <div>
                          <div className="font-medium">{e.full_name}</div>
                          {e.position && (
                            <div className="text-xs text-gray-500">{e.position.name}</div>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedEmployee && (
                <div className="flex items-center gap-2 mt-2">
                  <EmployeeAvatar employee={selectedEmployee} size="sm" />
                  <div className="text-sm">
                    <div className="font-medium">{selectedEmployee.full_name}</div>
                    {selectedEmployee.position && (
                      <div className="text-xs text-gray-500">{selectedEmployee.position.name}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Date
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => onDateChange(e.target.value)}
                className="bg-white"
              />
            </div>
          </div>

          {/* Time Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time & Duration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Start Time</label>
                <Input
                  type="time"
                  value={start}
                  onChange={(e) => onStartChange(e.target.value)}
                  className="bg-white"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">End Time</label>
                <Input
                  type="time"
                  value={end}
                  onChange={(e) => onEndChange(e.target.value)}
                  className="bg-white"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Break (minutes)</label>
                <Input
                  type="number"
                  min={0}
                  max={480}
                  value={breakMin}
                  onChange={(e) => onBreakChange(e.target.value)}
                  className="bg-white"
                  placeholder="0"
                />
              </div>
            </div>

            {!isValidTime && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                End time must be after start time
              </div>
            )}
          </div>

          {/* Position and Location */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Additional Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Position</label>
                <Select value={positionId} onValueChange={onPositionChange}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No position assigned</SelectItem>
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
                {selectedPosition && (
                  <Badge 
                    variant="secondary" 
                    className="w-fit"
                    style={{
                      backgroundColor: selectedPosition.color ? `${selectedPosition.color}20` : undefined,
                      color: selectedPosition.color || "#64748b",
                      borderColor: selectedPosition.color || "#64748b",
                    }}
                  >
                    {selectedPosition.name}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </label>
                <Select value={locationId} onValueChange={onLocationChange}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No location assigned</SelectItem>
                    {locations.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-gray-500" />
                          {l.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedLocation && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-3 w-3" />
                    {selectedLocation.name}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Quick Actions</label>
            <div className="flex gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onStartChange("09:00");
                  onEndChange("17:00");
                  onBreakChange("60");
                }}
              >
                9-5 (1h break)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onStartChange("08:00");
                  onEndChange("16:00");
                  onBreakChange("30");
                }}
              >
                8-4 (30m break)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onStartChange("18:00");
                  onEndChange("02:00");
                  onBreakChange("30");
                }}
              >
                Evening (6pm-2am)
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
          {mode === "edit" && onDelete && (
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={saving}
              className="sm:mr-auto gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Shift
            </Button>
          )}
          
          <div className="flex gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={saving}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button 
              onClick={onSave} 
              disabled={saving || !isValidTime}
              className="flex-1 sm:flex-none gap-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === "create" ? (
                <Plus className="h-4 w-4" />
              ) : (
                <CalendarIcon className="h-4 w-4" />
              )}
              {saving 
                ? "Saving..." 
                : mode === "create" 
                ? "Create Shift" 
                : "Save Changes"
              }
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}