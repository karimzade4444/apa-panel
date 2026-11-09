import type { AccessRole } from "@/lib/auth";

export enum PermissionAction {
  ViewDashboard = "dashboard:view",
  ViewUsers = "users:view",
  CreateUser = "users:create",
  UpdateUser = "users:update",
  BlockUser = "users:block",
  DeleteUser = "users:delete",
  AssignUserRole = "users:assign-role",
}

export const rolePermissions: Record<AccessRole, readonly PermissionAction[]> = {
  Editor: [PermissionAction.ViewDashboard, PermissionAction.ViewUsers],
  Admin: [
    PermissionAction.ViewDashboard,
    PermissionAction.ViewUsers,
    PermissionAction.CreateUser,
    PermissionAction.UpdateUser,
    PermissionAction.BlockUser,
    PermissionAction.DeleteUser,
    PermissionAction.AssignUserRole,
  ],
  SuperAdmin: [
    PermissionAction.ViewDashboard,
    PermissionAction.ViewUsers,
    PermissionAction.CreateUser,
    PermissionAction.UpdateUser,
    PermissionAction.BlockUser,
    PermissionAction.DeleteUser,
    PermissionAction.AssignUserRole,
  ],
};

export function hasPermission(
  role: AccessRole | null,
  action: PermissionAction,
): boolean {
  return role ? rolePermissions[role].includes(action) : false;
}
