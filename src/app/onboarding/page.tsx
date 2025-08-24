// app/onboarding/page.tsx
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabaseServer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/** SERVER ACTION (inline): create org via RPC and go to /dashboard */
async function createOrgAction(formData: FormData) {
  "use server";
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("org_name") || "").trim();
  if (name.length < 2) redirect("/onboarding?error=invalid_name");

  const { error } = await supabase.rpc("create_org_and_set_active", { p_name: name });
  if (error) redirect("/onboarding?error=" + encodeURIComponent(error.message || "create_org_failed"));

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/** SERVER ACTION (inline): join with code and go to /dashboard */
async function joinWithCodeAction(formData: FormData) {
  "use server";
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const code = String(formData.get("join_code") || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (!code) redirect("/onboarding?error=empty_code");

  const { data, error } = await supabase.rpc("join_org_with_code", { p_code: code, p_auto_employee: true });
  if (error) redirect("/onboarding?error=" + encodeURIComponent(error.message || "join_failed"));

  const orgId = (data as any)?.org_id;
  if (orgId) await supabase.rpc("set_active_org", { p_org_id: orgId });

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // If already in an org, skip
  const { data: memberships } = await supabase.from("memberships").select("org_id").limit(1);
  if (memberships?.length) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Let’s get your team set up</CardTitle>
          <CardDescription>Create an organization or join with a code.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create organization</TabsTrigger>
              <TabsTrigger value="join">Join with code</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="mt-6">
              <form action={createOrgAction} className="space-y-4">
                <Input id="org_name" name="org_name" placeholder="ACME Coffee – Mission St" required />
                <Button type="submit" className="w-full">Create and continue</Button>
              </form>
            </TabsContent>

            <TabsContent value="join" className="mt-6">
              <form action={joinWithCodeAction} className="space-y-4">
                <Input id="join_code" name="join_code" placeholder="A1B2-C3D4-E5F6" className="uppercase tracking-widest" required />
                <Button type="submit" className="w-full">Join organization</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
