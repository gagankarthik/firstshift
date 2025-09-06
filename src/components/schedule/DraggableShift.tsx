// components/schedule/DraggableShift.tsx
import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { ShiftChip } from "./ShiftChip";
import { cx } from "./utils";
import type { Shift } from "./types";

interface DraggableShiftProps {
  s: Shift;
  disabled: boolean;
  onEdit: () => void;
  compact?: boolean;
}

export function DraggableShift({
  s,
  disabled,
  onEdit,
  compact = false,
}: DraggableShiftProps) {
  const dnd = useDraggable({ id: s.id, disabled });
  const style: React.CSSProperties | undefined = dnd.transform
    ? {
        transform: `translate3d(${dnd.transform.x}px, ${dnd.transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined;

  return (
    <div
      ref={dnd.setNodeRef}
      style={style}
      {...dnd.listeners}
      {...dnd.attributes}
      className={cx(disabled && "opacity-60", "relative")}
    >
      <ShiftChip s={s} ghost={dnd.isDragging} onDoubleClick={onEdit} compact={compact} />
    </div>
  );
}