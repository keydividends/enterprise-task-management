const test = require('node:test');
const assert = require('node:assert/strict');

const teamService = require('../src/modules/teams/team.service');

test('listTeams returns seeded teams for the mock workspace', async () => {
  const result = await teamService.listTeams({ search: 'Platform' });
  assert.equal(result.length, 1);
  assert.equal(result[0].name, 'Platform Engineering');
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

test('removeTeamMember removes an existing member', async () => {
  const team = await teamService.createTeam({
    name: 'Support',
    description: 'Support team',
    leadId: 'mock-admin',
    members: ['mock-maya'],
  });

  const removed = await teamService.removeTeamMember(team.id, 'mock-maya');
  const members = await teamService.listTeamMembers(team.id);

  assert.equal(removed, true);
  assert.equal(members.some((member) => member.userId === 'mock-maya'), false);
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
