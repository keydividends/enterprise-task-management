const mongoose = require("mongoose");
const { UserAuth } = require("../auth/auth.model");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: false, // Optional for SSO users
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    microsoftId: {
      type: String,
      unique: true,
      sparse: true,
    },
    firstName: {
      type: String,
      trim: true,
      required: true,
    },
    lastName: {
      type: String,
      trim: true,
      default: "",
    },
    mobile: {
      type: String,
      trim: true,
      default: "",
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    department: {
      type: String,
      trim: true,
      default: "",
    },
    title: {
      type: String,
      trim: true,
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    employeeId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    managerEmployeeId: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      enum: ["MANAGER", "ADMIN", "USER", "INTERN"],
      default: "MANAGER",
    },
    roleId: {
      type: String,
      default: null,
    },
    permissions: {
      type: [String],
      default: ["PROJECT_VIEW", "SPRINT_VIEW", "TASK_VIEW", "TASK_UPDATE", "COMMENT_CREATE", "ATTACHMENT_UPLOAD", "ATTACHMENT_VIEW", "DASHBOARD_VIEW"],
    },
    status: {
      type: String,
      enum: ["ACTIVE", "DISABLED", "LOCKED", "DELETED"],
      default: "ACTIVE",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || UserAuth || mongoose.model("User", userSchema, "Users");

module.exports = {
  User,
};
