const express = require("express");
const attachmentController = require("./attachment.controller");
const { upload } = require("./attachment.upload");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

const taskAttachmentRouter = express.Router({ mergeParams: true });

taskAttachmentRouter.use(authenticate);
taskAttachmentRouter.get("/", authorize("ATTACHMENT_VIEW"), attachmentController.listAttachments);
taskAttachmentRouter.post("/", authorize("ATTACHMENT_UPLOAD"), upload.single("file"), attachmentController.uploadAttachment);

const attachmentRouter = express.Router();

attachmentRouter.use(authenticate);
attachmentRouter.get("/:attachmentId/download", authorize("ATTACHMENT_VIEW"), attachmentController.downloadAttachment);
attachmentRouter.patch("/:attachmentId", express.json(), attachmentController.renameAttachment);
attachmentRouter.delete("/:attachmentId", authorize("ATTACHMENT_DELETE"), attachmentController.deleteAttachment);

module.exports = { taskAttachmentRouter, attachmentRouter };
