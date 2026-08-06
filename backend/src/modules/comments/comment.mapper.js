const mapComment = (comment) => ({
  id: comment._id?.toString() || comment.id,
  taskId: comment.taskId?.toString?.() ?? comment.taskId,
  authorId: comment.authorId?.toString?.() ?? comment.authorId,
  authorName: comment.authorName ?? null,
  text: comment.text,
  parentCommentId: comment.parentCommentId?.toString?.() ?? comment.parentCommentId ?? null,
  isEdited: comment.isEdited,
  editedAt: comment.editedAt ?? null,
  createdAt: comment.createdAt,
  updatedAt: comment.updatedAt,
});

module.exports = { mapComment };
