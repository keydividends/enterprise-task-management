const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_STATUSES = ["ACTIVE", "DISABLED", "LOCKED", "DELETED"];

const createValidationError = (message, details = null) => {
  const error = new Error(message);
  error.code = "VALIDATION_ERROR";
  error.statusCode = 400;
  if (details) error.details = details;
  return error;
};

const validateCreateUser = (data = {}) => {
  const { firstName, email, status, role } = data;

  if (!firstName || typeof firstName !== "string" || !firstName.trim()) {
    throw createValidationError("First name is required.");
  }

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    throw createValidationError("A valid email address is required.");
  }

  if (status && !ALLOWED_STATUSES.includes(status)) {
    throw createValidationError(`Invalid status. Must be one of: ${ALLOWED_STATUSES.join(", ")}`);
  }
};

const validateUpdateUser = (data = {}) => {
  const protectedFields = ["_id", "id", "passwordHash", "isDeleted"];
  const keys = Object.keys(data);

  const attemptedProtected = keys.filter((k) => protectedFields.includes(k));
  if (attemptedProtected.length > 0) {
    throw createValidationError(`Cannot update protected fields: ${attemptedProtected.join(", ")}`);
  }

  if (data.email && !EMAIL_REGEX.test(data.email.trim())) {
    throw createValidationError("Invalid email format.");
  }

  if (data.status && !ALLOWED_STATUSES.includes(data.status)) {
    throw createValidationError(`Invalid status. Must be one of: ${ALLOWED_STATUSES.join(", ")}`);
  }
};

const validateStatusUpdate = (status) => {
  if (!status || !ALLOWED_STATUSES.includes(status)) {
    throw createValidationError(`Invalid status. Must be one of: ${ALLOWED_STATUSES.join(", ")}`);
  }
};

const validateProfileUpdate = (data = {}) => {
  const allowedProfileFields = ["firstName", "lastName", "mobile", "department", "title", "bio"];
  const keys = Object.keys(data);

  const disallowed = keys.filter((k) => !allowedProfileFields.includes(k));
  if (disallowed.length > 0) {
    throw createValidationError(`Disallowed profile fields: ${disallowed.join(", ")}`);
  }
};

const validateListQuery = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize, 10) || 20));
  const search = typeof query.search === "string" ? query.search.trim() : "";
  const status = ALLOWED_STATUSES.includes(query.status) ? query.status : null;
  const roleId = query.roleId || null;
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;

  return {
    page,
    pageSize,
    search,
    status,
    roleId,
    sortBy,
    sortOrder,
  };
};

module.exports = {
  validateCreateUser,
  validateUpdateUser,
  validateStatusUpdate,
  validateProfileUpdate,
  validateListQuery,
  createValidationError,
  ALLOWED_STATUSES,
};
