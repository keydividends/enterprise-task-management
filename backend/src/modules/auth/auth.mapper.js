const mapUser = (user) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  permissions: user.permissions || [],
  status: user.status,
  fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
});

module.exports = {
  mapUser,
};
