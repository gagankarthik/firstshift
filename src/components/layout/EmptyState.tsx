"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const ActionIcon = action?.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 sm:py-16 px-4",
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring" }}
        className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-muted/50 to-muted border border-border flex items-center justify-center mb-6"
      >
        <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/50" />
      </motion.div>

      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
        {title}
      </h3>

      <p className="text-sm sm:text-base text-muted-foreground max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {action && (
        <Button onClick={action.onClick} size="lg">
          {ActionIcon && <ActionIcon className="w-4 h-4 mr-2" />}
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}
