// app/settings/page.tsx
"use client";

import * as React from "react";
import { createClient } from "@/lib/supabaseClient";
import { useOrg } from "@/components/providers/OrgProvider";
import { toast } from "sonner";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import {
  Copy,
  RefreshCcw,
  Save,
  Trash2,
  Plus,
  Settings,
  Building2,
  Users,
  MapPin,
  Briefcase,
  QrCode,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  Info,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ================== Types ================== */

type Role = "admin" | "manager" | "employee";

type Org = {
  id: string;
  name: string;
  created_at?: string; // organizations.created_at exists, keep it
};

type JoinCodeRow = {
  id: string;
  org_id: string;
  code: string;
  role: Role;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  active: boolean;
  created_at: string | null;
};

type Position = {
  id: string;
  name: string;
  color: string | null;
  shift_count?: number; // computed via relation or separate count
};

type Location = {
  id: string;
  name: string;
  shift_count?: number; // computed via relation or separate count
};

type OrgStats = {
  totalEmployees: number;
  totalShifts: number;
  activePositions: number;
  activeLocations: number;
};

/* ============== Skeleton (loading) ============== */

function SkeletonCard() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-72 bg-gray-100 rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="h-10 w-full bg-gray-100 rounded animate-pulse" />
          <div className="h-10 w-full bg-gray-100 rounded animate-pulse" />
          <div className="h-20 w-full bg-gray-100 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

/* ================== Page ================== */

export default function SettingsPage() {
  const sb = React.useMemo(() => createClient(), []);
  const { orgId, role, loading } = useOrg();
  const canManage = role === "admin" || role === "manager";

  // Loading states
  const [dataLoading, setDataLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  // ORG
  const [org, setOrg] = React.useState<Org | null>(null);
  const [orgName, setOrgName] = React.useState("");
  const [orgStats, setOrgStats] = React.useState<OrgStats>({
    totalEmployees: 0,
    totalShifts: 0,
    activePositions: 0,
    activeLocations: 0,
  });

  // JOIN CODES
  const [codes, setCodes] = React.useState<JoinCodeRow[]>([]);
  const [genRole, setGenRole] = React.useState<Role>("employee");
  const [genMaxUses, setGenMaxUses] = React.useState<number>(5);
  const [genMinutes, setGenMinutes] = React.useState<number>(60 * 24);
  const [genBusy, setGenBusy] = React.useState(false);
  const [showExpiredCodes, setShowExpiredCodes] = React.useState(false);

  // POSITIONS
  const [positions, setPositions] = React.useState<Position[]>([]);
  const [newPosName, setNewPosName] = React.useState("");
  const [newPosColor, setNewPosColor] = React.useState("#3b82f6");
  const [savingPos, setSavingPos] = React.useState(false);
  const [deletingPosId, setDeletingPosId] = React.useState<string | null>(null);

  // LOCATIONS
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [newLocName, setNewLocName] = React.useState("");
  const [savingLoc, setSavingLoc] = React.useState(false);
  const [deletingLocId, setDeletingLocId] = React.useState<string | null>(null);

  // Error handling
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  /* ============== Loaders ============== */

  const loadOrg = React.useCallback(async () => {
    if (!orgId) return;
    try {
      const { data, error } = await sb
        .from("organizations")
        .select("id, name, created_at")
        .eq("id", orgId)
        .maybeSingle();

      if (error) throw error;

      const orgData = data as Org;
      setOrg(orgData);
      setOrgName(orgData?.name ?? "");
      setErrors((prev) => ({ ...prev, org: "" }));
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, org: error.message }));
      toast.error("Failed to load organization", { description: error.message });
    }
  }, [sb, orgId]);

  const loadStats = React.useCallback(async () => {
    if (!orgId) return;
    try {
      const [employeesRes, shiftsRes, positionsRes, locationsRes] = await Promise.all([
        sb.from("employees").select("id", { count: "exact", head: true }).eq("org_id", orgId),
        sb.from("shifts").select("id", { count: "exact", head: true }).eq("org_id", orgId),
        sb.from("positions").select("id", { count: "exact", head: true }).eq("org_id", orgId),
        sb.from("locations").select("id", { count: "exact", head: true }).eq("org_id", orgId),
      ]);

      setOrgStats({
        totalEmployees: employeesRes.count || 0,
        totalShifts: shiftsRes.count || 0,
        activePositions: positionsRes.count || 0,
        activeLocations: locationsRes.count || 0,
      });
    } catch (error: any) {
      console.error("Failed to load stats:", error);
    }
  }, [sb, orgId]);

  const loadCodes = React.useCallback(async () => {
    if (!orgId) return;
    try {
      const { data, error } = await sb
        .from("org_join_codes")
        .select("id, org_id, code, role, max_uses, used_count, expires_at, active, created_at")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      setCodes((data || []) as JoinCodeRow[]);
      setErrors((prev) => ({ ...prev, codes: "" }));
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, codes: error.message }));
      toast.error("Failed to load join codes", { description: error.message });
    }
  }, [sb, orgId]);

  const loadPositions = React.useCallback(async () => {
    if (!orgId) return;
    try {
      const { data, error } = await sb
        .from("positions")
        .select(
          `
          id, name, color,
          shifts:shifts(count)
        `
        )
        .eq("org_id", orgId)
        .order("name");

      if (error) throw error;

      const positionsWithCounts = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        shift_count: Array.isArray(p.shifts) ? p.shifts.length : p.shifts?.count || 0,
      }));

      setPositions(positionsWithCounts);
      setErrors((prev) => ({ ...prev, positions: "" }));
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, positions: error.message }));
      toast.error("Failed to load positions", { description: error.message });
    }
  }, [sb, orgId]);

  const loadLocations = React.useCallback(async () => {
    if (!orgId) return;
    try {
      const { data, error } = await sb
        .from("locations")
        .select(
          `
          id, name,
          shifts:shifts(count)
        `
        )
        .eq("org_id", orgId)
        .order("name");

      if (error) throw error;

      const locationsWithCounts = (data || []).map((l: any) => ({
        id: l.id,
        name: l.name,
        shift_count: Array.isArray(l.shifts) ? l.shifts.length : l.shifts?.count || 0,
      }));

      setLocations(locationsWithCounts);
      setErrors((prev) => ({ ...prev, locations: "" }));
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, locations: error.message }));
      toast.error("Failed to load locations", { description: error.message });
    }
  }, [sb, orgId]);

  const loadAllData = React.useCallback(async () => {
    if (!orgId) return;
    setDataLoading(true);
    try {
      await Promise.all([loadOrg(), loadStats(), loadCodes(), loadPositions(), loadLocations()]);
    } finally {
      setDataLoading(false);
    }
  }, [loadOrg, loadStats, loadCodes, loadPositions, loadLocations, orgId]);

  React.useEffect(() => {
    void loadAllData();
  }, [orgId, loadAllData]);

  // Realtime refresh
  React.useEffect(() => {
    if (!orgId) return;

    const channels = [
      sb
        .channel(`org-join-codes-${orgId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "org_join_codes", filter: `org_id=eq.${orgId}` },
          () => void loadCodes()
        ),
      sb
        .channel(`positions-${orgId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "positions", filter: `org_id=eq.${orgId}` },
          () => void loadPositions()
        ),
      sb
        .channel(`locations-${orgId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "locations", filter: `org_id=eq.${orgId}` },
          () => void loadLocations()
        ),
    ];

    channels.forEach((ch) => ch.subscribe());
    return () => channels.forEach((ch) => sb.removeChannel(ch));
  }, [sb, orgId, loadCodes, loadPositions, loadLocations]);

  /* ============== Actions ============== */

  // Organization
  async function saveOrgName() {
    if (!canManage || !org) return;
    const name = orgName.trim();
    if (!name) {
      toast.error("Organization name cannot be empty");
      return;
    }
    setSaving(true);
    try {
      const { error } = await sb.from("organizations").update({ name }).eq("id", org.id);
      if (error) throw error;
      setOrg((prev) => (prev ? { ...prev, name } : prev));
      toast.success("Organization name updated");
    } catch (error: any) {
      toast.error("Failed to update organization name", { description: error.message });
    } finally {
      setSaving(false);
    }
  }

  // Join codes
  async function generateCode() {
    if (!canManage) return;
    setGenBusy(true);
    try {
      const { error } = await sb.rpc("generate_org_join_code", {
        p_role: genRole,
        p_max_uses: genMaxUses,
        p_expires_minutes: genMinutes,
      });
      if (error) throw error;
      toast.success("Join code generated");
      await loadCodes();
    } catch (error: any) {
      toast.error("Failed to generate join code", { description: error.message });
    } finally {
      setGenBusy(false);
    }
  }

  async function toggleCodeStatus(codeId: string, currentStatus: boolean) {
    if (!canManage) return;
    try {
      const { error } = await sb.from("org_join_codes").update({ active: !currentStatus }).eq("id", codeId);
      if (error) throw error;
      setCodes((prev) => prev.map((c) => (c.id === codeId ? { ...c, active: !currentStatus } : c)));
      toast.success(!currentStatus ? "Code activated" : "Code deactivated");
    } catch (error: any) {
      toast.error("Failed to update code status", { description: error.message });
    }
  }

  async function deleteCode(codeId: string) {
    if (!canManage) return;
    if (!confirm("Delete this join code? This action cannot be undone.")) return;
    try {
      const { error } = await sb.from("org_join_codes").delete().eq("id", codeId);
      if (error) throw error;
      setCodes((prev) => prev.filter((c) => c.id !== codeId));
      toast.success("Join code deleted");
    } catch (error: any) {
      toast.error("Failed to delete join code", { description: error.message });
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).then(
      () => toast.success("Code copied to clipboard"),
      () => toast.error("Failed to copy code")
    );
  }

  // Positions
  async function addPosition() {
    if (!canManage || !orgId) return;
    const name = newPosName.trim();
    if (!name) {
      toast.error("Position name cannot be empty");
      return;
    }
    setSavingPos(true);
    try {
      const { error } = await sb.from("positions").insert({
        org_id: orgId,
        name,
        color: newPosColor || "#3b82f6",
      });
      if (error) throw error;
      setNewPosName("");
      setNewPosColor("#3b82f6");
      toast.success("Position added");
      await loadPositions();
    } catch (error: any) {
      toast.error("Failed to add position", { description: error.message });
    } finally {
      setSavingPos(false);
    }
  }

  async function updatePosition(id: string, patch: Partial<Position>) {
    if (!canManage) return;
    try {
      const { error } = await sb.from("positions").update(patch).eq("id", id);
      if (error) throw error;
      setPositions((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      toast.success("Position updated");
    } catch (error: any) {
      toast.error("Failed to update position", { description: error.message });
    }
  }

  async function deletePosition(id: string) {
    if (!canManage) return;
    const position = positions.find((p) => p.id === id);
    if ((position?.shift_count ?? 0) > 0) {
      toast.error("Cannot delete a position with assigned shifts");
      return;
    }
    if (!confirm("Delete this position?")) return;
    setDeletingPosId(id);
    try {
      const { error } = await sb.from("positions").delete().eq("id", id);
      if (error) throw error;
      setPositions((prev) => prev.filter((p) => p.id !== id));
      toast.success("Position deleted");
    } catch (error: any) {
      toast.error("Failed to delete position", { description: error.message });
    } finally {
      setDeletingPosId(null);
    }
  }

  // Locations
  async function addLocation() {
    if (!canManage || !orgId) return;
    const name = newLocName.trim();
    if (!name) {
      toast.error("Location name cannot be empty");
      return;
    }
    setSavingLoc(true);
    try {
      const { error } = await sb.from("locations").insert({ org_id: orgId, name });
      if (error) throw error;
      setNewLocName("");
      toast.success("Location added");
      await loadLocations();
    } catch (error: any) {
      toast.error("Failed to add location", { description: error.message });
    } finally {
      setSavingLoc(false);
    }
  }

  async function updateLocation(id: string, name: string) {
    if (!canManage || !name.trim()) return;
    try {
      const { error } = await sb.from("locations").update({ name: name.trim() }).eq("id", id);
      if (error) throw error;
      toast.success("Location updated");
    } catch (error: any) {
      toast.error("Failed to update location", { description: error.message });
    }
  }

  async function deleteLocation(id: string) {
    if (!canManage) return;
    const location = locations.find((l) => l.id === id);
    if ((location?.shift_count ?? 0) > 0) {
      toast.error("Cannot delete a location with assigned shifts");
      return;
    }
    if (!confirm("Delete this location?")) return;
    setDeletingLocId(id);
    try {
      const { error } = await sb.from("locations").delete().eq("id", id);
      if (error) throw error;
      setLocations((prev) => prev.filter((l) => l.id !== id));
      toast.success("Location deleted");
    } catch (error: any) {
      toast.error("Failed to delete location", { description: error.message });
    } finally {
      setDeletingLocId(null);
    }
  }

  /* ============== Helpers ============== */

  const getCodeStatus = (code: JoinCodeRow) => {
    if (!code.active) return { text: "Inactive", color: "destructive" as const };
    if (code.expires_at && new Date(code.expires_at) < new Date()) return { text: "Expired", color: "destructive" as const };
    if (code.used_count >= code.max_uses) return { text: "Full", color: "secondary" as const };
    return { text: "Active", color: "default" as const };
  };

  const filteredCodes = showExpiredCodes
    ? codes
    : codes.filter((code) => {
        const status = getCodeStatus(code);
        return status.text !== "Expired" && status.text !== "Inactive";
      });

  // Ensures we always return a strict boolean
  const hasAssignedShifts = (count?: number) => (count ?? 0) > 0;

  /* ============== Rendering ============== */

  if (loading || !orgId) {
    return (
      <div className="space-y-6 p-4 lg:p-6">
        <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
        <div className="grid gap-6 lg:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin" />
          <div>
            <div className="text-lg font-medium">Loading settings...</div>
            <div className="text-sm text-gray-400">Please wait</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-gray-600">Manage your organization settings and configurations</p>
        </div>

        {org && (
          <Card className="p-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{orgStats.totalEmployees}</div>
                <div className="text-xs text-gray-500">Employees</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{orgStats.totalShifts}</div>
                <div className="text-xs text-gray-500">Total Shifts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{orgStats.activePositions}</div>
                <div className="text-xs text-gray-500">Positions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">{orgStats.activeLocations}</div>
                <div className="text-xs text-gray-500">Locations</div>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Tabs defaultValue="org" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto">
          <TabsTrigger value="org" className="flex items-center gap-2 py-3">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Organization</span>
          </TabsTrigger>
          <TabsTrigger value="codes" className="flex items-center gap-2 py-3">
            <QrCode className="h-4 w-4" />
            <span className="hidden sm:inline">Join Codes</span>
          </TabsTrigger>
          <TabsTrigger value="positions" className="flex items-center gap-2 py-3">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Positions</span>
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-2 py-3">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Locations</span>
          </TabsTrigger>
        </TabsList>

        {/* Organization Tab */}
        <TabsContent value="org" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Organization Details
                </CardTitle>
                <CardDescription>Update your organization name and basic information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {errors.org && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{errors.org}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="org_name">Organization Name</Label>
                  <Input
                    id="org_name"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    disabled={!canManage}
                    placeholder="Enter organization name"
                  />
                </div>

                {org?.created_at && (
                  <div className="space-y-2">
                    <Label>Created</Label>
                    <div className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                      {new Date(org.created_at).toLocaleDateString()}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4">
                  {!canManage && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        You need admin or manager permissions to edit organization settings
                      </AlertDescription>
                    </Alert>
                  )}

                  {canManage && (
                    <Button onClick={saveOrgName} disabled={saving} className="gap-2">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Changes
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {canManage && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    Permissions & Access
                  </CardTitle>
                  <CardDescription>Your current role and permissions in this organization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Your Role</span>
                      <Badge variant={role === "admin" ? "default" : "secondary"}>
                        {role?.charAt(0).toUpperCase()}
                        {role?.slice(1)}
                      </Badge>
                    </div>

                    <Separator />

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>View all organization data</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Manage employees and schedules</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Create and manage join codes</span>
                      </div>
                      {role === "admin" && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Full administrative access</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Join Codes Tab */}
        <TabsContent value="codes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-blue-600" />
                Join Codes
              </CardTitle>
              <CardDescription>
                Generate and manage invitation codes to let people join your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {errors.codes && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{errors.codes}</AlertDescription>
                </Alert>
              )}

              {canManage && (
                <div className="grid gap-4 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={genRole} onValueChange={(v: Role) => setGenRole(v)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Employee
                          </div>
                        </SelectItem>
                        <SelectItem value="manager">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Manager
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Admin
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Max Uses</Label>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={genMaxUses}
                      onChange={(e) => setGenMaxUses(parseInt(e.target.value || "1"))}
                      placeholder="5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Expires In (hours)</Label>
                    <Select value={genMinutes.toString()} onValueChange={(v) => setGenMinutes(parseInt(v))}>
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="360">6 hours</SelectItem>
                        <SelectItem value="720">12 hours</SelectItem>
                        <SelectItem value="1440">1 day</SelectItem>
                        <SelectItem value="4320">3 days</SelectItem>
                        <SelectItem value="10080">1 week</SelectItem>
                        <SelectItem value="43200">1 month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button onClick={generateCode} disabled={genBusy} className="w-full gap-2">
                      {genBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                      {genBusy ? "Generating..." : "Generate Code"}
                    </Button>
                  </div>
                </div>
              )}

              {!canManage && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>Only admins and managers can generate join codes</AlertDescription>
                </Alert>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Active Codes</h3>
                <div className="flex items-center gap-2">
                  <Switch id="show-expired" checked={showExpiredCodes} onCheckedChange={setShowExpiredCodes} />
                  <Label htmlFor="show-expired" className="text-sm">
                    Show expired
                  </Label>
                </div>
              </div>

              <div className="rounded-lg border bg-white">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCodes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <QrCode className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <div className="text-sm font-medium text-gray-900">No join codes found</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {canManage ? "Generate a code to get started" : "Ask an admin to create codes"}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCodes.map((code) => {
                        const status = getCodeStatus(code);
                        const isExpired = code.expires_at && new Date(code.expires_at) < new Date();

                        return (
                          <TableRow
                            key={code.id}
                            className={cn("transition-colors", !code.active && "opacity-60", isExpired && "bg-red-50")}
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{code.code}</code>
                                {!code.active && <XCircle className="h-4 w-4 text-red-500" />}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {code.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">
                                  {code.used_count} / {code.max_uses}
                                </span>
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={cn(
                                      "h-2 rounded-full transition-all",
                                      code.used_count >= code.max_uses ? "bg-red-500" : "bg-blue-500"
                                    )}
                                    style={{ width: `${Math.min(100, (code.used_count / code.max_uses) * 100)}%` }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {code.expires_at ? (
                                  <div className={cn("flex items-center gap-1", isExpired ? "text-red-600" : "text-gray-600")}>
                                    <Clock className="h-3 w-3" />
                                    {new Date(code.expires_at).toLocaleDateString()}
                                  </div>
                                ) : (
                                  <span className="text-gray-500">Never</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={status.color}>{status.text}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center gap-1 justify-end">
                                <Button variant="ghost" size="sm" onClick={() => copyCode(code.code)} className="gap-1">
                                  <Copy className="h-3 w-3" />
                                </Button>

                                {canManage && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleCodeStatus(code.id, code.active)}
                                      className="gap-1"
                                    >
                                      {code.active ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                    </Button>

                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => deleteCode(code.id)}
                                      className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                      Delete
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Positions Tab */}
        <TabsContent value="positions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-purple-600" />
                Positions
              </CardTitle>
              <CardDescription>Job titles and roles used in shift scheduling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {errors.positions && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{errors.positions}</AlertDescription>
                </Alert>
              )}

              {canManage && (
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-1 space-y-2">
                    <Label htmlFor="pos_name">Position Name</Label>
                    <Input
                      id="pos_name"
                      placeholder="e.g. Barista, Manager, Chef"
                      value={newPosName}
                      onChange={(e) => setNewPosName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addPosition()}
                    />
                  </div>

                  <div className="lg:col-span-1 space-y-2">
                    <Label>Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={newPosColor}
                        onChange={(e) => setNewPosColor(e.target.value)}
                        className="font-mono"
                        placeholder="#3b82f6"
                      />
                      <input
                        type="color"
                        value={newPosColor}
                        onChange={(e) => setNewPosColor(e.target.value)}
                        className="h-10 w-12 rounded border bg-white cursor-pointer"
                        aria-label="Pick color"
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-1 flex items-end">
                    <Button onClick={addPosition} disabled={savingPos || !newPosName.trim()} className="w-full gap-2">
                      {savingPos ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      Add Position
                    </Button>
                  </div>
                </div>
              )}

              <div className="rounded-lg border bg-white">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Position</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Shifts</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {positions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <div className="text-sm font-medium text-gray-900">No positions created</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {canManage ? "Add your first position to get started" : "Ask an admin to create positions"}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      positions.map((position) => (
                        <TableRow key={position.id}>
                          <TableCell>
                            <Input
                              value={position.name}
                              onChange={(e) => {
                                const name = e.target.value;
                                setPositions((prev) => prev.map((p) => (p.id === position.id ? { ...p, name } : p)));
                              }}
                              onBlur={(e) => {
                                const name = e.target.value.trim();
                                if (name && name !== position.name) void updatePosition(position.id, { name });
                              }}
                              disabled={!canManage}
                              className="border-0 bg-transparent p-0 focus-visible:ring-1"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={position.color || "#3b82f6"}
                                onChange={(e) => {
                                  const color = e.target.value;
                                  setPositions((prev) => prev.map((p) => (p.id === position.id ? { ...p, color } : p)));
                                  void updatePosition(position.id, { color });
                                }}
                                disabled={!canManage}
                                className="h-8 w-8 rounded border bg-white cursor-pointer disabled:cursor-not-allowed"
                                aria-label="Pick color"
                              />
                              <div className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded border" style={{ backgroundColor: position.color || "#3b82f6" }} />
                                <code className="text-xs text-gray-600">{position.color || "#3b82f6"}</code>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{position.shift_count || 0} shifts</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {canManage && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deletePosition(position.id)}
                                disabled={deletingPosId === position.id || hasAssignedShifts(position.shift_count)}
                                className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                {deletingPosId === position.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                                Delete
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Locations Tab */}
        <TabsContent value="locations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-amber-600" />
                Locations
              </CardTitle>
              <CardDescription>Physical locations, stores, or offices for scheduling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {errors.locations && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{errors.locations}</AlertDescription>
                </Alert>
              )}

              {canManage && (
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="loc_name">Location Name</Label>
                    <Input
                      id="loc_name"
                      placeholder="e.g. Downtown Store, Main Office"
                      value={newLocName}
                      onChange={(e) => setNewLocName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addLocation()}
                    />
                  </div>

                  <div className="flex items-end">
                    <Button onClick={addLocation} disabled={savingLoc || !newLocName.trim()} className="w-full gap-2">
                      {savingLoc ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      Add Location
                    </Button>
                  </div>
                </div>
              )}

              <div className="rounded-lg border bg-white">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location Name</TableHead>
                      <TableHead>Shifts</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8">
                          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <div className="text-sm font-medium text-gray-900">No locations created</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {canManage ? "Add your first location to get started" : "Ask an admin to create locations"}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      locations.map((location) => (
                        <TableRow key={location.id}>
                          <TableCell>
                            <Input
                              value={location.name}
                              onChange={(e) => {
                                const name = e.target.value;
                                setLocations((prev) => prev.map((l) => (l.id === location.id ? { ...l, name } : l)));
                              }}
                              onBlur={(e) => {
                                const name = e.target.value.trim();
                                if (name && name !== location.name) void updateLocation(location.id, name);
                              }}
                              disabled={!canManage}
                              className="border-0 bg-transparent p-0 focus-visible:ring-1"
                            />
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{location.shift_count || 0} shifts</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {canManage && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteLocation(location.id)}
                                disabled={deletingLocId === location.id || hasAssignedShifts(location.shift_count)}
                                className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                {deletingLocId === location.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                                Delete
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
