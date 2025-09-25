import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";

import Sidebar from "@/components/Sidebar";
import DashboardTopbar from "@/components/DashboardTopbar";
import { OrgProvider } from "@/components/providers/OrgProvider";

// Ensure this route is evaluated per-request (uses cookies for SSR auth).
export const dynamic = "force-dynamic";

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
      <div className="min-h-screen relative overflow-hidden">
        {/* Light Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
         

          {/* Light grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />
        </div>

        {/* Professional Light Layout */}
        <div className="flex h-screen overflow-hidden relative z-10">
          {/* Light Sidebar - Always visible, responsive width */}
          <div className="hidden md:block w-64 xl:w-72 bg-white/90 border-r border-slate-200 backdrop-blur-xl flex-shrink-0 shadow-lg">
            <Sidebar />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Light Top Navigation */}
            <header className="bg-transparent border-b border-slate-200 backdrop-blur-xl flex-shrink-0 shadow-sm">
              <DashboardTopbar />
            </header>

            {/* Light Page Content with proper scrolling */}
            <main className="flex-1 overflow-y-auto bg-gradient-to-b from-white/50 to-slate-50/30">
              <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-5">
                <div className="min-h-full space-y-4 sm:space-y-5">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </OrgProvider>
  );
}
