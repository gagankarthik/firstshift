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
  Users2,
  UserPlus,
  Settings,
  Eye,
  Edit,
  Trash2,
  Shield,
  Info,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  Star,
  Award,
  UserCheck,
} from "lucide-react";
import { usePermissions } from "@/app/hooks/usePermissions";
import { useOrg } from "@/components/providers/OrgProvider";

type GuideSection = {
  id: string;
  title: string;
  content: React.ReactNode;
};

export default function EmployeeDocsPage() {
  const { role } = useOrg();
  const perms = usePermissions(role);

  const addingEmployeesGuide: GuideSection[] = [
    {
      id: "overview",
      title: "Overview",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            Employee management in FirstShift allows you to add team members, assign positions,
            and manage their information. This guide covers everything you need to know about
            managing your team.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 border-blue-200 bg-blue-50">
              <div className="flex items-start gap-3">
                <UserPlus className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-medium text-blue-900">For Administrators</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Add employees, assign positions, manage permissions, and organize your team structure.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-green-200 bg-green-50">
              <div className="flex items-start gap-3">
                <UserCheck className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-medium text-green-900">For Employees</h3>
                  <p className="text-sm text-green-700 mt-1">
                    View your profile, update contact information, and understand your role in the organization.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: "adding-employees",
      title: "Adding Employees",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Method 1: Manual Addition (Recommended for Small Teams)</h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">1</div>
                <div>
                  <h4 className="font-medium text-gray-900">Navigate to Employees Page</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Go to the Employees section in your sidebar or use the quick action from the dashboard.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">2</div>
                <div>
                  <h4 className="font-medium text-gray-900">Click "Add Employee"</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Look for the blue "Add employee" button in the top-right area of the page.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">3</div>
                <div>
                  <h4 className="font-medium text-gray-900">Fill Employee Information</h4>
                  <div className="mt-2 space-y-2">
                    <div className="text-sm text-gray-600">
                      <strong>Full Name:</strong> Employee's complete name as it should appear in schedules
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Email:</strong> Used for notifications and account access (optional but recommended)
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Position:</strong> Select from existing positions or leave unassigned
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">4</div>
                <div>
                  <h4 className="font-medium text-gray-900">Save Employee</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Click "Save" to add the employee to your organization. They will appear in your employee list immediately.
                  </p>
                </div>
              </div>
            </div>

            <Card className="p-4 border-amber-200 bg-amber-50">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-amber-600 mt-1" />
                <div>
                  <h4 className="font-medium text-amber-900">Pro Tips for Adding Employees</h4>
                  <ul className="text-sm text-amber-800 mt-2 space-y-1">
                    <li>• Use consistent name formatting (e.g., "First Last" vs "Last, First")</li>
                    <li>• Double-check email addresses to avoid notification issues</li>
                    <li>• You can always edit employee information later</li>
                    <li>• Consider adding employees in batches if you have many to add</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Method 2: Join Codes (Recommended for Large Teams)</h3>

            <p className="text-gray-600">
              Join codes allow employees to add themselves to your organization. This is more efficient
              for larger teams and ensures employees set up their own profiles correctly.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">1</div>
                <div>
                  <h4 className="font-medium text-gray-900">Generate Join Code</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Go to Settings → Join Codes and create a new code for "Employee" role.
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-2 gap-2">
                    <Link href="/settings/codes">
                      <ArrowRight className="h-3 w-3" />
                      Create Join Code
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">2</div>
                <div>
                  <h4 className="font-medium text-gray-900">Share with Your Team</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Send the join code to your employees via email, text, or your preferred communication method.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">3</div>
                <div>
                  <h4 className="font-medium text-gray-900">Employees Join</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Employees visit the join page, enter the code, and create their own profiles.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "positions-roles",
      title: "Positions & Roles",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-gray-600">
              Positions help organize your team and make scheduling more efficient. They're different
              from user roles (Admin, Manager, Employee) which control permissions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium text-gray-900">Positions</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Job titles or roles within your organization (e.g., Manager, Cashier, Cook, Server)
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Help with scheduling organization</li>
                    <li>• Visual identification with colors</li>
                    <li>• Can be assigned to multiple employees</li>
                    <li>• Optional but highly recommended</li>
                  </ul>
                </div>
              </Card>

              <Card className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <h3 className="font-medium text-gray-900">User Roles</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Permission levels that control what users can do in FirstShift
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>Admin:</strong> Full access to everything</li>
                    <li>• <strong>Manager:</strong> Schedule and approve time off</li>
                    <li>• <strong>Employee:</strong> View schedule, request time off</li>
                  </ul>
                </div>
              </Card>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Creating and Managing Positions</h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">1</div>
                <div>
                  <h4 className="font-medium text-gray-900">Access Position Management</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Positions are created from the Employees page. Look for position-related options in the interface.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">2</div>
                <div>
                  <h4 className="font-medium text-gray-900">Choose Position Details</h4>
                  <div className="mt-2 space-y-2">
                    <div className="text-sm text-gray-600">
                      <strong>Name:</strong> Clear, descriptive title (e.g., "Front Desk Manager", "Kitchen Staff")
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Color:</strong> Pick a unique color for visual identification in schedules
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">3</div>
                <div>
                  <h4 className="font-medium text-gray-900">Assign to Employees</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Once created, you can assign positions to employees from their profile or the main employees list.
                  </p>
                </div>
              </div>
            </div>

            <Card className="p-4 border-blue-200 bg-blue-50">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-medium text-blue-900">Common Position Examples</h4>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-blue-800">
                    <div>• Manager</div>
                    <div>• Assistant Manager</div>
                    <div>• Cashier</div>
                    <div>• Sales Associate</div>
                    <div>• Cook</div>
                    <div>• Server</div>
                    <div>• Kitchen Staff</div>
                    <div>• Cleaning Crew</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: "managing-employees",
      title: "Managing Employee Information",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-gray-600">
              Once employees are added, you can view, edit, and manage their information.
              Here's how to handle common employee management tasks.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">View Information</h3>
                <p className="text-sm text-gray-600 mt-1">
                  See employee details, position, and status
                </p>
              </Card>

              <Card className="p-4 text-center">
                <Edit className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Edit Details</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Update names, positions, and other information
                </p>
              </Card>

              <Card className="p-4 text-center">
                <Settings className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Manage Status</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Activate, deactivate, or remove employees
                </p>
              </Card>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Common Management Tasks</h3>

            <div className="space-y-4">
              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Editing Employee Information</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>1. Find the employee in your employees list</div>
                  <div>2. Click the three-dot menu (⋯) next to their name</div>
                  <div>3. Select "Edit" from the dropdown</div>
                  <div>4. Update any information and save changes</div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Changing Employee Positions</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>1. Go to the Employees page</div>
                  <div>2. Find the Position column for the employee</div>
                  <div>3. Click the dropdown to select a new position</div>
                  <div>4. Changes are saved automatically</div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Deactivating vs. Deleting Employees</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                    <h5 className="font-medium text-yellow-900">Deactivate (Recommended)</h5>
                    <p className="text-sm text-yellow-800 mt-1">
                      Hides from new schedules but preserves historical data and past shifts.
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 rounded border-l-4 border-red-400">
                    <h5 className="font-medium text-red-900">Delete (Permanent)</h5>
                    <p className="text-sm text-red-800 mt-1">
                      Completely removes employee and all associated data. Cannot be undone.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const accessibilityNotice = !perms.canManageEmployees && (
    <Card className="border-amber-200 bg-amber-50 mb-6">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-900">Limited Access</h3>
            <p className="text-amber-800 text-sm mt-1">
              Some features described in this guide require administrator or manager permissions.
              Contact your organization admin if you need access to employee management features.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <Users2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
            <p className="text-gray-600">
              Learn how to add, organize, and manage your team members
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          {perms.canManageEmployees && (
            <Button asChild className="gap-2">
              <Link href="/employees">
                <Users2 className="h-4 w-4" />
                Manage Employees
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" className="gap-2">
            <Link href="/docs/getting-started/quick-start">
              <ArrowRight className="h-4 w-4" />
              Quick Start Guide
            </Link>
          </Button>
        </div>
      </div>

      {accessibilityNotice}

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="adding-employees">Adding Employees</TabsTrigger>
          <TabsTrigger value="positions-roles">Positions & Roles</TabsTrigger>
          <TabsTrigger value="managing-employees">Managing Info</TabsTrigger>
        </TabsList>

        {addingEmployeesGuide.map((section) => (
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
              <Link href="/docs/getting-started/quick-start">
                <div className="flex items-center gap-2 w-full">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Quick Start</span>
                </div>
                <span className="text-sm text-gray-600 text-left">
                  Get your team set up in 5 minutes
                </span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 flex-col items-start gap-2">
              <Link href="/docs/scheduling">
                <div className="flex items-center gap-2 w-full">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Creating Schedules</span>
                </div>
                <span className="text-sm text-gray-600 text-left">
                  Learn to schedule your team
                </span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 flex-col items-start gap-2">
              <Link href="/docs/admin/join-codes">
                <div className="flex items-center gap-2 w-full">
                  <Mail className="h-4 w-4" />
                  <span className="font-medium">Join Codes</span>
                </div>
                <span className="text-sm text-gray-600 text-left">
                  Invite employees to join
                </span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}