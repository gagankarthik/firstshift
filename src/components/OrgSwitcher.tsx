"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabaseClient";
import { useOrg } from "@/components/providers/OrgProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Building2, ChevronDown, Check, Plus } from "lucide-react";
import { toast } from "sonner";

type Organization = {
  id: string;
  name: string;
  role: string;
};

export function OrgSwitcher() {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);
  const { orgId, orgName, loading: orgLoading, reload } = useOrg();

  const [organizations, setOrganizations] = React.useState<Organization[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Fetch all organizations user belongs to
  React.useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        const { data: members } = await supabase
          .from("organization_members")
          .select(`
            org_id,
            role,
            organizations:org_id (
              id,
              name
            )
          `)
          .eq("user_id", userData.user.id);

        if (members) {
          const orgs: Organization[] = members
            .filter((m: any) => m.organizations)
            .map((m: any) => ({
              id: m.organizations.id,
              name: m.organizations.name,
              role: m.role,
            }));
          setOrganizations(orgs);
        }
      } catch (error) {
        console.error("Error fetching organizations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [supabase, orgId]);

  const switchOrganization = async (newOrgId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Update active organization
      const { error } = await supabase
        .from("user_active_org")
        .upsert({
          user_id: userData.user.id,
          org_id: newOrgId,
        });

      if (error) throw error;

      // Reload org context
      await reload();

      toast.success("Organization switched successfully");
      router.refresh();
    } catch (error: any) {
      console.error("Error switching organization:", error);
      toast.error("Failed to switch organization");
    }
  };

  // If only one organization, don't show switcher
  if (!loading && organizations.length <= 1) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200">
        <Building2 className="h-3.5 w-3.5 text-blue-600" />
        <span className="text-sm font-medium text-blue-700 truncate max-w-[200px]">
          {orgLoading ? "Loading..." : orgName || "No organization"}
        </span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
        >
          <Building2 className="h-3.5 w-3.5 text-blue-600" />
          <span className="text-sm font-medium text-blue-700 truncate max-w-[200px]">
            {orgLoading ? "Loading..." : orgName || "No organization"}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-blue-600" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 p-2 bg-white/95 backdrop-blur-xl border border-slate-200 shadow-xl rounded-2xl">
        <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Switch Organization
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-200" />

        <div className="py-1 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="px-3 py-8 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-2 text-sm text-slate-500">Loading organizations...</p>
            </div>
          ) : organizations.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <Building2 className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-2 text-sm text-slate-600 font-medium">No organizations found</p>
              <p className="text-xs text-slate-500">Create or join an organization to get started</p>
            </div>
          ) : (
            <AnimatePresence>
              {organizations.map((org, index) => (
                <motion.div
                  key={org.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <DropdownMenuItem
                    onClick={() => switchOrganization(org.id)}
                    className={`
                      flex items-center justify-between gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200
                      ${org.id === orgId
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200"
                        : "hover:bg-slate-100"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`
                        flex items-center justify-center h-10 w-10 rounded-xl flex-shrink-0
                        ${org.id === orgId
                          ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                          : "bg-gradient-to-br from-slate-200 to-slate-300"
                        }
                      `}>
                        <Building2 className={`h-5 w-5 ${org.id === orgId ? "text-white" : "text-slate-600"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold truncate ${org.id === orgId ? "text-blue-700" : "text-slate-800"}`}>
                          {org.name}
                        </div>
                        <div className="text-xs text-slate-500 truncate capitalize">
                          {org.role}
                        </div>
                      </div>
                    </div>
                    {org.id === orgId && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <Check className="h-5 w-5 text-blue-600" />
                      </motion.div>
                    )}
                  </DropdownMenuItem>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        <DropdownMenuSeparator className="bg-slate-200 mt-2" />
        <DropdownMenuItem asChild>
          <button
            onClick={() => router.push("/onboarding")}
            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-blue-50 transition-colors duration-200 w-full text-left text-blue-600"
          >
            <Plus className="h-4 w-4" />
            <span className="font-medium">Create or Join Organization</span>
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
