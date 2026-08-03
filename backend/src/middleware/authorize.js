const authorize = (requiredPermission) => (req, res, next) => {
  const permissions = Array.isArray(req.user?.permissions) ? req.user.permissions : [];

  if (!requiredPermission) {
    return next();
  }

  if (!permissions.includes(requiredPermission)) {
    const error = new Error("Permission denied.");
    error.code = "PERMISSION_DENIED";
    error.statusCode = 403;
    return next(error);
  }

  return next();
};

module.exports = authorize;
