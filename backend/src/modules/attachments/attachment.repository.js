const { Attachment } = require("./attachment.model");

const createAttachment = (data) => Attachment.create(data);

const findAttachmentsByEntity = (entityType, entityId, { skip = 0, limit = 50 } = {}) =>
  Attachment.find({ entityType, entityId, isDeleted: false })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

const countAttachmentsByEntity = (entityType, entityId) =>
  Attachment.countDocuments({ entityType, entityId, isDeleted: false });

const findAttachmentById = (attachmentId) =>
  Attachment.findOne({ _id: attachmentId, isDeleted: false });

const softDeleteAttachment = (attachmentId, deletedBy) =>
  Attachment.findOneAndUpdate(
    { _id: attachmentId, isDeleted: false },
    { isDeleted: true, deletedAt: new Date(), deletedBy },
    { new: true }
  );

const updateAttachmentName = (attachmentId, originalFileName) =>
  Attachment.findOneAndUpdate(
    { _id: attachmentId, isDeleted: false },
    { originalFileName },
    { new: true }
  );

module.exports = {
  createAttachment,
  findAttachmentsByEntity,
  countAttachmentsByEntity,
  findAttachmentById,
  softDeleteAttachment,
  updateAttachmentName,
};
