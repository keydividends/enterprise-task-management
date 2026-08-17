const authorize = (requiredPermission) => (req, res, next) => {
  if (!requiredPermission) return next();

  // Only the platform-level Super Admin bypasses individual checks. Every
  // other role, including Organization Admin, is governed by its grants.
  if (String(req.user?.role || "").toUpperCase() === "SUPER_ADMIN") return next();

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
