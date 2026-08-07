const TEAM_MEMBER_ROLES = ["LEAD", "MEMBER", "SENIOR_DEVELOPER", "DEVELOPER", "QA_TESTER", "VIEWER"];
const TEAM_STATUSES = ["ACTIVE", "INACTIVE", "ARCHIVED"];

const createValidationError = (message, field = "general", statusCode = 400) => {
  const error = new Error(message);
  error.code = "VALIDATION_ERROR";
  error.statusCode = statusCode;
  error.field = field;
  return error;
};

const validateCreateTeam = (payload = {}) => {
  if (!payload || typeof payload !== "object") {
    throw createValidationError("Request body is required.", "body");
  }

  const name = String(payload.name || "").trim();
  if (!name) {
    throw createValidationError("Team name is required.", "name");
  }

  if (name.length > 150) {
    throw createValidationError("Team name must be 150 characters or fewer.", "name");
  }

  return {
    name,
    description: String(payload.description || "").trim(),
    leadId: payload.leadId ? String(payload.leadId).trim() : null,
    members: Array.isArray(payload.members) ? payload.members.map((m) => String(m).trim()).filter(Boolean) : [],
    projectIds: Array.isArray(payload.projectIds) ? payload.projectIds.map((p) => String(p).trim()).filter(Boolean) : [],
  };
};

const validateUpdateTeam = (payload = {}) => {
  if (!payload || typeof payload !== "object") {
    throw createValidationError("Request body is required.", "body");
  }

  const cleaned = {};

  if (payload.name !== undefined) {
    const name = String(payload.name || "").trim();
    if (!name) {
      throw createValidationError("Team name cannot be empty.", "name");
    }
    if (name.length > 150) {
      throw createValidationError("Team name must be 150 characters or fewer.", "name");
    }
    cleaned.name = name;
  }

  if (payload.description !== undefined) {
    cleaned.description = String(payload.description || "").trim();
  }

  if (payload.leadId !== undefined) {
    cleaned.leadId = String(payload.leadId).trim();
  }

  if (payload.projectIds !== undefined) {
    cleaned.projectIds = Array.isArray(payload.projectIds)
      ? payload.projectIds.map((p) => String(p).trim()).filter(Boolean)
      : [];
  }

  if (payload.status !== undefined) {
    const status = String(payload.status).trim().toUpperCase();
    if (!TEAM_STATUSES.includes(status)) {
      throw createValidationError(`Status must be one of: ${TEAM_STATUSES.join(", ")}.`, "status");
    }
    cleaned.status = status;
  }

  return cleaned;
};

const validateTeamId = (teamId) => {
  if (!teamId || !String(teamId).trim()) {
    throw createValidationError("Team ID is required.", "teamId");
  }
  return String(teamId).trim();
};

const validateAddMember = (payload = {}) => {
  if (!payload || typeof payload !== "object") {
    throw createValidationError("Request body is required.", "body");
  }

  const userId = String(payload.userId || "").trim();
  if (!userId) {
    throw createValidationError("User ID is required.", "userId");
  }

  const role = payload.role ? String(payload.role).trim().toUpperCase() : "MEMBER";
  if (!TEAM_MEMBER_ROLES.includes(role)) {
    throw createValidationError(`Member role must be one of: ${TEAM_MEMBER_ROLES.join(", ")}.`, "role");
  }

  return { userId, role };
};

const validateUpdateMember = (payload = {}) => {
  if (!payload || typeof payload !== "object") {
    throw createValidationError("Request body is required.", "body");
  }

  const role = payload.role ? String(payload.role).trim().toUpperCase() : "MEMBER";
  if (!TEAM_MEMBER_ROLES.includes(role)) {
    throw createValidationError(`Member role must be one of: ${TEAM_MEMBER_ROLES.join(", ")}.`, "role");
  }

  return { role };
};

const validateListQuery = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize, 10) || 20));
  const search = typeof query.search === "string" ? query.search.trim() : "";
  const status = query.status ? String(query.status).trim().toUpperCase() : undefined;
  const leadId = query.leadId ? String(query.leadId).trim() : undefined;
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;

  return {
    page,
    pageSize,
    search,
    status,
    leadId,
    sortBy,
    sortOrder,
  };
};

module.exports = {
  validateCreateTeam,
  validateUpdateTeam,
  validateTeamId,
  validateAddMember,
  validateUpdateMember,
  validateListQuery,
  createValidationError,
  TEAM_MEMBER_ROLES,
  TEAM_STATUSES,
};
