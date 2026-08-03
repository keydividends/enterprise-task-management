const crypto = require("node:crypto");
const { UserAuth, PasswordResetToken } = require("./auth.model");

const normalizeEmail = (email = "") => email.trim().toLowerCase();
const hashResetToken = (token) => crypto.createHash("sha256").update(String(token)).digest("hex");

const findUserByEmail = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  return UserAuth.findOne({ email: normalizedEmail, isDeleted: false });
};

const createUser = async ({ firstName, lastName, email, passwordHash, role = "USER", permissions = [] }) => {
  const normalizedEmail = normalizeEmail(email);
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
};

const findUserById = async (userId) => UserAuth.findOne({ _id: userId, isDeleted: false });

const updateUserPassword = async (userId, passwordHash) => UserAuth.findOneAndUpdate(
  { _id: userId, isDeleted: false },
  { $set: { passwordHash } },
  { new: true }
);

const storeResetToken = async (token, payload) => {
  const tokenHash = hashResetToken(token);
  await PasswordResetToken.updateMany(
    { userId: String(payload.userId), used: false },
    { $set: { used: true, usedAt: new Date() } }
  );

  return PasswordResetToken.create({
    userId: String(payload.userId),
    tokenHash,
    expiresAt: payload.expiresAt,
  });
};

const findResetTokenByToken = async (token) => {
  const tokenHash = hashResetToken(token);
  return PasswordResetToken.findOne({ tokenHash, used: false });
};

const markResetTokenAsUsed = async (token) => {
  const tokenHash = hashResetToken(token);
  return PasswordResetToken.findOneAndUpdate(
    { tokenHash, used: false },
    { $set: { used: true, usedAt: new Date() } },
    { new: true }
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
};
