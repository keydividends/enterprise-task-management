const mongoose = require("mongoose");
const repo = require("./comment.repository");
const { mapComment } = require("./comment.mapper");
const { validateCreateComment, validateUpdateComment, isValidObjectId } = require("./comment.validation");
const { assertTaskCollaborationAccess, isAdministrator } = require("../collaboration/taskAccess");

const MAX_COMMENTS_PER_TASK = 30;

const createError = (code, message, statusCode = 400) => {
  const err = new Error(message);
  err.code = code;
  err.statusCode = statusCode;
  return err;
};

const findTaskById = async (taskId) => {
  if (mongoose.models.Task) {
    try {
      return await mongoose.models.Task.findOne({ _id: taskId, isDeleted: false }).lean();
    } catch {
        return null;
    }
  }
  return null;
};

const assertTaskExists = async (taskId) => {
  if (!isValidObjectId(taskId)) throw createError("INVALID_IDENTIFIER", "Task ID must be valid.", 400);
  const task = await findTaskById(taskId);
  if (!task) throw createError("TASK_NOT_FOUND", "Task not found.", 404);
  return task;
};

const assertCommentExists = async (commentId) => {
  if (!isValidObjectId(commentId)) throw createError("INVALID_IDENTIFIER", "Comment ID must be valid.", 400);
  const comment = await repo.findCommentById(commentId);
  if (!comment) throw createError("COMMENT_NOT_FOUND", "Comment not found.", 404);
  return comment;
};

const assertCanModify = (comment, context) => {
  const userId = context.userId || context.user?.id;
  const isOwner = String(comment.authorId) === String(userId);
  if (!isOwner && !isAdministrator(context)) {
    throw createError("PERMISSION_DENIED", "You can only modify your own comments unless you are an administrator.", 403);
  }
};

const listComments = async (taskId, query, context = {}) => {
  const task = await assertTaskExists(taskId);
  await assertTaskCollaborationAccess(task, context);

  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const pageSize = Math.min(parseInt(query.pageSize, 10) || 20, 100);
  const skip = (page - 1) * pageSize;

  const [comments, totalItems] = await Promise.all([
    repo.findCommentsByTask(taskId, { skip, limit: pageSize }),
    repo.countCommentsByTask(taskId),
  ]);

  return {
    items: comments.map(mapComment),
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    },
  };
};

const createComment = async (taskId, payload, context = {}) => {
  validateCreateComment(payload);
  const task = await assertTaskExists(taskId);
  await assertTaskCollaborationAccess(task, context);

  const commentCount = await repo.countCommentsByTask(taskId);
  if (commentCount >= MAX_COMMENTS_PER_TASK) {
    throw createError(
      "COMMENT_LIMIT_REACHED",
      `A task can have at most ${MAX_COMMENTS_PER_TASK} comments. Delete an existing comment before adding another.`,
      409
    );
  }

  const userId = context.userId || context.user?.id;
  const { firstName, lastName } = context.user || {};
  const authorName = [firstName, lastName].filter(Boolean).join(' ').trim() || null;

  if (payload.parentCommentId) {
    if (!isValidObjectId(payload.parentCommentId)) {
      throw createError("INVALID_IDENTIFIER", "parentCommentId must be a valid ID.", 400);
    }
    const parent = await repo.findCommentById(payload.parentCommentId);
    if (!parent) throw createError("COMMENT_NOT_FOUND", "Parent comment not found.", 404);
    if (String(parent.taskId) !== String(taskId)) {
      throw createError("COMMENT_TASK_MISMATCH", "Parent comment does not belong to this task.", 400);
    }
  }

  const comment = await repo.createComment({
    taskId,
    authorId: userId,
    authorName,
    text: String(payload.text).trim(),
    parentCommentId: payload.parentCommentId || null,
  });

  return mapComment(comment);
};

const editComment = async (commentId, payload, context = {}) => {
  validateUpdateComment(payload);
  const comment = await assertCommentExists(commentId);
  const task = await assertTaskExists(comment.taskId);
  await assertTaskCollaborationAccess(task, context);
  assertCanModify(comment, context);

  const updated = await repo.updateComment(commentId, {
    text: String(payload.text).trim(),
    isEdited: true,
    editedAt: new Date(),
  });

  return mapComment(updated);
};

const deleteComment = async (commentId, context = {}) => {
  const comment = await assertCommentExists(commentId);
  const task = await assertTaskExists(comment.taskId);
  await assertTaskCollaborationAccess(task, context);
  assertCanModify(comment, context);

  await repo.softDeleteComment(commentId);
  return { id: commentId };
};

module.exports = {
  listComments,
  createComment,
  editComment,
  deleteComment,
  MAX_COMMENTS_PER_TASK,
};
