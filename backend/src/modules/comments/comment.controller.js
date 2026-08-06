const commentService = require("./comment.service");

const getUserContext = (req) => ({
  userId: req.user?.id,
  user: req.user,
});

const sendJson = (res, statusCode, message, data, pagination) => {
  const body = { success: true };
  if (message) body.message = message;
  if (data !== undefined) body.data = data;
  if (pagination) body.pagination = pagination;
  return res.status(statusCode).json(body);
};

const listComments = async (req, res, next) => {
  try {
    const result = await commentService.listComments(req.params.taskId, req.query, getUserContext(req));
    return sendJson(res, 200, null, result.items, result.pagination);
  } catch (error) {
    next(error);
  }
};

const createComment = async (req, res, next) => {
  try {
    const comment = await commentService.createComment(req.params.taskId, req.body, getUserContext(req));
    return sendJson(res, 201, "Comment created", comment);
  } catch (error) {
    next(error);
  }
};

const editComment = async (req, res, next) => {
  try {
    const comment = await commentService.editComment(req.params.commentId, req.body, getUserContext(req));
    return sendJson(res, 200, "Comment updated", comment);
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const result = await commentService.deleteComment(req.params.commentId, getUserContext(req));
    return sendJson(res, 200, "Comment deleted", result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listComments,
  createComment,
  editComment,
  deleteComment,
};
