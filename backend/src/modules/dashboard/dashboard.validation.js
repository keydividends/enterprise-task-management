const mongoose = require("mongoose");

const WIDGET_TYPES = new Set([
  "SUMMARY",
  "TASK_STATUS",
  "TASK_PRIORITY",
  "PROJECT_PROGRESS",
  "TEAM_WORKLOAD",
  "UPCOMING_DEADLINES",
  "RECENT_ACTIVITY",
]);

const validationError = (message, field) => {
  const error = new Error(message);
  error.code = "VALIDATION_ERROR";
  error.statusCode = 400;
  error.field = field;
  return error;
};

const validateObjectId = (value, field) => {
  if (value && !mongoose.Types.ObjectId.isValid(String(value))) throw validationError(`${field} must be a valid identifier.`, field);
};

const parseDate = (value, field) => {
  if (value === undefined || value === "") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw validationError(`${field} must be a valid date.`, field);
  return date;
};

const validateQuery = (query = {}) => {
  ["projectId", "sprintId", "teamId", "userId", "assigneeId", "taskId", "actorId"].forEach((field) => validateObjectId(query[field], field));
  const fromDate = parseDate(query.fromDate, "fromDate");
  const toDate = parseDate(query.toDate, "toDate");
  if (fromDate && toDate && fromDate > toDate) throw validationError("fromDate must be before or equal to toDate.", "fromDate");

  const limit = query.limit === undefined ? 10 : Number(query.limit);
  const days = query.days === undefined ? 7 : Number(query.days);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw validationError("limit must be between 1 and 100.", "limit");
  if (!Number.isInteger(days) || days < 1 || days > 90) throw validationError("days must be between 1 and 90.", "days");
  return { ...query, fromDate, toDate, limit, days };
};

const validateWidgets = (body = {}) => {
  if (!Array.isArray(body.widgets) || body.widgets.length > 20) throw validationError("widgets must contain at most 20 items.", "widgets");
  body.widgets.forEach((widget, index) => {
    if (!WIDGET_TYPES.has(widget.widgetType)) throw validationError(`Unsupported widget type at index ${index}.`, `widgets[${index}].widgetType`);
    const position = widget.position || {};
    if (!Number.isInteger(position.x) || !Number.isInteger(position.y) || !Number.isInteger(position.width) || !Number.isInteger(position.height)) {
      throw validationError(`Widget position at index ${index} must contain integer x, y, width, and height.`, `widgets[${index}].position`);
    }
    if (position.x < 0 || position.y < 0 || position.width < 1 || position.width > 12 || position.height < 1 || position.height > 24) {
      throw validationError(`Widget position at index ${index} is outside the supported layout bounds.`, `widgets[${index}].position`);
    }
  });
  return body.widgets;
};

module.exports = { validateQuery, validateWidgets, WIDGET_TYPES };