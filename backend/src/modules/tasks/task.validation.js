const mongoose = require("mongoose");
const { TASK_STATUSES, TASK_PRIORITIES, TASK_TYPES } = require("./task.model");

const createError = (message, field = "general", statusCode = 400) => {
  const err = new Error(message);
  err.code = "VALIDATION_ERROR";
  err.statusCode = statusCode;
  err.field = field;
  return err;
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const validateObjectId = (id, field) => {
  if (!id || !isValidObjectId(id)) throw createError(`${field} must be a valid ID.`, field);
};

const validateCreateTask = ({ title, projectId, type, status, priority, storyPoints, dueDate }) => {
  if (!title || !String(title).trim()) throw createError("Title is required.", "title");
  if (String(title).trim().length > 250) throw createError("Title must be 250 characters or fewer.", "title");
  if (!projectId) throw createError("Project ID is required.", "projectId");
  validateObjectId(projectId, "projectId");
  if (type && !TASK_TYPES.includes(type)) throw createError(`Type must be one of: ${TASK_TYPES.join(", ")}.`, "type");
  if (status && !TASK_STATUSES.includes(status)) throw createError(`Status must be one of: ${TASK_STATUSES.join(", ")}.`, "status");
  if (priority && !TASK_PRIORITIES.includes(priority)) throw createError(`Priority must be one of: ${TASK_PRIORITIES.join(", ")}.`, "priority");
  if (storyPoints !== undefined && storyPoints !== null && (isNaN(Number(storyPoints)) || Number(storyPoints) < 0)) {
    throw createError("Story points must be a non-negative number.", "storyPoints");
  }
  if (dueDate && isNaN(Date.parse(dueDate))) throw createError("Due date must be a valid date.", "dueDate");
};

const validateUpdateTask = ({ title, type, status, priority, storyPoints, dueDate }) => {
  if (title !== undefined) {
    if (!String(title).trim()) throw createError("Title cannot be empty.", "title");
    if (String(title).trim().length > 250) throw createError("Title must be 250 characters or fewer.", "title");
  }
  if (type && !TASK_TYPES.includes(type)) throw createError(`Type must be one of: ${TASK_TYPES.join(", ")}.`, "type");
  if (status && !TASK_STATUSES.includes(status)) throw createError(`Status must be one of: ${TASK_STATUSES.join(", ")}.`, "status");
  if (priority && !TASK_PRIORITIES.includes(priority)) throw createError(`Priority must be one of: ${TASK_PRIORITIES.join(", ")}.`, "priority");
  if (storyPoints !== undefined && storyPoints !== null && (isNaN(Number(storyPoints)) || Number(storyPoints) < 0)) {
    throw createError("Story points must be a non-negative number.", "storyPoints");
  }
  if (dueDate && isNaN(Date.parse(dueDate))) throw createError("Due date must be a valid date.", "dueDate");
};

const validateStatusChange = ({ status }) => {
  if (!status || !TASK_STATUSES.includes(status)) {
    throw createError(`Status must be one of: ${TASK_STATUSES.join(", ")}.`, "status");
  }
};

const validateAssignee = ({ userId }) => {
  if (!userId) throw createError("User ID is required.", "userId");
  validateObjectId(userId, "userId");
};

const validatePagination = ({ page, pageSize }) => {
  const p = parseInt(page, 10) || 1;
  const ps = Math.min(parseInt(pageSize, 10) || 20, 100);
  if (p < 1) throw createError("Page must be >= 1.", "page");
  if (ps < 1) throw createError("Page size must be >= 1.", "pageSize");
  return { page: p, pageSize: ps };
};

const validateLabelInput = ({ name, color }) => {
  if (!name || !String(name).trim()) throw createError("Label name is required.", "name");
  if (String(name).trim().length > 100) throw createError("Label name must be 100 characters or fewer.", "name");
  if (color !== undefined && color !== null && !/^#[0-9a-fA-F]{6}$/.test(color)) {
    throw createError("Color must be a hex value like #6366f1.", "color");
  }
  return { name: String(name).trim(), color: color || "#6366f1" };
};

const validateLabelId = ({ labelId }) => {
  if (!labelId) throw createError("Label ID is required.", "labelId");
  validateObjectId(labelId, "labelId");
};

const validateChecklistInput = ({ title }) => {
  if (!title || !String(title).trim()) throw createError("Checklist title is required.", "title");
  if (String(title).trim().length > 200) throw createError("Checklist title must be 200 characters or fewer.", "title");
  return { title: String(title).trim() };
};

const validateChecklistItemInput = ({ text, assigneeId, dueDate }) => {
  if (!text || !String(text).trim()) throw createError("Checklist item text is required.", "text");
  if (String(text).trim().length > 500) throw createError("Checklist item text must be 500 characters or fewer.", "text");
  if (assigneeId) validateObjectId(assigneeId, "assigneeId");
  if (dueDate && isNaN(Date.parse(dueDate))) throw createError("Due date must be a valid date.", "dueDate");
  return { text: String(text).trim() };
};

const validateTaskQuery = (query = {}) => {
  const { page, pageSize, sortBy, sortOrder, status, priority, labelId, dueFrom, dueTo } = query;
  const { page: p, pageSize: ps } = validatePagination({ page, pageSize });

  const sortField = sortBy || "createdAt";
  const sortDirection = sortOrder === "asc" ? 1 : -1;

  if (status && !TASK_STATUSES.includes(status)) {
    throw createError(`Status must be one of: ${TASK_STATUSES.join(", ")}.`, "status");
  }
  if (priority && !TASK_PRIORITIES.includes(priority)) {
    throw createError(`Priority must be one of: ${TASK_PRIORITIES.join(", ")}.`, "priority");
  }
  if (labelId) validateObjectId(labelId, "labelId");
  if (dueFrom && isNaN(Date.parse(dueFrom))) throw createError("dueFrom must be a valid date.", "dueFrom");
  if (dueTo && isNaN(Date.parse(dueTo))) throw createError("dueTo must be a valid date.", "dueTo");

  return { page: p, pageSize: ps, sortBy: sortField, sortOrder: sortDirection };
};

module.exports = {
  validateCreateTask,
  validateUpdateTask,
  validateStatusChange,
  validateAssignee,
  validatePagination,
  validateLabelInput,
  validateLabelId,
  validateChecklistInput,
  validateChecklistItemInput,
  validateTaskQuery,
  isValidObjectId,
};
