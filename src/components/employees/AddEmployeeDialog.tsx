"use client";
import * as React from "react";
import { createClient } from "@/lib/supabaseClient";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, ChevronsUpDown, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";

type Option = { id: string; full_name: string; avatar_url: string | null; };

export default function AddEmployeeDialog({
  orgId, open, onOpenChange,
}:{ orgId: string; open: boolean; onOpenChange: (v:boolean)=>void }) {
  const sb = React.useMemo(() => createClient(), []);
  const [options, setOptions] = React.useState<Option[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [selected, setSelected] = React.useState<Option | null>(null);
  const [title, setTitle] = React.useState("");

  const loadCandidates = React.useCallback(async () => {
    setLoading(true);
    const { data: empProfiles } = await sb.from("employees").select("profile_id").eq("org_id", orgId);
    const existing = new Set<string>(); (empProfiles||[]).forEach(r => r.profile_id && existing.add(r.profile_id));

    const { data: members, error } = await sb.from("memberships")
      .select("user_id, profiles:profiles(id, full_name, avatar_url)")
      .eq("org_id", orgId);

    if (error) {
      setLoading(false);
      toast.error("Failed to load users", { description: error.message });
      return;
    }

    const opts: Option[] = (members || [])
      .map((m: any) => ({ id: m.profiles?.id, full_name: m.profiles?.full_name || "Unnamed", avatar_url: m.profiles?.avatar_url || null }))
      .filter(o => o.id && !existing.has(o.id as string)) as Option[];

    opts.sort((a,b) => a.full_name.localeCompare(b.full_name));
    setOptions(opts); setLoading(false);
  }, [sb, orgId]);

  React.useEffect(() => { if (open) { setSelected(null); setTitle(""); loadCandidates(); } }, [open, loadCandidates]);

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    const payload = {
      org_id: orgId,
      profile_id: selected.id,
      full_name: selected.full_name,
      avatar_url: selected.avatar_url,
    };
    const { error } = await sb.from("employees").insert(payload);
    setSaving(false);
    if (error) {
      toast.error("Failed to add employee", { description: error.message });
      return;
    }
    toast.success("Employee added");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Add employee</DialogTitle>
          <DialogDescription>Choose a user from your organization to add as an employee.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="text-sm font-medium">Select user</div>
          <UserCombo options={options} loading={loading} value={selected} onChange={setSelected} />

          <div className="space-y-2">
            <label className="text-sm font-medium">Title (optional)</label>
            <Input placeholder="e.g., Barista, Cashier, Manager" value={title} onChange={(e)=>setTitle(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!selected || saving} onClick={handleSave}>{saving ? "Adding..." : "Add employee"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UserCombo({ options, loading, value, onChange }:{
  options: Option[]; loading: boolean; value: Option | null; onChange: (o:Option|null)=>void
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          <div className="flex items-center gap-2">
            {value ? (
              <Avatar className="h-6 w-6"><AvatarImage src={value.avatar_url || undefined} /><AvatarFallback>{value.full_name?.slice(0,1).toUpperCase()}</AvatarFallback></Avatar>
            ) : (<Users className="h-4 w-4 opacity-60" />)}
            <span className="truncate">{value ? value.full_name : "Select a user"}</span>
          </div>
          <ChevronsUpDown className="h-4 w-4 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search users..." />
          <CommandEmpty>{loading ? "Loading..." : "No users found"}</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {options.map(o => (
              <CommandItem key={o.id} onSelect={() => { onChange(o); setOpen(false); }} className="gap-2">
                <Avatar className="h-6 w-6"><AvatarImage src={o.avatar_url || undefined} /><AvatarFallback>{o.full_name?.slice(0,1).toUpperCase()}</AvatarFallback></Avatar>
                <span className="truncate">{o.full_name}</span>
                <Check className={cn("ml-auto h-4 w-4", value?.id === o.id ? "opacity-100" : "opacity-0")} />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
