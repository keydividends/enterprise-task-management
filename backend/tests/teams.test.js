const test = require('node:test');
const assert = require('node:assert/strict');

const teamService = require('../src/modules/teams/team.service');

test('listTeams returns seeded teams for the mock workspace', async () => {
  const result = await teamService.listTeams({ search: 'Platform' });
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].name, 'Platform Engineering');
  assert.equal(result.pagination.page, 1);
});

test('createTeam creates a team with a valid lead and members', async () => {
  const team = await teamService.createTeam({
    name: 'Release Operations',
    description: 'Handles product releases',
    leadId: 'mock-admin',
    projectIds: ['project-1'],
    members: ['mock-maya'],
  });

  assert.equal(team.name, 'Release Operations');
  assert.equal(team.members.length, 2);
  assert.equal(team.members[1].userId, 'mock-maya');
});

test('updateTeam updates team details successfully', async () => {
  const team = await teamService.createTeam({
    name: 'Ops',
    description: 'Ops team',
    leadId: 'mock-admin',
  });

  const updated = await teamService.updateTeam(team.id, {
    name: 'Operations',
    description: 'Updated ops description',
  });

  assert.equal(updated.name, 'Operations');
  assert.equal(updated.description, 'Updated ops description');
});

test('deleteTeam archives the team', async () => {
  const team = await teamService.createTeam({
    name: 'Archive Me',
    description: 'To be archived',
    leadId: 'mock-admin',
  });

  const archived = await teamService.deleteTeam(team.id);

  assert.equal(archived.isActive, false);
  assert.equal(archived.isDeleted, true);
  assert.equal(archived.status, 'ARCHIVED');
});

test('createTeam rejects duplicate members', async () => {
  await assert.rejects(
    () => teamService.createTeam({
      name: 'Ops',
      description: 'Ops team',
      leadId: 'mock-admin',
      members: ['mock-maya', 'mock-maya'],
    }),
    (error) => {
      assert.equal(error.code, 'DUPLICATE_MEMBER');
      return true;
    }
  );
});

test('createTeam rejects missing team name', async () => {
  await assert.rejects(
    () => teamService.createTeam({ description: 'No name' }),
    (error) => {
      assert.equal(error.code, 'VALIDATION_ERROR');
      assert.equal(error.field, 'name');
      return true;
    }
  );
});

test('addTeamMember rejects invalid users', async () => {
  const team = await teamService.createTeam({
    name: 'Infra',
    description: 'Infra team',
    leadId: 'mock-admin',
  });

  await assert.rejects(
    () => teamService.addTeamMember(team.id, { userId: 'missing-user' }),
    (error) => {
      assert.equal(error.code, 'INVALID_MEMBER_USER');
      return true;
    }
  );
});

test('addTeamMember rejects duplicate member', async () => {
  const team = await teamService.createTeam({
    name: 'Infra',
    description: 'Infra team',
    leadId: 'mock-admin',
    members: ['mock-maya'],
  });

  await assert.rejects(
    () => teamService.addTeamMember(team.id, { userId: 'mock-maya' }),
    (error) => {
      assert.equal(error.code, 'TEAM_MEMBER_EXISTS');
      return true;
    }
  );
});

test('updateTeamMember changes member role', async () => {
  const team = await teamService.createTeam({
    name: 'Support',
    description: 'Support team',
    leadId: 'mock-admin',
    members: ['mock-maya'],
  });

  const updated = await teamService.updateTeamMember(team.id, 'mock-maya', { role: 'DEVELOPER' });
  assert.equal(updated.role, 'DEVELOPER');
});

test('promoting a member to lead updates the team lead', async () => {
  const team = await teamService.createTeam({
    name: 'Lead Switch',
    description: 'Lead switch team',
    leadId: 'mock-admin',
    members: ['mock-maya'],
  });

  const updated = await teamService.assignTeamLead(team.id, { userId: 'mock-maya' });
  assert.equal(updated.leadId, 'mock-maya');
  const leadMember = updated.members.find((m) => m.userId === 'mock-maya');
  assert.equal(leadMember.role, 'LEAD');
});

test('removeTeamMember removes an existing member', async () => {
  const team = await teamService.createTeam({
    name: 'QA',
    description: 'QA team',
    leadId: 'mock-admin',
    members: ['mock-maya'],
  });

  const removed = await teamService.removeTeamMember(team.id, 'mock-maya');
  const members = await teamService.listTeamMembers(team.id);

  assert.equal(removed, true);
  assert.equal(members.some((member) => member.userId === 'mock-maya'), false);
});

test('removeTeamMember rejects removing the lead', async () => {
  const team = await teamService.createTeam({
    name: 'Protect Lead',
    description: 'Lead protection',
    leadId: 'mock-admin',
  });

  await assert.rejects(
    () => teamService.removeTeamMember(team.id, 'mock-admin'),
    (error) => {
      assert.equal(error.code, 'PROTECTED_TEAM_LEAD');
      return true;
    }
  );
});

test('restoreTeam restores an archived team', async () => {
  const team = await teamService.createTeam({
    name: 'Restore Me',
    description: 'To be restored',
    leadId: 'mock-admin',
  });

  await teamService.deleteTeam(team.id);
  const restored = await teamService.restoreTeam(team.id);

  assert.equal(restored.isActive, true);
  assert.equal(restored.isDeleted, false);
  assert.equal(restored.status, 'ACTIVE');
});

test('setTeamStatus deactivates a team', async () => {
  const team = await teamService.createTeam({
    name: 'Deactivate Me',
    description: 'To be deactivated',
    leadId: 'mock-admin',
  });

  const deactivated = await teamService.setTeamStatus(team.id, 'INACTIVE');
  assert.equal(deactivated.isActive, false);
  assert.equal(deactivated.status, 'INACTIVE');
});

test('listTeams supports pagination and status filter', async () => {
  const all = await teamService.listTeams({ page: 1, pageSize: 2 });
  assert.ok(all.items.length <= 2);
  assert.ok(all.pagination.totalItems >= 1);

  const inactive = await teamService.listTeams({ status: 'INACTIVE' });
  assert.ok(inactive.items.every((t) => t.status === 'INACTIVE'));
});

test('getTeamSummary exposes member count and projects', async () => {
  const team = await teamService.createTeam({
    name: 'Summary Team',
    description: 'Summary team',
    leadId: 'mock-admin',
    projectIds: ['project-1', 'project-2'],
    members: ['mock-maya'],
  });

  const summary = await teamService.getTeamSummary(team.id);

  assert.equal(summary.memberCount, 2);
  assert.equal(summary.projectIds.length, 2);
});
