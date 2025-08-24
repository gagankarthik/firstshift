// app/api/orgs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

type Role = "admin" | "manager" | "employee";

export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr) return NextResponse.json({ error: userErr.message }, { status: 500 });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("memberships")
    .select("org_id, role, organizations:org_id(name, created_at)")
    .eq("user_id", user.id) // scope to this user
    .order("org_id", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const orgs = (data || []).map((r: any) => ({
    id: r.org_id as string,
    name: r.organizations?.name ?? null,
    role: r.role as Role,
    created_at: r.organizations?.created_at ?? null,
  }));

  return NextResponse.json({ orgs });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr) return NextResponse.json({ error: userErr.message }, { status: 500 });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { name?: string; makeActive?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    /* ignore */
  }

  const name = (body.name || "").trim();
  const makeActive = body.makeActive !== false;

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Organization name is required." }, { status: 400 });
  }

  const { data: org, error: e1 } = await supabase
    .from("organizations")
    .insert({ name })
    .select()
    .single();
  if (e1 || !org) {
    return NextResponse.json({ error: e1?.message || "Failed to create organization." }, { status: 400 });
  }

  const { error: e2 } = await supabase
    .from("memberships")
    .insert({ org_id: org.id, user_id: user.id, role: "admin" });
  if (e2) {
    await supabase.from("organizations").delete().eq("id", org.id);
    return NextResponse.json({ error: e2.message }, { status: 400 });
  }

  if (makeActive) {
    // Do NOT chain .catch() — await and optionally inspect { error }
    const { error: setErr } = await supabase.rpc("set_active_org", { p_org_id: org.id });
    // It's safe to ignore setErr here; UI can handle fallback if needed
  }

  return NextResponse.json({ org }, { status: 201 });
}
