// components/schedule/EmployeeAvatar.tsx
import React from "react";
import { cx } from "./utils";
import type { Employee } from "./types";

interface EmployeeAvatarProps {
  employee: Employee;
  size?: "sm" | "md" | "lg";
}

export function EmployeeAvatar({ employee, size = "md" }: EmployeeAvatarProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10"
  };

  const initials = employee.full_name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cx(
      "relative overflow-hidden rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border border-blue-200",
      sizeClasses[size]
    )}>
      {employee.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={employee.avatar_url}
          alt={employee.full_name}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className={cx(
          "font-medium text-blue-700",
          size === "sm" ? "text-xs" : size === "lg" ? "text-sm" : "text-xs"
        )}>
          {initials}
        </span>
      )}
    </div>
  );
}