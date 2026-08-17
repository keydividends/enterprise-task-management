import { useAuth } from "../../auth/hooks/useAuth";

/**
 * PermissionGate Component
 * Conditionally renders children based on user permissions.
 * SUPER_ADMIN bypasses permission checks; all other roles use their assigned
 * permission set, matching the server-side authorization middleware.
 *
 * Usage:
 * <PermissionGate permission="TASK_CREATE">
 *   <button>Create Task</button>
 * </PermissionGate>
 */
const PermissionGate = ({ permission, children, fallback = null, adminOnly = false }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "SUPER_ADMIN";
  const userPermissions = user?.permissions || [];
  const userRole = user?.role;

  if (adminOnly) {
    return isAdmin ? children : fallback;
  }

  if (!permission) {
    return children;
  }

  if (isAdmin) {
    return children;
  }

  const hasPermission = userRole === "SUPER_ADMIN" || userPermissions.includes(permission);

  return hasPermission ? children : fallback;
};

export default PermissionGate;
