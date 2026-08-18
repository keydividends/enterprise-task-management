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
  const role = String(user?.role || "").toUpperCase();
  const isAdmin = role === "SUPER_ADMIN";
  const userPermissions = user?.permissions || [];
  const teamManagerRoles = ["ADMIN", "ORGANIZATION_ADMIN", "MANAGER", "LEAD"];

  if (adminOnly) {
    return isAdmin ? children : fallback;
  }

  if (!permission) {
    return children;
  }

  if (isAdmin) {
    return children;
  }

  const teamRoleDefaults = ["TEAM_CREATE", "TEAM_UPDATE", "TEAM_MANAGE_MEMBERS"];
  const teamMutatingPermissions = [...teamRoleDefaults, "TEAM_DELETE"];
  const hasPermission = isAdmin ||
    (teamMutatingPermissions.includes(permission)
      ? (teamManagerRoles.includes(role) && (teamRoleDefaults.includes(permission) || userPermissions.includes(permission) || ["ADMIN", "ORGANIZATION_ADMIN"].includes(role)))
      : userPermissions.includes(permission));

  return hasPermission ? children : fallback;
};

export default PermissionGate;
