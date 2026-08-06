const { Comment } = require("./comment.model");

const createComment = (data) => Comment.create(data);

const findCommentsByTask = (taskId, { skip = 0, limit = 50 } = {}) =>
  Comment.find({ taskId, isDeleted: false })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

const countCommentsByTask = (taskId) =>
  Comment.countDocuments({ taskId, isDeleted: false });

const findCommentById = (commentId) =>
  Comment.findOne({ _id: commentId, isDeleted: false });

const updateComment = (commentId, update) =>
  Comment.findOneAndUpdate(
    { _id: commentId, isDeleted: false },
    update,
    { new: true, runValidators: true }
  );

const softDeleteComment = (commentId) =>
  Comment.findOneAndUpdate(
    { _id: commentId, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );

const findRepliesByComment = (parentCommentId) =>
  Comment.find({ parentCommentId, isDeleted: false }).sort({ createdAt: 1 }).lean();

module.exports = {
  createComment,
  findCommentsByTask,
  countCommentsByTask,
  findCommentById,
  updateComment,
  softDeleteComment,
  findRepliesByComment,
};
