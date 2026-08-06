const express = require("express");
const attachmentController = require("./attachment.controller");
const { upload } = require("./attachment.upload");
const authenticate = require("../../middleware/authenticate");

const taskAttachmentRouter = express.Router({ mergeParams: true });

taskAttachmentRouter.use(authenticate);
taskAttachmentRouter.get("/", attachmentController.listAttachments);
taskAttachmentRouter.post("/", upload.single("file"), attachmentController.uploadAttachment);

const attachmentRouter = express.Router();

attachmentRouter.use(authenticate);
attachmentRouter.get("/:attachmentId/download", attachmentController.downloadAttachment);
attachmentRouter.delete("/:attachmentId", attachmentController.deleteAttachment);

module.exports = { taskAttachmentRouter, attachmentRouter };
