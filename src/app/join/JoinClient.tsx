// app/join/JoinClient.tsx
"use client";

import * as React from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type JoinOrgResult = { org_id: string | null };

function prettifyJoinCode(raw: string) {
  const cleaned = raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const groups = cleaned.match(/.{1,4}/g) ?? [];
  return groups.join("-");
}

export default function JoinClient({ initialCode }: { initialCode: string }) {
  const supabase = React.useMemo(() => createClient(), []);
  const router = useRouter();
  const [code, setCode] = React.useState(prettifyJoinCode(initialCode));
  const [busy, setBusy] = React.useState(false);

  async function join(e: React.FormEvent) {
    e.preventDefault();

    const normalized = code.replace(/-/g, "").trim().toUpperCase();
    if (!normalized) {
      toast.error("Please enter a join code.");
      return;
    }

    setBusy(true);
    const { data, error } = await supabase.rpc("join_org_with_code", {
      p_code: normalized,
      p_auto_employee: true,
    });
    setBusy(false);

    if (error) {
      toast.error("Join failed", { description: error.message });
      return;
    }

    const result = (data || {}) as JoinOrgResult;
    if (result.org_id) {
      const { error: setErr } = await supabase.rpc("set_active_org", {
        p_org_id: result.org_id,
      });
      if (setErr) {
        toast.warning("Joined, but could not set active org", {
          description: setErr.message,
        });
      }
    }

    toast.success("Joined organization");
    router.replace("/dashboard");
  }

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="mb-3 text-xl font-semibold">Join an organization</h1>
      <form onSubmit={join} className="space-y-3">
        <Input
          placeholder="Enter join code (e.g. A1B2-C3D4-E5F6)"
          value={code}
          onChange={(e) => setCode(prettifyJoinCode(e.target.value))}
          autoCapitalize="characters"
          spellCheck={false}
          className="uppercase tracking-widest"
          required
        />
        <Button className="w-full" disabled={busy || code.trim().length === 0}>
          {busy ? "Joining…" : "Join"}
        </Button>
      </form>
      <p className="mt-3 text-xs text-gray-500">
        Don’t have a code? Ask your manager/admin.
      </p>
    </div>
  );
}
