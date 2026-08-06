const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy-google-client-id');

const {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
} = require("../../config/env");
const {
  findUserByEmail,
  createUser,
  findUserById,
  updateUserPassword,
  storeResetToken,
  findResetTokenByToken,
  markResetTokenAsUsed,
  invalidateAllResetTokensForUser,
} = require("./auth.repository");
const { mapUser } = require("./auth.mapper");
const {
  validateLoginInput,
  validateRegisterInput,
  validateForgotPasswordInput,
  validateResetPasswordInput,
} = require("./auth.validation");
const {
  revokeAllSessionsForUser,
  createSessionRecord,
  revokeSessionByRefreshToken,
  findActiveSessionByRefreshToken,
} = require("./auth.session");
const { sendPasswordResetEmail } = require("../../utils/mail");

const hashPassword = async (password) => bcrypt.hash(String(password), 10);

const createAuthError = (code, message, statusCode = 401) => {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
};

const createTokenPair = (user) => {
  const userId = user.id || user._id;
  const accessToken = jwt.sign(
    {
      sub: userId,
      id: userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: user.permissions,
      workspaceId: user.workspaceId || "64a000000000000000000001",
      status: user.status,
      type: "access",
    },
    JWT_ACCESS_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    {
      sub: userId,
      id: userId,
      email: user.email,
      type: "refresh",
    },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );

  createSessionRecord({
    userId,
    refreshToken,
    deviceName: "Unknown device",
    ipAddress: null,
    userAgent: null,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  }).catch(() => {});

  return { accessToken, refreshToken };
};

const verifyAccessToken = (token) => {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    throw createAuthError("AUTH_INVALID_TOKEN", "Access token is invalid.", 401);
  }

  try {
    const payload = jwt.verify(token, JWT_ACCESS_SECRET);

    if (payload.type && payload.type !== "access") {
      throw createAuthError("AUTH_INVALID_TOKEN", "Access token is invalid.", 401);
    }

    return payload;
  } catch (error) {
    if (error.code === "AUTH_INVALID_TOKEN") {
      throw error;
    }

    if (error.name === "TokenExpiredError") {
      throw createAuthError("AUTH_TOKEN_EXPIRED", "Access token expired.", 401);
    }

    throw createAuthError("AUTH_INVALID_TOKEN", "Access token is invalid.", 401);
  }
};

const verifyRefreshToken = (token) => {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    throw createAuthError("AUTH_INVALID_TOKEN", "Refresh token is invalid.", 401);
  }

  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET);

    if (payload.type && payload.type !== "refresh") {
      throw createAuthError("AUTH_INVALID_TOKEN", "Refresh token is invalid.", 401);
    }

    return payload;
  } catch (error) {
    if (error.code === "AUTH_INVALID_TOKEN") {
      throw error;
    }

    if (error.name === "TokenExpiredError") {
      throw createAuthError("AUTH_TOKEN_EXPIRED", "Refresh token expired.", 401);
    }

    throw createAuthError("AUTH_INVALID_TOKEN", "Refresh token is invalid.", 401);
  }
};

const registerUser = async ({ firstName, lastName, email, password, confirmPassword }) => {
  validateRegisterInput({ firstName, lastName, email, password, confirmPassword });

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw createAuthError("USER_ALREADY_EXISTS", "A user with this email already exists.", 409);
  }

  const createdUser = await createUser({
    firstName,
    lastName,
    email,
    passwordHash: await hashPassword(password),
    role: "USER",
    permissions: [
      "USER_VIEW",
      "PROJECT_VIEW", "PROJECT_CREATE", "PROJECT_UPDATE",
      "TASK_VIEW", "TASK_CREATE", "TASK_UPDATE",
      "TEAM_VIEW",
    ],
  });

  const tokens = createTokenPair(createdUser);
  await createSessionRecord({
    userId: createdUser.id,
    refreshToken: tokens.refreshToken,
    deviceName: "Unknown device",
    ipAddress: null,
    userAgent: null,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: mapUser(createdUser),
  };
};

