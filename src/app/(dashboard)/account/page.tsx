// app/account/page.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

const AVATAR_BUCKET = "avatars"; // Make sure this bucket exists (public recommended)

export default function AccountPage() {
  const supabase = React.useMemo(() => createClient(), []);
  const router = useRouter();

  // user + profile state
  const [uid, setUid] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState<string | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);

  const [nameDraft, setNameDraft] = React.useState("");
  const [avatarDraft, setAvatarDraft] = React.useState<string | null>(null);

  // password state
  const [pw1, setPw1] = React.useState("");
  const [pw2, setPw2] = React.useState("");
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [savingPassword, setSavingPassword] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Load user + profile
  React.useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const user = u.user ?? null;
      if (!user) {
        router.replace("/login");
        return;
      }
      setUid(user.id);
      setEmail(user.email ?? null);

      const { data: prof, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        toast.error("Failed to load profile", { description: error.message });
        return;
      }
      const p: Profile = {
        id: user.id,
        full_name: prof?.full_name ?? "",
        avatar_url: prof?.avatar_url ?? null,
      };
      setProfile(p);
      setNameDraft(p.full_name ?? "");
      setAvatarDraft(p.avatar_url ?? null);
    })();
  }, [supabase, router]);

  const avatarFallback =
    (profile?.full_name || email || "U").slice(0, 1).toUpperCase();

  async function handleChooseFile() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !uid) return;

    // Validate image
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large", { description: "Max 5MB" });
      return;
    }

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${uid}/${Date.now()}.${ext}`;

    // Upload to Storage
    const { error: upErr } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: true });

    if (upErr) {
      toast.error("Upload failed", { description: upErr.message });
      return;
    }

    // Get public URL (or sign a URL if your bucket is private)
    const { data: pub } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
    const publicUrl = pub?.publicUrl ?? null;

    if (!publicUrl) {
      toast.error("Could not resolve avatar URL");
      return;
    }

    setAvatarDraft(publicUrl);
    toast.success("Avatar uploaded. Don’t forget to save.");
  }

  async function saveProfile() {
    if (!uid) return;
    const full_name = nameDraft.trim();

    setSavingProfile(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name, avatar_url: avatarDraft })
      .eq("id", uid);

    setSavingProfile(false);
    if (error) {
      toast.error("Could not save profile", { description: error.message });
      return;
    }

    setProfile((p) =>
      p ? { ...p, full_name, avatar_url: avatarDraft } : p
    );
    toast.success("Profile updated");
  }

  async function savePassword() {
    if (!uid) return;
    if (!pw1 || pw1.length < 8) {
      toast.error("Password too short", { description: "Use at least 8 characters." });
      return;
    }
    if (pw1 !== pw2) {
      toast.error("Passwords do not match");
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: pw1 });
    setSavingPassword(false);
    if (error) {
      toast.error("Could not change password", { description: error.message });
      return;
    }
    setPw1(""); setPw2("");
    toast.success("Password updated");
  }

  // Skeleton while loading
  if (!profile) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Loading your profile…</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-24 w-24 rounded-full bg-gray-200 animate-pulse" />
            <div className="mt-4 h-10 w-64 rounded bg-gray-200 animate-pulse" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Loading…</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-10 w-full rounded bg-gray-200 animate-pulse" />
              <div className="h-10 w-full rounded bg-gray-200 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Profile card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your name and avatar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {avatarDraft ? <AvatarImage src={avatarDraft} alt="" /> : null}
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
              <div className="space-x-2">
                <Button type="button" variant="outline" onClick={handleChooseFile}>
                  Change avatar
                </Button>
                {avatarDraft && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setAvatarDraft(null)}
                  >
                    Remove
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email ?? ""} readOnly className="bg-gray-50" />
            </div>

            <div className="pt-1">
              <Button onClick={saveProfile} disabled={savingProfile}>
                {savingProfile ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security card */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Change your password.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new_password">New password</Label>
              <Input
                id="new_password"
                type="password"
                value={pw1}
                onChange={(e) => setPw1(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm new password</Label>
              <Input
                id="confirm_password"
                type="password"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="pt-1">
              <Button onClick={savePassword} disabled={savingPassword}>
                {savingPassword ? "Saving…" : "Update password"}
              </Button>
            </div>

            <Separator className="my-2" />

            <p className="text-xs text-gray-500">
              If you didn’t sign up with a password (e.g. magic link), you can set one here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
