const mongoose = require("mongoose");
const MAX_COMMENT_LENGTH = 1000;

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

const validateCreateComment = ({ text, parentCommentId }) => {
  if (!text || !String(text).trim()) throw createError("Comment text is required.", "text");
  if (!String(text).trim().length) throw createError("Comment text cannot be only whitespace.", "text");
  if (String(text).trim().length > MAX_COMMENT_LENGTH) throw createError(`Comment text must be ${MAX_COMMENT_LENGTH} characters or fewer.`, "text");
  if (parentCommentId !== undefined && parentCommentId !== null) {
    validateObjectId(parentCommentId, "parentCommentId");
  }
};

const validateUpdateComment = ({ text }) => {
  if (!text || !String(text).trim()) throw createError("Comment text is required.", "text");
  if (String(text).trim().length > MAX_COMMENT_LENGTH) throw createError(`Comment text must be ${MAX_COMMENT_LENGTH} characters or fewer.`, "text");
};

module.exports = {
  validateCreateComment,
  validateUpdateComment,
  validateObjectId,
  isValidObjectId,
  MAX_COMMENT_LENGTH,
};
