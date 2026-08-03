const { verifyAccessToken } = require("../modules/auth/auth.service");

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

    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.id || payload.sub,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: payload.role,
      permissions: payload.permissions || [],
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
