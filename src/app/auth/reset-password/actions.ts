// app/reset-password/actions.ts
"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabaseServer";

async function getOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

export async function sendReset(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email) redirect("/reset-password");

  const supabase = await createClient();

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || getOrigin();

  // Supabase will send the email; when the user clicks it,
  // they’ll be sent to /auth/confirm?type=recovery
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?type=recovery`,
  });

  // Keep it minimal: on success or error just go back to login.
  redirect("/login");
}
