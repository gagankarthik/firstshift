// app/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  CalendarCheck,
  Users2,
  Clock3,
  LayoutDashboard,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Workflow,
  KeyRound,
  Radio,
  Menu,
} from "lucide-react";

/**
 * ✨ Color direction (no Tailwind config required):
 * - Primaries: indigo & fuchsia
 * - Accents: sky & amber
 * - Neutral base: slate
 *
 * We use gradients + soft tints, high contrast buttons, and consistent icon tinting.
 */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50 to-fuchsia-50 text-slate-900">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Callouts />
        <CTA />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

/* ----------------------- Header ----------------------- */
function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="FirstShift" width={136} height={36} />
        </Link>

        <nav className="ml-6 hidden items-center gap-6 text-sm text-slate-600 md:flex">
          <a href="#features" className="hover:text-slate-900">Features</a>
          <a href="#how" className="hover:text-slate-900">How it works</a>
          <a href="#faq" className="hover:text-slate-900">FAQ</a>
          <a href="#contact" className="hover:text-slate-900">Contact</a>
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Link href="/auth/login">
            <Button variant="outline">Sign in</Button>
          </Link>
          <Link href="/auth/signup">
            <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow hover:opacity-95">
              Get started free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Mobile menu */}
        <div className="ml-auto md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="mt-6 space-y-4">
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full">Sign in</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="w-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white hover:opacity-95">Get started</Button>
                </Link>
                <Separator />
                <nav className="grid gap-3 text-sm">
                  <a href="#features" className="hover:text-slate-900">Features</a>
                  <a href="#how" className="hover:text-slate-900">How it works</a>
                  <a href="#faq" className="hover:text-slate-900">FAQ</a>
                  <a href="#contact" className="hover:text-slate-900">Contact</a>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

