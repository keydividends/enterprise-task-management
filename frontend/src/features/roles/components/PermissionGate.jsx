import React from "react";
import { useAuth } from "../../auth/hooks/useAuth";

/**
 * PermissionGate Component
 * Conditionally renders children based on user permissions.
 * ADMIN and MANAGER roles bypass permission checks (consistent with the
 * backend `authorize` middleware and the UserListPage permission pattern).
 *
 * Usage:
 * <PermissionGate permission="TASK_CREATE">
 *   <button>Create Task</button>
 * </PermissionGate>
 */
const PermissionGate = ({ permission, children, fallback = null }) => {
  const { user } = useAuth();
  const userPermissions = user?.permissions || [];
  const userRole = user?.role;

  if (!permission) {
    return children;
  }

  // ADMIN/MANAGER roles bypass permission checks (mirrors backend authorize).
  const bypassRoles = ['ADMIN', 'MANAGER'];
  const hasPermission =
    bypassRoles.includes(userRole) || userPermissions.includes(permission);

  return hasPermission ? children : fallback;
};

export default PermissionGate;
