const userService = require("./user.service");

const getUsers = async (req, res, next) => {
  try {
    const result = await userService.getUsers(req.query);
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.userId);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body, req.user);
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.userId, req.body, req.user);
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const status = req.body.status || req.body.action;
    const user = await userService.updateUserStatus(req.params.userId, status, req.user);
    res.status(200).json({
      success: true,
      message: `User status updated to ${user.status}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const deactivateUser = async (req, res, next) => {
  try {
    const user = await userService.deactivateUser(req.params.userId, req.user);
    res.status(200).json({
      success: true,
      message: "User deactivated",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const activateUser = async (req, res, next) => {
  try {
    const user = await userService.activateUser(req.params.userId, req.user);
    res.status(200).json({
      success: true,
      message: "User activated",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.userId, req.user);
    res.status(200).json({
      success: true,
      message: "User deleted",
    });
  } catch (error) {
    next(error);
  }
};

const restoreUser = async (req, res, next) => {
  try {
    const user = await userService.restoreUser(req.params.userId, req.user);
    res.status(200).json({
      success: true,
      message: "User restored",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserProfile(req.params.userId, req.user);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const getMyProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const user = await userService.updateMyProfile(req.user, req.body);
    res.status(200).json({
      success: true,
      message: "Profile updated",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const updateMyEmployeeId = async (req, res, next) => {
  try {
    const user = await userService.updateMyEmployeeId(req.user, req.body.employeeId);
    res.status(200).json({
      success: true,
      message: "Employee ID updated",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    const avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : (req.body.avatarUrl || "/uploads/users/avatar.jpg");
    const user = await userService.uploadAvatar(req.user, avatarUrl);
    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      data: { avatarUrl: user.avatarUrl },
    });
  } catch (error) {
    next(error);
  }
};

const removeAvatar = async (req, res, next) => {
  try {
    await userService.removeAvatar(req.user);
    res.status(200).json({
      success: true,
      message: "Avatar removed",
    });
  } catch (error) {
    next(error);
  }
};

const searchUsers = async (req, res, next) => {
  try {
    const query = req.query.q || req.query.query || "";
    const limit = parseInt(req.query.limit, 10) || 10;
    const users = await userService.searchUsers(query, limit);
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const getUserProjects = async (req, res, next) => {
  try {
    const projects = await userService.getUserProjects(req.params.userId);
    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

const getUserTeams = async (req, res, next) => {
  try {
    const teams = await userService.getUserTeams(req.params.userId);
    res.status(200).json({
      success: true,
      data: teams,
    });
  } catch (error) {
    next(error);
  }
};

const getUserWorkload = async (req, res, next) => {
  try {
    const workload = await userService.getUserWorkload(req.params.userId);
    res.status(200).json({
      success: true,
      data: workload,
    });
  } catch (error) {
    next(error);
  }
};

const getUserByEmployeeId = async (req, res, next) => {
  try {
    const user = await userService.getUserByEmployeeId(req.params.employeeId);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
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
  getMyProfile,
  updateMyProfile,
  updateMyEmployeeId,
  uploadAvatar,
  removeAvatar,
  searchUsers,
  getUserProjects,
  getUserTeams,
  getUserWorkload,
  getUserByEmployeeId,
};
