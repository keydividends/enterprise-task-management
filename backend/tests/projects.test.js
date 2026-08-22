const test = require('node:test');
const assert = require('node:assert/strict');

const projectService = require('../src/modules/projects/project.service');
const projectRepository = require('../src/modules/projects/project.repository');
const userRepository = require('../src/modules/users/user.repository');
const request = require('supertest');
const app = require('../src/app');
const { getEffectivePermissions } = require('../src/modules/auth/rolePermissions');

const mockContext = { user: { id: 'mock-admin', role: 'ADMIN' }, workspaceId: '64a000000000000000000001' };
const mockProjectUser = { id: 'user_admin_1', employeeId: 'user_admin_1', firstName: 'Project', lastName: 'User', status: 'ACTIVE', isDeleted: false };

const withMockProjectUser = async (callback) => {
  const originalFindByEmployeeId = userRepository.findByEmployeeId;
  userRepository.findByEmployeeId = async (employeeId) => (
    employeeId === mockProjectUser.employeeId ? mockProjectUser : originalFindByEmployeeId(employeeId)
  );
  try {
    return await callback();
  } finally {
    userRepository.findByEmployeeId = originalFindByEmployeeId;
  }
};

test('createProject creates a project successfully', async () => {
  const result = await projectService.createProject({
    name: 'Project Test',
    key: 'PTST',
    description: 'Project creation test',
    status: 'ACTIVE',
    priority: 'HIGH',
  }, mockContext);

  assert.equal(result.name, 'Project Test');
  assert.equal(result.key, 'PTST');
});

test('createProject resolves a project manager employee ID', async () => {
  const originalFindByEmployeeId = userRepository.findByEmployeeId;
  const originalFindById = userRepository.findById;
  const managerId = '64a100000000000000000030';
  userRepository.findByEmployeeId = async (employeeId) => (
    employeeId === 'test-30' ? { id: managerId, employeeId, status: 'ACTIVE', isDeleted: false } : null
  );
  userRepository.findById = async (userId) => (
    userId === managerId ? { id: managerId, employeeId: 'test-30', status: 'ACTIVE', isDeleted: false } : null
  );

  try {
    const result = await projectService.createProject({
      name: 'Custom Manager Project',
      key: 'CMGR',
      projectManagerEmployeeId: 'test-30',
    }, mockContext);

    assert.equal(result.projectManagerEmployeeId, 'test-30');
  } finally {
    userRepository.findByEmployeeId = originalFindByEmployeeId;
    userRepository.findById = originalFindById;
  }
});

test('listProjects returns paginated results', async () => {
  const result = await projectService.listProjects({ search: 'Project', page: 1, pageSize: 10 }, mockContext);
  assert.ok(Array.isArray(result.items));
  assert.ok(result.pagination.totalItems >= 1);
});

test('updateProject validates fields and updates', async () => {
  const created = await projectService.createProject({
    name: 'Update Sample',
    key: 'UPDS',
    description: 'Update validation test',
  }, mockContext);

  const updated = await projectService.updateProject(created.id, { name: 'Updated Name', priority: 'CRITICAL' }, mockContext);
  assert.equal(updated.name, 'Updated Name');
  assert.equal(updated.priority, 'CRITICAL');
});

test('addProjectMember succeeds and duplicate members are rejected', async () => {
  const created = await projectService.createProject({
    name: 'Member Project',
    key: 'MBPJ',
  }, mockContext);

  await withMockProjectUser(async () => {
    const member = await projectService.addProjectMember(created.id, { employeeId: 'user_admin_1', projectRole: 'DEVELOPER' }, mockContext);
    assert.equal(member.employeeId, 'user_admin_1');
    assert.equal(member.userId, mockProjectUser.id);

    await assert.rejects(
      () => projectService.addProjectMember(created.id, { employeeId: 'user_admin_1', projectRole: 'DEVELOPER' }, mockContext),
      (error) => {
        assert.equal(error.code, 'PROJECT_MEMBER_EXISTS');
        return true;
      }
    );
  });
});

test('removeProjectMember removes an existing member', async () => {
  const created = await projectService.createProject({
    name: 'Remove Member Project',
    key: 'RMPJ',
  }, mockContext);

  await withMockProjectUser(async () => {
    await projectService.addProjectMember(created.id, { employeeId: 'user_admin_1', projectRole: 'DEVELOPER' }, mockContext);
    const removed = await projectService.removeProjectMember(created.id, 'user_admin_1', mockContext);
    assert.equal(removed.status, 'REMOVED');
  });
});

test('project data is isolated by workspace', async () => {
  const created = await projectService.createProject({ name: 'Isolated Project', key: 'ISOL' }, mockContext);
  await assert.rejects(
    () => projectService.getProjectById(created.id, { user: { id: 'other-admin', role: 'ADMIN' }, workspaceId: '64a000000000000000000099' }),
    (error) => error.code === 'PROJECT_NOT_FOUND'
  );
});

test('manager role receives all project management permissions', () => {
  const permissions = getEffectivePermissions({ role: 'MANAGER', permissions: ['TASK_VIEW'] });
  assert.deepEqual(
    permissions.filter((permission) => permission.startsWith('PROJECT_')).sort(),
    ['PROJECT_CREATE', 'PROJECT_DELETE', 'PROJECT_MANAGE_MEMBERS', 'PROJECT_UPDATE', 'PROJECT_VIEW']
  );
});

