"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Users2,
  CalendarDays,
  Clock3,
  UserCheck,
  Settings,
  Search,
  PlayCircle,
  ArrowRight,
  Star,
  Shield,
  Zap,
  HelpCircle,
  ChevronRight,
  FileText,
  Video,
  LifeBuoy,
} from "lucide-react";
import { useOrg } from "@/components/providers/OrgProvider";
import { usePermissions } from "@/app/hooks/usePermissions";

type GuideCategory = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  guides: Guide[];
  color: string;
};

type Guide = {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  href: string;
  popular?: boolean;
  new?: boolean;
};

export default function DocsPage() {
  const { role } = useOrg();
  const perms = usePermissions(role);
  const [searchQuery, setSearchQuery] = React.useState("");

  const categories: GuideCategory[] = [
    {
      id: "getting-started",
      title: "Getting Started",
      description: "Essential guides to get you up and running quickly",
      icon: <PlayCircle className="h-6 w-6" />,
      color: "from-blue-500 to-cyan-500",
      guides: [
        {
          id: "quick-start",
          title: "Quick Start Guide",
          description: "Get your team scheduled in under 10 minutes",
          duration: "5 min",
          difficulty: "Beginner",
          href: "/docs/getting-started/quick-start",
          popular: true,
        },
        {
          id: "account-setup",
          title: "Account & Organization Setup",
          description: "Set up your organization and invite team members",
          duration: "8 min",
          difficulty: "Beginner",
          href: "/docs/getting-started/account-setup",
        },
        {
          id: "join-organization",
          title: "Joining an Organization",
          description: "How to join your workplace using a join code",
          duration: "3 min",
          difficulty: "Beginner",
          href: "/docs/getting-started/join-organization",
        },
      ],
    },
    {
      id: "employee-management",
      title: "Employee Management",
      description: "Manage your team members and their information",
      icon: <Users2 className="h-6 w-6" />,
      color: "from-green-500 to-emerald-500",
      guides: [
        {
          id: "adding-employees",
          title: "Adding & Managing Employees",
          description: "Add team members and assign positions",
          duration: "6 min",
          difficulty: "Beginner",
          href: "/docs/employees/adding-employees",
          popular: true,
        },
        {
          id: "positions-roles",
          title: "Positions & Roles",
          description: "Create job positions and manage permissions",
          duration: "8 min",
          difficulty: "Intermediate",
          href: "/docs/employees/positions-roles",
        },
        {
          id: "employee-profiles",
          title: "Employee Profiles",
          description: "Manage employee information and settings",
          duration: "4 min",
          difficulty: "Beginner",
          href: "/docs/employees/profiles",
        },
      ],
    },
    {
      id: "scheduling",
      title: "Schedule Management",
      description: "Create and manage employee schedules",
      icon: <CalendarDays className="h-6 w-6" />,
      color: "from-purple-500 to-pink-500",
      guides: [
        {
          id: "creating-schedules",
          title: "Creating Schedules",
          description: "Learn the drag-and-drop scheduling interface",
          duration: "10 min",
          difficulty: "Beginner",
          href: "/docs/scheduling/creating-schedules",
          popular: true,
        },
        {
          id: "shift-management",
          title: "Shift Management",
          description: "Edit, copy, and manage individual shifts",
          duration: "7 min",
          difficulty: "Intermediate",
          href: "/docs/scheduling/shift-management",
        },
        {
          id: "conflict-resolution",
          title: "Handling Conflicts",
          description: "Resolve scheduling conflicts and availability issues",
          duration: "6 min",
          difficulty: "Intermediate",
          href: "/docs/scheduling/conflict-resolution",
        },
        {
          id: "schedule-templates",
          title: "Schedule Templates",
          description: "Create and use recurring schedule patterns",
          duration: "8 min",
          difficulty: "Advanced",
          href: "/docs/scheduling/templates",
          new: true,
        },
      ],
    },
    {
      id: "availability",
      title: "Availability Management",
      description: "Set and manage when employees are available to work",
      icon: <Clock3 className="h-6 w-6" />,
      color: "from-orange-500 to-red-500",
      guides: [
        {
          id: "setting-availability",
          title: "Setting Availability",
          description: "How employees can set their available hours",
          duration: "5 min",
          difficulty: "Beginner",
          href: "/docs/availability/setting-availability",
        },
        {
          id: "managing-team-availability",
          title: "Managing Team Availability",
          description: "View and edit availability for your team",
          duration: "6 min",
          difficulty: "Intermediate",
          href: "/docs/availability/managing-team",
        },
        {
          id: "availability-rules",
          title: "Availability Rules & Overrides",
          description: "Advanced availability management features",
          duration: "8 min",
          difficulty: "Advanced",
          href: "/docs/availability/rules-overrides",
        },
      ],
    },
    {
      id: "time-off",
      title: "Time Off Management",
      description: "Handle vacation requests and time off approvals",
      icon: <UserCheck className="h-6 w-6" />,
      color: "from-teal-500 to-blue-500",
      guides: [
        {
          id: "requesting-time-off",
          title: "Requesting Time Off",
          description: "How employees can request vacation and sick days",
          duration: "4 min",
          difficulty: "Beginner",
          href: "/docs/time-off/requesting",
        },
        {
          id: "approving-requests",
          title: "Approving Time Off Requests",
          description: "Review and approve time off requests",
          duration: "5 min",
          difficulty: "Intermediate",
          href: "/docs/time-off/approving",
        },
        {
          id: "time-off-policies",
          title: "Time Off Policies",
          description: "Set up and manage time off policies",
          duration: "10 min",
          difficulty: "Advanced",
          href: "/docs/time-off/policies",
        },
      ],
    },
    {
      id: "administration",
      title: "Administration",
      description: "Organization settings and advanced features",
      icon: <Settings className="h-6 w-6" />,
      color: "from-gray-500 to-slate-600",
      guides: [
        {
          id: "organization-settings",
          title: "Organization Settings",
          description: "Configure your organization preferences",
          duration: "7 min",
          difficulty: "Intermediate",
          href: "/docs/admin/organization-settings",
        },
        {
          id: "user-permissions",
          title: "User Permissions & Roles",
          description: "Understand and manage user permissions",
          duration: "9 min",
          difficulty: "Advanced",
          href: "/docs/admin/permissions",
        },
        {
          id: "join-codes",
          title: "Join Codes & Invitations",
          description: "Invite new users to your organization",
          duration: "5 min",
          difficulty: "Intermediate",
          href: "/docs/admin/join-codes",
        },
      ],
    },
  ];

  // Filter categories and guides based on user permissions
  const filteredCategories = categories.map(category => {
    let filteredGuides = category.guides;

    // Filter based on user role
    if (category.id === "administration" && !perms.canManageEmployees) {
      filteredGuides = filteredGuides.filter(guide =>
        guide.id === "join-codes" || guide.id === "user-permissions"
      );
    }

    if (category.id === "employee-management" && !perms.canManageEmployees) {
      filteredGuides = filteredGuides.filter(guide =>
        guide.id === "employee-profiles"
      );
    }

    // Filter based on search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredGuides = filteredGuides.filter(guide =>
        guide.title.toLowerCase().includes(query) ||
        guide.description.toLowerCase().includes(query)
      );
    }

    return {
      ...category,
      guides: filteredGuides,
    };
  }).filter(category => category.guides.length > 0);

  const allGuides = categories.flatMap(cat => cat.guides);
  const popularGuides = allGuides.filter(guide => guide.popular);

  const getDifficultyColor = (difficulty: Guide["difficulty"]) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            <BookOpen className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Documentation</h1>
            <p className="text-gray-600 mt-1">Learn how to make the most of FirstShift</p>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search guides..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Quick Start Banner */}
      {!searchQuery && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    New to FirstShift?
                  </Badge>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Get started in minutes
                </h2>
                <p className="text-gray-600 mb-4">
                  Follow our quick start guide to set up your team and create your first schedule.
                  Perfect for new users and administrators.
                </p>
                <Button asChild className="gap-2">
                  <Link href="/docs/getting-started/quick-start">
                    <PlayCircle className="h-4 w-4" />
                    Start Quick Guide
                  </Link>
                </Button>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">5</div>
                  <div className="text-sm text-gray-600">minute setup</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Guides */}
      {!searchQuery && popularGuides.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-900">Popular Guides</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularGuides.map((guide) => (
              <Card key={guide.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-gray-900 leading-tight">
                        {guide.title}
                      </h3>
                      <Badge variant="outline" className={getDifficultyColor(guide.difficulty)}>
                        {guide.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{guide.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{guide.duration}</span>
                      <Button asChild variant="ghost" size="sm" className="gap-1 h-8">
                        <Link href={guide.href}>
                          Read
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Guide Categories */}
      <div className="space-y-8">
        {searchQuery && (
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900">
              Search Results for "{searchQuery}"
            </h2>
          </div>
        )}

        {filteredCategories.map((category) => (
          <div key={category.id} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${category.color} text-white`}>
                {category.icon}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{category.title}</h2>
                <p className="text-gray-600">{category.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.guides.map((guide) => (
                <Card key={guide.id} className="hover:shadow-md transition-shadow group">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {guide.title}
                            </h3>
                            {guide.new && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{guide.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getDifficultyColor(guide.difficulty)}>
                            {guide.difficulty}
                          </Badge>
                          <span className="text-xs text-gray-500">{guide.duration}</span>
                        </div>
                        <Button asChild variant="ghost" size="sm" className="gap-1 h-8">
                          <Link href={guide.href}>
                            Read
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {searchQuery && filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No guides found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search terms or browse our categories below.
          </p>
          <Button
            variant="outline"
            onClick={() => setSearchQuery("")}
            className="gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            Browse All Guides
          </Button>
        </div>
      )}

      {/* Footer Help */}
      <Card className="border-dashed border-2 border-gray-200">
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <LifeBuoy className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">Still need help?</h3>
            </div>
            <p className="text-gray-600 max-w-md mx-auto">
              Can't find what you're looking for? Our support team is here to help you get the most out of FirstShift.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild variant="outline" className="gap-2">
                <Link href="/help">
                  <HelpCircle className="h-4 w-4" />
                  Contact Support
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/docs/getting-started/quick-start">
                  <Video className="h-4 w-4" />
                  Watch Video Tutorials
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}