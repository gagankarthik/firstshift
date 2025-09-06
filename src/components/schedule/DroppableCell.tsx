// components/schedule/DroppableCell.tsx
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { cx } from "./utils";

interface DroppableCellProps {
  id: string;
  unavailable?: boolean;
  timeOffLabel?: string | null;
  children: React.ReactNode;
  onAdd?: () => void;
  compact?: boolean;
}

export function DroppableCell({
  id,
  unavailable,
  timeOffLabel,
  children,
  onAdd,
  compact = false,
}: DroppableCellProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  const highlightClass = timeOffLabel
    ? "bg-red-50/50 border-red-200"
    : unavailable
    ? "bg-gray-50 border-gray-200"
    : "bg-white hover:bg-blue-50/30";

  return (
    <div
      ref={setNodeRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) onAdd?.();
      }}
      className={cx(
        "relative rounded border p-2 transition-all duration-200",
        highlightClass,
        isOver && !timeOffLabel && "bg-blue-50 border-blue-300 ring-1 ring-blue-200",
        compact ? "min-h-[60px]" : "min-h-[80px]",
        onAdd && "cursor-pointer"
      )}
    >
      {onAdd && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          className={cx(
            "absolute right-1 top-1 inline-flex items-center justify-center rounded",
            "bg-white/80 hover:bg-white border border-gray-200 hover:border-gray-300",
            "transition-all duration-200 text-gray-500 hover:text-blue-600",
            "hover:scale-105 active:scale-95",
            compact ? "h-5 w-5 text-xs" : "h-6 w-6 text-xs"
          )}
          title="Add shift"
        >
          <Plus className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
        </button>
      )}
      {timeOffLabel && (
        <div className="mb-1 inline-flex items-center gap-1 rounded bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-medium text-red-700">
          Time Off
        </div>
      )}
      {children}
      {!timeOffLabel && unavailable && (
        <div className="mt-1 text-[10px] font-medium text-gray-500">
          Unavailable
        </div>
      )}
    </div>
  );
}