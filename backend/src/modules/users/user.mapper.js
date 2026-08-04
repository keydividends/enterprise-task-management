const toUserDTO = (user) => {
  if (!user) return null;

  const plain = typeof user.toObject === "function" ? user.toObject() : { ...user };

  const id = plain.id || (plain._id ? String(plain._id) : null);
  const { passwordHash, resetTokenHash, __v, _id, ...rest } = plain;

  return {
    id,
    ...rest,
    fullName: `${rest.firstName || ""} ${rest.lastName || ""}`.trim(),
  };
};

const toUserListDTO = (users = []) => users.map(toUserDTO).filter(Boolean);

module.exports = {
  toUserDTO,
  toUserListDTO,
};
