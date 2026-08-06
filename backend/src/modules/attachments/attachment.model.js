const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      enum: ["TASK", "COMMENT", "PROJECT", "USER"],
      required: true,
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    originalFileName: {
      type: String,
      required: true,
      trim: true,
    },
    storedFileName: {
      type: String,
      required: true,
    },
    storageKey: {
      type: String,
      required: true,
      unique: true,
    },
    storageProvider: {
      type: String,
      enum: ["LOCAL", "IMAGEKIT"],
      default: "LOCAL",
      required: true,
    },
    remoteFileId: {
      type: String,
      default: null,
    },
    remoteUrl: {
      type: String,
      default: null,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    uploaderName: {
      type: String,
      default: null,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

attachmentSchema.index({ entityType: 1, entityId: 1, isDeleted: 1, createdAt: -1 });
attachmentSchema.index({ uploadedBy: 1, createdAt: -1 });

const Attachment =
  mongoose.models.Attachment ||
  mongoose.model("Attachment", attachmentSchema, "Attachments");

module.exports = { Attachment };
