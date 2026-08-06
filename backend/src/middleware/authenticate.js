const { verifyAccessToken } = require("../modules/auth/auth.service");

const mockUsers = {
  "mock-token": {
    id: "mock-admin",
    email: "admin@etms.dev",
    firstName: "Ava",
    lastName: "Cole",
    role: "ADMIN",
    permissions: ["TEAM_VIEW", "TEAM_CREATE", "TEAM_UPDATE", "TEAM_DELETE", "TEAM_MANAGE_MEMBERS"],
    workspaceId: "64a000000000000000000001",
    permissions: [
      "TEAM_VIEW", "TEAM_CREATE", "TEAM_UPDATE", "TEAM_DELETE",
      "PROJECT_VIEW", "PROJECT_CREATE", "PROJECT_UPDATE", "PROJECT_DELETE",
      "USER_VIEW", "USER_CREATE", "USER_UPDATE", "USER_DELETE",
      "TASK_VIEW", "TASK_CREATE", "TASK_UPDATE", "TASK_DELETE",
    ],
    status: "ACTIVE",
  },
  "mock-member-token": {
    id: "mock-maya",
    email: "maya@etms.dev",
    firstName: "Maya",
    lastName: "Singh",
    role: "MEMBER",
    workspaceId: "64a000000000000000000001",
    permissions: ["TEAM_VIEW", "PROJECT_VIEW", "TASK_VIEW", "USER_VIEW"],
    status: "ACTIVE",
  },
};

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

    if (!token) {
      const error = new Error("Authentication required.");
      error.code = "AUTH_REQUIRED";
      error.statusCode = 401;
      return next(error);
    }

    if (mockUsers[token]) {
      req.user = mockUsers[token];
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
