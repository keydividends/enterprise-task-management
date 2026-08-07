const mongoose = require("mongoose");

const PROJECT_STATUSES = ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"];
const PROJECT_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const PROJECT_ROLES = ["PROJECT_MANAGER", "TEAM_LEAD", "DEVELOPER", "QA_TESTER", "VIEWER"];

const createValidationError = (message, field = "general", statusCode = 400) => {
  const error = new Error(message);
  error.code = "VALIDATION_ERROR";
  error.statusCode = statusCode;
  error.field = field;
  return error;
};

const isValidObjectId = (id) => {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(id);
};

const validatePagination = ({ page = 1, pageSize = 20, sortOrder = -1, sortBy = "createdAt" } = {}) => {
  const nextPage = Number.isInteger(page) ? page : Number(page);
  const nextPageSize = Number.isInteger(pageSize) ? pageSize : Number(pageSize);
  const nextSortOrder = Number(sortOrder);

  if (Number.isNaN(nextPage) || nextPage < 1) {
    throw createValidationError("Page must be >= 1.", "page");
  }
  if (Number.isNaN(nextPageSize) || nextPageSize < 1 || nextPageSize > 100) {
    throw createValidationError("Page size must be between 1 and 100.", "pageSize");
  }
  if (![1, -1].includes(nextSortOrder)) {
    throw createValidationError("Sort order must be 1 or -1.", "sortOrder");
  }

  return {
    page: nextPage,
    pageSize: nextPageSize,
    sortBy: String(sortBy || "createdAt"),
    sortOrder: nextSortOrder,
  };
};

const validateListQuery = (query = {}) => {
  const { page, pageSize, sortOrder, sortBy, search, status, priority, managerId } = query;
  const normalized = validatePagination({ page, pageSize, sortOrder, sortBy });
  return {
    ...normalized,
    search: String(search || "").trim(),
    status: status ? String(status).trim().toUpperCase() : undefined,
    priority: priority ? String(priority).trim().toUpperCase() : undefined,
    managerId: managerId ? String(managerId).trim() : undefined,
  };
};

const validateCreateProject = (payload = {}) => {
  const name = String(payload.name || "").trim();
  const key = String(payload.key || "").trim();
  const status = payload.status ? String(payload.status).trim().toUpperCase() : undefined;
  const priority = payload.priority ? String(payload.priority).trim().toUpperCase() : undefined;

  if (!name) {
    throw createValidationError("Project name is required.", "name");
  }
  if (!key) {
    throw createValidationError("Project key is required.", "key");
  }
  if (status && !PROJECT_STATUSES.includes(status)) {
    throw createValidationError(`Project status must be one of: ${PROJECT_STATUSES.join(", ")}.`, "status");
  }
  if (priority && !PROJECT_PRIORITIES.includes(priority)) {
    throw createValidationError(`Project priority must be one of: ${PROJECT_PRIORITIES.join(", ")}.`, "priority");
  }
  if (payload.startDate && Number.isNaN(Date.parse(payload.startDate))) {
    throw createValidationError("Start date must be a valid date.", "startDate");
  }
  if (payload.targetEndDate && Number.isNaN(Date.parse(payload.targetEndDate))) {
    throw createValidationError("Target end date must be a valid date.", "targetEndDate");
  }
  if (payload.startDate && payload.targetEndDate && new Date(payload.startDate) > new Date(payload.targetEndDate)) {
    throw createValidationError("Target end date must be after the start date.", "targetEndDate");
  }

  return {
    name,
    key,
    description: String(payload.description || "").trim(),
    status: status || "PLANNING",
    priority: priority || "MEDIUM",
    projectManagerId: payload.projectManagerId ? String(payload.projectManagerId).trim() : undefined,
    startDate: payload.startDate ? new Date(payload.startDate) : null,
    targetEndDate: payload.targetEndDate ? new Date(payload.targetEndDate) : null,
  };
};

const validateUpdateProject = (payload = {}) => {
  const nextPayload = {};
  if (payload.name !== undefined) {
    const name = String(payload.name || "").trim();
    if (!name) {
      throw createValidationError("Project name is required.", "name");
    }
    nextPayload.name = name;
  }
  if (payload.key !== undefined) {
    const key = String(payload.key || "").trim();
    if (!key) {
      throw createValidationError("Project key is required.", "key");
    }
    nextPayload.key = key;
  }
  if (payload.status !== undefined) {
    const status = String(payload.status).trim().toUpperCase();
    if (!PROJECT_STATUSES.includes(status)) {
      throw createValidationError(`Project status must be one of: ${PROJECT_STATUSES.join(", ")}.`, "status");
    }
    nextPayload.status = status;
  }
  if (payload.priority !== undefined) {
    const priority = String(payload.priority).trim().toUpperCase();
    if (!PROJECT_PRIORITIES.includes(priority)) {
      throw createValidationError(`Project priority must be one of: ${PROJECT_PRIORITIES.join(", ")}.`, "priority");
    }
    nextPayload.priority = priority;
  }
  if (payload.description !== undefined) {
    nextPayload.description = String(payload.description || "").trim();
  }
  if (payload.projectManagerId !== undefined) {
    const projectManagerId = String(payload.projectManagerId || "").trim();
    if (!projectManagerId) {
      throw createValidationError("Project manager ID is required.", "projectManagerId");
    }
    nextPayload.projectManagerId = projectManagerId;
  }
  if (payload.startDate !== undefined) {
    if (payload.startDate && Number.isNaN(Date.parse(payload.startDate))) {
      throw createValidationError("Start date must be a valid date.", "startDate");
    }
    nextPayload.startDate = payload.startDate ? new Date(payload.startDate) : null;
  }
  if (payload.targetEndDate !== undefined) {
    if (payload.targetEndDate && Number.isNaN(Date.parse(payload.targetEndDate))) {
      throw createValidationError("Target end date must be a valid date.", "targetEndDate");
    }
    nextPayload.targetEndDate = payload.targetEndDate ? new Date(payload.targetEndDate) : null;
  }
  if (nextPayload.startDate && nextPayload.targetEndDate && nextPayload.startDate > nextPayload.targetEndDate) {
    throw createValidationError("Target end date must be after the start date.", "targetEndDate");
  }

  return nextPayload;
};

const validateProjectId = (projectId) => {
  if (!projectId || !String(projectId).trim()) {
    throw createValidationError("Project ID is required.", "projectId");
  }
  return String(projectId).trim();
};

const validateProjectMemberInput = (payload = {}) => {
  const userId = String(payload.userId || "").trim();
  const projectRole = payload.projectRole ? String(payload.projectRole).trim().toUpperCase() : "DEVELOPER";
  const allocationPercentage = payload.allocationPercentage !== undefined ? Number(payload.allocationPercentage) : 100;

  if (!userId) {
    throw createValidationError("User ID is required.", "userId");
  }
  if (!PROJECT_ROLES.includes(projectRole)) {
    throw createValidationError(`Project role must be one of: ${PROJECT_ROLES.join(", ")}.`, "projectRole");
  }
  if (Number.isNaN(allocationPercentage) || allocationPercentage < 0 || allocationPercentage > 100) {
    throw createValidationError("Allocation percentage must be between 0 and 100.", "allocationPercentage");
  }

  return {
    userId,
    projectRole,
    allocationPercentage,
  };
};

module.exports = {
  PROJECT_STATUSES,
  PROJECT_PRIORITIES,
  PROJECT_ROLES,
  createValidationError,
  validateListQuery,
  validateCreateProject,
  validateUpdateProject,
  validateProjectId,
  validateProjectMemberInput,
  isValidObjectId,
};
