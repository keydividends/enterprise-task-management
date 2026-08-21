const { getEffectivePermissions } = require("./rolePermissions");

const mapUser = (user) => ({
  id: user.id || (user._id ? String(user._id) : null),
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  employeeId: user.employeeId || "",
  companyId: user.companyId ? String(user.companyId) : null,
  companyName: user.companyName || "",
  address: user.address || "",
  role: user.role,
  permissions: getEffectivePermissions(user),
  status: user.status,
  fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
});

module.exports = {
  mapUser,
};
