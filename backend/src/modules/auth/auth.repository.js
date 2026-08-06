const crypto = require("node:crypto");
const mongoose = require("mongoose");
const { UserAuth, PasswordResetToken } = require("./auth.model");

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

const normalizeEmail = (email = "") => String(email).trim().toLowerCase();
const hashResetToken = (token) => crypto.createHash("sha256").update(String(token)).digest("hex");

const memoryUsers = new Map([
  [
    "admin@etms.com",
    {
      _id: "user_admin_1",
      id: "user_admin_1",
      firstName: "Admin",
      lastName: "User",
      email: "admin@etms.com",
      passwordHash: "$2b$10$2LHil5UBjkY2Wuvcdln.VeScEors5MVuMy3qX5nkRwyxhHtoJGUUy",
      role: "ADMIN",
      permissions: [
        "USER_VIEW", "USER_CREATE", "USER_UPDATE", "USER_DELETE",
        "PROJECT_VIEW", "PROJECT_CREATE", "PROJECT_UPDATE", "PROJECT_DELETE",
        "TASK_VIEW", "TASK_CREATE", "TASK_UPDATE", "TASK_DELETE",
        "TEAM_VIEW", "TEAM_CREATE", "TEAM_UPDATE", "TEAM_DELETE",
      ],
      workspaceId: "64a000000000000000000001",
      status: "ACTIVE",
      isDeleted: false,
    },
  ],
  [
    "demo@etms.com",
    {
      _id: "user_demo_1",
      id: "user_demo_1",
      firstName: "Demo",
      lastName: "User",
      email: "demo@etms.com",
      passwordHash: "$2b$10$XUA4r0D2oshUWDt1W7pej.qBPju9qQRx/FBR7s7o/alBkNZ6kCIUq",
      role: "USER",
      permissions: [
        "USER_VIEW",
        "PROJECT_VIEW", "PROJECT_CREATE", "PROJECT_UPDATE",
        "TASK_VIEW", "TASK_CREATE", "TASK_UPDATE",
        "TEAM_VIEW",
      ],
      workspaceId: "64a000000000000000000001",
      status: "ACTIVE",
      isDeleted: false,
    },
  ],
  [
    "disabled@etms.com",
    {
      _id: "user_disabled_1",
      id: "user_disabled_1",
      firstName: "Disabled",
      lastName: "User",
      email: "disabled@etms.com",
      passwordHash: "$2b$10$R0sU2qLsYx5U.B8MCMteT.NxiI85.SCxSguv60TDvnVPZMnd4KUN2",
      role: "USER",
      permissions: [],
      status: "DISABLED",
      isDeleted: false,
    },
  ],
]);

const resetTokens = new Map();

const findUserByEmail = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  if (isDbConnected()) {
    return UserAuth.findOne({ email: normalizedEmail, isDeleted: false });
  }

  const user = memoryUsers.get(normalizedEmail);
  return user && !user.isDeleted ? user : null;
};

const createUser = async ({ firstName, lastName, email, passwordHash, role = "USER", permissions = [] }) => {
  const normalizedEmail = normalizeEmail(email);

  if (isDbConnected()) {
    try {
      return await UserAuth.create({
        email: normalizedEmail,
        passwordHash,
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        role,
        permissions,
        status: "ACTIVE",
      });
    } catch (error) {
      if (error && error.code === 11000) {
        error.code = "USER_ALREADY_EXISTS";
        error.statusCode = 409;
        error.message = "A user with this email already exists.";
      }
      throw error;
    }
  }

  if (memoryUsers.has(normalizedEmail)) {
    const error = new Error("A user with this email already exists.");
    error.code = "USER_ALREADY_EXISTS";
    error.statusCode = 409;
    throw error;
  }

  const newId = `user_${Date.now()}`;
  const newUser = {
    _id: newId,
    id: newId,
    email: normalizedEmail,
    passwordHash,
    firstName: String(firstName).trim(),
    lastName: String(lastName).trim(),
    role,
    permissions,
    status: "ACTIVE",
    isDeleted: false,
  };

  memoryUsers.set(normalizedEmail, newUser);
  return newUser;
};

const findUserById = async (userId) => {
  if (isDbConnected()) {
    return UserAuth.findOne({ _id: userId, isDeleted: false });
  }

  for (const user of memoryUsers.values()) {
    if ((user.id === String(userId) || user._id === String(userId)) && !user.isDeleted) {
      return user;
    }
  }
  return null;
};

const updateUserPassword = async (userId, passwordHash) => {
  if (isDbConnected()) {
    return UserAuth.findOneAndUpdate(
      { _id: userId, isDeleted: false },
      { $set: { passwordHash } },
      { new: true }
    );
  }

  const user = await findUserById(userId);
  if (user) {
    user.passwordHash = passwordHash;
  }
  return user;
};

const storeResetToken = async (token, payload) => {
  const tokenHash = hashResetToken(token);

  if (isDbConnected()) {
    await PasswordResetToken.updateMany(
      { userId: String(payload.userId), used: false },
      { $set: { used: true, usedAt: new Date() } }
    );

    return PasswordResetToken.create({
      userId: String(payload.userId),
      tokenHash,
      expiresAt: payload.expiresAt,
    });
  }

  for (const rec of resetTokens.values()) {
    if (rec.userId === String(payload.userId) && !rec.used) {
      rec.used = true;
      rec.usedAt = new Date();
    }
  }

  const record = {
    userId: String(payload.userId),
    tokenHash,
    rawToken: token,
    expiresAt: payload.expiresAt,
    used: false,
  };
  resetTokens.set(tokenHash, record);
  return record;
};

const findResetTokenByToken = async (token) => {
  const tokenHash = hashResetToken(token);

  if (isDbConnected()) {
    return PasswordResetToken.findOne({ tokenHash, used: false });
  }

  const record = resetTokens.get(tokenHash);
  return record && !record.used ? record : null;
};

const markResetTokenAsUsed = async (token) => {
  const tokenHash = hashResetToken(token);

  if (isDbConnected()) {
    return PasswordResetToken.findOneAndUpdate(
      { tokenHash, used: false },
      { $set: { used: true, usedAt: new Date() } },
      { new: true }
    );
  }

  const record = resetTokens.get(tokenHash);
  if (record && !record.used) {
    record.used = true;
    record.usedAt = new Date();
    return record;
  }
  return null;
};

const invalidateAllResetTokensForUser = async (userId) => {
  if (isDbConnected()) {
    return PasswordResetToken.updateMany(
      { userId: String(userId), used: false },
      { $set: { used: true, usedAt: new Date() } }
    );
  }

  for (const rec of resetTokens.values()) {
    if (rec.userId === String(userId) && !rec.used) {
      rec.used = true;
      rec.usedAt = new Date();
    }
  }
};

module.exports = {
  findUserByEmail,
  createUser,
  findUserById,
  updateUserPassword,
  storeResetToken,
  findResetTokenByToken,
  markResetTokenAsUsed,
  invalidateAllResetTokensForUser,
  resetTokens,
};
