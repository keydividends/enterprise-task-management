const path = require("path");
const fs = require("node:fs");
const mongoose = require("mongoose");
const repo = require("./attachment.repository");
const { mapAttachment } = require("./attachment.mapper");
const { validateUploadedFile, validateDisplayName, isValidObjectId } = require("./attachment.validation");
const { UPLOAD_DIR } = require("./attachment.upload");
const { isImageKitConfigured, uploadToImageKit, deleteFromImageKit } = require("./imagekit.storage");
const { assertTaskCollaborationAccess, hasPermission } = require("../collaboration/taskAccess");

const MAX_ATTACHMENTS_PER_TASK = 15;

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
      /* ignore */
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

const assertAttachmentExists = async (attachmentId) => {
  if (!isValidObjectId(attachmentId)) throw createError("INVALID_IDENTIFIER", "Attachment ID must be valid.", 400);
  const attachment = await repo.findAttachmentById(attachmentId);
  if (!attachment) throw createError("ATTACHMENT_NOT_FOUND", "Attachment not found.", 404);
  return attachment;
};

const assertCanDelete = (attachment, context = {}) => {
  const userId = context.userId || context.user?.id;
  const isOwner = String(attachment.uploadedBy) === String(userId);
  if (!isOwner && !hasPermission(context, "ATTACHMENT_DELETE")) {
    throw createError("PERMISSION_DENIED", "You can only delete your own attachments unless you have attachment-delete permission.", 403);
  }
};


const uploadTaskAttachment = async (taskId, file, context = {}) => {
  const task = await assertTaskExists(taskId);
  await assertTaskCollaborationAccess(task, context);
  validateUploadedFile(file);

  const attachmentCount = await repo.countAttachmentsByEntity("TASK", taskId);
  if (attachmentCount >= MAX_ATTACHMENTS_PER_TASK) {
    throw createError(
      "ATTACHMENT_LIMIT_REACHED",
      `A task can have at most ${MAX_ATTACHMENTS_PER_TASK} attachments. Delete an existing attachment before uploading another.`,
      409
    );
  }

  const userId = context.userId || context.user?.id;
  const { firstName, lastName } = context.user || {};
  const uploaderName = [firstName, lastName].filter(Boolean).join(' ').trim() || null;
  const useImageKit = isImageKitConfigured();
  const remoteFile = useImageKit ? await uploadToImageKit(file) : null;

  let attachment;
  try {
    attachment = await repo.createAttachment({
      entityType: "TASK",
      entityId: taskId,
      originalFileName: context.fileName ? validateDisplayName(context.fileName) : file.originalname,
      storedFileName: useImageKit ? remoteFile.fileName : file.filename,
      storageKey: useImageKit ? remoteFile.fileId : file.filename,
      storageProvider: useImageKit ? "IMAGEKIT" : "LOCAL",
      remoteFileId: useImageKit ? remoteFile.fileId : null,
      remoteUrl: useImageKit ? remoteFile.url : null,
      mimeType: file.mimetype,
      fileSize: file.size,
      uploadedBy: userId,
      uploaderName,
    });
  } catch (error) {
    // Do not leave a remote file behind when metadata persistence fails.
    if (useImageKit) {
      try { await deleteFromImageKit(remoteFile.fileId); } catch { /* ignore cleanup failure */ }
    }
    throw error;
  }

  return mapAttachment(attachment);
};


const listTaskAttachments = async (taskId, query, context = {}) => {
  const task = await assertTaskExists(taskId);
  await assertTaskCollaborationAccess(task, context);

  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const pageSize = Math.min(parseInt(query.pageSize, 10) || 20, 100);
  const skip = (page - 1) * pageSize;

  const [attachments, totalItems] = await Promise.all([
    repo.findAttachmentsByEntity("TASK", taskId, { skip, limit: pageSize }),
    repo.countAttachmentsByEntity("TASK", taskId),
  ]);

  return {
    items: attachments.map(mapAttachment),
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    },
  };
};


const getAttachmentForDownload = async (attachmentId, context = {}) => {
  const attachment = await assertAttachmentExists(attachmentId);
  const task = await assertTaskExists(attachment.entityId);
  await assertTaskCollaborationAccess(task, context);

  if (attachment.storageProvider === "IMAGEKIT") {
    if (!attachment.remoteUrl) {
      throw createError("FILE_NOT_FOUND", "The file could not be found on ImageKit.", 404);
    }
    return { attachment, remoteUrl: attachment.remoteUrl };
  }

  const filePath = path.join(UPLOAD_DIR, attachment.storedFileName);

  if (!fs.existsSync(filePath)) {
    throw createError("FILE_NOT_FOUND", "The file could not be found on the server.", 404);
  }
  return { attachment, filePath, remoteUrl: null };
};


const deleteAttachment = async (attachmentId, context = {}) => {
  const attachment = await assertAttachmentExists(attachmentId);
  const task = await assertTaskExists(attachment.entityId);
  await assertTaskCollaborationAccess(task, context);
  assertCanDelete(attachment, context);
  const userId = context.userId || context.user?.id;

  await repo.softDeleteAttachment(attachmentId, userId);

  try {
    if (attachment.storageProvider === "IMAGEKIT") {
      await deleteFromImageKit(attachment.remoteFileId);
    } else {
      const filePath = path.join(UPLOAD_DIR, attachment.storedFileName);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  } catch {
    /* ignore */
  }

  return { id: attachmentId };
};

const renameAttachment = async (attachmentId, payload, context = {}) => {
  const userId = context.userId || context.user?.id;
  const attachment = await assertAttachmentExists(attachmentId);
  const task = await assertTaskExists(attachment.entityId);
  await assertTaskCollaborationAccess(task, context);

  if (String(attachment.uploadedBy) !== String(userId)) {
    throw createError("PERMISSION_DENIED", "You can only rename files you uploaded.", 403);
  }

  const updated = await repo.updateAttachmentName(attachmentId, validateDisplayName(payload?.fileName));
  return mapAttachment(updated);
};

module.exports = {
  uploadTaskAttachment,
  listTaskAttachments,
  getAttachmentForDownload,
  deleteAttachment,
  renameAttachment,
  MAX_ATTACHMENTS_PER_TASK,
};