/* ----------------------- Hero ----------------------- */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* soft decorative blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-1/2 top-0 h-[40rem] w-[40rem] rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute -right-1/3 top-10 h-[30rem] w-[30rem] rounded-full bg-fuchsia-200/50 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-14 md:py-20 lg:py-24 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <Badge className="mb-4 border border-indigo-200 bg-indigo-50 text-indigo-700">
            <Sparkles className="mr-1 h-3.5 w-3.5" /> New: Join codes & realtime
          </Badge>
          <h1 className="text-3xl font-semibold leading-tight sm:text-5xl">
            Schedule your team in minutes. <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">No chaos.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            Drag-and-drop shifts, employee availability, time off approvals, and
            realtime updates — all secured per organization with role-based access.
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/auth/signup">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-lg hover:opacity-95">
                Start free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                See features
              </Button>
            </a>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 text-left sm:grid-cols-4">
            {[
              { icon: <LayoutDashboard className="h-4 w-4" />, k: "Unified dashboard" },
              { icon: <Radio className="h-4 w-4" />, k: "Realtime updates" },
              { icon: <ShieldCheck className="h-4 w-4" />, k: "Org-wide RLS security" },
              { icon: <KeyRound className="h-4 w-4" />, k: "Join codes (no invites)" },
            ].map((f) => (
              <div key={f.k} className="flex items-center gap-2 rounded-xl border bg-white/80 px-3 py-2">
                <span className="text-indigo-600">{f.icon}</span>
                <span className="text-sm">{f.k}</span>
              </div>
            ))}
          </div>

          {/* UI mock */}
          <div className="mx-auto mt-10 w-full max-w-4xl rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="font-semibold">Week of Mon</div>
              <Badge variant="outline" className="gap-1 border-fuchsia-200 text-fuchsia-700">
                <Radio className="h-3.5 w-3.5" /> Live
              </Badge>
            </div>
            <div className="grid grid-cols-7 gap-2 text-[11px] text-slate-500">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="rounded-lg border bg-slate-50 px-2 py-1 text-center">{d}</div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="min-h-[96px] rounded-lg border border-dashed p-2">
                  {i % 2 === 0 ? (
                    <div className="rounded-lg border-l-4 border-indigo-500 bg-white px-2 py-1 text-xs shadow-sm">
                      9:00–17:00 <span className="ml-1 rounded bg-indigo-50 px-1 text-[10px] text-indigo-700">Barista</span>
                    </div>
                  ) : (
                    <div className="rounded-lg border-l-4 border-fuchsia-500 bg-white px-2 py-1 text-xs shadow-sm">
                      12:00–20:00 <span className="ml-1 rounded bg-fuchsia-50 px-1 text-[10px] text-fuchsia-700">Cashier</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-slate-500">Drag shifts to move them</div>
              <Link href="/schedule">
                <Button size="sm" variant="outline" className="gap-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                  Open schedule <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------- Features ----------------------- */
function Features() {
  const cards = [
    {
      title: "Drag-and-drop schedule",
      desc: "Assign, move, and resize shifts across a weekly grid with conflict checks.",
      icon: CalendarCheck,
      link: "/schedule",
      points: ["Weekly grid", "Conflicts guard", "Publish when ready"],
      ring: "ring-indigo-200",
      tint: "text-indigo-600 bg-indigo-50",
    },
    {
      title: "Employee availability",
      desc: "Employees set their hours; managers schedule with live availability.",
      icon: Users2,
      link: "/availability",
      points: ["Self-serve availability", "Manager override", "Org-scoped"],
      ring: "ring-fuchsia-200",
      tint: "text-fuchsia-600 bg-fuchsia-50",
    },
    {
      title: "Time off requests",
      desc: "Employees request; managers approve/deny. Schedule updates instantly.",
      icon: Clock3,
      link: "/time-off",
      points: ["Types & reasons", "Approve / deny", "Realtime status"],
      ring: "ring-sky-200",
      tint: "text-sky-600 bg-sky-50",
    },
    {
      title: "Roles & join codes",
      desc: "Admin, manager, employee permissions with secure join codes.",
      icon: ShieldCheck,
      link: "/settings/codes",
      points: ["No invites", "Expiry / usage limits", "Auto-create employee"],
      ring: "ring-amber-200",
      tint: "text-amber-600 bg-amber-50",
    },
    {
      title: "Realtime everything",
      desc: "Shifts, approvals, availability sync instantly across devices.",
      icon: Zap,
      link: "/dashboard",
      points: ["Postgres changes", "Typed channels", "Optimistic UI"],
      ring: "ring-indigo-200",
      tint: "text-indigo-600 bg-indigo-50",
    },
    {
      title: "One simple dashboard",
      desc: "KPIs, coverage, and upcoming shifts with quick actions and filters.",
      icon: LayoutDashboard,
      link: "/dashboard",
      points: ["Coverage by day", "Open shifts", "Pending time off"],
      ring: "ring-fuchsia-200",
      tint: "text-fuchsia-600 bg-fuchsia-50",
    },
  ];

  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-semibold sm:text-4xl">Everything you need to schedule like a pro</h2>
        <p className="mt-3 text-slate-600">Built for growing teams and multi-location businesses. Secure by design with per-organization access.</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.title} className={`bg-white ring-1 ${c.ring}`}>
              <CardHeader className="pb-2">
                <div className={`flex items-center gap-2 ${c.tint.split(" ")[0]}`}>
                  <span className={`grid h-8 w-8 place-items-center rounded-full ${c.tint}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <CardTitle className="text-base text-slate-900">{c.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-slate-600">{c.desc}</p>
                <ul className="mt-3 space-y-1 text-sm">
                  {c.points.map((p) => (
                    <li key={p} className="flex items-center gap-2">
                      <CheckCircle2 className={`h-4 w-4 ${c.tint.split(" ")[0]}`} />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  <Link href={c.link}>
                    <Button variant="outline" className="gap-2">
                      Explore <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

/* ----------------------- How it works ----------------------- */
function HowItWorks() {
  const steps = [
    { k: "Create your org", d: "Sign up and create an organization. You’re the admin." },
    { k: "Share a join code", d: "Generate role-based codes for managers or employees." },
    { k: "Go live", d: "Drag-and-drop shifts, approve time off, and watch updates in realtime." },
  ];
  return (
    <section id="how" className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <Badge className="border border-indigo-200 bg-indigo-50 text-indigo-700">3 steps</Badge>
          <h2 className="mt-3 text-2xl font-semibold sm:text-4xl">From zero to scheduled</h2>
          <p className="mt-2 text-slate-600">No email invites required. Codes work anywhere you can paste text.</p>
          <ol className="mt-4 space-y-3">
            {steps.map((s, i) => (
              <li key={s.k} className="flex items-start gap-3">
                <div className="mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-fuchsia-50 text-sm font-semibold text-fuchsia-700">
                  {i + 1}
                </div>
                <div>
                  <div className="font-medium">{s.k}</div>
                  <div className="text-sm text-slate-600">{s.d}</div>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex gap-2">
            <Link href="/auth/signup">
              <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow hover:opacity-95">
                Get started free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/settings/codes">
              <Button variant="outline" className="border-fuchsia-200 text-fuchsia-700 hover:bg-fuchsia-50">Generate a code</Button>
            </Link>
          </div>
        </div>

        {/* visual mock */}
        <div className="relative rounded-2xl border bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-semibold">Week of Mon</div>
            <Badge variant="outline" className="gap-1 border-indigo-200 text-indigo-700">
              <Radio className="h-3.5 w-3.5" /> Live
            </Badge>
          </div>
          <div className="grid grid-cols-7 gap-2 text-[11px] text-slate-500">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="rounded-lg border bg-slate-50 px-2 py-1 text-center">{d}</div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="min-h-[88px] rounded-lg border border-dashed p-2">
                {i % 2 === 0 ? (
                  <div className="rounded-lg border-l-4 border-indigo-500 bg-white px-2 py-1 text-xs shadow-sm">
                    9:00–17:00 <span className="ml-1 rounded bg-indigo-50 px-1 text-[10px] text-indigo-700">Barista</span>
                  </div>
                ) : (
                  <div className="rounded-lg border-l-4 border-fuchsia-500 bg-white px-2 py-1 text-xs shadow-sm">
                    12:00–20:00 <span className="ml-1 rounded bg-fuchsia-50 px-1 text-[10px] text-fuchsia-700">Cashier</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs text-slate-500">Conflicts prevented automatically</div>
            <Link href="/schedule">
              <Button size="sm" variant="outline" className="gap-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                Open schedule <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------- Callouts ----------------------- */
function Callouts() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="bg-white ring-1 ring-indigo-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-indigo-600">
              <Workflow className="h-5 w-5" />
              <div className="font-semibold text-slate-900">Role-based access</div>
            </div>
            <p className="mt-2 text-sm text-slate-600">Admins & managers can create schedules and approve time off. Employees can request time off and edit their own availability.</p>
          </CardContent>
        </Card>
        <Card className="bg-white ring-1 ring-fuchsia-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-fuchsia-600">
              <KeyRound className="h-5 w-5" />
              <div className="font-semibold text-slate-900">Join codes</div>
            </div>
            <p className="mt-2 text-sm text-slate-600">Skip email invites. Generate role-aware codes with usage limits and expiry; new members can join in seconds.</p>
          </CardContent>
        </Card>
        <Card className="bg-white ring-1 ring-sky-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sky-600">
              <Radio className="h-5 w-5" />
              <div className="font-semibold text-slate-900">Realtime everywhere</div>
            </div>
            <p className="mt-2 text-sm text-slate-600">Shifts, approvals, and availability sync instantly across devices via Postgres changes.</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

/* ----------------------- CTA ----------------------- */
function CTA() {
  return (
    <section className="relative overflow-hidden border-y bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50">
      <div aria-hidden className="pointer-events-none absolute -left-24 top-8 h-40 w-40 rounded-full bg-indigo-200 blur-2xl opacity-60" />
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h3 className="text-2xl font-semibold sm:text-3xl">Start scheduling in minutes</h3>
          <p className="mt-2 text-slate-600">Create your org, share a join code, and go live. Free to try — no credit card.</p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/auth/signup">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-lg hover:opacity-95">
                Create your account <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <form onSubmit={(e) => e.preventDefault()} className="flex w-full max-w-sm items-center gap-2">
              <Input type="email" placeholder="Email" className="bg-white" />
              <Button type="submit" variant="outline" className="border-sky-200 text-sky-700 hover:bg-sky-50">Notify me</Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------- FAQ ----------------------- */
function FAQ() {
  const qs = [
    { q: "Can employees add their availability?", a: "Yes. Employees edit their own availability; managers can edit anyone’s and override during scheduling if needed." },
    { q: "How do roles work?", a: "Roles are enforced by RLS. Admin/Manager can create/edit/delete schedules & approve time off; employees are view-only except time off and availability." },
    { q: "Do I need email invites?", a: "No. Generate join codes with a role, usage limit, and expiry, then share over Slack/WhatsApp." },
    { q: "Is it realtime?", a: "Yes. We subscribe to Postgres changes so updates appear instantly for everyone in the org." },
  ];
  return (
    <section id="faq" className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-2xl font-semibold sm:text-3xl">FAQ</h2>
        <div className="mt-5 divide-y rounded-2xl border bg-white">
          {qs.map((x, i) => (
            <details key={i} className="group px-5 py-4 open:bg-slate-50">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
                {x.q}
                <span className="ml-4 rounded-full border px-2 py-0.5 text-[10px] text-slate-500 group-open:hidden">Show</span>
                <span className="ml-4 hidden rounded-full border px-2 py-0.5 text-[10px] text-slate-500 group-open:inline">Hide</span>
              </summary>
              <p className="mt-2 text-sm text-slate-600">{x.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------- Footer ----------------------- */
function Footer() {
  return (
    <footer id="contact" className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="FirstShift" width={132} height={32} />
            </div>
            <p className="mt-3 text-sm text-slate-600">Modern, realtime schedule management for teams.</p>
          </div>

          <div>
            <div className="text-sm font-semibold">Product</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/dashboard" className="hover:text-slate-900">Dashboard</Link></li>
              <li><Link href="/schedule" className="hover:text-slate-900">Schedule</Link></li>
              <li><Link href="/time-off" className="hover:text-slate-900">Time off</Link></li>
              <li><Link href="/employees" className="hover:text-slate-900">Employees</Link></li>
              <li><Link href="/availability" className="hover:text-slate-900">Availability</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold">Company</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><a href="#features" className="hover:text-slate-900">Features</a></li>
              <li><a href="#how" className="hover:text-slate-900">How it works</a></li>
              <li><a href="#faq" className="hover:text-slate-900">FAQ</a></li>
              <li><Link href="/settings/codes" className="hover:text-slate-900">Join codes</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold">Get started</div>
            <p className="mt-3 text-sm text-slate-600">Create your org and share a join code with your team.</p>
            <div className="mt-3">
              <Link href="/auth/signup">
                <Button className="w-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white hover:opacity-95">Sign up</Button>
              </Link>
            </div>
            <form onSubmit={(e) => e.preventDefault()} className="mt-3 flex items-center gap-2">
              <Input type="email" placeholder="Email" className="bg-white" />
              <Button type="submit" variant="outline" className="border-sky-200 text-sky-700 hover:bg-sky-50">Notify</Button>
            </form>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs text-slate-500 sm:flex-row">
          <div>© {new Date().getFullYear()} FirstShift. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-700">Terms</a>
            <a href="#" className="hover:text-slate-700">Privacy</a>
            <a href="#" className="hover:text-slate-700">Status</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