const loginUser = async ({ email, password }) => {
  validateLoginInput({ email, password });

  const user = await findUserByEmail(email);

  if (!user) {
    throw createAuthError("AUTH_INVALID_CREDENTIALS", "Invalid email or password.", 401);
  }

  if (user.status !== "ACTIVE") {
    throw createAuthError("USER_INACTIVE", "User account is inactive.", 401);
  }

  const isPasswordValid = await bcrypt.compare(String(password), user.passwordHash);

  if (!isPasswordValid) {
    throw createAuthError("AUTH_INVALID_CREDENTIALS", "Invalid email or password.", 401);
  }

  const tokens = createTokenPair(user);
  await createSessionRecord({
    userId: user.id,
    refreshToken: tokens.refreshToken,
    deviceName: "Unknown device",
    ipAddress: null,
    userAgent: null,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: mapUser(user),
  };
};

const forgotPassword = async ({ email }) => {
  validateForgotPasswordInput({ email });

  const user = await findUserByEmail(email);

  if (user && user.status === "ACTIVE") {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 15 * 60 * 1000;

    await storeResetToken(token, {
      userId: user.id || user._id,
      expiresAt,
    });

    try {
      await sendPasswordResetEmail({
        to: user.email,
        firstName: user.firstName,
        token,
      });
    } catch (error) {
      console.error(`Failed to send password reset email to ${user.email}:`, error);
    }
  }

  return {
    message: "If the account exists, reset instructions have been sent",
  };
};

const resetPassword = async ({ token, newPassword, confirmPassword }) => {
  validateResetPasswordInput({ token, newPassword, confirmPassword });

  const resetTokenRecord = await findResetTokenByToken(token);

  if (!resetTokenRecord || resetTokenRecord.used || Number(resetTokenRecord.expiresAt) <= Date.now()) {
    throw createAuthError("RESET_TOKEN_INVALID", "Reset token is invalid or expired.", 400);
  }

  const user = await findUserById(resetTokenRecord.userId);

  if (!user || user.status !== "ACTIVE") {
    throw createAuthError("RESET_TOKEN_INVALID", "Reset token is invalid or expired.", 400);
  }

  const consumedToken = await markResetTokenAsUsed(token);
  if (!consumedToken) {
    throw createAuthError("RESET_TOKEN_INVALID", "Reset token is invalid or expired.", 400);
  }

  const hashedPassword = await hashPassword(newPassword);
  await updateUserPassword(user.id || user._id, hashedPassword);
  await revokeAllSessionsForUser(user.id || user._id);
  await invalidateAllResetTokensForUser(user.id || user._id);

  return {
    message: "Password reset successfully",
  };
};

const getCurrentUser = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    throw createAuthError("USER_NOT_FOUND", "User not found.", 404);
  }

  return mapUser(user);
};

const logoutUser = async ({ refreshToken } = {}) => {
  if (refreshToken) {
    await revokeSessionByRefreshToken(refreshToken);
  }

  return { message: "Logged out successfully" };
};

const getUserPermissions = async (userId) => {
  if (!userId) {
    throw createAuthError("AUTH_REQUIRED", "User context is required.", 401);
  }

  const user = await findUserById(userId);

  if (!user) {
    throw createAuthError("USER_NOT_FOUND", "User not found.", 404);
  }

  return Array.isArray(user.permissions) ? user.permissions : [];
};

