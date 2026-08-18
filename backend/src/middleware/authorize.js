const { getEffectivePermissions } = require("../modules/auth/rolePermissions");
const { Team } = require("../modules/teams/team.model");
const mongoose = require("mongoose");

const TEAM_DIRECTORY_ROLES = ["SUPER_ADMIN", "ADMIN", "ORGANIZATION_ADMIN", "MANAGER", "LEAD"];

const deny = (next) => {
  const error = new Error("Permission denied.");
  error.code = "PERMISSION_DENIED";
  error.statusCode = 403;
  return next(error);
};

const authorize = (requiredPermission) => (req, res, next) => {
  if (!requiredPermission) return next();

  // Only the platform-level Super Admin bypasses individual checks. Every
  // other role, including Organization Admin, is governed by its grants.
  if (String(req.user?.role || "").toUpperCase() === "SUPER_ADMIN") return next();

  // Keep authorization aligned with the project role policy even for existing
  // manager/admin accounts that were created before permissions were stored.
  const permissions = getEffectivePermissions(req.user);

  const role = String(req.user?.role || "").toUpperCase();
  const teamWritePermissions = ["TEAM_CREATE", "TEAM_UPDATE", "TEAM_MANAGE_MEMBERS", "TEAM_DELETE"];
  if (teamWritePermissions.includes(requiredPermission) && !["ADMIN", "ORGANIZATION_ADMIN", "MANAGER", "LEAD"].includes(role)) {
    const error = new Error("Permission denied.");
    error.code = "PERMISSION_DENIED";
    error.statusCode = 403;
    return next(error);
  }

  if (!permissions.includes(requiredPermission)) {
    const error = new Error("Permission denied.");
    error.code = "PERMISSION_DENIED";
    error.statusCode = 403;
    return next(error);
  }

  return next();
};

// Team module access is intentionally distinct from team-management actions.
// A normal user can view only teams they belong to, while privileged team
// roles retain directory-wide access. Create/update/delete remain protected by
// the regular action-level checks above.
const authorizeTeamView = async (req, res, next) => {
  const role = String(req.user?.role || "").toUpperCase();
  const permissions = getEffectivePermissions(req.user);
  if (TEAM_DIRECTORY_ROLES.includes(role) || permissions.includes("TEAM_VIEW")) {
    return next();
  }

  const userId = String(req.user?.id || "");
  if (!userId || !mongoose.connection || mongoose.connection.readyState !== 1) {
    return deny(next);
  }

  const membershipFilter = {
    isDeleted: false,
    $or: [
      { leadId: userId },
      { members: { $elemMatch: { userId, status: "ACTIVE", isDeleted: false } } },
    ],
  };

  if (req.params.teamId) {
    if (!mongoose.Types.ObjectId.isValid(req.params.teamId)) {
      return deny(next);
    }
    membershipFilter._id = new mongoose.Types.ObjectId(req.params.teamId);
  }

  try {
    const canView = await Team.exists(membershipFilter);
    return canView ? next() : deny(next);
  } catch (error) {
    return next(error);
  }
};

module.exports = authorize;
module.exports.authorizeTeamView = authorizeTeamView;
