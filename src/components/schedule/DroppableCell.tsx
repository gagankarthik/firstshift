// components/schedule/DroppableCell.tsx
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Plus, AlertCircle } from "lucide-react";
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
    ? "bg-gradient-to-br from-red-50 via-pink-50 to-red-50 border-red-200/60"
    : unavailable
    ? "bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200/60"
    : "bg-gradient-to-br from-white via-blue-50/20 to-white hover:from-blue-50/30 hover:via-blue-50/40 hover:to-blue-50/30 border-slate-200/60";

  return (
    <div
      ref={setNodeRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) onAdd?.();
      }}
      className={cx(
        "relative rounded-xl border-2 p-3 transition-all duration-300",
        "backdrop-blur-sm shadow-sm",
        highlightClass,
        isOver && !timeOffLabel && "bg-gradient-to-br from-blue-100 via-blue-50 to-blue-100 border-blue-400 ring-2 ring-blue-300/50",
        compact ? "min-h-[70px]" : "min-h-[90px]",
        onAdd && "cursor-pointer hover:shadow-md"
      )}
    >
      {onAdd && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          className={cx(
            "absolute right-2 top-2 inline-flex items-center justify-center rounded-xl",
            "bg-gradient-to-r from-white to-blue-50/80 hover:from-blue-50 hover:to-blue-100",
            "border border-slate-200 hover:border-blue-300",
            "transition-all duration-200 text-slate-500 hover:text-blue-600",
            "hover:scale-110 active:scale-95 shadow-sm hover:shadow-md",
            compact ? "h-6 w-6 text-xs" : "h-7 w-7 text-sm"
          )}
          title="Add new shift"
        >
          <Plus className={compact ? "h-3 w-3" : "h-4 w-4"} />
        </button>
      )}
      {timeOffLabel && (
        <div className="mb-2 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-100 to-pink-100 border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          Time Off
        </div>
      )}
      {children}
      {!timeOffLabel && unavailable && (
        <div className="mt-2 text-xs font-medium text-slate-500 bg-white/60 rounded-lg px-2 py-1 inline-block">
          Not Available
        </div>
      )}
    </div>
  );
}