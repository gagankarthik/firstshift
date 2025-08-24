// app/(dashboard)/news/page.tsx
"use client";

import * as React from "react";
import { createClient } from "@/lib/supabaseClient";
import { useOrg } from "@/components/providers/OrgProvider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Pin, PinOff, MoreHorizontal, Plus, Loader2, Trash2 } from "lucide-react";

type Role = "admin" | "manager" | "employee";

type MaybeArray<T> = T | T[] | null | undefined;
function pickOne<T>(v: MaybeArray<T>): T | null {
  return Array.isArray(v) ? v[0] ?? null : v ?? null;
}

type Author = { full_name: string | null; avatar_url: string | null };
type NewsRow = {
  id: string;
  org_id: string;
  title: string;
  body: string;
  pinned: boolean;
  created_by: string;
  created_at: string;
  author?: Author | null;
};

export default function NewsPage() {
  const sb = React.useMemo(() => createClient(), []);
  const { orgId, role, loading } = useOrg();
  const canManage = role === "admin" || role === "manager";

  const [busy, setBusy] = React.useState(true);
  const [rows, setRows] = React.useState<NewsRow[]>([]);
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [pinned, setPinned] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!orgId) return;
    setBusy(true);
    const { data, error } = await sb
      .from("news")
      .select(
        "id, org_id, title, body, pinned, created_by, created_at, author:created_by(full_name, avatar_url)"
      )
      .eq("org_id", orgId)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load notices", { description: error.message });
      setBusy(false);
      return;
    }
    const normalized: NewsRow[] = (data || []).map((r: any) => ({
      id: r.id,
      org_id: r.org_id,
      title: r.title,
      body: r.body,
      pinned: !!r.pinned,
      created_by: r.created_by,
      created_at: r.created_at,
      author: pickOne<Author>(r.author),
    }));
    setRows(normalized);
    setBusy(false);
  }, [sb, orgId]);

  React.useEffect(() => { void load(); }, [load]);

  // realtime
  React.useEffect(() => {
    if (!orgId) return;
    const ch = sb
      .channel(`news-${orgId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "news", filter: `org_id=eq.${orgId}` },
        load
      )
      .subscribe();
    return () => { sb.removeChannel(ch); };
  }, [sb, orgId, load]);

  async function createNotice(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId) return;
    setSubmitting(true);
    const { data: u } = await sb.auth.getUser();
    const uid = u.user?.id;
    if (!uid) {
      setSubmitting(false);
      toast.error("Not signed in");
      return;
    }
    const { error } = await sb.from("news").insert({
      org_id: orgId,
      title: title.trim(),
      body: body.trim(),
      pinned,
      created_by: uid,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Failed to post", { description: error.message });
      return;
    }
    toast.success("Notice posted");
    setTitle("");
    setBody("");
    setPinned(false);
    setOpen(false);
    // realtime will refresh
  }

  async function togglePin(id: string, next: boolean) {
    const prev = [...rows];
    setRows((cur) => cur.map((r) => (r.id === id ? { ...r, pinned: next } : r)));
    const { error } = await sb.from("news").update({ pinned: next }).eq("id", id);
    if (error) {
      setRows(prev);
      toast.error("Failed to update pin", { description: error.message });
    } else {
      toast.success(next ? "Pinned" : "Unpinned");
    }
  }

  async function remove(id: string) {
    const prev = [...rows];
    setRows((cur) => cur.filter((r) => r.id !== id));
    const { error } = await sb.from("news").delete().eq("id", id);
    if (error) {
      setRows(prev);
      toast.error("Failed to delete", { description: error.message });
    } else {
      toast.success("Notice deleted");
    }
  }

  if (loading || !orgId) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-semibold">News & Notices</h1>
        <div className="ml-auto" />
        {canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> New notice</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create notice</DialogTitle>
              </DialogHeader>
              <form onSubmit={createNotice} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Holiday hours this week"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body">Details</Label>
                  <Textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write the announcement..."
                    rows={6}
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={pinned}
                      onChange={(e) => setPinned(e.target.checked)}
                    />
                    Pin to top
                  </label>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting…</> : "Post"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* List */}
      <div className="grid gap-3">
        {busy && (
          <Card className="p-4 text-sm text-gray-500">
            <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
            Loading notices…
          </Card>
        )}

        {!busy && rows.length === 0 && (
          <Card className="p-5 text-sm text-gray-500">
            No notices yet. {canManage ? "Create the first announcement." : "Your managers will post important updates here."}
          </Card>
        )}

        {!busy &&
          rows.map((n) => (
            <Card key={n.id} className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={n.author?.avatar_url ?? undefined} alt="" />
                  <AvatarFallback>
                    {(n.author?.full_name?.[0] || "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-base font-semibold">{n.title}</h3>
                    {n.pinned && (
                      <Badge className="bg-amber-50 text-amber-700" variant="outline">
                        Pinned
                      </Badge>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500">
                    {n.author?.full_name || "Someone"} • {new Date(n.created_at).toLocaleString()}
                  </div>
                  <div className="prose prose-sm mt-3 max-w-none whitespace-pre-wrap text-gray-800">
                    {n.body}
                  </div>
                </div>

                {canManage && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Actions">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      {n.pinned ? (
                        <DropdownMenuItem onClick={() => togglePin(n.id, false)}>
                          <PinOff className="mr-2 h-4 w-4" /> Unpin
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => togglePin(n.id, true)}>
                          <Pin className="mr-2 h-4 w-4" /> Pin
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => remove(n.id)}
                        className="text-red-600 focus:text-red-700"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
}
