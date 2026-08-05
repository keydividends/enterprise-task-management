import React from "react";
import { useAuth } from "../../auth/hooks/useAuth";

/**
 * PermissionGate Component
 * Conditionally renders children based on user permissions
 *
 * Usage:
 * <PermissionGate permission="TASK_CREATE">
 *   <button>Create Task</button>
 * </PermissionGate>
 */
const PermissionGate = ({ permission, children, fallback = null }) => {
  const { user } = useAuth();
  const userPermissions = user?.permissions || [];

  if (!permission) {
    return children;
  }

  const hasPermission = userPermissions.includes(permission);

  return hasPermission ? children : fallback;
};

export default PermissionGate;
