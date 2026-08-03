const crypto = require("node:crypto");
const { UserSession } = require("./auth.model");

const hashRefreshToken = (token) => crypto.createHash("sha256").update(String(token)).digest("hex");

const createSessionRecord = async ({ userId, refreshToken, deviceName, ipAddress, userAgent, expiresAt }) => UserSession.create({
    userId: String(userId),
    refreshTokenHash: hashRefreshToken(refreshToken),
    deviceName,
    ipAddress,
    userAgent,
    expiresAt,
  });

const revokeAllSessionsForUser = async (userId) => {
  const result = await UserSession.updateMany(
    { userId: String(userId), isActive: true },
    { $set: { isActive: false, revokedAt: new Date() } }
  );
  return result.modifiedCount;
};

const revokeSessionByRefreshToken = async (refreshToken) => UserSession.findOneAndUpdate(
  { refreshTokenHash: hashRefreshToken(refreshToken), isActive: true },
  { $set: { isActive: false, revokedAt: new Date() } },
  { new: true }
);

const findActiveSessionByRefreshToken = async (refreshToken) => UserSession.findOne({
  refreshTokenHash: hashRefreshToken(refreshToken),
  isActive: true,
  expiresAt: { $gt: new Date() },
});

module.exports = {
  createSessionRecord,
  revokeAllSessionsForUser,
  revokeSessionByRefreshToken,
  findActiveSessionByRefreshToken,
};
