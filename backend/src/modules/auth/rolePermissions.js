const PROJECT_MANAGER_PERMISSIONS = [
  "PROJECT_VIEW",
  "PROJECT_CREATE",
  "PROJECT_UPDATE",
  "PROJECT_DELETE",
  "PROJECT_MANAGE_MEMBERS",
];

const TEAM_MANAGER_PERMISSIONS = ["TEAM_VIEW", "TEAM_CREATE", "TEAM_UPDATE", "TEAM_MANAGE_MEMBERS"];

// These defaults are applied at authentication time. They are needed for
// accounts created before role-permission records are synchronized onto the
// user document (including self-registered Manager accounts).
const TASK_MANAGER_PERMISSIONS = [
  "TASK_VIEW",
  "TASK_CREATE",
  "TASK_UPDATE",
  "TASK_DELETE",
  "TASK_ASSIGN",
  "TASK_REASSIGN",
  "TASK_CLOSE",
];

// Task matrix defaults. Reassign and close are intentionally not inferred for
// these roles because their assignments are not specified by the matrix.
const PROJECT_MANAGER_TASK_PERMISSIONS = ["TASK_VIEW", "TASK_CREATE", "TASK_UPDATE", "TASK_DELETE", "TASK_ASSIGN"];
const TEAM_LEAD_TASK_PERMISSIONS = ["TASK_VIEW", "TASK_CREATE", "TASK_UPDATE", "TASK_ASSIGN"];
const TASK_CONTRIBUTOR_PERMISSIONS = ["TASK_VIEW", "TASK_UPDATE"];

const rolePermissionDefaults = {
  ADMIN: [...PROJECT_MANAGER_PERMISSIONS, ...TEAM_MANAGER_PERMISSIONS, ...TASK_MANAGER_PERMISSIONS, "TEAM_DELETE"],
  ORGANIZATION_ADMIN: [...PROJECT_MANAGER_PERMISSIONS, ...TEAM_MANAGER_PERMISSIONS, ...TASK_MANAGER_PERMISSIONS, "TEAM_DELETE"],
  MANAGER: [...PROJECT_MANAGER_PERMISSIONS, ...TEAM_MANAGER_PERMISSIONS, ...TASK_MANAGER_PERMISSIONS],
  LEAD: TEAM_MANAGER_PERMISSIONS,
  PROJECT_MANAGER: [...PROJECT_MANAGER_PERMISSIONS, ...PROJECT_MANAGER_TASK_PERMISSIONS],
  TEAM_LEAD: [...TEAM_MANAGER_PERMISSIONS, ...TEAM_LEAD_TASK_PERMISSIONS],
  SENIOR_DEVELOPER: TASK_CONTRIBUTOR_PERMISSIONS,
  DEVELOPER: TASK_CONTRIBUTOR_PERMISSIONS,
  QA_ENGINEER: TASK_CONTRIBUTOR_PERMISSIONS,
  INTERN: TASK_CONTRIBUTOR_PERMISSIONS,
};

const getEffectivePermissions = (user = {}) => {
  const assignedPermissions = Array.isArray(user.permissions) ? user.permissions : [];
  const role = String(user.role || "").trim().toUpperCase();
  return [...new Set([...assignedPermissions, ...(rolePermissionDefaults[role] || [])])];
};

module.exports = {
  PROJECT_MANAGER_PERMISSIONS,
  TEAM_MANAGER_PERMISSIONS,
  TASK_MANAGER_PERMISSIONS,
  PROJECT_MANAGER_TASK_PERMISSIONS,
  TEAM_LEAD_TASK_PERMISSIONS,
  TASK_CONTRIBUTOR_PERMISSIONS,
  getEffectivePermissions,
};
