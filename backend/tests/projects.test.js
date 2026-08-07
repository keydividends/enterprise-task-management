const test = require('node:test');
const assert = require('node:assert/strict');

const projectService = require('../src/modules/projects/project.service');
const projectRepository = require('../src/modules/projects/project.repository');
const userRepository = require('../src/modules/users/user.repository');

const mockContext = { user: { id: 'mock-admin' }, workspaceId: '64a000000000000000000001' };

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

test('createProject resolves a project manager custom ID', async () => {
  const originalFindByCustomId = userRepository.findByCustomId;
  const originalFindById = userRepository.findById;
  const managerId = '64a100000000000000000030';
  userRepository.findByCustomId = async (customId) => (
    customId === 'test-30' ? { id: managerId, customId, status: 'ACTIVE', isDeleted: false } : null
  );
  userRepository.findById = async (userId) => (
    userId === managerId ? { id: managerId, customId: 'test-30', status: 'ACTIVE', isDeleted: false } : null
  );

  try {
    const result = await projectService.createProject({
      name: 'Custom Manager Project',
      key: 'CMGR',
      projectManagerId: 'test-30',
    }, mockContext);

    assert.equal(result.projectManagerId, managerId);
    assert.equal(result.projectManagerCustomId, 'test-30');
  } finally {
    userRepository.findByCustomId = originalFindByCustomId;
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

  const member = await projectService.addProjectMember(created.id, { userId: 'user_admin_1', projectRole: 'DEVELOPER' }, mockContext);
  assert.equal(member.userId, 'user_admin_1');

  await assert.rejects(
    () => projectService.addProjectMember(created.id, { userId: 'user_admin_1', projectRole: 'DEVELOPER' }, mockContext),
    (error) => {
      assert.equal(error.code, 'PROJECT_MEMBER_EXISTS');
      return true;
    }
  );
});

test('removeProjectMember removes an existing member', async () => {
  const created = await projectService.createProject({
    name: 'Remove Member Project',
    key: 'RMPJ',
  }, mockContext);

  await projectService.addProjectMember(created.id, { userId: 'user_admin_1', projectRole: 'DEVELOPER' }, mockContext);
  const removed = await projectService.removeProjectMember(created.id, 'user_admin_1', mockContext);
  assert.equal(removed.status, 'REMOVED');
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
