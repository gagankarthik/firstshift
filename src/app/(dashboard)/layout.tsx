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
      <div className="min-h-screen bg-gray-50 text-gray-900 md:grid md:grid-cols-[260px_1fr]">
        <Sidebar />
        <div className="min-h-screen flex flex-col">
          <DashboardTopbar />
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </OrgProvider>
  );
}
