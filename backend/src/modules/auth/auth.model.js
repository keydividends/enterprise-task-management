const mongoose = require("mongoose");

const userAuthSchema = new mongoose.Schema(
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
    },
    lastName: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      // Legacy roles remain readable for existing accounts. Public registration
      // is constrained by auth.service to the manager role below.
      enum: ["manager", "Manager", "Admin", "USER", "ADMIN", "INTERN"],
      default: "manager",
      required: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["ACTIVE", "DISABLED", "LOCKED", "DELETED"],
      default: "ACTIVE",
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    customId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    mobile: {
      type: String,
      trim: true,
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
    roleId: {
      type: String,
      default: null,
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const passwordResetTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// MongoDB removes reset tokens once they expire. The explicit expiry field is
// still retained so the service can reject an expired token immediately.
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const userSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    refreshTokenHash: {
      type: String,
      required: true,
    },
    deviceName: {
      type: String,
      default: "Unknown device",
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

userSessionSchema.index({ userId: 1, isActive: 1 });
userSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const UserAuth = mongoose.models.User || mongoose.model("User", userAuthSchema, "Users");
const PasswordResetToken = mongoose.models.PasswordResetToken || mongoose.model("PasswordResetToken", passwordResetTokenSchema, "PasswordResetTokens");
const UserSession = mongoose.models.UserSession || mongoose.model("UserSession", userSessionSchema, "UserSessions");

module.exports = {
  UserAuth,
  PasswordResetToken,
  UserSession,
};
