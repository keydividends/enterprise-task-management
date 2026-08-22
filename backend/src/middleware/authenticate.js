const { verifyAccessToken } = require("../modules/auth/auth.service");
const { getEffectivePermissions } = require("../modules/auth/rolePermissions");
const { User } = require("../modules/users/user.model");
const { isGlobalCompanyRole } = require("../utils/companyScope");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : null;

    if (!token) {
      const error = new Error("Authentication required.");
      error.code = "AUTH_REQUIRED";
      error.statusCode = 401;
      return next(error);
    }

    // Verify JWT
    const payload = verifyAccessToken(token);

    const userId = payload.id || payload.sub;

    if (!userId) {
      const error = new Error("Invalid authentication token.");
      error.code = "AUTH_INVALID_TOKEN";
      error.statusCode = 401;
      return next(error);
    }

    // Always get the current user from MongoDB.
    const user = await User.findOne({
      _id: userId,
      isDeleted: false,
    }).lean();

    if (!user) {
      const error = new Error("Authenticated user not found.");
      error.code = "AUTH_USER_NOT_FOUND";
      error.statusCode = 401;
      return next(error);
    }

    // Optional: prevent inactive users from accessing the system.
    if (user.status !== "ACTIVE") {
      const error = new Error("Your account is not active.");
      error.code = "AUTH_USER_INACTIVE";
      error.statusCode = 403;
      return next(error);
    }

    const isGlobalRole = isGlobalCompanyRole(user);

    /*
     * Normal users always belong to their own company.
     *
     * Global users, such as SUPER_ADMIN, may optionally
     * operate within a company selected through x-company-id.
     */
    const requestedCompanyId =
      String(req.headers["x-company-id"] || "").trim() || null;

    const companyId = isGlobalRole
      ? requestedCompanyId
      : user.companyId
        ? String(user.companyId)
        : null;

    req.user = {
      id: String(user._id),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: getEffectivePermissions(user),

      // Real company context
      companyId,

      companyName: user.companyName || "",
      status: user.status,
    };

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      error.code = "AUTH_TOKEN_EXPIRED";
      error.statusCode = 401;
    } else if (error.name === "JsonWebTokenError") {
      error.code = "AUTH_INVALID_TOKEN";
      error.statusCode = 401;
    }

    return next(error);
  }
};

module.exports = authenticate;