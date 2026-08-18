const PROJECT_MANAGER_PERMISSIONS = [
  "PROJECT_VIEW",
  "PROJECT_CREATE",
  "PROJECT_UPDATE",
  "PROJECT_DELETE",
  "PROJECT_MANAGE_MEMBERS",
];

const rolePermissionDefaults = {
  ADMIN: PROJECT_MANAGER_PERMISSIONS,
  ORGANIZATION_ADMIN: PROJECT_MANAGER_PERMISSIONS,
  MANAGER: PROJECT_MANAGER_PERMISSIONS,
  PROJECT_MANAGER: PROJECT_MANAGER_PERMISSIONS,
};

const getEffectivePermissions = (user = {}) => {
  const assignedPermissions = Array.isArray(user.permissions) ? user.permissions : [];
  const role = String(user.role || "").trim().toUpperCase();
  return [...new Set([...assignedPermissions, ...(rolePermissionDefaults[role] || [])])];
};

module.exports = { PROJECT_MANAGER_PERMISSIONS, getEffectivePermissions };
