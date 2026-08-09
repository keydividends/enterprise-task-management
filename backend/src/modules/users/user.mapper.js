const toUserDTO = (user) => {
  if (!user) return null;

  const plain = typeof user.toObject === "function" ? user.toObject() : { ...user };

  const id = plain.id || (plain._id ? String(plain._id) : null);
  const { passwordHash, resetTokenHash, __v, _id, ...rest } = plain;

  // Fallback custom ID generation for users created before customId field existed
  const fallbackCustomId = rest.email
    ? `EMP-${rest.email.split('@')[0]}`
    : `EMP-${id ? String(id).slice(-4) : '001'}`;

  const customId = rest.customId || fallbackCustomId;

  return {
    id,
    ...rest,
    customId,
    user_id: customId,
    fullName: `${rest.firstName || ""} ${rest.lastName || ""}`.trim(),
  };
};

const toUserListDTO = (users = []) => users.map(toUserDTO).filter(Boolean);

module.exports = {
  toUserDTO,
  toUserListDTO,
};
