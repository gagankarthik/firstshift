// app/settings/codes/page.tsx
"use client";

import * as React from "react";
import { createClient } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useOrg } from "@/components/providers/OrgProvider";

import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, KeyRound, RefreshCw, ShieldAlert } from "lucide-react";
import Link from "next/link";

type Role = "employee" | "manager" | "admin";

type JoinCodeRow = {
  id: string;
  org_id: string;
  code: string;
  role: Role;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  created_by: string;
  created_at: string;
};

export default function OrgCodesPage() {
  const sb = React.useMemo(() => createClient(), []);
  const { orgId, role, loading } = useOrg();

  const [genRole, setGenRole] = React.useState<Role>("employee");
  const [maxUses, setMaxUses] = React.useState<number>(5);
  const [minutes, setMinutes] = React.useState<number>(60 * 24);
  const [busy, setBusy] = React.useState(false);
  const [row, setRow] = React.useState<JoinCodeRow | null>(null);

  function clampInt(v: string, min: number, fallback: number) {
    const n = Number.parseInt(v, 10);
    if (Number.isNaN(n)) return fallback;
    return Math.max(min, n);
  }

  async function generate() {
    if (role !== "admin") {
      toast.error("Only admins can generate join codes.");
      return;
    }
    if (!orgId) {
      toast.error("No active organization.");
      return;
    }
    setRow(null);
    setBusy(true);
    try {
      const { data, error } = await sb.rpc("generate_org_join_code", {
        p_role: genRole,
        p_max_uses: maxUses,
        p_expires_minutes: minutes,
      });

      if (error) {
        toast.error("Could not generate code", { description: error.message });
        return;
      }

      const r = Array.isArray(data)
        ? ((data[0] as JoinCodeRow | undefined) ?? null)
        : ((data as JoinCodeRow | null) ?? null);

      if (!r) {
        toast.error("No code returned");
        return;
      }

      setRow(r);
      toast.success("Join code generated");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!row?.code) return;
    try {
      await navigator.clipboard.writeText(row.code);
      toast.success("Code copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  }

  if (loading) {
    return <div className="p-4 text-sm text-gray-500">Loading…</div>;
  }

  // 🔒 Hard gate: only admins can view this page
  if (role !== "admin") {
    return (
      <div className="p-4">
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 text-amber-600" />
            <div>
              <h1 className="text-base font-semibold">Not authorized</h1>
              <p className="mt-1 text-sm text-gray-600">
                Only <span className="font-medium">Admins</span> can view or generate join codes.
              </p>
              <div className="mt-3 flex gap-2">
                <Link href="/dashboard">
                  <Button variant="outline">Back to dashboard</Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const expiresLabel = row?.expires_at ? new Date(row.expires_at).toLocaleString() : "No expiry";
  const usesLabel = row ? `${row.used_count}/${row.max_uses} used` : "";

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <KeyRound className="h-5 w-5 text-teal-600" />
        <h1 className="text-xl font-semibold">Join codes</h1>
      </div>

      {!orgId ? (
        <Card className="p-4 text-sm text-gray-600">
          No active organization. Create one in <Link href="/onboarding" className="underline">Onboarding</Link>.
        </Card>
      ) : null}

      <Card className="space-y-4 p-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-sm">Role</Label>
            <Select value={genRole} onValueChange={(v) => setGenRole(v as Role)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Max uses</Label>
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              value={maxUses}
              onChange={(e) => setMaxUses(clampInt(e.target.value, 1, 5))}
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Expires (minutes)</Label>
            <Input
              type="number"
              inputMode="numeric"
              min={5}
              value={minutes}
              onChange={(e) => setMinutes(clampInt(e.target.value, 5, 1440))}
              className="bg-white"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={generate} disabled={busy || !orgId} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {busy ? "Generating…" : "Generate code"}
          </Button>

          {row?.code ? (
            <Button variant="outline" onClick={copy} className="gap-2">
              <Copy className="h-4 w-4" />
              Copy code
            </Button>
          ) : null}
        </div>

        {row ? (
          <div className="space-y-3 rounded-lg border bg-white p-3">
            <div className="font-mono text-lg tracking-wider">{row.code}</div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <Badge variant="outline" className="bg-slate-50">Role: {row.role}</Badge>
              <Badge variant="outline" className="bg-slate-50">{usesLabel}</Badge>
              <Badge variant="outline" className="bg-slate-50">Expires: {expiresLabel}</Badge>
            </div>
          </div>
        ) : null}

        <p className="text-xs text-slate-500">
          Only admins of your active organization can generate join codes. Codes may expire and have usage limits.
        </p>
      </Card>
    </div>
  );
}
