// components/providers/OrgProvider.tsx
"use client";
import * as React from "react";
import { createClient } from "@/lib/supabaseClient";

export type Role = "admin" | "manager" | "employee";

type ActiveOrgRow = {
  org_id: string;
  org_name: string | null;
  role: Role;
};

type OrgCtx = {
  orgId: string | null;
  orgName: string | null;   // ← add this
  role: Role | null;
  loading: boolean;
  reload: () => Promise<void>;
};

const OrgContext = React.createContext<OrgCtx | null>(null);

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const sb = React.useMemo(() => createClient(), []);
  const [state, setState] = React.useState<OrgCtx>({
    orgId: null,
    orgName: null,
    role: null,
    loading: true,
    reload: async () => {},
  });

  const load = React.useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));

    const { data, error } = await sb
      .rpc("get_or_init_active_org")
      .maybeSingle<ActiveOrgRow>();

    if (error) {
      setState({ orgId: null, orgName: null, role: null, loading: false, reload: load });
      return;
    }

    setState({
      orgId: data?.org_id ?? null,
      orgName: data?.org_name ?? null,   // ← set it
      role: (data?.role as Role | undefined) ?? null,
      loading: false,
      reload: load,
    });
  }, [sb]);

  React.useEffect(() => { void load(); }, [load]);

  return <OrgContext.Provider value={state}>{children}</OrgContext.Provider>;
}

export function useOrg() {
  const ctx = React.useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used inside <OrgProvider>");
  return ctx;
}
