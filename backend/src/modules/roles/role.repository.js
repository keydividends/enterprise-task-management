const Role = require("./role.model");
const Permission = require("./permission.model");
const RolePermission = require("./rolePermission.model");

// Role Repository
const createRole = async (roleData) => {
  const role = new Role(roleData);
  return await role.save();
};

const getRoleById = async (roleId) => {
  return await Role.findById(roleId);
};

const getRoleByName = async (name) => {
  return await Role.findOne({ name });
};

const listRoles = async (filters = {}) => {
  const query = {};
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }
  if (filters.search) {
    query.name = { $regex: filters.search, $options: "i" };
  }
  return await Role.find(query)
    .skip((filters.page - 1) * filters.pageSize)
    .limit(filters.pageSize)
    .sort({ createdAt: -1 });
};

const countRoles = async (filters = {}) => {
  const query = {};
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }
  if (filters.search) {
    query.name = { $regex: filters.search, $options: "i" };
  }
  return await Role.countDocuments(query);
};

const updateRole = async (roleId, updateData) => {
  return await Role.findByIdAndUpdate(roleId, updateData, { new: true });
};

const deleteRole = async (roleId) => {
  return await Role.findByIdAndDelete(roleId);
};

// Permission Repository
const createPermission = async (permissionData) => {
  const permission = new Permission(permissionData);
  return await permission.save();
};

const getPermissionById = async (permissionId) => {
  return await Permission.findById(permissionId);
};

const getPermissionByKey = async (key) => {
  return await Permission.findOne({ key });
};

const listPermissions = async (filters = {}) => {
  const query = {};
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }
  if (filters.module) {
    query.module = filters.module;
  }
  if (filters.search) {
    query.key = { $regex: filters.search, $options: "i" };
  }
  return await Permission.find(query)
    .skip((filters.page - 1) * filters.pageSize)
    .limit(filters.pageSize)
    .sort({ module: 1, category: 1, key: 1 });
};

const countPermissions = async (filters = {}) => {
  const query = {};
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }
  if (filters.module) {
    query.module = filters.module;
  }
  if (filters.search) {
    query.key = { $regex: filters.search, $options: "i" };
  }
  return await Permission.countDocuments(query);
};

const updatePermission = async (permissionId, updateData) => {
  return await Permission.findByIdAndUpdate(permissionId, updateData, {
    new: true,
  });
};

const deletePermission = async (permissionId) => {
  return await Permission.findByIdAndDelete(permissionId);
};

// RolePermission Repository
const assignPermissionToRole = async (roleId, permissionId) => {
  const rolePermission = new RolePermission({
    roleId,
    permissionId,
  });
  return await rolePermission.save();
};

const getRolePermissions = async (roleId) => {
  return await RolePermission.find({ roleId })
    .populate("permissionId")
    .lean();
};

const getRolePermissionIds = async (roleId) => {
  const rolePermissions = await RolePermission.find({ roleId }).lean();
  return rolePermissions.map((rp) => rp.permissionId.toString());
};

const removePermissionFromRole = async (roleId, permissionId) => {
  return await RolePermission.findOneAndDelete({ roleId, permissionId });
};

const replaceRolePermissions = async (roleId, permissionIds) => {
  // Delete existing permissions
  await RolePermission.deleteMany({ roleId });

  // Add new permissions
  const rolePermissions = permissionIds.map((permissionId) => ({
    roleId,
    permissionId,
  }));

  if (rolePermissions.length > 0) {
    return await RolePermission.insertMany(rolePermissions);
  }
  return [];
};

const checkPermissionExists = async (permissionId) => {
  return await Permission.findById(permissionId);
};

module.exports = {
  // Role
  createRole,
  getRoleById,
  getRoleByName,
  listRoles,
  countRoles,
  updateRole,
  deleteRole,
  // Permission
  createPermission,
  getPermissionById,
  getPermissionByKey,
  listPermissions,
  countPermissions,
  updatePermission,
  deletePermission,
  // RolePermission
  assignPermissionToRole,
  getRolePermissions,
  getRolePermissionIds,
  removePermissionFromRole,
  replaceRolePermissions,
  checkPermissionExists,
};
