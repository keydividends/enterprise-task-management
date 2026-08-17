const { getEffectivePermissions } = require("../modules/auth/rolePermissions");

const authorize = (requiredPermission) => (req, res, next) => {
  if (!requiredPermission) return next();

  // Only the platform-level Super Admin bypasses individual checks. Every
  // other role, including Organization Admin, is governed by its grants.
  if (String(req.user?.role || "").toUpperCase() === "SUPER_ADMIN") return next();

  // Keep authorization aligned with the project role policy even for existing
  // manager/admin accounts that were created before permissions were stored.
  const permissions = getEffectivePermissions(req.user);

  if (!permissions.includes(requiredPermission)) {
    const error = new Error("Permission denied.");
    error.code = "PERMISSION_DENIED";
    error.statusCode = 403;
    return next(error);
  }

  return next();
};

module.exports = authorize;
