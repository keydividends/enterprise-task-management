const test = require('node:test');
const assert = require('node:assert/strict');

const teamService = require('../src/modules/teams/team.service');

test('listTeams returns seeded teams for the mock workspace', async () => {
  const result = await teamService.listTeams({ search: 'Platform' });
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].name, 'Platform Engineering');
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
