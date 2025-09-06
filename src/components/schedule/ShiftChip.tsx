// components/schedule/ShiftChip.tsx
import React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
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

  return (
    <div
      onDoubleClick={onDoubleClick}
      className={cx(
        "rounded-md border bg-white shadow-sm transition-all duration-200",
        "cursor-grab active:cursor-grabbing select-none",
        "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        ghost && "opacity-80 shadow-lg",
        compact ? "px-2 py-1" : "px-3 py-2"
      )}
      style={{
        borderLeftWidth: 3,
        borderLeftColor: s.position?.color || "#64748b",
        background: ghost ? "rgba(255,255,255,0.95)" : "white",
      }}
    >
      <div className={cx("flex items-center justify-between gap-2", compact ? "text-xs" : "text-sm")}>
        <div className="font-medium text-gray-900 min-w-0">
          {format(st, "h:mm a")} - {format(en, "h:mm a")}
        </div>
        {s.position?.name && (
          <Badge
            variant="secondary"
            className={cx("capitalize font-medium shrink-0", compact ? "text-[9px] px-1 py-0" : "text-[10px] px-1.5")}
            style={{
              backgroundColor: s.position?.color ? `${s.position.color}15` : undefined,
              color: s.position?.color || "#64748b",
              borderColor: s.position?.color || "#64748b",
            }}
          >
            {s.position.name}
          </Badge>
        )}
      </div>
    </div>
  );
}