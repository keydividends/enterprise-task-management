const bcrypt = require("bcryptjs");
const userRepository = require("./user.repository");
const { toUserDTO, toUserListDTO } = require("./user.mapper");
const {
  validateCreateUser,
  validateUpdateUser,
  validateStatusUpdate,
  validateProfileUpdate,
  validateListQuery,
  createValidationError,
} = require("./user.validation");

const createUserError = (code, message, statusCode = 400) => {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
};

const hashPassword = async (password) => bcrypt.hash(String(password), 10);

const getUsers = async (query = {}) => {
  const validatedQuery = validateListQuery(query);
  const { items, totalItems, page, pageSize, totalPages } = await userRepository.findAll(validatedQuery);

  return {
    data: toUserListDTO(items),
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
    },
  };
};

const getUserById = async (userId) => {
  if (!userId) {
    throw createUserError("INVALID_IDENTIFIER", "User ID is required.");
  }

  const user = await userRepository.findById(userId);
  if (!user) {
    throw createUserError("USER_NOT_FOUND", "User not found.", 404);
  }

  return toUserDTO(user);
};

const createUser = async (data = {}, currentUser = null) => {
  // Allow Admins and Managers to create employees
  if (currentUser && currentUser.role !== "ADMIN" && currentUser.role !== "MANAGER" && !currentUser.permissions?.includes("USER_CREATE")) {
    throw createUserError("FORBIDDEN", "Only Administrators and Managers are allowed to create employees.", 403);
  }

  validateCreateUser(data);

  const existing = await userRepository.findByEmail(data.email);
  if (existing) {
    throw createUserError("USER_EMAIL_ALREADY_EXISTS", "A user with this email address already exists.", 409);
  }

  const passwordHash = data.password
    ? await hashPassword(data.password)
    : await hashPassword("User@123");

  const createdUser = await userRepository.createUser({
    firstName: String(data.firstName).trim(),
    lastName: data.lastName ? String(data.lastName).trim() : "",
    email: String(data.email).trim().toLowerCase(),
    passwordHash,
    mobile: data.mobile || "",
    department: data.department || "",
    title: data.title || "",
    bio: data.bio || "",
    customId: data.customId ? String(data.customId).trim() : null,
    managerCustomId: data.managerCustomId ? String(data.managerCustomId).trim() : "",
    role: data.role || "USER",
    roleId: data.roleId || null,
    permissions: data.permissions || ["USER_VIEW", "PROJECT_VIEW", "TASK_VIEW"],
    status: data.status || "ACTIVE",
  });

  return toUserDTO(createdUser);
};

const updateUser = async (userId, updateData = {}, currentUser = null) => {
  if (!userId) {
    throw createUserError("INVALID_IDENTIFIER", "User ID is required.");
  }

  // Restrict editing employee profiles strictly to Admins and Managers (unless self-updating)
  if (currentUser && String(currentUser.id) !== String(userId)) {
    const isAllowed = currentUser.role === "ADMIN" || currentUser.role === "MANAGER" || currentUser.permissions?.includes("USER_UPDATE");
    if (!isAllowed) {
      throw createUserError("FORBIDDEN", "Only Administrators and Managers are permitted to edit employee profiles.", 403);
    }
  }

  validateUpdateUser(updateData);

  const existingUser = await userRepository.findById(userId);
  if (!existingUser) {
    throw createUserError("USER_NOT_FOUND", "User not found.", 404);
  }

  if (updateData.email && updateData.email.toLowerCase() !== existingUser.email.toLowerCase()) {
    const emailCheck = await userRepository.findByEmail(updateData.email);
    if (emailCheck && String(emailCheck.id || emailCheck._id) !== String(userId)) {
      throw createUserError("USER_EMAIL_ALREADY_EXISTS", "A user with this email address already exists.", 409);
    }
  }

  const updatedUser = await userRepository.updateUser(userId, updateData);
  return toUserDTO(updatedUser);
};

