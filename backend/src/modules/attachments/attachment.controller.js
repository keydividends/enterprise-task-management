const attachmentService = require("./attachment.service");
const axios = require("axios");

const isBrowserViewable = (mimeType = "") =>
  mimeType === "application/pdf"
  || mimeType === "text/plain"
  || mimeType === "text/csv"
  || mimeType.startsWith("image/");

const contentDisposition = (fileName, inline) =>
  `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(fileName)}`;

const getUserContext = (req) => ({
  userId: req.user?.id,
  user: req.user,
  fileName: req.body?.fileName,
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
    const { attachment, filePath, remoteUrl } = await attachmentService.getAttachmentForDownload(
      req.params.attachmentId,
      getUserContext(req)
    );

    // The same protected endpoint serves a browser preview when explicitly
    // requested for a safe, browser-supported MIME type. Unsupported types
    // always remain downloads.
    const inline = req.query.disposition === "inline" && isBrowserViewable(attachment.mimeType);
    res.setHeader("Content-Disposition", contentDisposition(attachment.originalFileName, inline));
    res.setHeader("Content-Type", attachment.mimeType);
    if (remoteUrl) {
      // Do not redirect to a public storage URL. Proxy the approved download
      // so each request remains protected by the task-access check above.
      const remoteFile = await axios.get(remoteUrl, { responseType: "stream" });
      if (remoteFile.headers["content-length"]) {
        res.setHeader("Content-Length", remoteFile.headers["content-length"]);
      }
      return remoteFile.data.pipe(res);
    }
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

const renameAttachment = async (req, res, next) => {
  try {
    const attachment = await attachmentService.renameAttachment(
      req.params.attachmentId,
      req.body,
      getUserContext(req)
    );
    return sendJson(res, 200, "Attachment renamed", attachment);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadAttachment,
  listAttachments,
  downloadAttachment,
  deleteAttachment,
  renameAttachment,
};
