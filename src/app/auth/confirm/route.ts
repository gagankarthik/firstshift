// app/auth/confirm/route.ts
import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const joinCode = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next") || "";
  const DEFAULT_AFTER = "/dashboard";

  // Build a clean redirect URL (strip sensitive params)
  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = nextParam || DEFAULT_AFTER;
  ["token_hash", "type", "code", "next"].forEach((k) =>
    redirectTo.searchParams.delete(k)
  );

  if (token_hash && type) {
    const supabase = await createClient();

    // Verify the OTP/magic link
    const { error: verifyErr } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!verifyErr) {
      // If the link included a join code, try to join an org first
      if (joinCode) {
        const { data: joinData, error: joinErr } = await supabase.rpc(
          "join_org_with_code",
          { p_code: joinCode.toUpperCase(), p_auto_employee: true }
        );

        if (!joinErr && joinData?.org_id) {
          // Set active org (ignore failure, it will fall back in UI)
          try {
            await supabase.rpc("set_active_org", { p_org_id: joinData.org_id });
          } catch {
            /* noop */
          }
          redirectTo.pathname = DEFAULT_AFTER;
          return NextResponse.redirect(redirectTo);
        }

        // Invalid or expired join code → send them back to /join with an error
        redirectTo.pathname = "/join";
        redirectTo.searchParams.set("err", "invalid_or_expired_code");
        return NextResponse.redirect(redirectTo);
      }

      // No join code → see if the user already has memberships
      const { data: memberships, error: memErr } = await supabase
        .from("memberships")
        .select("org_id, role")
        .limit(1);

      if (!memErr && memberships?.length) {
        // Optionally set active org to the first membership
        const first = memberships[0];
        try {
          await supabase.rpc("set_active_org", { p_org_id: first.org_id });
        } catch {
          /* noop */
        }
        redirectTo.pathname = DEFAULT_AFTER;
        return NextResponse.redirect(redirectTo);
      }

      // Brand-new user with no org → onboarding
      redirectTo.pathname = "/welcome";
      return NextResponse.redirect(redirectTo);
    }
  }

  // Failed verification or missing params → error page
  redirectTo.pathname = "/error";
  return NextResponse.redirect(redirectTo);
}
