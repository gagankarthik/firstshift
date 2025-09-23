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
  Clock,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Users,
  CheckCircle,
  Info,
  Lightbulb,
  ArrowRight,
  Sun,
  Moon,
  Coffee,
  AlertTriangle,
  Target,
  Settings,
} from "lucide-react";
import { usePermissions } from "@/app/hooks/usePermissions";
import { useOrg } from "@/components/providers/OrgProvider";

type GuideSection = {
  id: string;
  title: string;
  content: React.ReactNode;
};

export default function AvailabilityDocsPage() {
  const { role } = useOrg();
  const perms = usePermissions(role);

  const availabilityGuide: GuideSection[] = [
    {
      id: "overview",
      title: "Overview",
      content: (
        <div className="space-y-6">
          <p className="text-gray-600">
            Availability management helps ensure employees are only scheduled when they can actually work.
            This system prevents conflicts and makes scheduling more efficient by showing managers
            exactly when each team member is available.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 border-blue-200 bg-blue-50">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-medium text-blue-900">For Employees</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Set your available hours for each day of the week. Be accurate to avoid scheduling conflicts.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-green-200 bg-green-50">
              <div className="flex items-start gap-3">
                <Settings className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-medium text-green-900">For Managers</h3>
                  <p className="text-sm text-green-700 mt-1">
                    View and edit team availability. Override when necessary for business needs.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <Sun className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Day Patterns</h3>
              <p className="text-sm text-gray-600 mt-1">
                Set different hours for each day of the week
              </p>
            </Card>

            <Card className="p-4 text-center">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Time Ranges</h3>
              <p className="text-sm text-gray-600 mt-1">
                Multiple time blocks per day (morning & evening shifts)
              </p>
            </Card>

            <Card className="p-4 text-center">
              <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Conflict Prevention</h3>
              <p className="text-sm text-gray-600 mt-1">
                Automatic warnings during scheduling
              </p>
            </Card>
          </div>

          <Card className="p-4 border-amber-200 bg-amber-50">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 mt-1" />
              <div>
                <h3 className="font-medium text-amber-900">How Availability Works</h3>
                <ul className="text-sm text-amber-800 mt-2 space-y-1">
                  <li>• Set weekly patterns that repeat each week</li>
                  <li>• Each day can have multiple time ranges</li>
                  <li>• Managers can override availability if needed</li>
                  <li>• System warns about conflicts during scheduling</li>
                  <li>• Updates apply to future scheduling only</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      ),
    },
    {
      id: "setting-availability",
      title: "Setting Your Availability",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-gray-600">
              As an employee, setting accurate availability is crucial for getting scheduled
              at times you can actually work. Here's how to set and manage your availability.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">1</div>
                <div>
                  <h4 className="font-medium text-gray-900">Navigate to Availability</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Click "Availability" in the sidebar to access your availability settings.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">2</div>
                <div>
                  <h4 className="font-medium text-gray-900">Choose Your Days</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    The page shows all seven days of the week. You can set different hours for each day.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">3</div>
                <div>
                  <h4 className="font-medium text-gray-900">Add Time Ranges</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    For each day you can work, set your start and end times, then click "Add" to save that range.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">4</div>
                <div>
                  <h4 className="font-medium text-gray-900">Review and Update</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Your availability saves automatically. Update it anytime your schedule changes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Common Availability Patterns</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Full-Time Schedule</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div><strong>Mon-Fri:</strong> 8:00 AM - 6:00 PM</div>
                  <div><strong>Weekends:</strong> Not available</div>
                  <div className="text-xs text-gray-500 mt-2">
                    Standard business hours, consistent schedule
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Part-Time Evenings</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div><strong>Mon-Thu:</strong> 5:00 PM - 10:00 PM</div>
                  <div><strong>Sat-Sun:</strong> 10:00 AM - 8:00 PM</div>
                  <div className="text-xs text-gray-500 mt-2">
                    Good for students or second jobs
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Flexible Schedule</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div><strong>Mon:</strong> 9:00 AM - 2:00 PM</div>
                  <div><strong>Wed:</strong> 11:00 AM - 7:00 PM</div>
                  <div><strong>Fri-Sat:</strong> 6:00 PM - 11:00 PM</div>
                  <div className="text-xs text-gray-500 mt-2">
                    Irregular but consistent weekly pattern
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Split Shift Availability</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div><strong>Tue-Thu:</strong> 7:00 AM - 11:00 AM</div>
                  <div><strong>Tue-Thu:</strong> 2:00 PM - 6:00 PM</div>
                  <div className="text-xs text-gray-500 mt-2">
                    Multiple ranges per day for split shifts
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Card className="p-4 border-green-200 bg-green-50">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-green-600 mt-1" />
              <div>
                <h4 className="font-medium text-green-900">Availability Best Practices</h4>
                <ul className="text-sm text-green-800 mt-2 space-y-1">
                  <li>• Be realistic about your actual availability</li>
                  <li>• Include travel time between locations</li>
                  <li>• Update immediately when your schedule changes</li>
                  <li>• Consider your energy levels (don't overcommit)</li>
                  <li>• Communicate special constraints to your manager</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      ),
    },
    {
      id: "managing-team",
      title: "Managing Team Availability",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-gray-600">
              As a manager, you can view and edit availability for your entire team. This helps
              you understand scheduling constraints and make adjustments when business needs require it.
            </p>

            {!perms.canManageSchedule && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-amber-900">Manager Access Required</h3>
                      <p className="text-amber-800 text-sm mt-1">
                        Managing team availability requires manager or administrator permissions.
                        Contact your organization admin if you need access to these features.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">1</div>
                <div>
                  <h4 className="font-medium text-gray-900">Access Team Availability</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Go to the Availability page. As a manager, you'll see a dropdown to select different employees.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">2</div>
                <div>
                  <h4 className="font-medium text-gray-900">Select Employee</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Choose an employee from the dropdown to view and edit their availability settings.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">3</div>
                <div>
                  <h4 className="font-medium text-gray-900">Make Adjustments</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Add new time ranges, edit existing ones, or remove availability as needed for business requirements.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">4</div>
                <div>
                  <h4 className="font-medium text-gray-900">Communicate Changes</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Let employees know if you've changed their availability, especially if it affects their expectations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Common Management Scenarios</h3>

            <div className="space-y-4">
              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">New Employee Setup</h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    When hiring new employees, you may need to set their initial availability.
                  </p>
                  <ol className="text-sm text-gray-600 ml-4 space-y-1">
                    <li>1. Discuss their preferred schedule during hiring</li>
                    <li>2. Set up their availability in the system</li>
                    <li>3. Show them how to update it themselves</li>
                    <li>4. Review and adjust after their first week</li>
                  </ol>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Business Need Overrides</h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Sometimes business needs require scheduling outside normal availability.
                  </p>
                  <ol className="text-sm text-gray-600 ml-4 space-y-1">
                    <li>1. Check if the employee can actually work those hours</li>
                    <li>2. Communicate the need and get agreement</li>
                    <li>3. Use the override option when scheduling</li>
                    <li>4. Consider updating availability if it becomes regular</li>
                  </ol>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Seasonal Adjustments</h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Availability may change with seasons, school schedules, or life changes.
                  </p>
                  <ol className="text-sm text-gray-600 ml-4 space-y-1">
                    <li>1. Check with employees about schedule changes</li>
                    <li>2. Update availability for the new period</li>
                    <li>3. Plan staffing adjustments in advance</li>
                    <li>4. Set reminders to review periodically</li>
                  </ol>
                </div>
              </Card>
            </div>
          </div>

          <Card className="p-4 border-blue-200 bg-blue-50">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-1" />
              <div>
                <h4 className="font-medium text-blue-900">Manager Tips</h4>
                <ul className="text-sm text-blue-800 mt-2 space-y-1">
                  <li>• Regular availability reviews prevent scheduling issues</li>
                  <li>• Encourage employees to keep their availability current</li>
                  <li>• Use availability data for hiring and staffing decisions</li>
                  <li>• Consider offering incentives for flexible availability</li>
                  <li>• Document any permanent availability changes</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      ),
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting & Tips",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Common Issues & Solutions</h3>

            <div className="space-y-4">
              <Card className="p-4 border-red-200 bg-red-50">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-red-900">Problem: Can't Add Time Range</h4>
                    <p className="text-sm text-red-800 mt-1 mb-3">
                      The "Add" button is disabled or doesn't work when trying to set availability.
                    </p>
                    <div className="text-sm text-red-800">
                      <strong>Solutions:</strong>
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>• Check that end time is after start time</li>
                        <li>• Make sure times don't overlap with existing ranges</li>
                        <li>• Try refreshing the page and trying again</li>
                        <li>• Contact support if the issue persists</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-amber-200 bg-amber-50">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-amber-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-amber-900">Problem: Still Getting Scheduled Outside Availability</h4>
                    <p className="text-sm text-amber-800 mt-1 mb-3">
                      Manager is scheduling shifts during times marked as unavailable.
                    </p>
                    <div className="text-sm text-amber-800">
                      <strong>Solutions:</strong>
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>• Confirm your availability was saved correctly</li>
                        <li>• Talk to your manager about the conflict</li>
                        <li>• Understand that managers can override availability</li>
                        <li>• Discuss permanent schedule changes if needed</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-blue-200 bg-blue-50">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-blue-900">Problem: Can't See Other Employees' Availability</h4>
                    <p className="text-sm text-blue-800 mt-1 mb-3">
                      Unable to view or edit team member availability settings.
                    </p>
                    <div className="text-sm text-blue-800">
                      <strong>Solutions:</strong>
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>• Check that you have manager or admin permissions</li>
                        <li>• Ask your organization admin for proper access</li>
                        <li>• Employees can only edit their own availability</li>
                        <li>• Use the employee dropdown if you have access</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Advanced Tips</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Strategic Availability Setting</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>
                    <strong>Buffer Time:</strong> Add 15-30 minutes before/after for preparation and travel
                  </li>
                  <li>
                    <strong>Energy Management:</strong> Don't schedule back-to-back difficult shifts
                  </li>
                  <li>
                    <strong>Consistency:</strong> Try to maintain regular patterns when possible
                  </li>
                  <li>
                    <strong>Flexibility:</strong> Consider offering some flexible hours for coverage needs
                  </li>
                </ul>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Communication Best Practices</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>
                    <strong>Advance Notice:</strong> Update availability changes as soon as you know
                  </li>
                  <li>
                    <strong>Temporary Changes:</strong> Communicate short-term availability changes directly
                  </li>
                  <li>
                    <strong>Reasoning:</strong> Explain constraints to help managers understand
                  </li>
                  <li>
                    <strong>Flexibility:</strong> Be open to occasional exceptions for business needs
                  </li>
                </ul>
              </Card>
            </div>

            <Card className="p-4 border-green-200 bg-green-50">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-medium text-green-900">Availability Success Formula</h4>
                  <div className="text-sm text-green-800 mt-2">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="font-medium">Accurate</div>
                        <div className="text-xs">Reflect real availability</div>
                      </div>
                      <div>
                        <div className="font-medium">Current</div>
                        <div className="text-xs">Update when changes happen</div>
                      </div>
                      <div>
                        <div className="font-medium">Communicated</div>
                        <div className="text-xs">Discuss with your manager</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ),
    },
  ];

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
          <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Availability Management</h1>
            <p className="text-gray-600">
              Set and manage when employees are available to work
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button asChild className="gap-2">
            <Link href="/availability">
              <Clock className="h-4 w-4" />
              Set Availability
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/docs/scheduling">
              <Calendar className="h-4 w-4" />
              Scheduling Guide
            </Link>
          </Button>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="setting-availability">Setting Availability</TabsTrigger>
          <TabsTrigger value="managing-team">Managing Team</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
        </TabsList>

        {availabilityGuide.map((section) => (
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
              <Link href="/docs/scheduling">
                <div className="flex items-center gap-2 w-full">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Schedule Management</span>
                </div>
                <span className="text-sm text-gray-600 text-left">
                  Create schedules with availability data
                </span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 flex-col items-start gap-2">
              <Link href="/docs/time-off">
                <div className="flex items-center gap-2 w-full">
                  <Coffee className="h-4 w-4" />
                  <span className="font-medium">Time Off Management</span>
                </div>
                <span className="text-sm text-gray-600 text-left">
                  Request vacation and sick days
                </span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 flex-col items-start gap-2">
              <Link href="/docs/employees">
                <div className="flex items-center gap-2 w-full">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Employee Management</span>
                </div>
                <span className="text-sm text-gray-600 text-left">
                  Organize your team structure
                </span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}