const { getEffectivePermissions } = require("./rolePermissions");

const mapUser = (user) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  employeeId: user.employeeId || "",
  role: user.role,
  permissions: getEffectivePermissions(user),
  status: user.status,
  fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
});

module.exports = {
  mapUser,
};
