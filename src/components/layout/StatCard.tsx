"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  subtitle?: string;
  gradient?: string;
  iconColor?: string;
  className?: string;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  gradient = "from-blue-500 to-indigo-600",
  iconColor = "text-blue-600",
  className,
  onClick,
}: StatCardProps) {
  const isClickable = !!onClick;

  const TrendIcon = trend
    ? trend.value > 0
      ? TrendingUp
      : trend.value < 0
      ? TrendingDown
      : Minus
    : null;

  const trendColor = trend
    ? trend.value > 0
      ? "text-green-600"
      : trend.value < 0
      ? "text-red-600"
      : "text-muted-foreground"
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={isClickable ? { y: -4, scale: 1.02 } : undefined}
      className={cn("group", className)}
    >
      <Card
        className={cn(
          "glass-card border-border/50 hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden",
          isClickable && "hover:shadow-lg"
        )}
        onClick={onClick}
      >
        {/* Hover gradient overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity",
            gradient
          )}
        />

        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className={cn(
                "p-2 sm:p-2.5 rounded-xl bg-background/80 border border-border shadow-sm",
                "group-hover:shadow-md transition-shadow"
              )}
            >
              <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5", iconColor)} />
            </motion.div>
          </div>

          <div className="space-y-2">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className={cn(
                "text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                gradient
              )}
            >
              {value}
            </motion.div>

            {subtitle && (
              <p className="text-xs sm:text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}

            {trend && TrendIcon && (
              <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                <TrendIcon className={cn("w-3 h-3 sm:w-4 sm:h-4", trendColor)} />
                <span className={cn("font-medium", trendColor)}>
                  {trend.value > 0 ? "+" : ""}
                  {trend.value}%
                </span>
                <span className="text-muted-foreground">{trend.label}</span>
              </div>
            )}
          </div>
        </CardContent>

        {/* Animated border on hover */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-xl border-2 opacity-0 group-hover:opacity-60 transition-opacity pointer-events-none",
            gradient.includes("blue")
              ? "border-blue-300/40"
              : gradient.includes("green")
              ? "border-green-300/40"
              : gradient.includes("purple")
              ? "border-purple-300/40"
              : "border-primary/40"
          )}
        />
      </Card>
    </motion.div>
  );
}
