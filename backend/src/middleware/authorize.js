const authorize = (requiredPermission) => (req, res, next) => {
  if (!requiredPermission) return next();

  // ADMIN role bypasses all permission checks
  if (req.user?.role === "ADMIN") return next();

  const permissions = Array.isArray(req.user?.permissions) ? req.user.permissions : [];

  if (!permissions.includes(requiredPermission)) {
    const error = new Error("Permission denied.");
    error.code = "PERMISSION_DENIED";
    error.statusCode = 403;
    return next(error);
  }

  return next();
};

module.exports = authorize;
