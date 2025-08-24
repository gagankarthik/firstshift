"use client";
export type Role = "admin" | "manager" | "employee" | null;

export function usePermissions(role: Role) {
  const canManageSchedule = role === "admin" || role === "manager";
  const canApproveTimeOff = canManageSchedule;
  const canManageEmployees = canManageSchedule;
  const canSubmitTimeOff = role !== null;

  function canEditAvailabilityFor(targetEmployeeId: string, myEmployeeId?: string | null) {
    return canManageSchedule || (!!myEmployeeId && targetEmployeeId === myEmployeeId);
  }

  return {
    canManageSchedule,
    canApproveTimeOff,
    canManageEmployees,
    canSubmitTimeOff,
    canEditAvailabilityFor,
  };
}
