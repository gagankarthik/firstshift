import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";

import Sidebar from "@/components/Sidebar";
import DashboardTopbar from "@/components/DashboardTopbar";
import { OrgProvider } from "@/components/providers/OrgProvider";
import { NoSSR } from "@/components/ui/no-ssr";

// Ensure this route is evaluated per-request (uses cookies for SSR auth).
export const dynamic = "force-dynamic";

// Mobile Bottom Navigation Component
function MobileBottomNav() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  const navItems = [
    { href: '/dashboard', icon: '🏠', label: 'Home' },
    { href: '/schedule', icon: '📅', label: 'Schedule' },
    { href: '/employees', icon: '👥', label: 'Team' },
    { href: '/time-off', icon: '🕐', label: 'Time Off' },
    { href: '/report', icon: '📊', label: 'Reports' },
  ];

  return (
    <nav className="flex items-center justify-around px-2 py-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
        return (
          <a
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <span className="text-lg mb-1">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // If unauthenticated (or auth error), send to login.
  if (error || !user) {
    redirect("/auth/login");
  }

  return (
    <OrgProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
        {/* Enhanced Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Animated gradient orbs */}
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

          {/* Enhanced grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

          {/* Radial gradient overlay */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-white/5 to-white/10" />
        </div>

        {/* Enhanced Responsive Layout */}
        <div className="flex h-screen overflow-hidden relative z-10">
          {/* Enhanced Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 xl:w-72 bg-white/95 border-r border-slate-200/80 backdrop-blur-xl flex-shrink-0 shadow-xl">
            <NoSSR>
              <Sidebar />
            </NoSSR>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 w-full">
            {/* Enhanced Top Navigation */}
            <header className="bg-white/80 border-b border-slate-200/80 backdrop-blur-2xl flex-shrink-0 shadow-sm sticky top-0 z-50">
              <NoSSR>
                <DashboardTopbar />
              </NoSSR>
            </header>

            {/* Enhanced Main Content with better mobile spacing */}
            <main className="flex-1 overflow-y-auto bg-gradient-to-b from-transparent via-white/20 to-slate-50/40 scrollbar-hide">
              <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
                <div className="min-h-full space-y-4 sm:space-y-6 lg:space-y-8">
                  <NoSSR showLoader>
                    {children}
                  </NoSSR>
                </div>
              </div>

              {/* Bottom padding for mobile navigation */}
              <div className="h-20 lg:h-0" />
            </main>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 z-50">
          <NoSSR>
            <MobileBottomNav />
          </NoSSR>
        </div>
      </div>
    </OrgProvider>
  );
}
