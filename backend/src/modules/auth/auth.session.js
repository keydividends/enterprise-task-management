const crypto = require("node:crypto");
const mongoose = require("mongoose");
const { UserSession } = require("./auth.model");

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

const hashRefreshToken = (token) => crypto.createHash("sha256").update(String(token)).digest("hex");

const memorySessions = new Map();

const createSessionRecord = async ({ userId, refreshToken, deviceName, ipAddress, userAgent, expiresAt }) => {
  const tokenHash = hashRefreshToken(refreshToken);

  if (isDbConnected()) {
    return UserSession.create({
      userId: String(userId),
      refreshTokenHash: tokenHash,
      deviceName,
      ipAddress,
      userAgent,
      expiresAt,
    });
  }

  const session = {
    userId: String(userId),
    refreshTokenHash: tokenHash,
    deviceName,
    ipAddress,
    userAgent,
    expiresAt,
    isActive: true,
  };
  memorySessions.set(tokenHash, session);
  return session;
};

const revokeAllSessionsForUser = async (userId) => {
  if (isDbConnected()) {
    const result = await UserSession.updateMany(
      { userId: String(userId), isActive: true },
      { $set: { isActive: false, revokedAt: new Date() } }
    );
    return result.modifiedCount;
  }

  let count = 0;
  for (const session of memorySessions.values()) {
    if (session.userId === String(userId) && session.isActive) {
      session.isActive = false;
      session.revokedAt = new Date();
      count++;
    }
  }
  return count;
};

const revokeSessionByRefreshToken = async (refreshToken) => {
  const tokenHash = hashRefreshToken(refreshToken);

  if (isDbConnected()) {
    return UserSession.findOneAndUpdate(
      { refreshTokenHash: tokenHash, isActive: true },
      { $set: { isActive: false, revokedAt: new Date() } },
      { new: true }
    );
  }

  const session = memorySessions.get(tokenHash);
  if (session && session.isActive) {
    session.isActive = false;
    session.revokedAt = new Date();
    return session;
  }
  return null;
};

const findActiveSessionByRefreshToken = async (refreshToken) => {
  const tokenHash = hashRefreshToken(refreshToken);

  if (isDbConnected()) {
    return UserSession.findOne({
      refreshTokenHash: tokenHash,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });
  }

  const session = memorySessions.get(tokenHash);
  if (session && session.isActive && new Date(session.expiresAt) > new Date()) {
    return session;
  }
  return null;
};

module.exports = {
  createSessionRecord,
  revokeAllSessionsForUser,
  revokeSessionByRefreshToken,
  findActiveSessionByRefreshToken,
};
