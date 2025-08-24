// components/DashboardTopbar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSelectedLayoutSegments } from "next/navigation";
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
import { Search, ChevronDown, UserRound, Building2 } from "lucide-react";

function usePageTitle() {
  const segs = useSelectedLayoutSegments();
  const map: Record<string, string> = {
    dashboard: "Dashboard",
    schedule: "Schedule",
    employees: "Employees",
    "time-off": "Time off",
    availability: "Availability",
    report: "Report",
    messages: "Messages",
    settings: "Settings",
  };
  const last = segs[segs.length - 1] || "dashboard";
  return map[last] ?? last.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function DashboardTopbar() {
  const title = usePageTitle();
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
    (async () => {
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
    })();
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
    <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
      {/* Top row */}
      <div className="flex items-center gap-3 px-3 py-2 md:px-5 md:py-3">
        {/* Title + Org */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-base font-semibold md:text-lg">{title}</h1>
            {/* Org badge (desktop and md+) */}
            <span
              className="hidden md:inline-flex max-w-[360px] items-center gap-1.5 truncate rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700"
              title={displayOrg}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span className="truncate">{displayOrg}</span>
            </span>
          </div>
          {/* Org (mobile) */}
          <div className="mt-0.5 text-[11px] text-gray-500 md:hidden truncate">{displayOrg}</div>
        </div>

        <div className="ml-auto" />

        {/* Search (desktop) */}
        <div className="hidden items-center gap-2 md:flex">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              ref={inputRef}
              className="w-[280px] pl-8"
              placeholder="Search… ( / )"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onSearchKeyDown}
              aria-label="Search"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border bg-white px-1.5 py-0.5 text-[10px] text-gray-500">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Account menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-8 w-8">
                {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[160px] truncate text-sm md:inline">{displayUser}</span>
              <ChevronDown className="hidden h-4 w-4 opacity-60 md:inline" />
              <span className="sr-only">Open account menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex items-center gap-2">
              <UserRound className="h-4 w-4" />
              Signed in
            </DropdownMenuLabel>
            <div className="px-2 pb-2 text-xs text-gray-600">
              <div className="truncate">{userName || "—"}</div>
              <div className="truncate">{userEmail || "—"}</div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/account">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action="/auth/signout" method="post" className="w-full">
                <button type="submit" className="w-full text-left text-red-600">
                  Log out
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile search row */}
      <div className="flex gap-2 px-3 pb-2 md:hidden">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            ref={inputRef}
            className="pl-8"
            placeholder="Search… ( / )"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onSearchKeyDown}
            aria-label="Search"
          />
        </div>
      </div>
    </header>
  );
}
