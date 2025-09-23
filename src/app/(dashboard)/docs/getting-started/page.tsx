"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  PlayCircle,
  Users2,
  CalendarDays,
  Clock3,
  UserCheck,
  ArrowRight,
  ExternalLink,
  Lightbulb,
  Timer,
  Target,
  Zap,
} from "lucide-react";
import { useOrg } from "@/components/providers/OrgProvider";
import { usePermissions } from "@/app/hooks/usePermissions";

type Step = {
  id: string;
  title: string;
  description: string;
  duration: string;
  action?: {
    text: string;
    href: string;
    external?: boolean;
  };
  tips?: string[];
  completed?: boolean;
};

export default function GettingStartedPage() {
  const { role, orgId } = useOrg();
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

  const adminSteps: Step[] = [
    {
      id: "verify-org",
      title: "Verify Your Organization Setup",
      description: "Make sure your organization information is correct and complete",
      duration: "2 min",
      action: {
        text: "Check Organization Settings",
        href: "/account",
      },
      tips: [
        "Update your organization name and details",
        "Set your timezone for accurate scheduling",
        "Upload a logo to personalize your workspace"
      ],
    },
    {
      id: "add-employees",
      title: "Add Your First Employees",
      description: "Start building your team by adding employee profiles",
      duration: "5 min",
      action: {
        text: "Add Employees",
        href: "/employees",
      },
      tips: [
        "You can add employees manually or use join codes",
        "Assign positions to organize your team",
        "Employee photos help with quick identification"
      ],
    },
    {
      id: "create-positions",
      title: "Set Up Job Positions",
      description: "Define the different roles and positions in your organization",
      duration: "3 min",
      action: {
        text: "Manage Positions",
        href: "/employees",
      },
      tips: [
        "Use different colors for easy visual identification",
        "Common positions: Manager, Cashier, Cook, Server",
        "You can edit positions anytime"
      ],
    },
    {
      id: "set-availability",
      title: "Configure Employee Availability",
      description: "Set when your employees are available to work",
      duration: "10 min",
      action: {
        text: "Set Availability",
        href: "/availability",
      },
      tips: [
        "Employees can set their own availability",
        "You can override availability as needed",
        "Set recurring patterns for regular schedules"
      ],
    },
    {
      id: "create-schedule",
      title: "Create Your First Schedule",
      description: "Use the drag-and-drop interface to create shifts",
      duration: "8 min",
      action: {
        text: "Build Schedule",
        href: "/schedule",
      },
      tips: [
        "Drag shifts between employees and days",
        "System will warn about conflicts",
        "Start with simple 8-hour shifts"
      ],
    },
    {
      id: "generate-join-code",
      title: "Generate Join Codes",
      description: "Create codes for employees to join your organization",
      duration: "2 min",
      action: {
        text: "Create Join Codes",
        href: "/settings/codes",
      },
      tips: [
        "Set expiration dates for security",
        "Different codes for different roles",
        "Share codes via email or message"
      ],
    },
  ];

  const employeeSteps: Step[] = [
    {
      id: "join-org",
      title: "Join Your Organization",
      description: "Use the join code provided by your manager to access your workplace",
      duration: "2 min",
      action: {
        text: "Join Organization",
        href: "/join",
      },
      tips: [
        "Ask your manager for the join code",
        "Make sure you're using the correct code",
        "Contact support if you have issues"
      ],
    },
    {
      id: "complete-profile",
      title: "Complete Your Profile",
      description: "Add your personal information and upload a photo",
      duration: "3 min",
      action: {
        text: "Update Profile",
        href: "/account",
      },
      tips: [
        "Upload a clear profile photo",
        "Keep your contact information current",
        "Set your notification preferences"
      ],
    },
    {
      id: "set-availability",
      title: "Set Your Availability",
      description: "Let your manager know when you're available to work",
      duration: "5 min",
      action: {
        text: "Set Availability",
        href: "/availability",
      },
      tips: [
        "Be accurate with your available hours",
        "Update regularly if your schedule changes",
        "Include break preferences if possible"
      ],
    },
    {
      id: "view-schedule",
      title: "Check Your Schedule",
      description: "View your upcoming shifts and work schedule",
      duration: "2 min",
      action: {
        text: "View Schedule",
        href: "/schedule",
      },
      tips: [
        "Check for any scheduling conflicts",
        "Note shift times and locations",
        "Set up notifications for reminders"
      ],
    },
    {
      id: "request-time-off",
      title: "Learn Time Off Process",
      description: "Understand how to request vacation and sick days",
      duration: "3 min",
      action: {
        text: "Time Off Requests",
        href: "/time-off",
      },
      tips: [
        "Submit requests well in advance",
        "Provide clear reasons for time off",
        "Check approval status regularly"
      ],
    },
  ];

  const steps = perms.canManageEmployees ? adminSteps : employeeSteps;
  const completedCount = steps.filter(step => completedSteps.has(step.id)).length;
  const progressPercentage = (completedCount / steps.length) * 100;

  const isAdmin = perms.canManageEmployees;
  const totalEstimatedTime = steps.reduce((acc, step) => {
    const minutes = parseInt(step.duration.replace(' min', ''));
    return acc + minutes;
  }, 0);

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
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            <PlayCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Getting Started Guide</h1>
            <p className="text-gray-600">
              {isAdmin ? "Set up your organization and get your team scheduled" : "Get familiar with FirstShift and join your team"}
            </p>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="h-5 w-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Your Progress</h2>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Completed steps</span>
                    <span className="font-medium text-gray-900">{completedCount} of {steps.length}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      Estimated time: {totalEstimatedTime} minutes
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {progressPercentage === 100 ? "Complete!" : `${Math.round(progressPercentage)}% done`}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">{completedCount}</div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-gray-400">{steps.length - completedCount}</div>
                  <div className="text-xs text-gray-600">Remaining</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Badge */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="gap-2">
          {isAdmin ? (
            <>
              <Users2 className="h-3 w-3" />
              Administrator Guide
            </>
          ) : (
            <>
              <UserCheck className="h-3 w-3" />
              Employee Guide
            </>
          )}
        </Badge>
        <span className="text-sm text-gray-500">
          Customized for your role and permissions
        </span>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
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
                      className="flex-shrink-0 mt-1"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <Circle className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-500">Step {stepNumber}</span>
                            <Badge variant="outline" className="text-xs">
                              {step.duration}
                            </Badge>
                          </div>
                          <h3 className={`text-lg font-semibold mt-1 ${
                            isCompleted ? 'text-green-900' : 'text-gray-900'
                          }`}>
                            {step.title}
                          </h3>
                          <p className="text-gray-600 mt-1">{step.description}</p>
                        </div>

                        {step.action && (
                          <Button
                            asChild
                            variant={isCompleted ? "outline" : "default"}
                            className="gap-2 flex-shrink-0"
                          >
                            <Link href={step.action.href}>
                              {step.action.text}
                              {step.action.external ? (
                                <ExternalLink className="h-4 w-4" />
                              ) : (
                                <ArrowRight className="h-4 w-4" />
                              )}
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tips */}
                  {step.tips && step.tips.length > 0 && (
                    <div className="ml-10 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-900 mb-2">Pro Tips</h4>
                          <ul className="space-y-1">
                            {step.tips.map((tip, tipIndex) => (
                              <li key={tipIndex} className="text-sm text-blue-800">
                                • {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Completion Message */}
      {progressPercentage === 100 && (
        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <CheckCircle2 className="h-12 w-12 mx-auto" />
              <h2 className="text-2xl font-bold">🎉 Congratulations!</h2>
              <p className="text-green-100 max-w-md mx-auto">
                You've completed the getting started guide. You're now ready to make the most of FirstShift!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                <Button asChild variant="secondary" className="gap-2">
                  <Link href={isAdmin ? "/schedule" : "/availability"}>
                    {isAdmin ? (
                      <>
                        <CalendarDays className="h-4 w-4" />
                        Start Scheduling
                      </>
                    ) : (
                      <>
                        <Clock3 className="h-4 w-4" />
                        Set Availability
                      </>
                    )}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20">
                  <Link href="/docs">
                    <ArrowLeft className="h-4 w-4" />
                    Browse More Guides
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {progressPercentage < 100 && (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">What's Next?</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Continue working through the steps above to get your {isAdmin ? "organization" : "profile"} fully set up.
                Each step builds on the previous one.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button asChild variant="outline" className="gap-2">
                  <Link href="/docs">
                    Browse All Guides
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