"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSelectedLayoutSegments } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabaseClient";
import { useOrg } from "@/components/providers/OrgProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, ChevronDown, UserRound, Building2, Menu, Bell, Settings, LogOut, LayoutDashboard, CalendarCheck, Users2, Clock3, Radio, FileBarChart2, BookOpen, Newspaper, HelpCircle } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "@/components/Sidebar";
import { OrgSwitcher } from "@/components/OrgSwitcher";
import Image from "next/image";

// ----------------- Topbar Component -----------------

export default function DashboardTopbar() {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);
  const { orgName, loading: orgLoading } = useOrg() as {
    orgName?: string | null;
    loading: boolean;
  };

  const [q, setQ] = React.useState("");
  const [userName, setUserName] = React.useState<string | null>(null);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);

  // Load user profile/email for the top-right menu
  React.useEffect(() => {
    const loadUserData = async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id ?? null;
      setUserEmail(u.user?.email ?? null);

      if (uid) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", uid)
          .maybeSingle();

        setUserName(prof?.full_name ?? null);
        setAvatarUrl(prof?.avatar_url ?? null);
      }
    };

    loadUserData();

    // Listen for profile updates from other components
    const handleProfileUpdate = (event: CustomEvent) => {
      const { full_name, avatar_url } = event.detail;
      if (full_name !== undefined) setUserName(full_name);
      if (avatar_url !== undefined) setAvatarUrl(avatar_url);
    };

    window.addEventListener('user-profile-updated', handleProfileUpdate as EventListener);

    return () => {
      window.removeEventListener('user-profile-updated', handleProfileUpdate as EventListener);
    };
  }, [supabase]);

  // Focus search with "/" and go to search with "Ctrl/Cmd+K"
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping = target && (["INPUT", "TEXTAREA"].includes(target.tagName) || (target as any).isContentEditable);
      if (!isTyping && e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const term = q.trim();
        if (term) router.push(`/search?q=${encodeURIComponent(term)}`);
        else inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [q, router]);

  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const term = q.trim();
      if (term) router.push(`/search?q=${encodeURIComponent(term)}`);
    }
  }

  const displayOrg = orgLoading ? "Loading…" : orgName ?? "No organization";
  const displayUser = userName || userEmail || "Account";
  const avatarFallback = (userName ?? userEmail ?? "U").slice(0, 1).toUpperCase();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 border-b border-slate-200 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Enhanced Mobile menu button */}
        <Sheet>
          <SheetTrigger asChild>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="icon" className="md:hidden hover:bg-slate-100 transition-colors duration-200">
                <Menu className="h-5 w-5 text-slate-600" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </motion.div>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80 sm:w-96 bg-white/95 backdrop-blur-xl border-slate-200">
            <div className="flex h-full w-full flex-col overflow-hidden">
              {/* Enhanced Brand Row - Fixed */}
              <div className="flex-shrink-0 flex items-center px-6 py-6 border-b border-slate-200">
                <Link href="/" className="flex items-center gap-3 group">
                 <Image src="/logo.svg" alt="FirstShift Logo" width={132} height={32} />
                 </Link>
              </div>


              {/* Navigation - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                <div className="py-6 px-3">
                  <nav className="space-y-8">
                    <div>
                      <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                        Workspace
                      </h3>
                      <div className="space-y-1">
                        <Link href="/dashboard" className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors">
                          <LayoutDashboard className="h-5 w-5 text-slate-500 group-hover:text-blue-600" />
                          <span className="truncate">Dashboard</span>
                        </Link>
                        <Link href="/schedule" className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors">
                          <CalendarCheck className="h-5 w-5 text-slate-500 group-hover:text-blue-600" />
                          <span className="truncate">Schedule</span>
                        </Link>
                        <Link href="/employees" className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors">
                          <Users2 className="h-5 w-5 text-slate-500 group-hover:text-blue-600" />
                          <span className="truncate">Employees</span>
                        </Link>
                        <Link href="/time-off" className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors">
                          <Clock3 className="h-5 w-5 text-slate-500 group-hover:text-blue-600" />
                          <span className="truncate">Time off</span>
                        </Link>
                        <Link href="/availability" className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors">
                          <Radio className="h-5 w-5 text-slate-500 group-hover:text-blue-600" />
                          <span className="truncate">Availability</span>
                        </Link>
                        <Link href="/report" className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors">
                          <FileBarChart2 className="h-5 w-5 text-slate-500 group-hover:text-blue-600" />
                          <span className="truncate">Report</span>
                        </Link>
                      </div>
                    </div>

                    <div>
                      <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                        General
                      </h3>
                      <div className="space-y-1">
                        <Link href="/docs" className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors">
                          <BookOpen className="h-5 w-5 text-slate-500 group-hover:text-emerald-600" />
                          <span className="truncate">Documentation</span>
                        </Link>
                        <Link href="/news" className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors">
                          <Newspaper className="h-5 w-5 text-slate-500 group-hover:text-emerald-600" />
                          <span className="truncate">News Feed</span>
                        </Link>
                        <Link href="/settings" className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors">
                          <Settings className="h-5 w-5 text-slate-500 group-hover:text-emerald-600" />
                          <span className="truncate">Settings</span>
                        </Link>
                        <Link href="/help" className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors">
                          <HelpCircle className="h-5 w-5 text-slate-500 group-hover:text-emerald-600" />
                          <span className="truncate">Help & Support</span>
                        </Link>
                      </div>
                    </div>

                    {/* Extra space at bottom for better scrolling */}
                    <div className="h-8"></div>
                  </nav>
                </div>
              </div>

             
            </div>
          </SheetContent>
        </Sheet>

        {/* Enhanced Page Title & Breadcrumb */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="min-w-0">
            {/* Enhanced Organization Switcher */}
            <OrgSwitcher />
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className="hidden lg:flex items-center mx-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl group-hover:shadow-violet-500/25 transition-all duration-300">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-400 transition-colors duration-200" />
              <Input
                ref={inputRef}
                className="w-[320px] pl-12 pr-16 py-3 bg-transparent border-0 focus:ring-0 text-black placeholder:text-gray-400 font-medium"
                placeholder="Search everything..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onSearchKeyDown}
                aria-label="Search"
              />
            </div>
          </motion.div>
        </div>

        {/* Enhanced Account Menu */}
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button variant="ghost" className="gap-3 px-3 py-2 rounded-xl border border-transparent transition-all duration-200">
                  <Avatar className="h-9 w-9 ring-2 ring-white/20">
                    {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
                    <AvatarFallback className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-black font-semibold">{avatarFallback}</AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block text-left">
                    <div className="text-sm font-semibold text-black max-w-[120px] truncate">{displayUser}</div>
                  </div>
                  <motion.div
                    animate={{ rotate: 0 }}
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="hidden lg:block h-4 w-4 text-gray-400" />
                  </motion.div>
                </Button>
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-1 bg-white/95 backdrop-blur-xl border border-slate-200 shadow-xl rounded-2xl">
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
                    <AvatarFallback className="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 font-semibold">{avatarFallback}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 truncate">{userName || userEmail?.split('@')[0] || "User"}</div>
                    <div className="text-sm text-slate-500 truncate">{userEmail || "—"}</div>
                  </div>
                </div>
              </div>

              <div className="p-2 space-y-1">
                <DropdownMenuItem asChild>
                  <Link href="/account" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors duration-200">
                    <UserRound className="h-4 w-4 text-slate-500" />
                    <span className="font-medium text-slate-700">Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors duration-200">
                    <Settings className="h-4 w-4 text-slate-500" />
                    <span className="font-medium text-slate-700">Settings</span>
                  </Link>
                </DropdownMenuItem>
              </div>

              <div className="border-t border-slate-200 p-2">
                <DropdownMenuItem asChild>
                  <form action="/auth/signout" method="post" className="w-full">
                    <button type="submit" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors duration-200 w-full text-left text-red-600">
                      <LogOut className="h-4 w-4" />
                      <span className="font-medium">Log out</span>
                    </button>
                  </form>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile search */}
      <div className="border-t border-slate-200 px-4 py-3 lg:hidden">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            className="w-full pl-10 bg-white/90 border-slate-200 text-slate-800 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Search..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onSearchKeyDown}
            aria-label="Search"
          />
        </div>
      </div>
    </motion.header>
  );
}
