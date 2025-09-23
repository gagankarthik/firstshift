"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  UserCheck,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Users,
  FileText,
  Lightbulb,
  Coffee,
  Heart,
  Briefcase,
  Settings,
} from "lucide-react";
import { usePermissions } from "@/app/hooks/usePermissions";
import { useOrg } from "@/components/providers/OrgProvider";

export default function TimeOffDocsPage() {
  const { role } = useOrg();
  const perms = usePermissions(role);

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
          <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 text-white">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Time Off Management</h1>
            <p className="text-gray-600">
              Request, approve, and manage vacation and sick days
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button asChild className="gap-2">
            <Link href="/time-off">
              <UserCheck className="h-4 w-4" />
              Manage Time Off
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
          <TabsTrigger value="requesting">Requesting Time Off</TabsTrigger>
          <TabsTrigger value="approving">Approving Requests</TabsTrigger>
          <TabsTrigger value="types">Time Off Types</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-600">
                FirstShift's time off system helps manage vacation, sick days, and other leave requests.
                The system integrates with scheduling to prevent conflicts and ensure proper coverage.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 border-blue-200 bg-blue-50">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-medium text-blue-900">For Employees</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Submit time off requests for vacation, sick days, and personal time.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-green-200 bg-green-50">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <h3 className="font-medium text-green-900">For Managers</h3>
                      <p className="text-sm text-green-700 mt-1">
                        Review and approve requests while ensuring adequate coverage.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                  <Coffee className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900">Vacation</h3>
                  <p className="text-sm text-gray-600 mt-1">Planned time off</p>
                </Card>

                <Card className="p-4 text-center">
                  <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900">Sick Leave</h3>
                  <p className="text-sm text-gray-600 mt-1">Health-related absences</p>
                </Card>

                <Card className="p-4 text-center">
                  <Briefcase className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900">Personal</h3>
                  <p className="text-sm text-gray-600 mt-1">Personal matters</p>
                </Card>

                <Card className="p-4 text-center">
                  <Settings className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900">Other</h3>
                  <p className="text-sm text-gray-600 mt-1">Custom categories</p>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requesting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Requesting Time Off</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">How to Submit a Request</h3>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">1</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Navigate to Time Off</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Click "Time Off" in the sidebar to access the time off management page.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">2</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Click "New Request"</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Look for the "New request" button to start creating your time off request.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">3</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Fill Request Details</h4>
                      <div className="mt-2 space-y-2">
                        <div className="text-sm text-gray-600">
                          <strong>Start Date:</strong> First day you'll be off
                        </div>
                        <div className="text-sm text-gray-600">
                          <strong>End Date:</strong> Last day you'll be off
                        </div>
                        <div className="text-sm text-gray-600">
                          <strong>Type:</strong> Vacation, Sick, Personal, or Other
                        </div>
                        <div className="text-sm text-gray-600">
                          <strong>Reason:</strong> Brief explanation (optional but helpful)
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">4</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Submit and Wait</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Submit your request and wait for manager approval. You'll be notified of the decision.
                      </p>
                    </div>
                  </div>
                </div>

                <Card className="p-4 border-green-200 bg-green-50">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-green-900">Request Tips</h4>
                      <ul className="text-sm text-green-800 mt-2 space-y-1">
                        <li>• Submit requests as early as possible</li>
                        <li>• Check with your team about coverage</li>
                        <li>• Be specific about partial days if needed</li>
                        <li>• Include contact info for emergencies</li>
                        <li>• Follow your organization's policies</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approving" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Approving Requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!perms.canApproveTimeOff && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-amber-900">Manager Access Required</h3>
                        <p className="text-amber-800 text-sm mt-1">
                          Approving time off requests requires manager or administrator permissions.
                          Contact your organization admin if you need access to these features.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Approval Process</h3>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">1</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Review Pending Requests</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Check the Time Off page for pending requests that need your approval.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">2</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Check Coverage</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Verify that you have adequate staffing coverage for the requested dates.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">3</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Make Decision</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Click the approve (✓) or deny (✗) button based on business needs and policies.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">4</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Communicate Decision</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        The employee will be notified automatically, but consider discussing complex situations directly.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4 border-green-200 bg-green-50">
                    <h4 className="font-medium text-green-900 mb-3">Approval Considerations</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Adequate coverage available</li>
                      <li>• Request follows policy</li>
                      <li>• Sufficient advance notice</li>
                      <li>• No scheduling conflicts</li>
                      <li>• Business needs are met</li>
                    </ul>
                  </Card>

                  <Card className="p-4 border-red-200 bg-red-50">
                    <h4 className="font-medium text-red-900 mb-3">Denial Reasons</h4>
                    <ul className="text-sm text-red-800 space-y-1">
                      <li>• Insufficient staffing</li>
                      <li>• Busy period/blackout dates</li>
                      <li>• Too many concurrent requests</li>
                      <li>• Policy violations</li>
                      <li>• Insufficient notice given</li>
                    </ul>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Time Off Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-600">
                FirstShift supports different types of time off to help categorize and track various kinds of leave.
              </p>

              <div className="space-y-4">
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <Coffee className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">Vacation</h3>
                      <p className="text-sm text-gray-600 mt-1 mb-3">
                        Planned time off for rest, travel, or personal activities.
                      </p>
                      <div className="text-sm text-gray-600">
                        <strong>Best Practices:</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• Request well in advance</li>
                          <li>• Consider team schedules</li>
                          <li>• Plan for project handoffs</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <Heart className="h-6 w-6 text-red-600 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">Sick Leave</h3>
                      <p className="text-sm text-gray-600 mt-1 mb-3">
                        Time off for illness, medical appointments, or health-related issues.
                      </p>
                      <div className="text-sm text-gray-600">
                        <strong>Best Practices:</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• Submit as soon as possible</li>
                          <li>• Follow notification policies</li>
                          <li>• May require documentation</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <Users className="h-6 w-6 text-purple-600 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">Personal Time</h3>
                      <p className="text-sm text-gray-600 mt-1 mb-3">
                        Time off for personal matters, family events, or other non-vacation activities.
                      </p>
                      <div className="text-sm text-gray-600">
                        <strong>Best Practices:</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• Be specific about needs</li>
                          <li>• Respect others' schedules</li>
                          <li>• Consider timing carefully</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <Settings className="h-6 w-6 text-gray-600 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">Other</h3>
                      <p className="text-sm text-gray-600 mt-1 mb-3">
                        Catch-all category for other types of approved absences.
                      </p>
                      <div className="text-sm text-gray-600">
                        <strong>Examples:</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• Jury duty</li>
                          <li>• Bereavement</li>
                          <li>• Training/education</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-4 border-blue-200 bg-blue-50">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-blue-900">Important Notes</h4>
                    <ul className="text-sm text-blue-800 mt-2 space-y-1">
                      <li>• Each organization may have specific policies for different types</li>
                      <li>• Some types may require additional documentation</li>
                      <li>• Approval criteria may vary by type</li>
                      <li>• Check with your manager about specific requirements</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
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
                  How time off affects scheduling
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
                  Set when you can work
                </span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 flex-col items-start gap-2">
              <Link href="/docs/getting-started">
                <div className="flex items-center gap-2 w-full">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Getting Started</span>
                </div>
                <span className="text-sm text-gray-600 text-left">
                  New to FirstShift? Start here
                </span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}