const updateUserStatus = async (userId, status, currentUser = null) => {
  if (!userId) {
    throw createUserError("INVALID_IDENTIFIER", "User ID is required.");
  }

  validateStatusUpdate(status);

  const existingUser = await userRepository.findById(userId);
  if (!existingUser) {
    throw createUserError("USER_NOT_FOUND", "User not found.", 404);
  }

  if (existingUser.role === "ADMIN" && (status === "DISABLED" || status === "DELETED")) {
    if (currentUser && String(currentUser.id) === String(userId)) {
      throw createUserError("PROTECTED_USER", "You cannot deactivate or delete your own admin account.", 403);
    }
  }

  const updatedUser = await userRepository.updateUserStatus(userId, status);
  return toUserDTO(updatedUser);
};

const deactivateUser = async (userId, currentUser = null) => {
  return updateUserStatus(userId, "DISABLED", currentUser);
};

const activateUser = async (userId, currentUser = null) => {
  return updateUserStatus(userId, "ACTIVE", currentUser);
};

const deleteUser = async (userId, currentUser = null) => {
  if (!userId) {
    throw createUserError("INVALID_IDENTIFIER", "User ID is required.");
  }

  const existingUser = await userRepository.findById(userId);
  if (!existingUser) {
    throw createUserError("USER_NOT_FOUND", "User not found.", 404);
  }

  if (existingUser.role === "ADMIN") {
    throw createUserError("PROTECTED_USER", "System administrator accounts cannot be deleted.", 403);
  }

  if (currentUser && String(currentUser.id) === String(userId)) {
    throw createUserError("PROTECTED_USER", "You cannot delete your own logged-in account.", 403);
  }

  const deletedUser = await userRepository.softDeleteUser(userId);
  return toUserDTO(deletedUser);
};

const restoreUser = async (userId, currentUser = null) => {
  if (!userId) {
    throw createUserError("INVALID_IDENTIFIER", "User ID is required.");
  }

  const restoredUser = await userRepository.restoreUser(userId);
  if (!restoredUser) {
    throw createUserError("USER_NOT_FOUND", "User not found.", 404);
  }

  return toUserDTO(restoredUser);
};

const getUserByCustomId = async (customId) => {
  if (!customId) throw createUserError("INVALID_IDENTIFIER", "Custom ID is required.");
  const user = await userRepository.findByCustomId(customId);
  if (!user) throw createUserError("USER_NOT_FOUND", "User not found.", 404);
  return toUserDTO(user);
};

const getUserProfile = async (userId, currentUser = null) => {
  const targetId = userId === "me" ? currentUser?.id : userId;
  return getUserById(targetId);
};

const updateMyProfile = async (currentUser, profileData = {}) => {
  if (!currentUser || !currentUser.id) {
    throw createUserError("AUTH_REQUIRED", "Authentication required.", 401);
  }

  validateProfileUpdate(profileData);
  return updateUser(currentUser.id, profileData, currentUser);
};

const uploadAvatar = async (currentUser, avatarUrl) => {
  if (!currentUser || !currentUser.id) {
    throw createUserError("AUTH_REQUIRED", "Authentication required.", 401);
  }

  const updated = await userRepository.updateUser(currentUser.id, { avatarUrl });
  return toUserDTO(updated);
};

const removeAvatar = async (currentUser) => {
  if (!currentUser || !currentUser.id) {
    throw createUserError("AUTH_REQUIRED", "Authentication required.", 401);
  }

  const updated = await userRepository.updateUser(currentUser.id, { avatarUrl: "" });
  return toUserDTO(updated);
};

const searchUsers = async (query = "", limit = 10) => {
  const list = await userRepository.searchUsers(query, limit);
  return toUserListDTO(list);
};

const getUserProjects = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw createUserError("USER_NOT_FOUND", "User not found.", 404);
  }
  return userRepository.getUserProjects(userId);
};

const getUserTeams = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw createUserError("USER_NOT_FOUND", "User not found.", 404);
  }
  return userRepository.getUserTeams(userId);
};

const getUserWorkload = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw createUserError("USER_NOT_FOUND", "User not found.", 404);
  }
  return userRepository.getUserWorkload(userId);
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  deactivateUser,
  activateUser,
  deleteUser,
  restoreUser,
  getUserProfile,
  updateMyProfile,
  uploadAvatar,
  removeAvatar,
  searchUsers,
  getUserProjects,
  getUserTeams,
  getUserWorkload,
  getUserByCustomId,
};
