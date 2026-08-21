const toUserDTO = (user) => {
  if (!user) return null;

  const plain = typeof user.toObject === "function" ? user.toObject() : { ...user };

  const id = plain.id || (plain._id ? String(plain._id) : null);
  const { passwordHash, resetTokenHash, __v, _id, ...rest } = plain;

  // Keep a display fallback for records that have not yet been migrated. The
  // migration script persists legacy values as employeeId; this fallback is
  // never written back to the database automatically.
  const fallbackEmployeeId = rest.email
    ? `EMP-${rest.email.split('@')[0]}`
    : `EMP-${id ? String(id).slice(-4) : '001'}`;

  const employeeId = rest.employeeId || fallbackEmployeeId;

  return {
    id,
    ...rest,
    employeeId,
    managerEmployeeId: rest.managerEmployeeId || "",
    companyId: rest.companyId ? String(rest.companyId) : null,
    companyName: rest.companyName || "",
    fullName: `${rest.firstName || ""} ${rest.lastName || ""}`.trim(),
  };
};

const toUserListDTO = (users = []) => users.map(toUserDTO).filter(Boolean);

module.exports = {
  toUserDTO,
  toUserListDTO,
};
