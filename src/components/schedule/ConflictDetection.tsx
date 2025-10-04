"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  XCircle,
  Clock,
  User,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";
import { format } from "date-fns";

export type ConflictType =
  | "overtime"
  | "double_booking"
  | "no_availability"
  | "no_time_off"
  | "insufficient_break"
  | "skill_mismatch"
  | "under_hours"
  | "max_shifts_exceeded";

export type Conflict = {
  id: string;
  type: ConflictType;
  severity: "error" | "warning" | "info";
  employee_id: string;
  employee_name: string;
  shift_id: string;
  date: string;
  description: string;
  suggestion?: string;
};

interface ConflictDetectionProps {
  conflicts: Conflict[];
  onResolve?: (conflictId: string) => void;
  onIgnore?: (conflictId: string) => void;
  showResolved?: boolean;
}

const CONFLICT_CONFIG: Record<
  ConflictType,
  { icon: React.ElementType; color: string; bgColor: string; label: string }
> = {
  overtime: {
    icon: Clock,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    label: "Overtime Risk",
  },
  double_booking: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    label: "Double Booking",
  },
  no_availability: {
    icon: AlertCircle,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    label: "No Availability",
  },
  no_time_off: {
    icon: Calendar,
    color: "text-red-600",
    bgColor: "bg-red-50",
    label: "Time Off Conflict",
  },
  insufficient_break: {
    icon: AlertTriangle,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    label: "Insufficient Break",
  },
  skill_mismatch: {
    icon: User,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    label: "Skill Mismatch",
  },
  under_hours: {
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    label: "Under Hours",
  },
  max_shifts_exceeded: {
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    label: "Max Shifts Exceeded",
  },
};

export function ConflictDetection({
  conflicts,
  onResolve,
  onIgnore,
  showResolved = false,
}: ConflictDetectionProps) {
  const groupedConflicts = React.useMemo(() => {
    const groups = {
      error: conflicts.filter((c) => c.severity === "error"),
      warning: conflicts.filter((c) => c.severity === "warning"),
      info: conflicts.filter((c) => c.severity === "info"),
    };
    return groups;
  }, [conflicts]);

  const totalConflicts = conflicts.length;
  const errorCount = groupedConflicts.error.length;
  const warningCount = groupedConflicts.warning.length;

  if (totalConflicts === 0 && !showResolved) {
    return (
      <Card className="glass-card border-green-200">
        <CardContent className="py-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-3" />
          </motion.div>
          <h3 className="font-semibold text-lg text-green-700 mb-1">
            No Conflicts Detected
          </h3>
          <p className="text-sm text-green-600">
            Your schedule is ready to publish!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className="glass-card border-primary/30 shadow-glow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <span>Schedule Conflicts</span>
            </div>
            <div className="flex items-center gap-2">
              {errorCount > 0 && (
                <Badge className="bg-red-500">
                  {errorCount} Error{errorCount > 1 ? "s" : ""}
                </Badge>
              )}
              {warningCount > 0 && (
                <Badge className="bg-orange-500">
                  {warningCount} Warning{warningCount > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Error Conflicts */}
      {groupedConflicts.error.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Critical Issues ({groupedConflicts.error.length})
          </h3>
          <div className="space-y-2">
            {groupedConflicts.error.map((conflict, index) => (
              <ConflictCard
                key={conflict.id}
                conflict={conflict}
                index={index}
                onResolve={onResolve}
                onIgnore={onIgnore}
              />
            ))}
          </div>
        </div>
      )}

      {/* Warning Conflicts */}
      {groupedConflicts.warning.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-orange-600 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Warnings ({groupedConflicts.warning.length})
          </h3>
          <div className="space-y-2">
            {groupedConflicts.warning.map((conflict, index) => (
              <ConflictCard
                key={conflict.id}
                conflict={conflict}
                index={index}
                onResolve={onResolve}
                onIgnore={onIgnore}
              />
            ))}
          </div>
        </div>
      )}

      {/* Info Conflicts */}
      {groupedConflicts.info.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
            <Info className="h-4 w-4" />
            Suggestions ({groupedConflicts.info.length})
          </h3>
          <div className="space-y-2">
            {groupedConflicts.info.map((conflict, index) => (
              <ConflictCard
                key={conflict.id}
                conflict={conflict}
                index={index}
                onResolve={onResolve}
                onIgnore={onIgnore}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ConflictCard({
  conflict,
  index,
  onResolve,
  onIgnore,
}: {
  conflict: Conflict;
  index: number;
  onResolve?: (id: string) => void;
  onIgnore?: (id: string) => void;
}) {
  const config = CONFLICT_CONFIG[conflict.type];
  const Icon = config.icon;

  const borderColor =
    conflict.severity === "error"
      ? "border-red-300"
      : conflict.severity === "warning"
      ? "border-orange-300"
      : "border-blue-300";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={`glass-card ${borderColor}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`p-2 rounded-lg ${config.bgColor}`}>
              <Icon className={`h-5 w-5 ${config.color}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-semibold text-foreground text-sm">
                    {config.label}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {conflict.employee_name}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(conflict.date), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
                <Badge
                  variant={conflict.severity === "error" ? "destructive" : "outline"}
                  className="text-xs shrink-0"
                >
                  {conflict.severity}
                </Badge>
              </div>

              <p className="text-sm text-foreground/80 mb-2">
                {conflict.description}
              </p>

              {conflict.suggestion && (
                <div className="p-2 bg-accent/30 rounded-lg mb-2">
                  <p className="text-xs text-muted-foreground">
                    💡 <span className="font-medium">Suggestion:</span>{" "}
                    {conflict.suggestion}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {(onResolve || onIgnore) && (
                <div className="flex gap-2 mt-3">
                  {onResolve && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onResolve(conflict.id)}
                      className="text-xs"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Resolve
                    </Button>
                  )}
                  {onIgnore && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onIgnore(conflict.id)}
                      className="text-xs"
                    >
                      Ignore
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
