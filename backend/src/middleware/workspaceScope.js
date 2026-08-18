const workspaceScope = (req, res, next) => {
  if (req.user?.workspaceId) return next();
  const error = new Error("Workspace access is required.");
  error.code = "WORKSPACE_ACCESS_DENIED";
  error.statusCode = 403;
  return next(error);
};

module.exports = workspaceScope;