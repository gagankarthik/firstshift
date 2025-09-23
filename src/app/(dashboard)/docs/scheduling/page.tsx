"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CalendarDays,
  Plus,
  MousePointer2,
  Copy,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  MapPin,
  Info,
  Lightbulb,
  ArrowRight,
  Download,
  Printer,
  Eye,
  Filter,
  Zap,
  Target,
  Calendar,
} from "lucide-react";
import { usePermissions } from "@/app/hooks/usePermissions";
import { useOrg } from "@/components/providers/OrgProvider";

type GuideSection = {
  id: string;
  title: string;
  content: React.ReactNode;
};

export default function SchedulingDocsPage() {
  const { role } = useOrg();
  const perms = usePermissions(role);

  const schedulingGuide: GuideSection[] = [
    {
      id: "overview",
      title: "Overview",
      content: (
        <div className="space-y-6">
          <p className="text-gray-600">
            FirstShift's scheduling system uses an intuitive drag-and-drop interface to make creating
            and managing employee schedules fast and easy. This guide covers everything from basic
            shift creation to advanced scheduling features.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 border-blue-200 bg-blue-50">
              <div className="flex items-start gap-3">
                <MousePointer2 className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-medium text-blue-900">Drag & Drop Interface</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Move shifts between employees and days with simple drag and drop gestures.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-green-200 bg-green-50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-medium text-green-900">Conflict Detection</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Automatic warnings for overlapping shifts, availability conflicts, and time off.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-purple-200 bg-purple-50">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-purple-600 mt-1" />
                <div>
                  <h3 className="font-medium text-purple-900">Real-time Updates</h3>
                  <p className="text-sm text-purple-700 mt-1">
                    Changes sync instantly across all devices and team members.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-orange-200 bg-orange-50">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-orange-600 mt-1" />
                <div>
                  <h3 className="font-medium text-orange-900">Multiple Views</h3>
                  <p className="text-sm text-orange-700 mt-1">
                    Weekly grid view, employee lists, and export options for different needs.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-4 border-amber-200 bg-amber-50">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 mt-1" />
              <div>
                <h3 className="font-medium text-amber-900">Before You Start</h3>
                <ul className="text-sm text-amber-800 mt-2 space-y-1">
                  <li>• Make sure you have employees added to your organization</li>
                  <li>• Set up employee availability for accurate scheduling</li>
                  <li>• Create job positions for better organization (optional)</li>
                  <li>• Understand your organization's scheduling requirements</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      ),
    },
    {
      id: "creating-shifts",
      title: "Creating Shifts",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Method 1: Using the Add Shift Button</h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">1</div>
                <div>
                  <h4 className="font-medium text-gray-900">Navigate to Schedule Page</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Click "Schedule" in the sidebar or use the quick link from the dashboard.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">2</div>
                <div>
                  <h4 className="font-medium text-gray-900">Click "Add Shift"</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Look for the blue "Add Shift" button in the top-right area of the schedule page.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">3</div>
                <div>
                  <h4 className="font-medium text-gray-900">Fill Shift Details</h4>
                  <div className="mt-2 space-y-2">
                    <div className="text-sm text-gray-600">
                      <strong>Employee:</strong> Select who will work this shift, or leave unassigned
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Date:</strong> Choose the day for this shift
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Time:</strong> Set start and end times (e.g., 9:00 AM to 5:00 PM)
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Position:</strong> Assign a job position (optional)
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Location:</strong> Set work location if you have multiple (optional)
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Break Time:</strong> Add break duration in minutes (optional)
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">4</div>
                <div>
                  <h4 className="font-medium text-gray-900">Save the Shift</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Click "Create Shift" to add it to your schedule. The shift will appear immediately in the grid.
                  </p>
                </div>
              </div>
            </div>

            <Card className="p-4 border-green-200 bg-green-50">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-medium text-green-900">Quick Shift Creation Tips</h4>
                  <ul className="text-sm text-green-800 mt-2 space-y-1">
                    <li>• Start with common shift patterns (8-hour days, standard times)</li>
                    <li>• Create "open shifts" first, then assign employees later</li>
                    <li>• Use consistent time formats (e.g., always use 9:00 AM instead of 9:00am)</li>
                    <li>• Double-check times to avoid confusion (AM vs PM)</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Method 2: Quick Creation from Grid</h3>

            <p className="text-gray-600">
              You can also create shifts directly by clicking on empty cells in the schedule grid.
              This is faster for creating multiple shifts quickly.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">1</div>
                <div>
                  <h4 className="font-medium text-gray-900">Click on Empty Cell</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Find the intersection of an employee row and a day column, then click the empty space.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">2</div>
                <div>
                  <h4 className="font-medium text-gray-900">Shift Dialog Opens</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    The create shift dialog will open with the employee and date pre-filled.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">3</div>
                <div>
                  <h4 className="font-medium text-gray-900">Set Times and Save</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Just add the start and end times, then save. The shift appears in that exact spot.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "drag-drop",
      title: "Drag & Drop Features",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-gray-600">
              The drag and drop interface makes it easy to move shifts between employees and days.
              This is especially useful for adjusting schedules quickly or handling last-minute changes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h3 className="font-medium text-gray-900 mb-3">What You Can Drag</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Existing shifts between employees
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Shifts to different days
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Shifts to "Open Shifts" row
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Open shifts to specific employees
                  </li>
                </ul>
              </Card>

              <Card className="p-4">
                <h3 className="font-medium text-gray-900 mb-3">Automatic Checks</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Overlapping shift conflicts
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Employee availability
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Approved time off requests
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Maximum hours per day
                  </li>
                </ul>
              </Card>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">How to Use Drag & Drop</h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">1</div>
                <div>
                  <h4 className="font-medium text-gray-900">Click and Hold</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Click on any shift block and hold your mouse button down. The shift will highlight.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">2</div>
                <div>
                  <h4 className="font-medium text-gray-900">Drag to Target</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    While holding, move your mouse to the destination cell (different employee or day).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">3</div>
                <div>
                  <h4 className="font-medium text-gray-900">Drop to Move</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Release the mouse button when you're over the target cell. The shift moves instantly.
                  </p>
                </div>
              </div>
            </div>

            <Card className="p-4 border-amber-200 bg-amber-50">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-amber-600 mt-1" />
                <div>
                  <h4 className="font-medium text-amber-900">Conflict Handling</h4>
                  <p className="text-sm text-amber-800 mt-1">
                    If there's a conflict (like employee unavailability), FirstShift will ask if you want to override.
                    You can choose to proceed anyway or cancel the move.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Common Drag & Drop Scenarios</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Switching Employees</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Need to swap who's working a particular shift?
                </p>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Drag shift from Employee A to empty cell</li>
                  <li>2. Drag Employee B's shift to Employee A</li>
                  <li>3. Drag the temporary shift to Employee B</li>
                </ol>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Moving to Different Day</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Shift the same employee to a different day?
                </p>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Drag from current day column</li>
                  <li>2. Drop on target day in same employee row</li>
                  <li>3. Time stays the same, only date changes</li>
                </ol>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Creating Open Shifts</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Remove assignment but keep the shift?
                </p>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Drag shift to "Open Shifts" row</li>
                  <li>2. Shift becomes unassigned</li>
                  <li>3. Can be assigned to anyone later</li>
                </ol>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Filling Open Shifts</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Assign an open shift to an employee?
                </p>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Drag from "Open Shifts" row</li>
                  <li>2. Drop on target employee and day</li>
                  <li>3. Employee is now assigned</li>
                </ol>
              </Card>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "editing-shifts",
      title: "Editing & Managing Shifts",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-gray-600">
              Once shifts are created, you can easily edit their details, copy them to other days,
              or delete them entirely. Here's how to manage existing shifts effectively.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <Edit className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Edit Details</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Change times, positions, or other shift information
                </p>
              </Card>

              <Card className="p-4 text-center">
                <Copy className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Copy Shifts</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Duplicate shifts to other days or employees
                </p>
              </Card>

              <Card className="p-4 text-center">
                <Trash2 className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Delete Shifts</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Remove shifts that are no longer needed
                </p>
              </Card>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Editing Shift Details</h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">1</div>
                <div>
                  <h4 className="font-medium text-gray-900">Click on Shift</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Click directly on any shift block in the schedule grid.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">2</div>
                <div>
                  <h4 className="font-medium text-gray-900">Edit Dialog Opens</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    The shift editing dialog will appear with all current information filled in.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">3</div>
                <div>
                  <h4 className="font-medium text-gray-900">Make Changes</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Modify any fields you need: times, employee assignment, position, location, or break time.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">4</div>
                <div>
                  <h4 className="font-medium text-gray-900">Save or Delete</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Click "Save Changes" to update the shift, or "Delete Shift" to remove it completely.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Bulk Operations</h3>

            <p className="text-gray-600">
              For efficiency, you can perform operations on multiple shifts at once.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Copy Week Template</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Create a template week and copy it to future weeks.
                </p>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Create your ideal week schedule</li>
                  <li>2. Use week navigation to go to next week</li>
                  <li>3. Manually recreate similar pattern</li>
                  <li>4. Adjust for individual differences</li>
                </ol>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Mass Updates</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Update multiple shifts with similar changes.
                </p>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Edit each shift individually</li>
                  <li>2. Use drag & drop for position changes</li>
                  <li>3. Consider creating new shifts instead</li>
                  <li>4. Delete old shifts when done</li>
                </ol>
              </Card>
            </div>

            <Card className="p-4 border-blue-200 bg-blue-50">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-medium text-blue-900">Efficiency Tips</h4>
                  <ul className="text-sm text-blue-800 mt-2 space-y-1">
                    <li>• Use drag & drop instead of editing for simple moves</li>
                    <li>• Create similar shifts in batches</li>
                    <li>• Set up recurring patterns manually week by week</li>
                    <li>• Delete and recreate rather than extensive editing</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: "conflicts",
      title: "Handling Conflicts",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-gray-600">
              FirstShift automatically detects scheduling conflicts and provides warnings to help you
              avoid problems. Here's how to understand and resolve common conflicts.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 border-red-200 bg-red-50">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-1" />
                  <div>
                    <h3 className="font-medium text-red-900">Overlap Conflicts</h3>
                    <p className="text-sm text-red-700 mt-1">
                      When an employee is scheduled for multiple shifts at the same time.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-amber-200 bg-amber-50">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-amber-600 mt-1" />
                  <div>
                    <h3 className="font-medium text-amber-900">Availability Conflicts</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      When a shift is scheduled outside an employee's available hours.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-blue-200 bg-blue-50">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-medium text-blue-900">Time Off Conflicts</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      When a shift is scheduled during approved time off.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-purple-200 bg-purple-50">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-purple-600 mt-1" />
                  <div>
                    <h3 className="font-medium text-purple-900">Coverage Gaps</h3>
                    <p className="text-sm text-purple-700 mt-1">
                      When important shifts remain unassigned or understaffed.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Resolving Conflicts</h3>

            <div className="space-y-4">
              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Overlap Conflicts</h4>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    <strong>Problem:</strong> Employee scheduled for 9:00 AM - 5:00 PM and 3:00 PM - 11:00 PM on same day
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Solutions:</strong>
                  </div>
                  <ul className="text-sm text-gray-600 ml-4 space-y-1">
                    <li>• Adjust shift times to eliminate overlap</li>
                    <li>• Assign one shift to a different employee</li>
                    <li>• Split the long shift between multiple people</li>
                    <li>• Move one shift to a different day</li>
                  </ul>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Availability Conflicts</h4>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    <strong>Problem:</strong> Shift scheduled during times employee marked as unavailable
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Solutions:</strong>
                  </div>
                  <ul className="text-sm text-gray-600 ml-4 space-y-1">
                    <li>• Check if employee can work those hours</li>
                    <li>• Update employee availability if it changed</li>
                    <li>• Assign shift to someone who is available</li>
                    <li>• Override the warning if it's temporary</li>
                  </ul>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Time Off Conflicts</h4>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    <strong>Problem:</strong> Shift scheduled during approved vacation or sick time
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Solutions:</strong>
                  </div>
                  <ul className="text-sm text-gray-600 ml-4 space-y-1">
                    <li>• Assign shift to a different employee</li>
                    <li>• Move shift to when employee returns</li>
                    <li>• Check if time off request can be modified</li>
                    <li>• Cover with temporary or substitute worker</li>
                  </ul>
                </div>
              </Card>
            </div>

            <Card className="p-4 border-green-200 bg-green-50">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-medium text-green-900">Conflict Prevention</h4>
                  <ul className="text-sm text-green-800 mt-2 space-y-1">
                    <li>• Keep employee availability updated</li>
                    <li>• Process time off requests promptly</li>
                    <li>• Schedule well in advance when possible</li>
                    <li>• Communicate with team about preferences</li>
                    <li>• Review schedules before publishing</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ),
    },
  ];

  const canManage = perms.canManageSchedule;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/docs" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Documentation
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Schedule Management</h1>
            <p className="text-gray-600">
              Master the drag-and-drop scheduling interface and advanced features
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          {canManage && (
            <Button asChild className="gap-2">
              <Link href="/schedule">
                <CalendarDays className="h-4 w-4" />
                Open Schedule
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" className="gap-2">
            <Link href="/docs/employees">
              <Users className="h-4 w-4" />
              Employee Management
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/docs/availability">
              <Clock className="h-4 w-4" />
              Availability Guide
            </Link>
          </Button>
        </div>
      </div>

      {/* Access Notice */}
      {!canManage && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-900">Limited Scheduling Access</h3>
                <p className="text-amber-800 text-sm mt-1">
                  Creating and editing schedules requires manager or administrator permissions.
                  You can view schedules and learn about the system, but won't be able to make changes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="creating-shifts">Creating Shifts</TabsTrigger>
          <TabsTrigger value="drag-drop">Drag & Drop</TabsTrigger>
          <TabsTrigger value="editing-shifts">Editing Shifts</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
        </TabsList>

        {schedulingGuide.map((section) => (
          <TabsContent key={section.id} value={section.id} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {section.content}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Related Guides */}
      <Card className="border-dashed border-2 border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Related Guides</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-auto p-4 flex-col items-start gap-2">
              <Link href="/docs/employees">
                <div className="flex items-center gap-2 w-full">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Employee Management</span>
                </div>
                <span className="text-sm text-gray-600 text-left">
                  Add and organize your team first
                </span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 flex-col items-start gap-2">
              <Link href="/docs/availability">
                <div className="flex items-center gap-2 w-full">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Availability Management</span>
                </div>
                <span className="text-sm text-gray-600 text-left">
                  Set up when employees can work
                </span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 flex-col items-start gap-2">
              <Link href="/docs/time-off">
                <div className="flex items-center gap-2 w-full">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Time Off Management</span>
                </div>
                <span className="text-sm text-gray-600 text-left">
                  Handle vacation and sick days
                </span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}