// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck,
  Users2,
  Clock3,
  LayoutDashboard,
  ShieldCheck,
  Zap,
  ChevronDown,
  Menu,
  X,
  Check,
  Star,
  Sparkles,
  Radio,
  KeyRound,
} from "lucide-react";

/**
 * ✨ Palette & vibe:
 * Primaries: indigo & fuchsia
 * Accents: sky & amber
 * Neutral base: slate
 * Soft gradients, glassy surfaces, and subtle motion.
 */

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.88]);

  // Main feature cards (content lifted from your first file)
  const mainFeatures = [
    {
      icon: <CalendarCheck className="w-6 h-6" />,
      title: "Drag-and-drop schedule",
      description:
        "Assign, move, and resize shifts across a weekly grid with conflict checks.",
      bullets: ["Weekly grid", "Conflicts guard", "Publish when ready"],
      tint: "from-indigo-500 to-fuchsia-500",
    },
    {
      icon: <Users2 className="w-6 h-6" />,
      title: "Employee availability",
      description:
        "Employees set their hours; managers schedule with live availability.",
      bullets: ["Self-serve availability", "Manager override", "Org-scoped"],
      tint: "from-fuchsia-500 to-rose-500",
    },
    {
      icon: <Clock3 className="w-6 h-6" />,
      title: "Time off requests",
      description:
        "Employees request; managers approve/deny. Schedule updates instantly.",
      bullets: ["Types & reasons", "Approve / deny", "Realtime status"],
      tint: "from-sky-500 to-indigo-500",
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Roles & join codes",
      description:
        "Admin, manager, employee permissions with secure join codes.",
      bullets: ["No invites", "Expiry / usage limits", "Auto-create employee"],
      tint: "from-amber-500 to-orange-500",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Realtime everything",
      description: "Shifts, approvals, availability sync instantly.",
      bullets: ["Postgres changes", "Typed channels", "Optimistic UI"],
      tint: "from-indigo-500 to-fuchsia-500",
    },
    {
      icon: <LayoutDashboard className="w-6 h-6" />,
      title: "One simple dashboard",
      description:
        "KPIs, coverage, and upcoming shifts with quick actions and filters.",
      bullets: ["Coverage by day", "Open shifts", "Pending time off"],
      tint: "from-fuchsia-500 to-pink-500",
    },
  ];

  // Extra micro-features (kept concise)
  const extra = [
    { title: "Join codes (no invites)", icon: <KeyRound className="w-5 h-5" /> },
    { title: "Realtime updates", icon: <Radio className="w-5 h-5" /> },
    { title: "Unified dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { title: "Org-wide RLS security", icon: <ShieldCheck className="w-5 h-5" /> },
  ];

  // Auto hover effect (optional polish)
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setActive((p) => (p + 1) % mainFeatures.length),
      4000
    );
    return () => clearInterval(t);
  }, [mainFeatures.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50 to-fuchsia-50 text-slate-900 overflow-x-hidden">
      {/* Soft decorative blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-1/2 top-0 h-[40rem] w-[40rem] rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute -right-1/3 top-10 h-[30rem] w-[30rem] rounded-full bg-fuchsia-200/50 blur-3xl" />
      </div>

      {/* Header / Nav */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="FirstShift" width={136} height={36} />
          </Link>

          <nav className="ml-6 hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <a href="#features" className="hover:text-slate-900">
              Features
            </a>
            <a href="#how" className="hover:text-slate-900">
              How it works
            </a>
            <a href="#faq" className="hover:text-slate-900">
              FAQ
            </a>
            <a href="#contact" className="hover:text-slate-900">
              Contact
            </a>
          </nav>

          <div className="ml-auto hidden items-center gap-2 md:flex">
            <Link href="/auth/login" className="rounded-md border px-3 py-2">
              Sign in
            </Link>
            <Link href="/auth/signup">
              <button className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-white shadow hover:opacity-95">
                Get started free <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>

          {/* Mobile */}
          <div className="ml-auto md:hidden">
            <button
              onClick={() => setIsMenuOpen((s) => !s)}
              className="rounded-md border px-2 py-2"
              aria-label="Open menu"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="border-t bg-white/90 px-4 py-4 backdrop-blur-xl md:hidden">
            <div className="grid gap-4">
              <Link href="/auth/login" className="rounded-md border px-3 py-2">
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-md bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-3 py-2 text-white"
              >
                Get started
              </Link>
              <div className="h-px bg-slate-200" />
              <nav className="grid gap-3 text-sm">
                <a href="#features" onClick={() => setIsMenuOpen(false)}>
                  Features
                </a>
                <a href="#how" onClick={() => setIsMenuOpen(false)}>
                  How it works
                </a>
                <a href="#faq" onClick={() => setIsMenuOpen(false)}>
                  FAQ
                </a>
                <a href="#contact" onClick={() => setIsMenuOpen(false)}>
                  Contact
                </a>
              </nav>
            </div>
          </div>
        )}
      </motion.header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-14 md:py-20 lg:py-24 md:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left copy */}
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-center lg:text-left"
            >
              <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm text-indigo-700">
                <Sparkles className="mr-1 h-3.5 w-3.5" /> New: Join codes &
                realtime
              </span>

              <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">
                Schedule your team in minutes.{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
                  No chaos.
                </span>
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
                Drag-and-drop shifts, employee availability, time off approvals,
                and realtime updates — all secured per organization with
                role-based access.
              </p>

              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <Link href="/auth/signup">
                  <button className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-5 py-3 text-white shadow-lg hover:opacity-95">
                    Start free <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <a href="#features">
                  <button className="rounded-md border border-indigo-200 px-5 py-3 text-indigo-700 hover:bg-indigo-50">
                    See features
                  </button>
                </a>
              </div>

              {/* quick chips */}
              <div className="mt-8 grid grid-cols-2 gap-3 text-left sm:grid-cols-4">
                {extra.map((f) => (
                  <div
                    key={f.title}
                    className="flex items-center gap-2 rounded-xl border bg-white/80 px-3 py-2"
                  >
                    <span className="text-indigo-600">{f.icon}</span>
                    <span className="text-sm">{f.title}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right visual */}
            <motion.div
              style={{ y: y1, opacity }}
              className="relative hidden lg:block"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative rounded-3xl border bg-white p-6 shadow-2xl"
              >
                {/* Mock schedule frame */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="font-semibold">Week of Mon</div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-fuchsia-200 px-2 py-0.5 text-[11px] text-fuchsia-700">
                    <Radio className="h-3.5 w-3.5" /> Live
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-2 text-[11px] text-slate-500">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <div
                      key={d}
                      className="rounded-lg border bg-slate-50 px-2 py-1 text-center"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                <div className="mt-2 grid grid-cols-7 gap-2">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.05 }}
                      className="min-h-[96px] rounded-lg border border-dashed p-2"
                    >
                      {i % 2 === 0 ? (
                        <div className="rounded-lg border-l-4 border-indigo-500 bg-white px-2 py-1 text-xs shadow-sm">
                          9:00–17:00{" "}
                          <span className="ml-1 rounded bg-indigo-50 px-1 text-[10px] text-indigo-700">
                            Barista
                          </span>
                        </div>
                      ) : (
                        <div className="rounded-lg border-l-4 border-fuchsia-500 bg-white px-2 py-1 text-xs shadow-sm">
                          12:00–20:00{" "}
                          <span className="ml-1 rounded bg-fuchsia-50 px-1 text-[10px] text-fuchsia-700">
                            Cashier
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Floating stats */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-2 text-sm font-semibold text-white shadow-lg"
                >
                  +42% Efficiency
                </motion.div>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-4 -left-4 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-lg"
                >
                  25 Active
                </motion.div>
              </motion.div>

              {/* Scroll chevron */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-10 left-1/2 -translate-x-1/2"
              >
                <ChevronDown className="h-6 w-6 text-slate-400" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold sm:text-4xl">
            Everything you need to schedule like a pro
          </h2>
          <p className="mt-3 text-slate-600">
            Built for growing teams and multi-location businesses. Secure by
            design with per-organization access.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mainFeatures.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onMouseEnter={() => setActive(i)}
              className={`rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-indigo-100/60`}
            >
              <div className="mb-3 flex items-center gap-2 text-slate-900">
                <span
                  className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${f.tint} text-white`}
                >
                  {f.icon}
                </span>
                <div className="font-semibold">{f.title}</div>
              </div>
              <p className="text-sm text-slate-600">{f.description}</p>
              <ul className="mt-3 space-y-1 text-sm">
                {f.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              {active === i && (
                <motion.div
                  layoutId="glow"
                  className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-200/20 to-fuchsia-200/20"
                />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-sm text-indigo-700">
              3 steps
            </span>
            <h2 className="mt-3 text-2xl font-semibold sm:text-4xl">
              From zero to scheduled
            </h2>
            <p className="mt-2 text-slate-600">
              No email invites required. Codes work anywhere you can paste text.
            </p>

            <ol className="mt-4 space-y-3">
              {[
                {
                  k: "Create your org",
                  d: "Sign up and create an organization. You’re the admin.",
                },
                {
                  k: "Share a join code",
                  d: "Generate role-based codes for managers or employees.",
                },
                {
                  k: "Go live",
                  d: "Drag-and-drop shifts, approve time off, and watch updates in realtime.",
                },
              ].map((s, i) => (
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
                <button className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-white shadow hover:opacity-95">
                  Get started free <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="/settings/codes">
                <button className="rounded-md border border-fuchsia-200 px-4 py-2 text-fuchsia-700 hover:bg-fuchsia-50">
                  Generate a code
                </button>
              </Link>
            </div>
          </div>

          {/* Small schedule mock */}
          <div className="relative rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="font-semibold">Week of Mon</div>
              <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 px-2 py-0.5 text-[11px] text-indigo-700">
                <Radio className="h-3.5 w-3.5" /> Live
              </span>
            </div>
            <div className="grid grid-cols-7 gap-2 text-[11px] text-slate-500">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div
                  key={d}
                  className="rounded-lg border bg-slate-50 px-2 py-1 text-center"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="min-h-[88px] rounded-lg border border-dashed p-2"
                >
                  {i % 2 === 0 ? (
                    <div className="rounded-lg border-l-4 border-indigo-500 bg-white px-2 py-1 text-xs shadow-sm">
                      9:00–17:00{" "}
                      <span className="ml-1 rounded bg-indigo-50 px-1 text-[10px] text-indigo-700">
                        Barista
                      </span>
                    </div>
                  ) : (
                    <div className="rounded-lg border-l-4 border-fuchsia-500 bg-white px-2 py-1 text-xs shadow-sm">
                      12:00–20:00{" "}
                      <span className="ml-1 rounded bg-fuchsia-50 px-1 text-[10px] text-fuchsia-700">
                        Cashier
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Conflicts prevented automatically
              </div>
              <Link href="/schedule" className="text-sm">
                <span className="inline-flex items-center gap-1 rounded-md border border-indigo-200 px-2 py-1 text-indigo-700 hover:bg-indigo-50">
                  Open schedule <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial + stats band */}
      <section className="px-4 pb-14">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 p-10 text-white shadow-2xl">
            <div className="grid gap-8 md:grid-cols-4 text-center">
              {[
                ["90%", "Less time scheduling"],
                ["10K+", "Active organizations"],
                ["4.9/5", "Average rating"],
                ["24/7", "AI assistance"],
              ].map(([stat, label], i) => (
                <motion.div
                  key={stat}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="text-4xl font-bold">{stat}</div>
                  <div className="text-indigo-100">{label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="px-4 py-14 md:px-6 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h2 className="text-2xl font-semibold sm:text-4xl">
              Loved by{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
                thousands
              </span>
            </h2>
            <p className="mt-2 text-slate-600">
              Join the companies that have transformed their scheduling.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Sarah Chen",
                role: "Operations Manager",
                company: "TechStart Inc.",
                content:
                  "FirstShift cut our scheduling time by 85%. The suggestions are spot-on, and our team loves the mobile experience.",
              },
              {
                name: "Michael Rodriguez",
                role: "HR Director",
                company: "Retail Plus",
                content:
                  "Managing 5 locations was tough before FirstShift. Now it's automated and our compliance issues disappeared.",
              },
              {
                name: "Emma Thompson",
                role: "Restaurant Owner",
                company: "The Green Table",
                content:
                  "Incredibly easy. No training needed — our managers just started using it immediately.",
              },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border bg-white p-6 shadow-lg"
              >
                <div className="mb-3 flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="mb-4 text-slate-700 italic">“{t.content}”</p>
                <div>
                  <div className="font-semibold text-slate-900">{t.name}</div>
                  <div className="text-sm text-slate-600">
                    {t.role} at {t.company}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-y bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-8 h-40 w-40 rounded-full bg-indigo-200 opacity-60 blur-2xl"
        />
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h3 className="text-2xl font-semibold sm:text-3xl">
              Start scheduling in minutes
            </h3>
            <p className="mt-2 text-slate-600">
              Create your org, share a join code, and go live. Free to try — no
              credit card.
            </p>
            <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/auth/signup">
                <button className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-5 py-3 text-white shadow-lg hover:opacity-95">
                  Create your account <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex w-full max-w-sm items-center gap-2"
              >
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-md border bg-white px-3 py-3 text-sm outline-none"
                />
                <button
                  type="submit"
                  className="rounded-md border border-sky-200 px-4 py-3 text-sky-700 hover:bg-sky-50"
                >
                  Notify me
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-semibold sm:text-3xl">FAQ</h2>
          <div className="mt-5 divide-y rounded-2xl border bg-white">
            {[
              {
                q: "Can employees add their availability?",
                a: "Yes. Employees edit their own availability; managers can edit anyone’s and override during scheduling if needed.",
              },
              {
                q: "How do roles work?",
                a: "Roles are enforced by RLS. Admin/Manager can create/edit/delete schedules & approve time off; employees are view-only except time off and availability.",
              },
              {
                q: "Do I need email invites?",
                a: "No. Generate join codes with a role, usage limit, and expiry, then share over Slack/WhatsApp.",
              },
              {
                q: "Is it realtime?",
                a: "Yes. We subscribe to Postgres changes so updates appear instantly for everyone in the org.",
              },
            ].map((x, i) => (
              <details key={i} className="group px-5 py-4 open:bg-slate-50">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
                  {x.q}
                  <span className="ml-4 rounded-full border px-2 py-0.5 text-[10px] text-slate-500 group-open:hidden">
                    Show
                  </span>
                  <span className="ml-4 hidden rounded-full border px-2 py-0.5 text-[10px] text-slate-500 group-open:inline">
                    Hide
                  </span>
                </summary>
                <p className="mt-2 text-sm text-slate-600">{x.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <Image src="/logo.svg" alt="FirstShift" width={132} height={32} />
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Modern, realtime schedule management for teams.
              </p>
            </div>

            <div>
              <div className="text-sm font-semibold">Product</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>
                  <Link href="/dashboard" className="hover:text-slate-900">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/schedule" className="hover:text-slate-900">
                    Schedule
                  </Link>
                </li>
                <li>
                  <Link href="/time-off" className="hover:text-slate-900">
                    Time off
                  </Link>
                </li>
                <li>
                  <Link href="/employees" className="hover:text-slate-900">
                    Employees
                  </Link>
                </li>
                <li>
                  <Link href="/availability" className="hover:text-slate-900">
                    Availability
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold">Company</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>
                  <a href="#features" className="hover:text-slate-900">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how" className="hover:text-slate-900">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-slate-900">
                    FAQ
                  </a>
                </li>
                <li>
                  <Link href="/settings/codes" className="hover:text-slate-900">
                    Join codes
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold">Get started</div>
              <p className="mt-3 text-sm text-slate-600">
                Create your org and share a join code with your team.
              </p>
              <div className="mt-3">
                <Link href="/auth/signup">
                  <span className="inline-block w-full rounded-md bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-3 py-2 text-center text-white hover:opacity-95">
                    Sign up
                  </span>
                </Link>
              </div>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="mt-3 flex items-center gap-2"
              >
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-md border bg-white px-3 py-2 text-sm outline-none"
                />
                <button
                  type="submit"
                  className="rounded-md border border-sky-200 px-3 py-2 text-sky-700 hover:bg-sky-50"
                >
                  Notify
                </button>
              </form>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs text-slate-500 sm:flex-row">
            <div>© {new Date().getFullYear()} FirstShift. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-slate-700">
                Terms
              </a>
              <a href="#" className="hover:text-slate-700">
                Privacy
              </a>
              <a href="#" className="hover:text-slate-700">
                Status
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Tiny helper animations for blob demo (no Tailwind plugin needed) */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.08);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.96);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
