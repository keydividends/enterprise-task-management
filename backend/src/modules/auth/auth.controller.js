const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  getUserPermissions,
  logoutUser,
  refreshAccessToken,
  logoutAllSessions,
} = require("./auth.service");

const sendSuccess = (res, statusCode, payload) => {
  res.status(statusCode).json(payload);
};

const register = async (req, res, next) => {
  try {
    const result = await registerUser(req.body);
    sendSuccess(res, 201, {
      success: true,
      message: "Registration successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);
    sendSuccess(res, 200, {
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.user.id);
    sendSuccess(res, 200, {
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const getPermissions = async (req, res, next) => {
  try {
    const permissions = await getUserPermissions(req.user.id);
    sendSuccess(res, 200, {
      success: true,
      data: permissions,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const result = await logoutUser({
      refreshToken: req.headers["x-refresh-token"] || null,
    });
    sendSuccess(res, 200, {
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const logoutAll = async (req, res, next) => {
  try {
    const result = await logoutAllSessions({
      userId: req.user.id,
      refreshToken: req.headers["x-refresh-token"] || null,
    });

    sendSuccess(res, 200, {
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const requestPasswordReset = async (req, res, next) => {
  try {
    const result = await forgotPassword(req.body);
    sendSuccess(res, 200, {
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const resetPasswordHandler = async (req, res, next) => {
  try {
    const result = await resetPassword(req.body);
    sendSuccess(res, 200, {
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const result = await refreshAccessToken(req.body);
    sendSuccess(res, 200, {
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  getPermissions,
  logout,
  logoutAll,
  requestPasswordReset,
  resetPassword: resetPasswordHandler,
  refresh,
};
