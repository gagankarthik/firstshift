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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Mail,
  Camera,
  Save,
  Key,
  Shield,
  UserCircle,
  Upload,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Settings,
  Calendar,
} from "lucide-react";

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
    toast.success("Avatar uploaded. Don't forget to save.");
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

    // Dispatch custom event to notify other components about the update
    window.dispatchEvent(new CustomEvent('user-profile-updated', {
      detail: { full_name, avatar_url: avatarDraft }
    }));

    toast.success("Profile updated successfully!");
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
    toast.success("Password updated successfully!");
  }

  // Skeleton while loading
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-6xl mx-auto p-6 lg:p-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
                <div className="h-4 w-48 bg-gray-100 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-24 w-24 rounded-full bg-gray-200 mx-auto"></div>
                <div className="mt-4 space-y-4">
                  <div className="h-10 w-full bg-gray-100 rounded"></div>
                  <div className="h-10 w-full bg-gray-100 rounded"></div>
                </div>
              </CardContent>
            </Card>
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-28 bg-gray-200 rounded"></div>
                <div className="h-4 w-40 bg-gray-100 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-10 w-full bg-gray-100 rounded"></div>
                  <div className="h-10 w-full bg-gray-100 rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-6xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-xl">
                <UserCircle className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Account Settings</h1>
                <p className="text-gray-600 mt-1">Manage your profile and account security</p>
              </div>
            </div>
            <div className="flex-1 lg:flex lg:justify-end">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 lg:min-w-[300px]">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 ring-2 ring-white">
                    {avatarDraft ? <AvatarImage src={avatarDraft} alt="" /> : null}
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-lg">{avatarFallback}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{nameDraft || email?.split('@')[0] || "User"}</div>
                    <div className="text-sm text-gray-600 truncate flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {email || "—"}
                    </div>
                    <div className="mt-1">
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active Account
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Enhanced Profile card */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-50" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">Profile Information</div>
                <div className="text-sm font-normal text-gray-600 mt-1">Update your personal details and avatar</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100">
              <div className="text-center">
                <div className="relative inline-block">
                  <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg">
                    {avatarDraft ? <AvatarImage src={avatarDraft} alt="" /> : null}
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-2xl">{avatarFallback}</AvatarFallback>
                  </Avatar>
                  <button
                    onClick={handleChooseFile}
                    className="absolute -bottom-2 -right-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors duration-200"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button type="button" variant="outline" onClick={handleChooseFile} className="gap-2">
                      <Upload className="h-4 w-4" />
                      Upload New
                    </Button>
                    {avatarDraft && avatarDraft !== profile?.avatar_url && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setAvatarDraft(profile?.avatar_url || null)}
                        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Reset
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Recommended: Square image, at least 200x200px, max 5MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <div className="grid gap-6 mt-6">
                <div className="space-y-3">
                  <Label htmlFor="full_name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <UserCircle className="h-4 w-4 text-gray-500" />
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    placeholder="Enter your full name"
                    className="bg-white border-gray-200 hover:border-blue-300 transition-colors h-12 text-base"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    Email Address
                  </Label>
                  <Input
                    value={email ?? ""}
                    readOnly
                    className="bg-gray-50 border-gray-200 h-12 text-base cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500">Email cannot be changed. Contact support if needed.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={saveProfile}
                disabled={savingProfile || (nameDraft === (profile?.full_name || "") && avatarDraft === profile?.avatar_url)}
                className="flex-1 gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Profile
                  </>
                )}
              </Button>
              {(nameDraft !== (profile?.full_name || "") || avatarDraft !== profile?.avatar_url) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setNameDraft(profile?.full_name || "");
                    setAvatarDraft(profile?.avatar_url || null);
                  }}
                  className="gap-2 h-12"
                >
                  Reset Changes
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Security card */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 opacity-50" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">Account Security</div>
                <div className="text-sm font-normal text-gray-600 mt-1">Update your password and security settings</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-100">
              <div className="grid gap-6">
                <div className="space-y-3">
                  <Label htmlFor="new_password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Key className="h-4 w-4 text-gray-500" />
                    New Password
                  </Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={pw1}
                    onChange={(e) => setPw1(e.target.value)}
                    placeholder="Enter new password"
                    className="bg-white border-gray-200 hover:border-red-300 transition-colors h-12 text-base"
                  />
                  {pw1 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        {pw1.length >= 8 ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                        )}
                        <span className={pw1.length >= 8 ? "text-green-600" : "text-red-600"}>
                          At least 8 characters
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="confirm_password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Key className="h-4 w-4 text-gray-500" />
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={pw2}
                    onChange={(e) => setPw2(e.target.value)}
                    placeholder="Confirm new password"
                    className="bg-white border-gray-200 hover:border-red-300 transition-colors h-12 text-base"
                  />
                  {pw2 && (
                    <div className="flex items-center gap-2 text-xs">
                      {pw1 === pw2 ? (
                        <>
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-green-600">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                          <span className="text-red-600">Passwords don't match</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={savePassword}
                disabled={savingPassword || !pw1 || !pw2 || pw1 !== pw2 || pw1.length < 8}
                className="flex-1 gap-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12"
              >
                {savingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    Update Password
                  </>
                )}
              </Button>
              {(pw1 || pw2) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setPw1("");
                    setPw2("");
                  }}
                  className="gap-2 h-12"
                >
                  Clear Fields
                </Button>
              )}
            </div>

            <Alert>
              <Settings className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Security Note:</strong> If you signed up with a magic link or social login,
                setting a password here will allow you to log in with email/password as well.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}