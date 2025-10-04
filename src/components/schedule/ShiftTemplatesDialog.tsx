"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  Calendar,
  Copy,
  Trash2,
  Plus,
  Save,
  Sparkles,
  Repeat,
  Star,
} from "lucide-react";
import { toast } from "sonner";

export type ShiftTemplate = {
  id: string;
  name: string;
  start_time: string; // HH:mm format
  end_time: string;
  position_id: string | null;
  location_id: string | null;
  break_minutes: number;
  days_of_week: number[]; // 0=Sun, 1=Mon, etc.
  color?: string;
};

interface ShiftTemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: ShiftTemplate[];
  positions: Array<{ id: string; name: string; color?: string | null }>;
  locations: Array<{ id: string; name: string }>;
  onSaveTemplate: (template: Omit<ShiftTemplate, "id">) => Promise<void>;
  onDeleteTemplate: (id: string) => Promise<void>;
  onApplyTemplate: (template: ShiftTemplate, date: Date) => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

export function ShiftTemplatesDialog({
  open,
  onOpenChange,
  templates,
  positions,
  locations,
  onSaveTemplate,
  onDeleteTemplate,
  onApplyTemplate,
}: ShiftTemplatesDialogProps) {
  const [creating, setCreating] = React.useState(false);
  const [newTemplate, setNewTemplate] = React.useState({
    name: "",
    start_time: "09:00",
    end_time: "17:00",
    position_id: null as string | null,
    location_id: null as string | null,
    break_minutes: 30,
    days_of_week: [] as number[],
  });
  const [saving, setSaving] = React.useState(false);

  const handleSave = async () => {
    if (!newTemplate.name || !newTemplate.start_time || !newTemplate.end_time) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      await onSaveTemplate(newTemplate);
      toast.success("Template saved successfully!");
      setNewTemplate({
        name: "",
        start_time: "09:00",
        end_time: "17:00",
        position_id: null,
        location_id: null,
        break_minutes: 30,
        days_of_week: [],
      });
      setCreating(false);
    } catch (error) {
      toast.error("Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: number) => {
    setNewTemplate((prev) => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter((d) => d !== day)
        : [...prev.days_of_week, day].sort(),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
              <Repeat className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Shift Templates
              </DialogTitle>
              <DialogDescription>
                Create reusable shift templates for faster scheduling
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Create New Template */}
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plus className="h-4 w-4 text-primary" />
                  Create New Template
                </CardTitle>
                <Button
                  variant={creating ? "ghost" : "default"}
                  size="sm"
                  onClick={() => setCreating(!creating)}
                >
                  {creating ? "Cancel" : <Plus className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>

            <AnimatePresence>
              {creating && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <CardContent className="space-y-4">
                    {/* Template Name */}
                    <div className="space-y-2">
                      <Label htmlFor="template-name" className="font-semibold">
                        Template Name *
                      </Label>
                      <Input
                        id="template-name"
                        placeholder="e.g., Morning Shift"
                        value={newTemplate.name}
                        onChange={(e) =>
                          setNewTemplate({ ...newTemplate, name: e.target.value })
                        }
                      />
                    </div>

                    {/* Time Range */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-semibold">Start Time *</Label>
                        <Input
                          type="time"
                          value={newTemplate.start_time}
                          onChange={(e) =>
                            setNewTemplate({ ...newTemplate, start_time: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-semibold">End Time *</Label>
                        <Input
                          type="time"
                          value={newTemplate.end_time}
                          onChange={(e) =>
                            setNewTemplate({ ...newTemplate, end_time: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    {/* Position & Location */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-semibold">Position</Label>
                        <Select
                          value={newTemplate.position_id || ""}
                          onValueChange={(value) =>
                            setNewTemplate({ ...newTemplate, position_id: value || null })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select position" />
                          </SelectTrigger>
                          <SelectContent>
                            {positions.map((pos) => (
                              <SelectItem key={pos.id} value={pos.id}>
                                {pos.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-semibold">Location</Label>
                        <Select
                          value={newTemplate.location_id || ""}
                          onValueChange={(value) =>
                            setNewTemplate({ ...newTemplate, location_id: value || null })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((loc) => (
                              <SelectItem key={loc.id} value={loc.id}>
                                {loc.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Break Minutes */}
                    <div className="space-y-2">
                      <Label className="font-semibold">Break Minutes</Label>
                      <Input
                        type="number"
                        min="0"
                        value={newTemplate.break_minutes}
                        onChange={(e) =>
                          setNewTemplate({
                            ...newTemplate,
                            break_minutes: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    {/* Days of Week */}
                    <div className="space-y-2">
                      <Label className="font-semibold">Repeats On</Label>
                      <div className="flex gap-2 flex-wrap">
                        {DAYS_OF_WEEK.map((day) => (
                          <Button
                            key={day.value}
                            type="button"
                            variant={
                              newTemplate.days_of_week.includes(day.value)
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => toggleDay(day.value)}
                            className="w-12"
                          >
                            {day.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Save Button */}
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full"
                      size="lg"
                    >
                      {saving ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Save className="h-4 w-4 mr-2" />
                          </motion.div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Template
                        </>
                      )}
                    </Button>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Existing Templates */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              Saved Templates ({templates.length})
            </h3>

            {templates.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <Repeat className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No templates yet. Create your first template above.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {templates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="glass-card group hover:shadow-glow transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground mb-1">
                              {template.name}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {template.start_time} - {template.end_time}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={async () => {
                                await onDeleteTemplate(template.id);
                                toast.success("Template deleted");
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>

                        {/* Days of Week */}
                        {template.days_of_week.length > 0 && (
                          <div className="flex gap-1 mb-3 flex-wrap">
                            {template.days_of_week.map((day) => (
                              <Badge key={day} variant="outline" className="text-xs">
                                {DAYS_OF_WEEK.find((d) => d.value === day)?.label}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Break Time */}
                        {template.break_minutes > 0 && (
                          <div className="text-xs text-muted-foreground mb-3">
                            Break: {template.break_minutes} minutes
                          </div>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            // This would be handled by parent component
                            toast.success("Select a date on the schedule to apply this template");
                          }}
                        >
                          <Copy className="h-3 w-3 mr-2" />
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
