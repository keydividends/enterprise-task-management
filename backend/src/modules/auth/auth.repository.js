const crypto = require("node:crypto");
const mongoose = require("mongoose");
const { UserAuth, PasswordResetToken } = require("./auth.model");

const isDbConnected = () =>
  mongoose.connection && mongoose.connection.readyState === 1;

const requireDatabase = () => {
  if (!isDbConnected()) {
    const error = new Error(
      "Database connection is required for authentication."
    );

    error.code = "DATABASE_UNAVAILABLE";
    error.statusCode = 503;

    throw error;
  }
};

const normalizeEmail = (email = "") =>
  String(email).trim().toLowerCase();

const hashResetToken = (token) =>
  crypto
    .createHash("sha256")
    .update(String(token))
    .digest("hex");

const logRegistrationDebug = (message, details) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[auth:register] ${message}`, details);
  }
};

const findUserByEmail = async (email) => {
  requireDatabase();

  const normalizedEmail = normalizeEmail(email);

  const user = await UserAuth.findOne({
    email: normalizedEmail,
    isDeleted: false,
  });

  logRegistrationDebug("user lookup", {
    normalizedEmail,
    collection: UserAuth.collection.name,
    userFound: Boolean(user),
    userId: user ? String(user._id) : null,
  });

  return user;
};

const createUser = async ({
  firstName,
  lastName,
  email,
  passwordHash,
  googleId,
  microsoftId,
  role = "MANAGER",
  permissions = [],
  companyId = null,
  companyName = "",
}) => {
  requireDatabase();

  const normalizedEmail = normalizeEmail(email);

  try {
    return await UserAuth.create({
      email: normalizedEmail,
      passwordHash,
      googleId,
      microsoftId,
      firstName: String(firstName || "").trim(),
      lastName: String(lastName || "").trim(),
      role,
      permissions,
      companyId,
      companyName,
      status: "ACTIVE",
      isDeleted: false,
    });
  } catch (error) {
    const duplicateEmail =
      error &&
      error.code === 11000 &&
      (
        error.keyPattern?.email ||
        Object.prototype.hasOwnProperty.call(
          error.keyValue || {},
          "email"
        )
      );

    if (duplicateEmail) {
      error.code = "USER_ALREADY_EXISTS";
      error.statusCode = 409;
      error.message = "A user with this email already exists.";
    }

    logRegistrationDebug("user creation failed", {
      normalizedEmail,
      collection: UserAuth.collection.name,
      errorCode: error?.code,
      duplicateEmail,
      duplicateKey: error?.keyPattern || null,
    });

    throw error;
  }
};

const findUserById = async (userId) => {
  requireDatabase();

  if (!userId) {
    return null;
  }

  return UserAuth.findOne({
    _id: userId,
    isDeleted: false,
  });
};

const updateUserPassword = async (userId, passwordHash) => {
  requireDatabase();

  if (!userId) {
    return null;
  }

  return UserAuth.findOneAndUpdate(
    {
      _id: userId,
      isDeleted: false,
    },
    {
      $set: {
        passwordHash,
      },
    },
    {
      new: true,
    }
  );
};

const storeResetToken = async (token, payload) => {
  requireDatabase();

  const tokenHash = hashResetToken(token);

  await PasswordResetToken.updateMany(
    {
      userId: String(payload.userId),
      used: false,
    },
    {
      $set: {
        used: true,
        usedAt: new Date(),
      },
    }
  );

  return PasswordResetToken.create({
    userId: String(payload.userId),
    tokenHash,
    expiresAt: payload.expiresAt,
    used: false,
  });
};

const findResetTokenByToken = async (token) => {
  requireDatabase();

  const tokenHash = hashResetToken(token);

  return PasswordResetToken.findOne({
    tokenHash,
    used: false,
  });
};

const markResetTokenAsUsed = async (token) => {
  requireDatabase();

  const tokenHash = hashResetToken(token);

  return PasswordResetToken.findOneAndUpdate(
    {
      tokenHash,
      used: false,
    },
    {
      $set: {
        used: true,
        usedAt: new Date(),
      },
    },
    {
      new: true,
    }
  );
};

const invalidateAllResetTokensForUser = async (userId) => {
  requireDatabase();

  return PasswordResetToken.updateMany(
    {
      userId: String(userId),
      used: false,
    },
    {
      $set: {
        used: true,
        usedAt: new Date(),
      },
    }
  );
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
};