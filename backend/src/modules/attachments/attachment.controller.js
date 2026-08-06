const attachmentService = require("./attachment.service");

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

const uploadAttachment = async (req, res, next) => {
  try {
    const attachment = await attachmentService.uploadTaskAttachment(
      req.params.taskId,
      req.file,
      getUserContext(req)
    );
    return sendJson(res, 201, "File uploaded", attachment);
  } catch (error) {
    next(error);
  }
};

const listAttachments = async (req, res, next) => {
  try {
    const result = await attachmentService.listTaskAttachments(
      req.params.taskId,
      req.query,
      getUserContext(req)
    );
    return sendJson(res, 200, null, result.items, result.pagination);
  } catch (error) {
    next(error);
  }
};

const downloadAttachment = async (req, res, next) => {
  try {
    const { attachment, filePath } = await attachmentService.getAttachmentForDownload(
      req.params.attachmentId,
      getUserContext(req)
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(attachment.originalFileName)}"`
    );
    res.setHeader("Content-Type", attachment.mimeType);
    return res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};

const deleteAttachment = async (req, res, next) => {
  try {
    const result = await attachmentService.deleteAttachment(
      req.params.attachmentId,
      getUserContext(req)
    );
    return sendJson(res, 200, "Attachment deleted", result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadAttachment,
  listAttachments,
  downloadAttachment,
  deleteAttachment,
};
