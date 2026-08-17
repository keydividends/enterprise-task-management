const { verifyAccessToken } = require("../modules/auth/auth.service");
const { User } = require("../modules/users/user.model");
const mongoose = require("mongoose");

// Cache resolved mock-token → real MongoDB user so we only query once per process.
const _mockUserCache = {};

// Resolve a mock token to a real MongoDB user by email.
// Falls back to the static profile if MongoDB is not yet connected.
const resolveMockUser = async (email, staticProfile) => {
  if (_mockUserCache[email]) return _mockUserCache[email];

  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      const dbUser = await User.findOne({ email, isDeleted: false }).lean();
      if (dbUser) {
        const resolved = {
          id: String(dbUser._id),
          email: dbUser.email,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
          role: dbUser.role,
          permissions: dbUser.permissions || [],
          workspaceId: staticProfile.workspaceId,
          status: dbUser.status,
        };
        _mockUserCache[email] = resolved;
        return resolved;
      }
    } catch (_) {
      // DB lookup failed — fall through to static profile
    }
  }

  return staticProfile;
};

// Static profiles used when MongoDB is unavailable (tests / cold start).
// Permissions are the full admin/member sets — IDs are placeholders until
// resolveMockUser() replaces them with real MongoDB _ids.
const MOCK_TOKEN_PROFILES = {
  "mock-token": {
    id: "mock-admin",
    email: "admin@etms.com",
    firstName: "Admin",
    lastName: "User",
    role: "ADMIN",
    workspaceId: "64a000000000000000000001",
    permissions: [
      "TEAM_VIEW", "TEAM_CREATE", "TEAM_UPDATE", "TEAM_DELETE", "TEAM_MANAGE_MEMBERS",
      "PROJECT_VIEW", "PROJECT_CREATE", "PROJECT_UPDATE", "PROJECT_DELETE", "PROJECT_MANAGE_MEMBERS",
      "USER_VIEW", "USER_CREATE", "USER_UPDATE", "USER_DELETE",
      "TASK_VIEW", "TASK_CREATE", "TASK_UPDATE", "TASK_DELETE", "TASK_ASSIGN",
      "SPRINT_VIEW", "SPRINT_CREATE", "SPRINT_UPDATE", "SPRINT_MANAGE",
      "DASHBOARD_VIEW", "REPORT_VIEW",
    ],
    status: "ACTIVE",
  },
  "mock-member-token": {
    id: "mock-demo",
    email: "demo@etms.com",
    firstName: "Demo",
    lastName: "User",
    role: "USER",
    workspaceId: "64a000000000000000000001",
    permissions: ["TEAM_VIEW", "PROJECT_VIEW", "TASK_VIEW", "USER_VIEW", "DASHBOARD_VIEW", "REPORT_VIEW"],
    status: "ACTIVE",
  },
};

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

    if (!token) {
      const error = new Error("Authentication required.");
      error.code = "AUTH_REQUIRED";
      error.statusCode = 401;
      return next(error);
    }

    const mockProfile = MOCK_TOKEN_PROFILES[token];
    if (mockProfile) {
      // Resolve to real MongoDB user so team member IDs match DB records.
      req.user = await resolveMockUser(mockProfile.email, mockProfile);
      return next();
    }

    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.id || payload.sub,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: payload.role,
      permissions: payload.permissions || [],
      workspaceId: payload.workspaceId || null,
      status: payload.status,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      error.code = "AUTH_TOKEN_EXPIRED";
      error.statusCode = 401;
    } else if (error.name === "JsonWebTokenError") {
      error.code = "AUTH_INVALID_TOKEN";
      error.statusCode = 401;
    }

    next(error);
  }
};

module.exports = authenticate;
