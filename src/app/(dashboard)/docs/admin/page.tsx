"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Settings,
  Shield,
  KeyRound,
  Users,
  Building,
  Mail,
  AlertTriangle,
  CheckCircle,
  Info,
  Crown,
  UserCog,
  Clock,
  Calendar,
} from "lucide-react";
import { usePermissions } from "@/app/hooks/usePermissions";
import { useOrg } from "@/components/providers/OrgProvider";

export default function AdminDocsPage() {
  const { role } = useOrg();
  const perms = usePermissions(role);

  const isAdmin = perms.canManageEmployees; // Using this as a proxy for admin access

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
          <div className="p-3 rounded-xl bg-gradient-to-br from-gray-500 to-slate-600 text-white">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
            <p className="text-gray-600">
              Organization settings, user management, and advanced features
            </p>
          </div>
        </div>

        {/* Access Notice */}
        {!isAdmin && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-900">Admin Access Required</h3>
                  <p className="text-amber-800 text-sm mt-1">
                    Most administrative features require administrator permissions.
                    Contact your organization admin if you need access to these features.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          {isAdmin && (
            <>
              <Button asChild className="gap-2">
                <Link href="/settings/codes">
                  <KeyRound className="h-4 w-4" />
                  Join Codes
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/employees">
                  <Users className="h-4 w-4" />
                  Manage Employees
                </Link>
              </Button>
            </>
          )}
          <Button asChild variant="outline" className="gap-2">
            <Link href="/account">
              <Settings className="h-4 w-4" />
              Account Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Admin Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Administrative Overview</CardTitle>
          <CardDescription>
            Understanding roles, permissions, and organization management in FirstShift
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 border-blue-200 bg-blue-50">
              <div className="flex items-start gap-3">
                <Crown className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-medium text-blue-900">Administrator</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Full access to all features, settings, and employee management
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-green-200 bg-green-50">
              <div className="flex items-start gap-3">
                <UserCog className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-medium text-green-900">Manager</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Can create schedules, approve time off, and manage team
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-purple-200 bg-purple-50">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-purple-600 mt-1" />
                <div>
                  <h3 className="font-medium text-purple-900">Employee</h3>
                  <p className="text-sm text-purple-700 mt-1">
                    Can view schedules, set availability, and request time off
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Key Administrative Tasks</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-blue-600" />
                  Join Code Management
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Create and manage codes for employees to join your organization.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Generate role-specific codes</li>
                  <li>• Set expiration dates and usage limits</li>
                  <li>• Track code usage and effectiveness</li>
                </ul>
                {isAdmin && (
                  <Button asChild variant="outline" size="sm" className="mt-3">
                    <Link href="/settings/codes">Manage Join Codes</Link>
                  </Button>
                )}
              </Card>

              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  Employee Management
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Add, organize, and manage your team members and their roles.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Add and remove employees</li>
                  <li>• Assign positions and roles</li>
                  <li>• Manage employee information</li>
                </ul>
                {isAdmin && (
                  <Button asChild variant="outline" size="sm" className="mt-3">
                    <Link href="/employees">Manage Employees</Link>
                  </Button>
                )}
              </Card>

              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Building className="h-4 w-4 text-purple-600" />
                  Organization Settings
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Configure your organization details and preferences.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Update organization information</li>
                  <li>• Set timezone and preferences</li>
                  <li>• Manage locations and positions</li>
                </ul>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link href="/account">Organization Settings</Link>
                </Button>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-orange-600" />
                  Permissions & Security
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Understand and manage user permissions and access levels.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Role-based access control</li>
                  <li>• Feature permissions by role</li>
                  <li>• Security best practices</li>
                </ul>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link href="/docs/admin/permissions">Learn About Permissions</Link>
                </Button>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started for Admins */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Quick Start</CardTitle>
          <CardDescription>
            Essential steps for setting up and managing your FirstShift organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Initial Setup</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">Complete organization profile</div>
                    <div className="text-gray-600">Set name, timezone, and basic information</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">Create job positions</div>
                    <div className="text-gray-600">Define roles like Manager, Cashier, etc.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">Add initial employees</div>
                    <div className="text-gray-600">Start with key team members</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Ongoing Management</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">Generate join codes</div>
                    <div className="text-gray-600">Invite new employees to join</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">Monitor schedules</div>
                    <div className="text-gray-600">Review and approve scheduling</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Settings className="h-4 w-4 text-gray-600 mt-1 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">Regular maintenance</div>
                    <div className="text-gray-600">Update settings and permissions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Common Admin Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Common Administrative Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">How do I add new employees?</h4>
              <p className="text-sm text-gray-600 mb-2">
                You can add employees manually through the Employees page, or generate join codes
                for them to add themselves.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/docs/employees">Employee Management Guide</Link>
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">How do join codes work?</h4>
              <p className="text-sm text-gray-600 mb-2">
                Join codes allow employees to add themselves to your organization. You can set
                expiration dates, usage limits, and role assignments.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/docs/admin/join-codes">Join Codes Guide</Link>
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">What's the difference between roles?</h4>
              <p className="text-sm text-gray-600 mb-2">
                Admins have full access, Managers can create schedules and approve time off,
                and Employees can view schedules and request time off.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/docs/admin/permissions">Permissions Guide</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Related Guides */}
      <Card className="border-dashed border-2 border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Related Guides</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-auto p-4 flex-col items-start gap-2">
              <Link href="/docs/getting-started/quick-start">
                <div className="flex items-center gap-2 w-full">
                  <Settings className="h-4 w-4" />
                  <span className="font-medium">Quick Start</span>
                </div>
                <span className="text-sm text-gray-600 text-left">
                  Get your organization set up fast
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
                  Add and organize your team
                </span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 flex-col items-start gap-2">
              <Link href="/docs/scheduling">
                <div className="flex items-center gap-2 w-full">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Schedule Management</span>
                </div>
                <span className="text-sm text-gray-600 text-left">
                  Master the scheduling system
                </span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}