test('users cannot manage a project even if stale permissions are present', async () => {
  const project = await projectService.createProject({ name: 'Role Restricted Project', key: 'RRPR' }, mockContext);
  const userContext = {
    user: { id: 'user-1', role: 'USER', permissions: ['PROJECT_VIEW', 'PROJECT_UPDATE', 'PROJECT_DELETE', 'PROJECT_MANAGE_MEMBERS'] },
    workspaceId: mockContext.workspaceId,
  };

  await assert.rejects(
    () => projectService.updateProject(project.id, { name: 'Forbidden update' }, userContext),
    (error) => error.code === 'PROJECT_ACCESS_DENIED'
  );
});

test('ordinary users can only list and view projects they manage or belong to', async () => {
  const memberContext = { user: { id: 'member-1', role: 'USER', permissions: ['PROJECT_VIEW'] }, workspaceId: mockContext.workspaceId };
  const visibleProject = await projectService.createProject({ name: 'Visible Project', key: 'VSB1' }, mockContext);
  const hiddenProject = await projectService.createProject({ name: 'Hidden Project', key: 'HDN1' }, mockContext);

  const originalFindByEmployeeId = userRepository.findByEmployeeId;
  userRepository.findByEmployeeId = async (employeeId) => (
    employeeId === 'MEM-001' ? { id: 'member-1', employeeId, status: 'ACTIVE', isDeleted: false } : originalFindByEmployeeId(employeeId)
  );
  try {
    await projectService.addProjectMember(visibleProject.id, { employeeId: 'MEM-001', projectRole: 'VIEWER' }, mockContext);
    const projects = await projectService.listProjects({}, memberContext);
    assert.deepEqual(projects.items.map((project) => project.id), [visibleProject.id]);
    await assert.rejects(() => projectService.getProjectById(hiddenProject.id, memberContext), (error) => error.code === 'PROJECT_ACCESS_DENIED');
    assert.equal((await projectService.getProjectById(visibleProject.id, memberContext)).id, visibleProject.id);
  } finally {
    userRepository.findByEmployeeId = originalFindByEmployeeId;
  }
});

test('managers only see and manage projects they own or belong to', async () => {
  const managerA = { user: { id: 'manager-a', role: 'MANAGER', permissions: ['PROJECT_VIEW', 'PROJECT_CREATE', 'PROJECT_UPDATE'] }, workspaceId: mockContext.workspaceId };
  const managerB = { user: { id: 'manager-b', role: 'MANAGER', permissions: ['PROJECT_VIEW', 'PROJECT_CREATE', 'PROJECT_UPDATE'] }, workspaceId: mockContext.workspaceId };
  const projectA = await projectService.createProject({ name: 'Manager A Project', key: 'MGA1' }, managerA);
  const projectB = await projectService.createProject({ name: 'Manager B Project', key: 'MGB1' }, managerB);

  const managerAProjects = await projectService.listProjects({}, managerA);
  assert.ok(managerAProjects.items.some((project) => project.id === projectA.id));
  assert.ok(!managerAProjects.items.some((project) => project.id === projectB.id));

  await assert.rejects(
    () => projectService.getProjectById(projectB.id, managerA),
    (error) => error.code === 'PROJECT_ACCESS_DENIED'
  );
  await assert.rejects(
    () => projectService.updateProject(projectB.id, { name: 'Unauthorized update' }, managerA),
    (error) => error.code === 'PROJECT_ACCESS_DENIED'
  );
});

test('project API rejects unauthenticated and unauthorized requests', async () => {
  const unauthenticated = await request(app).get('/api/v1/projects');
  assert.equal(unauthenticated.status, 401);
  assert.equal(unauthenticated.body.code, 'AUTH_REQUIRED');

  const unauthorized = await request(app)
    .post('/api/v1/projects')
    .set('Authorization', 'Bearer mock-member-token')
    .send({ name: 'Forbidden Project', key: 'FORB' });
  assert.equal(unauthorized.status, 403);
  assert.equal(unauthorized.body.code, 'PERMISSION_DENIED');
});

test('deleteProject archives project', async () => {
  const created = await projectService.createProject({
    name: 'Archive Project',
    key: 'ARCH',
  }, mockContext);

  const deleted = await projectService.deleteProject(created.id, mockContext);
  assert.equal(deleted.isDeleted, true);
  assert.equal(deleted.status, 'ARCHIVED');
});

test('getProjectTaskSummary returns task status counts and forwards the sprint filter', async () => {
  const created = await projectService.createProject({
    name: 'Summary Project',
    key: 'SUMM',
  }, mockContext);

  const originalGetTaskSummary = projectRepository.getTaskSummary;
  const expectedSummary = { TODO: 2, IN_PROGRESS: 1, DONE: 3 };
  let receivedProjectId;
  let receivedOptions;
  projectRepository.getTaskSummary = async (projectId, options) => {
    receivedProjectId = projectId;
    receivedOptions = options;
    return expectedSummary;
  };

  try {
    const summary = await projectService.getProjectTaskSummary(
      created.id,
      mockContext,
      { sprintId: '64a200000000000000000010' }
    );

    assert.deepEqual(summary, expectedSummary);
    assert.equal(receivedProjectId, created.id);
    assert.deepEqual(receivedOptions, { sprintId: '64a200000000000000000010' });
  } finally {
    projectRepository.getTaskSummary = originalGetTaskSummary;
  }
});

test('getProjectTaskSummary rejects a missing project', async () => {
  await assert.rejects(
    () => projectService.getProjectTaskSummary('nonexistent-project', mockContext, {}),
    (error) => {
      assert.equal(error.code, 'PROJECT_NOT_FOUND');
      assert.equal(error.statusCode, 404);
      return true;
    }
  );
});
