"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  User,
  Calendar,
  XCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export type ShiftConfirmationStatus = "pending" | "confirmed" | "declined" | "expired";

export type PendingShift = {
  id: string;
  starts_at: string;
  ends_at: string;
  position?: { name: string; color?: string | null };
  location?: { name: string };
  confirmation_status: ShiftConfirmationStatus;
  confirmation_deadline?: string; // ISO string
};

interface ShiftConfirmationCardProps {
  shifts: PendingShift[];
  onConfirm: (shiftId: string) => Promise<void>;
  onDecline: (shiftId: string, reason?: string) => Promise<void>;
}

export function ShiftConfirmationCard({
  shifts,
  onConfirm,
  onDecline,
}: ShiftConfirmationCardProps) {
  const [confirming, setConfirming] = React.useState<string | null>(null);
  const [declining, setDeclining] = React.useState<string | null>(null);

  const pendingShifts = shifts.filter((s) => s.confirmation_status === "pending");

  if (pendingShifts.length === 0) {
    return null;
  }

  const handleConfirm = async (shiftId: string) => {
    setConfirming(shiftId);
    try {
      await onConfirm(shiftId);
      toast.success("Shift confirmed! 🎉");
    } catch (error) {
      toast.error("Failed to confirm shift");
    } finally {
      setConfirming(null);
    }
  };

  const handleDecline = async (shiftId: string) => {
    setDeclining(shiftId);
    try {
      await onDecline(shiftId);
      toast.success("Shift declined");
    } catch (error) {
      toast.error("Failed to decline shift");
    } finally {
      setDeclining(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="glass-card border-primary/30 shadow-glow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
                <AlertCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-bold">Shifts Pending Confirmation</div>
                <div className="text-xs font-normal text-muted-foreground">
                  Please confirm or decline these shifts
                </div>
              </div>
            </CardTitle>
            <Badge className="bg-gradient-to-r from-primary to-secondary">
              {pendingShifts.length}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {pendingShifts.map((shift, index) => {
            const startTime = new Date(shift.starts_at);
            const endTime = new Date(shift.ends_at);
            const deadline = shift.confirmation_deadline
              ? new Date(shift.confirmation_deadline)
              : null;
            const hours =
              (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

            return (
              <motion.div
                key={shift.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gradient-to-r from-background/80 to-accent/10 rounded-xl border border-border/50 hover:border-primary/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Shift Details */}
                  <div className="flex-1 space-y-2">
                    {/* Date & Time */}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-foreground">
                        {format(startTime, "EEE, MMM d, yyyy")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {hours.toFixed(1)}h
                      </Badge>
                    </div>

                    {/* Position & Location */}
                    <div className="flex flex-wrap items-center gap-2">
                      {shift.position && (
                        <Badge className="gradient-primary">
                          {shift.position.name}
                        </Badge>
                      )}
                      {shift.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {shift.location.name}
                        </div>
                      )}
                    </div>

                    {/* Deadline Warning */}
                    {deadline && (
                      <div className="flex items-center gap-2 text-xs text-orange-600">
                        <AlertCircle className="h-3 w-3" />
                        Confirm by {format(deadline, "MMM d 'at' h:mm a")}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 sm:flex-col sm:w-32">
                    <Button
                      onClick={() => handleConfirm(shift.id)}
                      disabled={confirming === shift.id || declining === shift.id}
                      className="flex-1 sm:w-full"
                      size="sm"
                    >
                      {confirming === shift.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Confirming...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirm
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => handleDecline(shift.id)}
                      disabled={confirming === shift.id || declining === shift.id}
                      className="flex-1 sm:w-full border-destructive/30 text-destructive hover:bg-destructive/10"
                      size="sm"
                    >
                      {declining === shift.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Declining...
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Decline
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}
