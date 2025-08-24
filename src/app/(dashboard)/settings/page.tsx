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
import { Copy, RefreshCcw, Save, Trash2, Plus } from "lucide-react";

type Role = "admin" | "manager" | "employee";

type Org = { id: string; name: string };
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
type Position = { id: string; name: string; color: string | null };
type Location = { id: string; name: string };

export default function SettingsPage() {
  const sb = React.useMemo(() => createClient(), []);
  const { orgId, role, loading } = useOrg();
  const canManage = role === "admin" || role === "manager";

  // ORG
  const [org, setOrg] = React.useState<Org | null>(null);
  const [orgName, setOrgName] = React.useState("");

  // JOIN CODES
  const [codes, setCodes] = React.useState<JoinCodeRow[]>([]);
  const [genRole, setGenRole] = React.useState<Role>("employee");
  const [genMaxUses, setGenMaxUses] = React.useState<number>(5);
  const [genMinutes, setGenMinutes] = React.useState<number>(60 * 24);
  const [genBusy, setGenBusy] = React.useState(false);

  // POSITIONS
  const [positions, setPositions] = React.useState<Position[]>([]);
  const [newPosName, setNewPosName] = React.useState("");
  const [newPosColor, setNewPosColor] = React.useState("#22c55e");
  const [savingPos, setSavingPos] = React.useState(false);

  // LOCATIONS
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [newLocName, setNewLocName] = React.useState("");
  const [savingLoc, setSavingLoc] = React.useState(false);

  // LOADERS
  const loadOrg = React.useCallback(async () => {
    if (!orgId) return;
    const { data, error } = await sb.from("organizations").select("id, name").eq("id", orgId).maybeSingle();
    if (error) {
      toast.error("Failed to load organization", { description: error.message });
      return;
    }
    setOrg(data as Org);
    setOrgName(data?.name ?? "");
  }, [sb, orgId]);

  const loadCodes = React.useCallback(async () => {
    if (!orgId) return;
    const { data, error } = await sb
      .from("org_join_codes")
      .select("id, org_id, code, role, max_uses, used_count, expires_at, active, created_at")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) {
      toast.error("Failed to load join codes", { description: error.message });
      return;
    }
    setCodes((data || []) as JoinCodeRow[]);
  }, [sb, orgId]);

  const loadPositions = React.useCallback(async () => {
    if (!orgId) return;
    const { data, error } = await sb
      .from("positions")
      .select("id, name, color")
      .eq("org_id", orgId)
      .order("name");
    if (error) {
      toast.error("Failed to load positions", { description: error.message });
      return;
    }
    setPositions((data || []) as Position[]);
  }, [sb, orgId]);

  const loadLocations = React.useCallback(async () => {
    if (!orgId) return;
    const { data, error } = await sb
      .from("locations")
      .select("id, name")
      .eq("org_id", orgId)
      .order("name");
    if (error) {
      toast.error("Failed to load locations", { description: error.message });
      return;
    }
    setLocations((data || []) as Location[]);
  }, [sb, orgId]);

  React.useEffect(() => {
    void loadOrg();
    void loadCodes();
    void loadPositions();
    void loadLocations();
  }, [loadOrg, loadCodes, loadPositions, loadLocations]);

  // Realtime subscriptions (nice-to-have)
  React.useEffect(() => {
    if (!orgId) return;
    const ch = sb
      .channel(`settings-${orgId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "org_join_codes", filter: `org_id=eq.${orgId}` }, loadCodes)
      .on("postgres_changes", { event: "*", schema: "public", table: "positions", filter: `org_id=eq.${orgId}` }, loadPositions)
      .on("postgres_changes", { event: "*", schema: "public", table: "locations", filter: `org_id=eq.${orgId}` }, loadLocations)
      .subscribe();
    return () => { sb.removeChannel(ch); };
  }, [sb, orgId, loadCodes, loadPositions, loadLocations]);

  // ---- Hooks end; safe to branch after here
  if (loading || !orgId) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-48 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-48 animate-pulse rounded-xl bg-gray-200" />
        </div>
      </div>
    );
  }

  // ORG actions
  async function saveOrgName() {
    if (!canManage || !org) return;
    const name = orgName.trim();
    if (!name) {
      toast.error("Please enter an organization name");
      return;
    }
    const { error } = await sb.from("organizations").update({ name }).eq("id", org.id);
    if (error) {
      toast.error("Failed to rename org", { description: error.message });
      return;
    }
    toast.success("Organization updated");
    setOrg((o) => (o ? { ...o, name } : o));
  }

  // JOIN CODES actions
  async function generateCode() {
    if (!canManage) return;
    setGenBusy(true);
    const { data, error } = await sb.rpc("generate_org_join_code", {
      p_role: genRole,
      p_max_uses: genMaxUses,
      p_expires_minutes: genMinutes,
    });
    setGenBusy(false);
    if (error) {
      toast.error("Could not generate code", { description: error.message });
      return;
    }
    // Handle both return shapes (table row or scalar)
    let newRow: Partial<JoinCodeRow> | null = null;
    if (Array.isArray(data)) {
      newRow = data[0] ?? null;
    } else if (data && typeof data === "object") {
      newRow = data as any;
    } else if (typeof data === "string") {
      newRow = { code: data } as any;
    }
    if (newRow?.code) {
      toast.success("Join code generated");
      void loadCodes();
    } else {
      toast.message("Code generated", { description: "Refresh to see latest." });
    }
  }

  function copyCode(c: string) {
    navigator.clipboard.writeText(c).then(
      () => toast.success("Code copied"),
      () => toast.error("Failed to copy")
    );
  }

  // POSITIONS actions
  async function addPosition() {
    if (!canManage) return;
    const name = newPosName.trim();
    if (!name) {
      toast.error("Please enter a position name");
      return;
    }
    setSavingPos(true);
    const { error } = await sb.from("positions").insert({
      org_id: orgId,
      name,
      color: newPosColor || "#22c55e",
    });
    setSavingPos(false);
    if (error) {
      toast.error("Failed to add position", { description: error.message });
      return;
    }
    setNewPosName("");
    toast.success("Position added");
    void loadPositions();
  }

  async function updatePosition(id: string, patch: Partial<Position>) {
    if (!canManage) return;
    const { error } = await sb.from("positions").update(patch).eq("id", id);
    if (error) {
      toast.error("Failed to update position", { description: error.message });
      return;
    }
    toast.success("Position updated");
  }

  async function deletePosition(id: string) {
    if (!canManage) return;
    const confirmDel = window.confirm("Delete this position?");
    if (!confirmDel) return;
    const { error } = await sb.from("positions").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete position", { description: error.message });
      return;
    }
    toast.success("Position deleted");
  }

  // LOCATIONS actions
  async function addLocation() {
    if (!canManage) return;
    const name = newLocName.trim();
    if (!name) {
      toast.error("Please enter a location name");
      return;
    }
    setSavingLoc(true);
    const { error } = await sb.from("locations").insert({ org_id: orgId, name });
    setSavingLoc(false);
    if (error) {
      toast.error("Failed to add location", { description: error.message });
      return;
    }
    setNewLocName("");
    toast.success("Location added");
    void loadLocations();
  }

  async function deleteLocation(id: string) {
    if (!canManage) return;
    const confirmDel = window.confirm("Delete this location?");
    if (!confirmDel) return;
    const { error } = await sb.from("locations").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete location", { description: error.message });
      return;
    }
    toast.success("Location deleted");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>

      <Tabs defaultValue="org" className="w-full">
        <TabsList className="flex w-full flex-wrap gap-2">
          <TabsTrigger value="org">Organization</TabsTrigger>
          <TabsTrigger value="codes">Join Codes</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>

        {/* ORG */}
        <TabsContent value="org" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
              <CardDescription>Rename your organization.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <div className="space-y-2">
                  <Label htmlFor="org_name">Name</Label>
                  <Input
                    id="org_name"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    disabled={!canManage}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={saveOrgName} disabled={!canManage}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              </div>
              {!canManage && (
                <p className="text-xs text-gray-500">
                  You don’t have permission to edit this. Ask an admin or manager.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CODES */}
        <TabsContent value="codes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Join Codes</CardTitle>
              <CardDescription>Generate and share codes to let people join your org.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-4">
                <div>
                  <Label>Role</Label>
                  <Select value={genRole} onValueChange={(v: Role) => setGenRole(v)} disabled={!canManage}>
                    <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Max uses</Label>
                  <Input
                    type="number"
                    min={1}
                    value={genMaxUses}
                    onChange={(e) => setGenMaxUses(parseInt(e.target.value || "1"))}
                    disabled={!canManage}
                  />
                </div>
                <div>
                  <Label>Expires (minutes)</Label>
                  <Input
                    type="number"
                    min={5}
                    value={genMinutes}
                    onChange={(e) => setGenMinutes(parseInt(e.target.value || "60"))}
                    disabled={!canManage}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={generateCode} disabled={!canManage || genBusy} className="w-full">
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    {genBusy ? "Generating…" : "Generate"}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="overflow-x-auto rounded-lg border">
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
                    {codes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-sm text-gray-500">
                          No codes yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      codes.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-mono">{c.code}</TableCell>
                          <TableCell><Badge variant="secondary">{c.role}</Badge></TableCell>
                          <TableCell>{c.used_count}/{c.max_uses}</TableCell>
                          <TableCell>
                            {c.expires_at ? new Date(c.expires_at).toLocaleString() : "Never"}
                          </TableCell>
                          <TableCell>
                            {c.active ? <Badge>Active</Badge> : <Badge variant="outline">Inactive</Badge>}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => copyCode(c.code)}>
                              <Copy className="mr-2 h-4 w-4" /> Copy
                            </Button>
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

        {/* POSITIONS */}
        <TabsContent value="positions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Positions</CardTitle>
              <CardDescription>Job titles / roles used in schedules.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-[1fr_140px_120px]">
                <div>
                  <Label htmlFor="pos_name">Name</Label>
                  <Input
                    id="pos_name"
                    placeholder="e.g. Barista"
                    value={newPosName}
                    onChange={(e) => setNewPosName(e.target.value)}
                    disabled={!canManage}
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={newPosColor}
                      onChange={(e) => setNewPosColor(e.target.value)}
                      disabled={!canManage}
                      className="font-mono"
                    />
                    <input
                      type="color"
                      value={newPosColor}
                      onChange={(e) => setNewPosColor(e.target.value)}
                      disabled={!canManage}
                      className="h-10 w-10 rounded border"
                      aria-label="Pick color"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <Button onClick={addPosition} disabled={!canManage || savingPos} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {positions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-sm text-gray-500">
                          No positions yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      positions.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="max-w-[320px]">
                            <Input
                              value={p.name}
                              onChange={(e) => {
                                const name = e.target.value;
                                setPositions((arr) => arr.map((x) => (x.id === p.id ? { ...x, name } : x)));
                              }}
                              onBlur={(e) => {
                                const name = e.target.value.trim();
                                if (name && name !== p.name) updatePosition(p.id, { name });
                              }}
                              disabled={!canManage}
                            />
                          </TableCell>
                          <TableCell className="min-w-[200px]">
                            <div className="flex items-center gap-2">
                              <Input
                                value={p.color ?? "#22c55e"}
                                onChange={(e) => {
                                  const color = e.target.value;
                                  setPositions((arr) => arr.map((x) => (x.id === p.id ? { ...x, color } : x)));
                                }}
                                onBlur={(e) => {
                                  const color = e.target.value;
                                  if (color && color !== p.color) updatePosition(p.id, { color });
                                }}
                                disabled={!canManage}
                                className="font-mono"
                              />
                              <input
                                type="color"
                                value={p.color ?? "#22c55e"}
                                onChange={(e) => {
                                  const color = e.target.value;
                                  setPositions((arr) => arr.map((x) => (x.id === p.id ? { ...x, color } : x)));
                                  void updatePosition(p.id, { color });
                                }}
                                disabled={!canManage}
                                className="h-9 w-9 rounded border"
                                aria-label="Pick color"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deletePosition(p.id)}
                              disabled={!canManage}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
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

        {/* LOCATIONS */}
        <TabsContent value="locations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Locations</CardTitle>
              <CardDescription>Sites / stores / offices for scheduling.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-[1fr_160px]">
                <div>
                  <Label htmlFor="loc_name">Name</Label>
                  <Input
                    id="loc_name"
                    placeholder="e.g. Downtown Store"
                    value={newLocName}
                    onChange={(e) => setNewLocName(e.target.value)}
                    disabled={!canManage}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addLocation} disabled={!canManage || savingLoc} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-sm text-gray-500">
                          No locations yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      locations.map((l) => (
                        <TableRow key={l.id}>
                          <TableCell className="max-w-[420px]">
                            <Input
                              value={l.name}
                              onChange={(e) => {
                                const name = e.target.value;
                                setLocations((arr) => arr.map((x) => (x.id === l.id ? { ...x, name } : x)));
                              }}
                              onBlur={async (e) => {
                                const name = e.target.value.trim();
                                if (!name || !canManage) return;
                                const { error } = await sb.from("locations").update({ name }).eq("id", l.id);
                                if (error) toast.error("Failed to update location", { description: error.message });
                                else toast.success("Location updated");
                              }}
                              disabled={!canManage}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteLocation(l.id)}
                              disabled={!canManage}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
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
