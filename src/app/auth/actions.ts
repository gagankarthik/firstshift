// app/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // Your /login page can read ?error= and show a Sonner toast
   toast.error(error.message || "Login failed");
    redirect("/auth/login");
  }
  // Check memberships
  const { data: memberships, error: memErr } = await supabase
    .from("memberships")
    .select("org_id")
    .limit(1);

  if (!memErr && memberships?.length) {
    // Set active org (ignore failure)
    const first = memberships[0];
    await supabase.rpc("set_active_org", { p_org_id: first.org_id });
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  // No org yet → onboard
  revalidatePath("/", "layout");
  redirect("/welcome");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const full_name = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  if (!email || !password) {
    toast.error("Email and password are required.");
    redirect("/auth/signup");
  }
  if (password !== confirm) {
    toast.error("Passwords do not match.");
    redirect("/auth/signup");
  }

  // Include full_name in user metadata so your profile trigger can pick it up
  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name } },
  });

  if (error) {
    toast.error(error.message || "Sign up failed");
    redirect("/auth/signup");
  }

  // If email confirmation is required, there's no session yet—send to check email
  if (!data.session) {
    revalidatePath("/", "layout");
    redirect("/auth/check-email");
  }

  // If we do have a session, route based on memberships (same as login)
  const { data: memberships, error: memErr } = await supabase
    .from("memberships")
    .select("org_id")
    .limit(1);

  if (!memErr && memberships?.length) {
    const first = memberships[0];
    await supabase.rpc("set_active_org", { p_org_id: first.org_id });
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  revalidatePath("/", "layout");
  redirect("/welcome");
}
