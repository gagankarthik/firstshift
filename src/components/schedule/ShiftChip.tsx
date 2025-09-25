// components/schedule/ShiftChip.tsx
import React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";
import { cx } from "./utils";
import type { Shift } from "./types";

interface ShiftChipProps {
  s: Shift;
  ghost?: boolean;
  onDoubleClick?: () => void;
  compact?: boolean;
}

export function ShiftChip({
  s,
  ghost = false,
  onDoubleClick,
  compact = false,
}: ShiftChipProps) {
  const st = new Date(s.starts_at),
    en = new Date(s.ends_at);

  const duration = Math.round((en.getTime() - st.getTime()) / (1000 * 60 * 60 * 100)) / 10; // hours with 1 decimal
  const isToday = format(st, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  return (
    <div
      onDoubleClick={onDoubleClick}
      className={cx(
        "rounded-xl border-0 bg-gradient-to-r shadow-md transition-all duration-300",
        "cursor-grab active:cursor-grabbing select-none",
        "hover:shadow-lg hover:scale-[1.03] active:scale-[0.97]",
        ghost && "opacity-80 shadow-xl",
        isToday && "ring-2 ring-blue-500/30",
        compact ? "px-3 py-2" : "px-4 py-3"
      )}
      style={{
        background: s.position?.color
          ? `linear-gradient(135deg, ${s.position.color}15, ${s.position.color}25)`
          : "linear-gradient(135deg, #f8fafc, #e2e8f0)",
        borderLeft: `4px solid ${s.position?.color || "#64748b"}`,
      }}
    >
      <div className={cx("space-y-1", compact ? "text-xs" : "text-sm")}>
        <div className="flex items-center justify-between gap-2">
          <div className="font-bold text-slate-800 min-w-0">
            {format(st, "h:mm")} - {format(en, "h:mm")}
          </div>
          <div className="text-xs font-medium text-slate-600 bg-white/60 rounded-lg px-2 py-0.5">
            {duration}h
          </div>
        </div>
        {s.position?.name && (
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: s.position.color || "#64748b" }}
            />
            <Badge
              variant="secondary"
              className={cx(
                "capitalize font-medium shrink-0 bg-white/60 border-0",
                compact ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5"
              )}
              style={{
                color: s.position?.color || "#64748b",
              }}
            >
              {s.position.name}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}