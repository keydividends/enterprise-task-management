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
      passwordHash: "$2a$10$w4O8v893a7K.Xy3wzG0P..73Jd8V0v.FkL2Y1g7Q2P2G7f",
      role: "ADMIN",
      permissions: [
        "USER_VIEW",
        "USER_CREATE",
        "USER_UPDATE",
        "PROJECT_VIEW",
        "PROJECT_CREATE",
        "TASK_VIEW",
        "TASK_CREATE",
        "TASK_UPDATE",
      ],
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
      passwordHash: "$2a$10$w4O8v893a7K.Xy3wzG0P..73Jd8V0v.FkL2Y1g7Q2P2G7f",
      role: "USER",
      permissions: ["USER_VIEW", "PROJECT_VIEW", "TASK_VIEW", "TASK_CREATE"],
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
      passwordHash: "$2a$10$w4O8v893a7K.Xy3wzG0P..73Jd8V0v.FkL2Y1g7Q2P2G7f",
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

module.exports = {
  findUserByEmail,
  createUser,
  findUserById,
  updateUserPassword,
  storeResetToken,
  findResetTokenByToken,
  markResetTokenAsUsed,
  resetTokens,
};
