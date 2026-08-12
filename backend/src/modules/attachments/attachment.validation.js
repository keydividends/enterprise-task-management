const mongoose = require("mongoose");
const path = require("path");

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
  "application/zip",
]);

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

const validateUploadedFile = (file) => {
  if (!file) throw createError("No file uploaded.", "file", 400);

  if (file.size > MAX_FILE_SIZE) {
    const err = new Error("File exceeds the 10 MB size limit.");
    err.code = "FILE_TOO_LARGE";
    err.statusCode = 413;
    throw err;
  }

  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    const err = new Error(`File type '${file.mimetype}' is not allowed.`);
    err.code = "UNSUPPORTED_FILE_TYPE";
    err.statusCode = 415;
    throw err;
  }
};

const validateDisplayName = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    throw createError("File name is required.", "fileName");
  }
  const name = value.trim();
  if (name.length > 255 || name.includes("/") || name.includes("\\")) {
    throw createError("File name must be at most 255 characters and cannot contain path separators.", "fileName");
  }
  return name;
};

module.exports = {
  validateUploadedFile,
  validateObjectId,
  isValidObjectId,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
  validateDisplayName,
};
