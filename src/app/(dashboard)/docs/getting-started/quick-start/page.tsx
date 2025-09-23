"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  PlayCircle,
  Users2,
  CalendarDays,
  Clock3,
  UserPlus,
  ArrowRight,
  Timer,
  Target,
  Zap,
  AlertCircle,
  Lightbulb,
  ExternalLink,
} from "lucide-react";
import { useOrg } from "@/components/providers/OrgProvider";
import { usePermissions } from "@/app/hooks/usePermissions";

type QuickStep = {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  action: {
    text: string;
    href: string;
  };
  details: string[];
  important?: string;
};

export default function QuickStartPage() {
  const { role } = useOrg();
  const perms = usePermissions(role);
  const [completedSteps, setCompletedSteps] = React.useState<Set<string>>(new Set());

  const toggleStep = (stepId: string) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const quickSteps: QuickStep[] = [
    {
      id: "add-employees",
      title: "Add 2-3 Employees",
      description: "Start with a small team to test the system",
      estimatedTime: "3 min",
      action: {
        text: "Add Employees",
        href: "/employees",
      },
      details: [
        "Click 'Add employee' button",
        "Enter their name and email",
        "Assign a position (optional)",
        "Save and repeat for 2-3 people"
      ],
      important: "You can add more employees later. Start small to learn the system."
    },
    {
      id: "set-basic-availability",
      title: "Set Basic Availability",
      description: "Configure when your employees can work",
      estimatedTime: "5 min",
      action: {
        text: "Set Availability",
        href: "/availability",
      },
      details: [
        "Go to Availability page",
        "Select each employee",
        "Add time ranges for each day they work",
        "Example: Monday-Friday 9:00 AM to 5:00 PM"
      ],
      important: "Employees can update their own availability later."
    },
    {
      id: "create-first-shifts",
      title: "Create Your First Shifts",
      description: "Schedule work shifts for the current week",
      estimatedTime: "4 min",
      action: {
        text: "Create Shifts",
        href: "/schedule",
      },
      details: [
        "Click 'Add Shift' button",
        "Select employee, date, and time",
        "Set shift duration (e.g., 8 hours)",
        "Save and create 2-3 more shifts"
      ],
      important: "You can drag and drop shifts between employees and days."
    },
    {
      id: "test-time-off",
      title: "Test Time Off Request",
      description: "Submit and approve a test time off request",
      estimatedTime: "2 min",
      action: {
        text: "Time Off",
        href: "/time-off",
      },
      details: [
        "Click 'New request' button",
        "Select future dates",
        "Choose 'Vacation' type",
        "Submit and then approve your own request"
      ],
      important: "This helps you understand the employee experience."
    },
    {
      id: "generate-join-code",
      title: "Create Join Code",
      description: "Generate a code for employees to join",
      estimatedTime: "1 min",
      action: {
        text: "Generate Code",
        href: "/settings/codes",
      },
      details: [
        "Select role (Employee or Manager)",
        "Set max uses (5-10 is good)",
        "Set expiration (24-48 hours)",
        "Generate and copy the code"
      ],
      important: "Share this code with your team via email or message."
    }
  ];

  const completedCount = quickSteps.filter(step => completedSteps.has(step.id)).length;
  const progressPercentage = (completedCount / quickSteps.length) * 100;
  const totalTime = quickSteps.reduce((acc, step) => {
    return acc + parseInt(step.estimatedTime.replace(' min', ''));
  }, 0);

  const canManage = perms.canManageEmployees;

  if (!canManage) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/docs" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Documentation
            </Link>
          </Button>
        </div>

        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-amber-900 mb-2">Admin Access Required</h2>
                <p className="text-amber-800 mb-4">
                  This quick start guide is designed for administrators and managers who need to set up
                  the organization and create schedules.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild variant="outline" className="gap-2">
                    <Link href="/docs/getting-started">
                      <UserPlus className="h-4 w-4" />
                      Employee Getting Started
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="gap-2">
                    <Link href="/docs">
                      Browse All Guides
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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

      {/* Title */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">5-Minute Quick Start</h1>
            <p className="text-gray-600">
              Get your team scheduled in under 5 minutes with this streamlined setup
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{totalTime}</div>
                <div className="text-xs text-blue-700">minutes total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{quickSteps.length}</div>
                <div className="text-xs text-green-700">simple steps</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{completedCount}</div>
                <div className="text-xs text-purple-700">completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{Math.round(progressPercentage)}%</div>
                <div className="text-xs text-orange-700">progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Your Progress</h2>
              <Badge variant={progressPercentage === 100 ? "default" : "secondary"}>
                {completedCount} of {quickSteps.length} steps
              </Badge>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Timer className="h-4 w-4" />
                ~{totalTime} minutes total
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                {progressPercentage === 100 ? "Complete!" : `${quickSteps.length - completedCount} steps remaining`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steps */}
      <div className="space-y-6">
        {quickSteps.map((step, index) => {
          const isCompleted = completedSteps.has(step.id);
          const stepNumber = index + 1;

          return (
            <Card key={step.id} className={`transition-all duration-200 ${
              isCompleted ? 'bg-green-50 border-green-200' : 'hover:shadow-md'
            }`}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Step Header */}
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleStep(step.id)}
                      className="flex-shrink-0 mt-1 hover:scale-110 transition-transform"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      ) : (
                        <div className="relative">
                          <Circle className="h-8 w-8 text-gray-400" />
                          <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-600">
                            {stepNumber}
                          </span>
                        </div>
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className={`text-xl font-semibold ${
                              isCompleted ? 'text-green-900' : 'text-gray-900'
                            }`}>
                              {step.title}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {step.estimatedTime}
                            </Badge>
                          </div>
                          <p className="text-gray-600">{step.description}</p>
                        </div>

                        <Button
                          asChild
                          size="lg"
                          variant={isCompleted ? "outline" : "default"}
                          className="gap-2 flex-shrink-0"
                        >
                          <Link href={step.action.href}>
                            {step.action.text}
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="ml-12 space-y-4">
                    {/* Step Details */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">How to do it:</h4>
                      <ol className="space-y-1">
                        {step.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="text-sm text-gray-600 flex gap-2">
                            <span className="text-blue-600 font-medium flex-shrink-0">
                              {detailIndex + 1}.
                            </span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Important Note */}
                    {step.important && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-sm font-medium text-blue-900">Pro Tip: </span>
                            <span className="text-sm text-blue-800">{step.important}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Completion */}
      {progressPercentage === 100 && (
        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <CardContent className="p-8 text-center">
            <div className="space-y-6">
              <div className="space-y-2">
                <CheckCircle2 className="h-16 w-16 mx-auto" />
                <h2 className="text-3xl font-bold">🎉 You're All Set!</h2>
                <p className="text-green-100 text-lg max-w-md mx-auto">
                  Your organization is now ready for scheduling. Time to put it to work!
                </p>
              </div>

              <Separator className="bg-white/20" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="p-4 bg-white/10 rounded-lg">
                  <CalendarDays className="h-6 w-6 mb-2" />
                  <h3 className="font-semibold mb-1">Create More Schedules</h3>
                  <p className="text-sm text-green-100">Build out schedules for future weeks</p>
                </div>
                <div className="p-4 bg-white/10 rounded-lg">
                  <Users2 className="h-6 w-6 mb-2" />
                  <h3 className="font-semibold mb-1">Invite Your Team</h3>
                  <p className="text-sm text-green-100">Share join codes with all employees</p>
                </div>
                <div className="p-4 bg-white/10 rounded-lg">
                  <Clock3 className="h-6 w-6 mb-2" />
                  <h3 className="font-semibold mb-1">Refine Availability</h3>
                  <p className="text-sm text-green-100">Work with employees to set accurate hours</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" variant="secondary" className="gap-2">
                  <Link href="/schedule">
                    <CalendarDays className="h-5 w-5" />
                    View Your Schedule
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20">
                  <Link href="/docs">
                    <ArrowLeft className="h-5 w-5" />
                    Explore More Guides
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {progressPercentage < 100 && (
        <Card className="border-2 border-dashed border-gray-200">
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <Target className="h-8 w-8 text-gray-400 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keep Going!</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  You're {completedCount} of {quickSteps.length} steps complete.
                  Each step builds on the previous one to get you fully set up.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button asChild variant="outline" className="gap-2">
                  <Link href="/docs/getting-started">
                    <ArrowLeft className="h-4 w-4" />
                    Full Getting Started Guide
                  </Link>
                </Button>
                <Button asChild variant="outline" className="gap-2">
                  <Link href="/help">
                    Get Help
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}