const refreshAccessToken = async ({ refreshToken }) => {
  if (!refreshToken || !String(refreshToken).trim()) {
    throw createAuthError("AUTH_INVALID_TOKEN", "Refresh token is required.", 401);
  }

  const payload = verifyRefreshToken(refreshToken);
  const user = await findUserById(payload.id);

  if (!user) {
    throw createAuthError("USER_NOT_FOUND", "User not found.", 404);
  }

  if (user.status !== "ACTIVE") {
    throw createAuthError("USER_INACTIVE", "User account is inactive.", 401);
  }

  const activeSession = await findActiveSessionByRefreshToken(refreshToken);

  if (!activeSession || activeSession.userId !== String(user.id)) {
    throw createAuthError("AUTH_INVALID_TOKEN", "Refresh token is invalid.", 401);
  }

  await revokeSessionByRefreshToken(refreshToken);
  const tokens = createTokenPair(user);
  await createSessionRecord({
    userId: user.id,
    refreshToken: tokens.refreshToken,
    deviceName: activeSession.deviceName,
    ipAddress: activeSession.ipAddress,
    userAgent: activeSession.userAgent,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return tokens;
};

const logoutAllSessions = async ({ userId, refreshToken }) => {
  if (!userId) {
    throw createAuthError("AUTH_REQUIRED", "User context is required.", 401);
  }

  if (refreshToken && typeof refreshToken === "string") {
    try {
      verifyRefreshToken(refreshToken);
    } catch (error) {
      throw createAuthError("AUTH_INVALID_TOKEN", "Refresh token is invalid.", 401);
    }
  }

  await revokeAllSessionsForUser(userId);

  return {
    message: "All sessions revoked",
  };
};

const googleLogin = async ({ credential, accessToken }) => {
  if (!credential && !accessToken) {
    throw createAuthError("AUTH_INVALID_TOKEN", "Google credential or access token is required.", 401);
  }

  let email, given_name, family_name, googleId;

  try {
    if (credential) {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID || 'dummy-google-client-id',
      });
      const payload = ticket.getPayload();
      email = payload.email;
      given_name = payload.given_name;
      family_name = payload.family_name;
      googleId = payload.sub;
    } else if (accessToken) {
      const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      email = response.data.email;
      given_name = response.data.given_name;
      family_name = response.data.family_name;
      googleId = response.data.sub;
    }
  } catch (err) {
    throw createAuthError("AUTH_INVALID_TOKEN", "Invalid Google credential.", 401);
  }

  if (!email) {
    throw createAuthError("AUTH_INVALID_TOKEN", "Could not retrieve email from Google.", 401);
  }

  let user = await findUserByEmail(email);

  if (!user) {
    user = await createUser({
      firstName: given_name || "Google",
      lastName: family_name || "User",
      email: email,
      googleId: googleId,
      role: "USER",
      permissions: ["USER_VIEW", "PROJECT_VIEW", "TASK_VIEW"],
    });
  } else if (!user.googleId) {
    if (typeof user.save === 'function') {
      user.googleId = googleId;
      await user.save();
    }
  }

  if (user.status !== "ACTIVE") {
    throw createAuthError("USER_INACTIVE", "User account is inactive.", 401);
  }

  const tokens = createTokenPair(user);
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: mapUser(user),
  };
};

const microsoftLogin = async ({ accessToken }) => {
  if (!accessToken) {
    throw createAuthError("AUTH_INVALID_TOKEN", "Microsoft access token is required.", 401);
  }

  let profile;
  try {
    const response = await axios.get("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    profile = response.data;
  } catch (err) {
    throw createAuthError("AUTH_INVALID_TOKEN", "Invalid Microsoft access token.", 401);
  }

  const email = profile.mail || profile.userPrincipalName;
  if (!email) {
    throw createAuthError("AUTH_INVALID_TOKEN", "Could not retrieve email from Microsoft.", 401);
  }

  const microsoftId = profile.id;
  let user = await findUserByEmail(email);

  if (!user) {
    user = await createUser({
      firstName: profile.givenName || "Microsoft",
      lastName: profile.surname || "User",
      email: email,
      microsoftId: microsoftId,
      role: "USER",
      permissions: ["USER_VIEW", "PROJECT_VIEW", "TASK_VIEW"],
    });
  } else if (!user.microsoftId) {
    if (typeof user.save === 'function') {
      user.microsoftId = microsoftId;
      await user.save();
    }
  }

  if (user.status !== "ACTIVE") {
    throw createAuthError("USER_INACTIVE", "User account is inactive.", 401);
  }

  const tokens = createTokenPair(user);
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: mapUser(user),
  };
};

module.exports = {
  createAuthError,
  createTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  getUserPermissions,
  logoutUser,
  refreshAccessToken,
  logoutAllSessions,
  googleLogin,
  microsoftLogin,
};
