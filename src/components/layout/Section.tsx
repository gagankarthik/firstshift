"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SPACING } from "@/lib/constants/spacing";

interface SectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  spacing?: keyof typeof SPACING.section;
  noPadding?: boolean;
}

export function Section({
  children,
  title,
  description,
  actions,
  className,
  spacing = "md",
  noPadding = false,
}: SectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(SPACING.section[spacing], className)}
    >
      {(title || description || actions) && (
        <div className={cn("flex items-start justify-between mb-4 sm:mb-6", noPadding && "px-0")}>
          <div className="flex-1 min-w-0">
            {title && (
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex-shrink-0 ml-4">{actions}</div>}
        </div>
      )}
      <div className={cn(!noPadding && "space-y-4 sm:space-y-6")}>{children}</div>
    </motion.section>
  );
}
