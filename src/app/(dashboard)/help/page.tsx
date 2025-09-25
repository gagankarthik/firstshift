// app/help/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";
import { useOrg } from "@/components/providers/OrgProvider";
import { toast } from "sonner";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from "@/components/ui/accordion";
import {
  HelpCircle,
  ShieldCheck,
  KeyRound,
  CalendarCheck,
  Users2,
  Clock3,
  Copy,
  Mail,
  BookOpen,
  MessageSquare,
  Bug
} from "lucide-react";

export default function HelpPage() {
  const supabase = React.useMemo(() => createClient(), []);
  const { orgId, role, loading } = useOrg();

  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [faqQuery, setFaqQuery] = React.useState("");

  React.useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data.user?.email ?? null);
      setUserId(data.user?.id ?? null);
    })();
  }, [supabase]);

  const diag = React.useMemo(() => {
    return `FirstShift diagnostics
- user: ${userEmail ?? "unknown"}
- user_id: ${userId ?? "unknown"}
- active_org_id: ${orgId ?? "none"}
- role: ${role ?? "unknown"}`;
  }, [userEmail, userId, orgId, role]);

  function copyDiagnostics() {
    navigator.clipboard
      .writeText(diag)
      .then(() => toast.success("Diagnostics copied"))
      .catch(() => toast.error("Failed to copy"));
  }

  function copyTemplate(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Copied"))
      .catch(() => toast.error("Copy failed"));
  }

  const sampleJoinMessage =
    "Join our FirstShift workspace with this code:\n\nCODE-HERE\n\nOpen the app → Sign in → Join → paste the code.";

  const mailSubject = encodeURIComponent("FirstShift Support");
  const mailBody = encodeURIComponent(`${diag}\n\nDescribe the issue here:\n- What happened?\n- Steps to reproduce:\n- Expected result:\n- Actual result:\n- Browser/OS:`);
  const supportMail = `mailto:support@firstshift.app?subject=${mailSubject}&body=${mailBody}`;

  const faqs = [
    {
      k: "getting-started",
      q: "How do I get started with FirstShift?",
      a: "Start by joining your organization with a join code from your manager, then set your availability and view your schedule. Check the Documentation section for detailed guides."
    },
    {
      k: "roles",
      q: "What are the different roles and their permissions?",
      a: "Admin: Full control over organization, settings, and users. Manager: Create schedules, manage employees, approve time off. Employee: View schedule, set availability, request time off."
    },
    {
      k: "join-code",
      q: "My join code says 'invalid or expired'",
      a: "Contact your admin or manager to generate a fresh code in Settings → Join Codes. Codes can expire or hit usage limits for security."
    },
    {
      k: "schedule-viewing",
      q: "How do I view my schedule?",
      a: "Go to the Schedule page from the sidebar. You can view your shifts by day, week, or month. Click on any shift to see details like break times and location."
    },
    {
      k: "drag-drop",
      q: "Drag and drop isn't working on the schedule",
      a: "Ensure you have the right permissions (Admin/Manager) and aren't overlapping existing shifts. If an employee is unavailable, you'll be prompted to override."
    },
    {
      k: "time-off",
      q: "How do I request time off?",
      a: "Go to Time Off page, click 'Request Time Off', select dates and type (vacation, sick, etc.). Admins and Managers will review and approve/deny your request."
    },
    {
      k: "availability",
      q: "How do I set my availability?",
      a: "Visit the Availability page to add your available time ranges for each day. This helps managers schedule you during times that work best."
    },
    {
      k: "notifications",
      q: "How do I get notified about schedule changes?",
      a: "You'll receive email notifications when your schedule is published or changes are made. Make sure your email is updated in Account settings."
    },
    {
      k: "mobile",
      q: "Can I use FirstShift on my phone?",
      a: "Yes! FirstShift works great on mobile browsers. Simply visit the same URL on your phone and log in with your credentials."
    },
    {
      k: "reports",
      q: "How can I view my work hours and reports?",
      a: "The Reports page shows your worked hours, completed shifts, and time off history. Managers and Admins can see organization-wide analytics."
    },
    {
      k: "troubleshooting",
      q: "What should I do if something isn't working?",
      a: "Try refreshing your browser, signing out and back in, or checking your internet connection. If issues persist, contact support using the diagnostics tool below."
    }
  ];

  const filteredFaqs = faqs.filter(
    f =>
      f.q.toLowerCase().includes(faqQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(faqQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Enhanced gradient header */}
      <div className="rounded-2xl border bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-6 py-8 sm:px-8 shadow-lg">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-md">
                <HelpCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Help &amp; Support Center</h1>
                <p className="text-sm text-slate-600">
                  Everything you need to master FirstShift
                </p>
              </div>
            </div>
            <p className="text-slate-600 max-w-2xl">
              Find answers to common questions, get step-by-step guides, and access support resources to make the most of your workforce management experience.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/docs">
              <Button className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md hover:shadow-lg transition-all">
                <BookOpen className="h-4 w-4" />
                Documentation
              </Button>
            </Link>
            <Link href="/settings/codes">
              <Button variant="outline" className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
                <KeyRound className="h-4 w-4" />
                Join codes
              </Button>
            </Link>
            <Link href="/schedule">
              <Button variant="outline" className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                <CalendarCheck className="h-4 w-4" />
                View schedule
              </Button>
            </Link>
          </div>
        </header>
      </div>

      {/* Quick help cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              Roles &amp; permissions
            </CardTitle>
            <CardDescription>What each role can do</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            <ul className="space-y-2">
              <li className="flex items-center">
                <Badge className="mr-2">Admin</Badge>
                <span>Full access to org, settings, join codes.</span>
              </li>
              <li className="flex items-center">
                <Badge variant="secondary" className="mr-2">
                  Manager
                </Badge>
                <span>Create/edit schedules, approve time off, manage team.</span>
              </li>
              <li className="flex items-center">
                <Badge variant="outline" className="mr-2">
                  Employee
                </Badge>
                <span>View schedules, set availability, request time off.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-teal-600" />
              Join with a code
            </CardTitle>
            <CardDescription>No email invites required</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <ol className="list-inside list-decimal space-y-1">
              <li>
                Go to <span className="font-medium">Join</span> in the app
              </li>
              <li>Paste the code you received</li>
              <li>
                Click <span className="font-medium">Join</span>
              </li>
            </ol>
            <div className="flex items-center gap-2">
              <Input readOnly value="CODE-HERE" className="font-mono" aria-label="Example code" />
              <Button
                variant="outline"
                onClick={() => copyTemplate(sampleJoinMessage)}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy message
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-teal-600" />
              Time off &amp; availability
            </CardTitle>
            <CardDescription>Where to find them</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link href="/time-off">
              <Button variant="outline" size="sm">
                Time off
              </Button>
            </Link>
            <Link href="/availability">
              <Button variant="outline" size="sm">
                Availability
              </Button>
            </Link>
            <Link href="/schedule">
              <Button variant="outline" size="sm">
                Schedule
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* FAQ with search */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle>FAQ</CardTitle>
              <CardDescription>Common questions answered</CardDescription>
            </div>
            <div className="relative w-full sm:w-[320px]">
              <Input
                placeholder="Search FAQs…"
                value={faqQuery}
                onChange={(e) => setFaqQuery(e.target.value)}
                aria-label="Search FAQs"
                className="pl-3"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredFaqs.length === 0 ? (
            <div className="rounded-lg border bg-slate-50 px-4 py-6 text-center text-sm text-gray-600">
              No results. Try a different term.
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((f) => (
                <AccordionItem key={f.k} value={f.k}>
                  <AccordionTrigger>{f.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Troubleshooting / Support */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
            <CardDescription>Quick steps to resolve issues</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <ul className="list-inside list-disc space-y-1">
              <li>Refresh your browser tab (Ctrl/Cmd + R)</li>
              <li>Sign out and sign back in</li>
              <li>Ensure your active organization is correct</li>
              <li>Check that your role has the required permission</li>
            </ul>
            <Separator />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="gap-2" onClick={copyDiagnostics}>
                <Copy className="h-4 w-4" /> Copy diagnostics
              </Button>
              <Link href="/settings">
                <Button variant="outline">Open Settings</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Contact &amp; Resources</CardTitle>
            <CardDescription>Reach us and learn more</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-lg border bg-white p-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-teal-600" />
                <div>
                  <div className="text-sm font-medium">Product guide</div>
                  <div className="text-xs text-gray-500">How-to articles &amp; tips</div>
                </div>
              </div>
              <Link href="/help" className="text-sm underline">
                Open
              </Link>
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-white p-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-teal-600" />
                <div>
                  <div className="text-sm font-medium">Community &amp; feedback</div>
                  <div className="text-xs text-gray-500">Share ideas and ask questions</div>
                </div>
              </div>
              <a href="mailto:support@firstshift.app" className="text-sm underline">
                Contact
              </a>
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-white p-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-teal-600" />
                <div>
                  <div className="text-sm font-medium">Email support</div>
                  <div className="text-xs text-gray-500">We’ll respond promptly</div>
                </div>
              </div>
              <a href={supportMail} className="text-sm underline">
                support@firstshift.app
              </a>
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-white p-3">
              <div className="flex items-center gap-2">
                <Bug className="h-4 w-4 text-teal-600" />
                <div>
                  <div className="text-sm font-medium">Report a bug</div>
                  <div className="text-xs text-gray-500">Include diagnostics for faster help</div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  copyTemplate(
                    `Bug report\n\n${diag}\n\nWhat happened?\nSteps to reproduce:\n1.\n2.\n3.\nExpected result:\nActual result:\nBrowser/OS:`
                  )
                }
              >
                Copy template
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer note */}
      <p className="text-xs text-gray-500">
        {loading ? "Checking your organization…" : `Active org: ${orgId ?? "none"} · Role: ${role ?? "unknown"}`}
      </p>
    </div>
  );
}
