"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { DESIGN_SYSTEM } from "@/lib/design-system";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  noPadding?: boolean;
}

export function PageContainer({
  children,
  className,
  maxWidth = "xl",
  noPadding = false,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "w-full mx-auto",
        DESIGN_SYSTEM.container[maxWidth],
        !noPadding && DESIGN_SYSTEM.padding.page,
        className
      )}
    >
      {children}
    </div>
  );
}
