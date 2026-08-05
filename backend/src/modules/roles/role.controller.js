const service = require("./role.service");
const validation = require("./role.validation");

const sendSuccess = (res, statusCode, payload) => {
  res.status(statusCode).json(payload);
};

// Role Controllers
const createRole = async (req, res, next) => {
  try {
    const { error, value } = validation.validateCreateRole(req.body);
    if (error) {
      const validationError = new Error(error.details[0].message);
      validationError.code = "VALIDATION_ERROR";
      validationError.statusCode = 400;
      validationError.details = error.details;
      return next(validationError);
    }

    const newRole = await service.createRole(value);
    sendSuccess(res, 201, {
      success: true,
      message: "Role created successfully",
      data: newRole,
    });
  } catch (error) {
    next(error);
  }
};

const listRoles = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const search = req.query.search || "";
    const isActive =
      req.query.isActive === "true"
        ? true
        : req.query.isActive === "false"
          ? false
          : undefined;

    const result = await service.listRoles(page, pageSize, {
      search,
      isActive,
    });

    sendSuccess(res, 200, {
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getRoleById = async (req, res, next) => {
  try {
    const role = await service.getRoleById(req.params.roleId);
    sendSuccess(res, 200, {
      success: true,
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const { error, value } = validation.validateUpdateRole(req.body);
    if (error) {
      const validationError = new Error(error.details[0].message);
      validationError.code = "VALIDATION_ERROR";
      validationError.statusCode = 400;
      validationError.details = error.details;
      return next(validationError);
    }

    const updatedRole = await service.updateRole(req.params.roleId, value);
    sendSuccess(res, 200, {
      success: true,
      message: "Role updated successfully",
      data: updatedRole,
    });
  } catch (error) {
    next(error);
  }
};

const deleteRole = async (req, res, next) => {
  try {
    await service.deleteRole(req.params.roleId);
    sendSuccess(res, 200, {
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Permission Controllers
const listPermissions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 50;
    const search = req.query.search || "";
    const module = req.query.module || "";
    const isActive =
      req.query.isActive === "true"
        ? true
        : req.query.isActive === "false"
          ? false
          : undefined;

    const result = await service.listPermissions(page, pageSize, {
      search,
      module,
      isActive,
    });

    sendSuccess(res, 200, {
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getRolePermissions = async (req, res, next) => {
  try {
    const permissions = await service.getRolePermissions(req.params.roleId);
    sendSuccess(res, 200, {
      success: true,
      data: permissions,
    });
  } catch (error) {
    next(error);
  }
};

const updateRolePermissions = async (req, res, next) => {
  try {
    const { error, value } = validation.validateUpdateRolePermissions(
      req.body
    );
    if (error) {
      const validationError = new Error(error.details[0].message);
      validationError.code = "VALIDATION_ERROR";
      validationError.statusCode = 400;
      validationError.details = error.details;
      return next(validationError);
    }

    const result = await service.updateRolePermissions(
      req.params.roleId,
      value.permissionIds
    );
    sendSuccess(res, 200, {
      success: true,
      message: "Role permissions updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  // Role
  createRole,
  listRoles,
  getRoleById,
  updateRole,
  deleteRole,
  // Permission
  listPermissions,
  getRolePermissions,
  updateRolePermissions,
};
