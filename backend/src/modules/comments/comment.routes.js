const express = require("express");
const commentController = require("./comment.controller");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

const taskCommentRouter = express.Router({ mergeParams: true });

taskCommentRouter.use(authenticate);
taskCommentRouter.get("/", authorize("TASK_VIEW"), commentController.listComments);
taskCommentRouter.post("/", authorize("TASK_VIEW"), commentController.createComment);

const commentRouter = express.Router();

commentRouter.use(authenticate);
commentRouter.patch("/:commentId", authorize("TASK_VIEW"), commentController.editComment);
commentRouter.delete("/:commentId", authorize("TASK_VIEW"), commentController.deleteComment);

module.exports = { taskCommentRouter, commentRouter };