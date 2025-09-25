"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  BookOpen,
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
  { href: "/docs", label: "Documentation", icon: BookOpen },
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
      className="block relative"
    >
      <motion.div
        whileHover={{ scale: 1.02, x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 relative overflow-hidden",
          active
            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-lg border border-blue-200"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-800 backdrop-blur-sm"
        )}
      >
        {/* Animated background for active state */}
        <AnimatePresence>
          {active && (
            <motion.div
              layoutId="activeNavBg"
              className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </AnimatePresence>

        <div className="relative z-10 flex items-center gap-3">
          <motion.div
            animate={{
              rotate: active ? 360 : 0,
              scale: active ? 1.1 : 1,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <Icon
              className={cn(
                "h-5 w-5 transition-colors duration-300",
                active
                  ? "text-blue-600"
                  : "text-slate-500 group-hover:text-blue-600"
              )}
            />
          </motion.div>
          <span className={cn(
            "truncate transition-all duration-300",
            active ? "font-semibold" : "font-medium"
          )}>
            {label}
          </span>
        </div>

        {/* Hover indicator */}
        <motion.div
          className="absolute right-2 w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full opacity-0 group-hover:opacity-100"
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>
    </Link>
  );
}

// ----------------- Sidebar Panel -----------------
function SidebarPanel({ onItemClick }: { onItemClick?: () => void }) {
  return (
    <div className="flex h-full w-full flex-col bg-white/95 backdrop-blur-xl overflow-hidden border-r border-slate-200">
      {/* Enhanced Brand Section - Fixed */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 flex items-center px-4 py-5 border-b border-slate-200"
      >
        <Link href="/" className="flex items-center gap-3 group">
         <Image src="/logo.svg" alt="FirstShift Logo" width={120} height={28} className="rounded-full" />
        </Link>
      </motion.div>

      {/* Enhanced Navigation - Scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="py-4 px-3">
          <nav className="space-y-5">
            {/* Main Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <h3 className="px-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <div className="h-0.5 w-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                Workspace
              </h3>
              <div className="space-y-0.5">
                {NAV_MAIN.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05, duration: 0.4 }}
                  >
                    <NavItem {...item} onClick={onItemClick} />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* General Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <h3 className="px-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <div className="h-0.5 w-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                General
              </h3>
              <div className="space-y-0.5">
                {NAV_GENERAL.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05, duration: 0.4 }}
                  >
                    <NavItem {...item} onClick={onItemClick} />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Extra space at bottom for better scrolling */}
            <div className="h-4"></div>
          </nav>
        </div>
      </div>
    </div>
  );
}

// ----------------- Root Sidebar -----------------
export default function Sidebar() {
  return (
    <aside className="h-full">
      <SidebarPanel />
    </aside>
  );
}
