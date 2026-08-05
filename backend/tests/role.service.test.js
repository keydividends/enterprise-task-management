const test = require('node:test');
const assert = require('node:assert/strict');

const roleService = require('../src/modules/roles/role.service');
const repository = require('../src/modules/roles/role.repository');

const restoreRepositoryMethods = (originalMethods) => {
  Object.entries(originalMethods).forEach(([name, value]) => {
    repository[name] = value;
  });
};

test('createRole creates a role and assigns permissions', async () => {
  const originalMethods = {
    getRoleByName: repository.getRoleByName,
    createRole: repository.createRole,
    checkPermissionExists: repository.checkPermissionExists,
    assignPermissionToRole: repository.assignPermissionToRole,
  };

  const createdRole = {
    _id: 'role_123',
    name: 'ENGINEER',
    description: 'Engineer role',
    isSystem: false,
    isActive: true,
  };

  let createdRoleData;
  let assignedRoleId;
  let assignedPermissionId;

  repository.getRoleByName = async () => null;
  repository.createRole = async (roleData) => {
    createdRoleData = roleData;
    return createdRole;
  };
  repository.checkPermissionExists = async (permissionId) => ({ _id: permissionId });
  repository.assignPermissionToRole = async (roleId, permissionId) => {
    assignedRoleId = roleId;
    assignedPermissionId = permissionId;
    return { roleId, permissionId };
  };

  try {
    const result = await roleService.createRole({
      name: 'ENGINEER',
      description: 'Engineer role',
      permissionIds: ['permission_123'],
    });

    assert.equal(result, createdRole);
    assert.deepEqual(createdRoleData, {
      name: 'ENGINEER',
      description: 'Engineer role',
      isSystem: false,
      isActive: true,
    });
    assert.equal(assignedRoleId, 'role_123');
    assert.equal(assignedPermissionId, 'permission_123');
  } finally {
    restoreRepositoryMethods(originalMethods);
  }
});

test('createRole rejects duplicate role names', async () => {
  const originalMethods = {
    getRoleByName: repository.getRoleByName,
    createRole: repository.createRole,
  };

  repository.getRoleByName = async () => ({ name: 'ENGINEER' });
  repository.createRole = async () => {
    throw new Error('should not create');
  };

  try {
    await assert.rejects(
      () => roleService.createRole({ name: 'ENGINEER' }),
      (error) => {
        assert.equal(error.code, 'ROLE_NAME_ALREADY_EXISTS');
        assert.equal(error.statusCode, 409);
        return true;
      }
    );
  } finally {
    restoreRepositoryMethods(originalMethods);
  }
});

test('updateRole blocks system role modifications', async () => {
  const originalMethods = {
    getRoleById: repository.getRoleById,
    getRoleByName: repository.getRoleByName,
    updateRole: repository.updateRole,
  };

  repository.getRoleById = async () => ({
    _id: 'role_admin',
    name: 'ADMIN',
    description: 'System role',
    isSystem: true,
    isActive: true,
  });
  repository.getRoleByName = async () => null;
  repository.updateRole = async () => {
    throw new Error('should not update');
  };

  try {
    await assert.rejects(
      () => roleService.updateRole('role_admin', { description: 'changed' }),
      (error) => {
        assert.equal(error.code, 'SYSTEM_ROLE_PROTECTED');
        assert.equal(error.statusCode, 403);
        return true;
      }
    );
  } finally {
    restoreRepositoryMethods(originalMethods);
  }
});

test('deleteRole removes a custom role and its permission links', async () => {
  const originalMethods = {
    getRoleById: repository.getRoleById,
    replaceRolePermissions: repository.replaceRolePermissions,
    deleteRole: repository.deleteRole,
  };

  let replacedRoleId;
  let replacedPermissions;

  repository.getRoleById = async () => ({
    _id: 'role_custom',
    name: 'CUSTOM',
    isSystem: false,
  });
  repository.replaceRolePermissions = async (roleId, permissionIds) => {
    replacedRoleId = roleId;
    replacedPermissions = permissionIds;
    return [];
  };
  repository.deleteRole = async (roleId) => ({ deletedRoleId: roleId });

  try {
    const result = await roleService.deleteRole('role_custom');

    assert.deepEqual(result, { deletedRoleId: 'role_custom' });
    assert.equal(replacedRoleId, 'role_custom');
    assert.deepEqual(replacedPermissions, []);
  } finally {
    restoreRepositoryMethods(originalMethods);
  }
});
