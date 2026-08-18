const { validateQuery } = require("../dashboard/dashboard.validation");

const validateReportQuery = (query = {}) => {
  const result = validateQuery(query);
  const page = query.page === undefined ? 1 : Number(query.page);
  const pageSize = query.pageSize === undefined ? 20 : Number(query.pageSize);
  if (!Number.isInteger(page) || page < 1) {
    const error = new Error("page must be a positive integer.");
    error.code = "VALIDATION_ERROR";
    error.statusCode = 400;
    throw error;
  }
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    const error = new Error("pageSize must be between 1 and 100.");
    error.code = "VALIDATION_ERROR";
    error.statusCode = 400;
    throw error;
  }
  const interval = query.interval === undefined ? "day" : String(query.interval).toLowerCase();
  if (!["day", "week", "month"].includes(interval)) {
    const error = new Error("interval must be day, week, or month.");
    error.code = "VALIDATION_ERROR";
    error.statusCode = 400;
    throw error;
  }
  const format = query.format === undefined ? "json" : String(query.format).toLowerCase();
  if (!["json", "csv"].includes(format)) {
    const error = new Error("format must be json or csv.");
    error.code = "VALIDATION_ERROR";
    error.statusCode = 400;
    throw error;
  }
  return { ...result, page, pageSize, interval, format };
};

module.exports = { validateReportQuery };