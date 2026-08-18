const PROJECT_MANAGER_PERMISSIONS = [
  "PROJECT_VIEW",
  "PROJECT_CREATE",
  "PROJECT_UPDATE",
  "PROJECT_DELETE",
  "PROJECT_MANAGE_MEMBERS",
];

const TEAM_MANAGER_PERMISSIONS = ["TEAM_VIEW", "TEAM_CREATE", "TEAM_UPDATE", "TEAM_MANAGE_MEMBERS"];

const rolePermissionDefaults = {
  ADMIN: [...PROJECT_MANAGER_PERMISSIONS, ...TEAM_MANAGER_PERMISSIONS, "TEAM_DELETE"],
  ORGANIZATION_ADMIN: [...PROJECT_MANAGER_PERMISSIONS, ...TEAM_MANAGER_PERMISSIONS, "TEAM_DELETE"],
  MANAGER: [...PROJECT_MANAGER_PERMISSIONS, ...TEAM_MANAGER_PERMISSIONS],
  LEAD: TEAM_MANAGER_PERMISSIONS,
  PROJECT_MANAGER: PROJECT_MANAGER_PERMISSIONS,
};

const getEffectivePermissions = (user = {}) => {
  const assignedPermissions = Array.isArray(user.permissions) ? user.permissions : [];
  const role = String(user.role || "").trim().toUpperCase();
  return [...new Set([...assignedPermissions, ...(rolePermissionDefaults[role] || [])])];
};

module.exports = { PROJECT_MANAGER_PERMISSIONS, TEAM_MANAGER_PERMISSIONS, getEffectivePermissions };
