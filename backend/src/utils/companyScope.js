const GLOBAL_ROLES = new Set(["SUPER_ADMIN"]);
const COMPANY_LOCKED_ROLES = new Set(["MANAGER", "COMPANY_ADMIN", "EMPLOYEE", "USER", "DEVELOPER", "QA_ENGINEER", "INTERN", "TEAM_LEAD", "LEAD", "PROJECT_MANAGER"]);

const isGlobalCompanyRole = (user) => GLOBAL_ROLES.has(String(user?.role || "").toUpperCase());

const isCompanyLockedRole = (user) => COMPANY_LOCKED_ROLES.has(String(user?.role || "").toUpperCase());

const toCompanyIdString = (value) => {
  if (!value) return null;
  return String(value);
};

const sameCompany = (left, right) => {
  const a = toCompanyIdString(left);
  const b = toCompanyIdString(right);
  if (!a || !b) return false;
  return a === b;
};

const getActiveCompanyId = (user) => toCompanyIdString(user?.companyId);

const shouldEnforceCompanyScope = (user) => {
  if (!user) return false;
  if (isGlobalCompanyRole(user)) return Boolean(getActiveCompanyId(user));
  return Boolean(getActiveCompanyId(user));
};

const createScopeError = (message = "Resource not found.", statusCode = 404) => {
  const error = new Error(message);
  error.code = "RESOURCE_NOT_FOUND";
  error.statusCode = statusCode;
  return error;
};

const assertCompanyAccess = (user, resourceCompanyId, message = "Resource not found.") => {
  if (!shouldEnforceCompanyScope(user)) return;
  if (!sameCompany(getActiveCompanyId(user), resourceCompanyId)) {
    throw createScopeError(message);
  }
};

const workspaceIdForUser = (user) => {
  if (!user) return null;
  if (isGlobalCompanyRole(user)) return getActiveCompanyId(user);
  return getActiveCompanyId(user) || user.workspaceId || null;
};

const scopedCompanyId = (user) => (shouldEnforceCompanyScope(user) ? getActiveCompanyId(user) : null);

const resolveOwnedCompany = (actor, requestedCompanyId = null) => {
  if (isCompanyLockedRole(actor)) {
    return {
      companyId: getActiveCompanyId(actor) || null,
      forced: true,
    };
  }
  if (isGlobalCompanyRole(actor) && getActiveCompanyId(actor)) {
    return { companyId: getActiveCompanyId(actor), forced: true };
  }
  return { companyId: toCompanyIdString(requestedCompanyId) || getActiveCompanyId(actor), forced: false };
};

module.exports = {
  GLOBAL_ROLES,
  COMPANY_LOCKED_ROLES,
  isGlobalCompanyRole,
  isCompanyLockedRole,
  toCompanyIdString,
  sameCompany,
  getActiveCompanyId,
  shouldEnforceCompanyScope,
  assertCompanyAccess,
  workspaceIdForUser,
  scopedCompanyId,
  resolveOwnedCompany,
  createScopeError,
};
