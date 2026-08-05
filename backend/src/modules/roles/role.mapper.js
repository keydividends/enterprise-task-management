// Role Mapper - transforms models to API response format

const mapRoleToResponse = (role) => {
  return {
    id: role._id,
    name: role.name,
    description: role.description,
    isSystem: role.isSystem,
    isActive: role.isActive,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
};

const mapPermissionToResponse = (permission) => {
  return {
    id: permission._id,
    key: permission.key,
    description: permission.description,
    module: permission.module,
    category: permission.category,
    isActive: permission.isActive,
    createdAt: permission.createdAt,
    updatedAt: permission.updatedAt,
  };
};

const mapRoleWithPermissionsToResponse = (role, permissions) => {
  return {
    id: role._id,
    name: role.name,
    description: role.description,
    isSystem: role.isSystem,
    isActive: role.isActive,
    permissions: permissions.map(mapPermissionToResponse),
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
};

module.exports = {
  mapRoleToResponse,
  mapPermissionToResponse,
  mapRoleWithPermissionsToResponse,
};
