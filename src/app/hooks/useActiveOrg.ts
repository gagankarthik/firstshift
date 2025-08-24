"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

export type Role = "admin" | "manager" | "employee";
export type MyOrg = { orgId: string; name?: string | null; role: Role };

type State = {
  orgId: string | null;
  role: Role | null;
  myOrgs: MyOrg[];
  loading: boolean;
  error?: string;
};

export function useActiveOrg() {
  const supabase = useMemo(() => createClient(), []);
  const [state, setState] = useState<State>({ orgId: null, role: null, myOrgs: [], loading: true });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: undefined }));

    const { data: orgIdData, error: e1 } = await supabase.rpc("get_or_init_active_org");
    if (e1) {
      setState((s) => ({ ...s, loading: false, error: e1.message }));
      return;
    }
    const orgId: string | null = (orgIdData as string) || null;

    const { data: orgRows, error: e2 } = await supabase
      .from("memberships")
      .select("org_id, role, organizations:org_id(name)")
      .order("org_id", { ascending: true });

    const myOrgs: MyOrg[] =
      (orgRows || []).map((r: any) => ({
        orgId: r.org_id,
        name: r.organizations?.name ?? null,
        role: r.role as Role,
      })) ?? [];

    let role: Role | null = null;
    if (orgId) {
      const { data: mem, error: e3 } = await supabase
        .from("memberships")
        .select("role")
        .eq("org_id", orgId)
        .limit(1)
        .maybeSingle();
      if (!e3) role = (mem?.role as Role) ?? null;
    }

    setState({ orgId, role, myOrgs, loading: false, error: e2?.message });
  }, [supabase]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await load();
      const { data: sub } = supabase.auth.onAuthStateChange(async () => {
        if (!mounted) return;
        await load();
      });
      return () => sub.subscription.unsubscribe();
    })();
    return () => {
      mounted = false;
    };
  }, [supabase, load]);

  const setActiveOrg = useCallback(
    async (orgId: string) => {
      const { error } = await supabase.rpc("set_active_org", { p_org_id: orgId });
      if (error) throw error;
      await load();
    },
    [supabase, load]
  );

  return { ...state, setActiveOrg, reloadActiveOrg: load };
}
