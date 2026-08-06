const mapAttachment = (attachment) => ({
  id: attachment._id?.toString() || attachment.id,
  entityType: attachment.entityType,
  entityId: attachment.entityId?.toString?.() ?? attachment.entityId,
  originalFileName: attachment.originalFileName,
  storedFileName: attachment.storedFileName,
  storageKey: attachment.storageKey,
  storageProvider: attachment.storageProvider || "LOCAL",
  mimeType: attachment.mimeType,
  fileSize: attachment.fileSize,
  uploadedBy: attachment.uploadedBy?.toString?.() ?? attachment.uploadedBy,
  uploaderName: attachment.uploaderName ?? null,
  createdAt: attachment.createdAt,
  updatedAt: attachment.updatedAt,
});

module.exports = { mapAttachment };
