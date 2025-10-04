"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Award,
  Plus,
  X,
  Star,
  Shield,
  CheckCircle,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export type Skill = {
  id: string;
  name: string;
  category?: string;
  description?: string;
};

export type EmployeeSkill = {
  skill_id: string;
  employee_id: string;
  proficiency_level: "beginner" | "intermediate" | "advanced" | "expert";
  certified: boolean;
  certification_date?: string;
  expiry_date?: string;
  skill: Skill;
};

interface SkillsManagerProps {
  employeeId: string;
  employeeName: string;
  employeeSkills: EmployeeSkill[];
  availableSkills: Skill[];
  onAddSkill: (
    skillId: string,
    proficiency: string,
    certified: boolean
  ) => Promise<void>;
  onRemoveSkill: (skillId: string) => Promise<void>;
  onUpdateSkill: (
    skillId: string,
    proficiency: string,
    certified: boolean
  ) => Promise<void>;
}

const PROFICIENCY_LEVELS = [
  { value: "beginner", label: "Beginner", color: "bg-blue-500" },
  { value: "intermediate", label: "Intermediate", color: "bg-yellow-500" },
  { value: "advanced", label: "Advanced", color: "bg-orange-500" },
  { value: "expert", label: "Expert", color: "bg-green-500" },
];

export function SkillsManager({
  employeeId,
  employeeName,
  employeeSkills,
  availableSkills,
  onAddSkill,
  onRemoveSkill,
  onUpdateSkill,
}: SkillsManagerProps) {
  const [addingSkill, setAddingSkill] = React.useState(false);
  const [selectedSkillId, setSelectedSkillId] = React.useState("");
  const [proficiency, setProficiency] = React.useState("intermediate");
  const [certified, setCertified] = React.useState(false);

  const unassignedSkills = availableSkills.filter(
    (skill) => !employeeSkills.find((es) => es.skill_id === skill.id)
  );

  const handleAddSkill = async () => {
    if (!selectedSkillId) {
      toast.error("Please select a skill");
      return;
    }

    try {
      await onAddSkill(selectedSkillId, proficiency, certified);
      toast.success("Skill added successfully!");
      setAddingSkill(false);
      setSelectedSkillId("");
      setProficiency("intermediate");
      setCertified(false);
    } catch (error) {
      toast.error("Failed to add skill");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Skills & Certifications
            </CardTitle>
            <Button
              onClick={() => setAddingSkill(true)}
              size="sm"
              disabled={unassignedSkills.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {employeeSkills.length === 0 ? (
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No skills assigned yet. Add skills to enable smart shift assignment.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {employeeSkills.map((empSkill, index) => {
                const levelInfo = PROFICIENCY_LEVELS.find(
                  (l) => l.value === empSkill.proficiency_level
                );
                const isExpiringSoon = empSkill.expiry_date &&
                  new Date(empSkill.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                const isExpired = empSkill.expiry_date &&
                  new Date(empSkill.expiry_date) < new Date();

                return (
                  <motion.div
                    key={empSkill.skill_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-gradient-to-r from-background/80 to-accent/10 rounded-xl border border-border/50 hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-foreground">
                            {empSkill.skill.name}
                          </h4>
                          {empSkill.certified && (
                            <Badge className="bg-gradient-to-r from-primary to-secondary">
                              <Shield className="h-3 w-3 mr-1" />
                              Certified
                            </Badge>
                          )}
                        </div>

                        {empSkill.skill.description && (
                          <p className="text-xs text-muted-foreground mb-2">
                            {empSkill.skill.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Proficiency Badge */}
                          <Badge variant="outline" className="gap-1">
                            <div
                              className={`w-2 h-2 rounded-full ${levelInfo?.color}`}
                            />
                            {levelInfo?.label}
                          </Badge>

                          {/* Certification Date */}
                          {empSkill.certification_date && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              Certified {format(new Date(empSkill.certification_date), "MMM yyyy")}
                            </div>
                          )}

                          {/* Expiry Warning */}
                          {isExpired && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Expired
                            </Badge>
                          )}
                          {!isExpired && isExpiringSoon && (
                            <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Expiring Soon
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onRemoveSkill(empSkill.skill_id)}
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Skill Dialog */}
      <Dialog open={addingSkill} onOpenChange={setAddingSkill}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Add Skill to {employeeName}
            </DialogTitle>
            <DialogDescription>
              Assign a new skill and set the proficiency level
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Skill Selection */}
            <div className="space-y-2">
              <Label>Select Skill</Label>
              <select
                className="w-full h-10 px-3 rounded-xl border border-border bg-background"
                value={selectedSkillId}
                onChange={(e) => setSelectedSkillId(e.target.value)}
              >
                <option value="">Choose a skill...</option>
                {unassignedSkills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Proficiency Level */}
            <div className="space-y-2">
              <Label>Proficiency Level</Label>
              <div className="grid grid-cols-2 gap-2">
                {PROFICIENCY_LEVELS.map((level) => (
                  <Button
                    key={level.value}
                    type="button"
                    variant={proficiency === level.value ? "default" : "outline"}
                    onClick={() => setProficiency(level.value)}
                    className="justify-start"
                  >
                    <div className={`w-3 h-3 rounded-full ${level.color} mr-2`} />
                    {level.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Certified Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="certified"
                checked={certified}
                onChange={(e) => setCertified(e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
              <Label htmlFor="certified" className="cursor-pointer">
                Employee is certified for this skill
              </Label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setAddingSkill(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleAddSkill} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Add Skill
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
