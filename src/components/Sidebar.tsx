"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  CalendarCheck,
  LayoutDashboard,
  Users2,
  FileBarChart2,
  Clock3,
  Newspaper,
  Settings,
  HelpCircle,
  Menu,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// ----------------- Navigation Data -----------------
const NAV_MAIN = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/schedule", label: "Schedule", icon: CalendarCheck },
  { href: "/employees", label: "Employees", icon: Users2 },
  { href: "/time-off", label: "Time off", icon: Clock3 },
  { href: "/availability", label: "Availability", icon: Radio },
  { href: "/report", label: "Report", icon: FileBarChart2 },
];

const NAV_GENERAL = [
  { href: "/news", label: "News Feed", icon: Newspaper },
  { href: "/settings/codes", label: "Join Codes", icon: Settings },
  { href: "/help", label: "Help & Support", icon: HelpCircle },
];

// ----------------- Nav Item -----------------
function NavItem({ href, label, icon: Icon, onClick }: {
  href: string;
  label: string;
  icon: any;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm outline-none transition-colors",
        active
          ? "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:ring-indigo-900"
          : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 transition-colors",
          active
            ? "text-indigo-600 dark:text-indigo-300"
            : "text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200"
        )}
      />
      <span className="truncate">{label}</span>
    </Link>
  );
}

// ----------------- Sidebar Panel -----------------
function SidebarPanel({ onItemClick }: { onItemClick?: () => void }) {
  return (
    <div className="flex h-full w-[264px] flex-col bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-950/40">
      {/* Brand Row */}
      <div className="flex items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="FirstShift" width={132} height={32} />
        </Link>
      </div>
      <Separator />

      <ScrollArea className="flex-1 px-3 py-3">
        <div className="px-2 text-[11px] uppercase tracking-wide text-slate-400">Menu</div>
        <div className="mt-2 space-y-1">
          {NAV_MAIN.map((i) => (
            <NavItem key={i.href} {...i} onClick={onItemClick} />
          ))}
        </div>

        <div className="mt-6 px-2 text-[11px] uppercase tracking-wide text-slate-400">General</div>
        <div className="mt-2 space-y-1">
          {NAV_GENERAL.map((i) => (
            <NavItem key={i.href} {...i} onClick={onItemClick} />
          ))}
        </div>
      </ScrollArea>


    </div>
  );
}

// ----------------- Root Sidebar -----------------
export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile trigger */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-white via-indigo-50 to-fuchsia-50/70 backdrop-blur md:hidden">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="border-indigo-200 text-slate-700 hover:bg-indigo-50"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="text-sm font-semibold text-slate-800">FirstShift</div>
          <div className="w-10" />
        </div>
      </div>

      {/* Mobile sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[288px] p-0">
          <SidebarPanel onItemClick={() => setOpen(false)} />
        </SheetContent>
        <SheetTrigger asChild>
          <span className="hidden" />
        </SheetTrigger>
      </Sheet>

      {/* Desktop rail */}
      <aside className="sticky top-0 hidden h-screen w-[260px] border-r bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 md:flex dark:bg-slate-950/40">
        <SidebarPanel />
      </aside>
    </>
  );
}
