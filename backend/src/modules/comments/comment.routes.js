const express = require("express");
const commentController = require("./comment.controller");
const authenticate = require("../../middleware/authenticate");

const taskCommentRouter = express.Router({ mergeParams: true });

taskCommentRouter.use(authenticate);
taskCommentRouter.get("/", commentController.listComments);
taskCommentRouter.post("/", commentController.createComment);

const commentRouter = express.Router();

commentRouter.use(authenticate);
commentRouter.patch("/:commentId", commentController.editComment);
commentRouter.delete("/:commentId", commentController.deleteComment);

module.exports = { taskCommentRouter, commentRouter };
