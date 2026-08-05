const repository = require("./role.repository");

// Role Service
const createRole = async (roleData) => {
  // Check if role already exists
  const existingRole = await repository.getRoleByName(roleData.name);
  if (existingRole) {
    const error = new Error("Role with this name already exists");
    error.code = "ROLE_NAME_ALREADY_EXISTS";
    error.statusCode = 409;
    throw error;
  }

  const newRole = await repository.createRole({
    name: roleData.name,
    description: roleData.description || "",
    isSystem: false,
    isActive: true,
  });

  // Assign permissions if provided
  if (
    roleData.permissionIds &&
    Array.isArray(roleData.permissionIds) &&
    roleData.permissionIds.length > 0
  ) {
    for (const permissionId of roleData.permissionIds) {
      const permission = await repository.checkPermissionExists(permissionId);
      if (!permission) {
        const error = new Error(`Permission with ID ${permissionId} not found`);
        error.code = "PERMISSION_NOT_FOUND";
        error.statusCode = 404;
        throw error;
      }
      await repository.assignPermissionToRole(newRole._id, permissionId);
    }
  }

  return newRole;
};

const getRoleById = async (roleId) => {
  const role = await repository.getRoleById(roleId);
  if (!role) {
    const error = new Error("Role not found");
    error.code = "ROLE_NOT_FOUND";
    error.statusCode = 404;
    throw error;
  }
  return role;
};

const listRoles = async (page = 1, pageSize = 20, filters = {}) => {
  const roles = await repository.listRoles({
    page,
    pageSize,
    ...filters,
  });

  const total = await repository.countRoles(filters);

  return {
    data: roles,
    pagination: {
      page,
      pageSize,
      totalItems: total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

const updateRole = async (roleId, updateData) => {
  const role = await repository.getRoleById(roleId);
  if (!role) {
    const error = new Error("Role not found");
    error.code = "ROLE_NOT_FOUND";
    error.statusCode = 404;
    throw error;
  }

  // Prevent updating system roles
  if (role.isSystem) {
    const error = new Error("System roles cannot be modified");
    error.code = "SYSTEM_ROLE_PROTECTED";
    error.statusCode = 403;
    throw error;
  }

  // Check for duplicate name if name is being changed
  if (updateData.name && updateData.name !== role.name) {
    const existingRole = await repository.getRoleByName(updateData.name);
    if (existingRole) {
      const error = new Error("Role with this name already exists");
      error.code = "ROLE_NAME_ALREADY_EXISTS";
      error.statusCode = 409;
      throw error;
    }
  }

  const updatedRole = await repository.updateRole(roleId, {
    name: updateData.name || role.name,
    description: updateData.description !== undefined ? updateData.description : role.description,
    isActive: updateData.isActive !== undefined ? updateData.isActive : role.isActive,
  });

  return updatedRole;
};

const deleteRole = async (roleId) => {
  const role = await repository.getRoleById(roleId);
  if (!role) {
    const error = new Error("Role not found");
    error.code = "ROLE_NOT_FOUND";
    error.statusCode = 404;
    throw error;
  }

  // Prevent deleting system roles
  if (role.isSystem) {
    const error = new Error("System roles cannot be deleted");
    error.code = "SYSTEM_ROLE_PROTECTED";
    error.statusCode = 403;
    throw error;
  }

  // Delete all permissions associated with this role
  await repository.replaceRolePermissions(roleId, []);

  // Delete the role
  return await repository.deleteRole(roleId);
};

// Permission Service
const createPermission = async (permissionData) => {
  const existingPermission = await repository.getPermissionByKey(
    permissionData.key.toUpperCase()
  );
  if (existingPermission) {
    const error = new Error("Permission with this key already exists");
    error.code = "PERMISSION_KEY_ALREADY_EXISTS";
    error.statusCode = 409;
    throw error;
  }

  const newPermission = await repository.createPermission({
    key: permissionData.key.toUpperCase(),
    description: permissionData.description || "",
    module: permissionData.module,
    category: permissionData.category,
    isActive: true,
  });

  return newPermission;
};

const getPermissionById = async (permissionId) => {
  const permission = await repository.getPermissionById(permissionId);
  if (!permission) {
    const error = new Error("Permission not found");
    error.code = "PERMISSION_NOT_FOUND";
    error.statusCode = 404;
    throw error;
  }
  return permission;
};

const listPermissions = async (page = 1, pageSize = 20, filters = {}) => {
  const permissions = await repository.listPermissions({
    page,
    pageSize,
    ...filters,
  });

  const total = await repository.countPermissions(filters);

  return {
    data: permissions,
    pagination: {
      page,
      pageSize,
      totalItems: total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

// RolePermission Service
const updateRolePermissions = async (roleId, permissionIds) => {
  const role = await repository.getRoleById(roleId);
  if (!role) {
    const error = new Error("Role not found");
    error.code = "ROLE_NOT_FOUND";
    error.statusCode = 404;
    throw error;
  }

  // Prevent updating system roles
  if (role.isSystem) {
    const error = new Error("System roles cannot be modified");
    error.code = "SYSTEM_ROLE_PROTECTED";
    error.statusCode = 403;
    throw error;
  }

  // Validate all permission IDs exist
  for (const permissionId of permissionIds) {
    const permission = await repository.checkPermissionExists(permissionId);
    if (!permission) {
      const error = new Error(`Permission with ID ${permissionId} not found`);
      error.code = "PERMISSION_NOT_FOUND";
      error.statusCode = 404;
      throw error;
    }
  }

  // Replace permissions
  await repository.replaceRolePermissions(roleId, permissionIds);

  // Fetch and return updated role with permissions
  const updatedRole = await repository.getRoleById(roleId);
  const rolePermissions = await repository.getRolePermissions(roleId);
  const permissions = rolePermissions.map((rp) => rp.permissionId);

  return {
    role: updatedRole,
    permissions,
  };
};

const getRolePermissions = async (roleId) => {
  const role = await repository.getRoleById(roleId);
  if (!role) {
    const error = new Error("Role not found");
    error.code = "ROLE_NOT_FOUND";
    error.statusCode = 404;
    throw error;
  }

  const rolePermissions = await repository.getRolePermissions(roleId);
  return rolePermissions.map((rp) => rp.permissionId);
};

module.exports = {
  // Role
  createRole,
  getRoleById,
  listRoles,
  updateRole,
  deleteRole,
  // Permission
  createPermission,
  getPermissionById,
  listPermissions,
  // RolePermission
  updateRolePermissions,
  getRolePermissions,
};
