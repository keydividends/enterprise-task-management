/**
 * Multi-team membership tests.
 *
 * Covers the 5 scenarios from the requirement:
 *   TEST 1 — user with no team membership can be added to a team.
 *   TEST 2 — duplicate membership in the SAME team is rejected.
 *   TEST 3 — user in Team A can be added to Team B (multi-team allowed).
 *   TEST 4 — getUserTeams returns the correct teams for a user in multiple teams.
 *   TEST 5 — user in Team A and Team B can be added to Team C.
 *
 * All tests run against the in-memory fallback (no MongoDB required).
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const teamService = require('../src/modules/teams/team.service');
const userRepository = require('../src/modules/users/user.repository');

// TEST 1 — user with no existing team membership can be added directly.
test('multi-team TEST1: user with no team membership is added without error', async () => {
  const team = await teamService.createTeam({
    name: 'MT-Team-Alpha',
    description: 'Multi-team test alpha',
    leadId: 'mock-admin',
  });

  // mock-alex has no membership in any seeded team
  const member = await teamService.addTeamMember(team.id, { userId: 'mock-alex', role: 'MEMBER' });
  assert.equal(member.userId, 'mock-alex');
  assert.equal(member.role, 'MEMBER');
});

// TEST 2 — duplicate membership in the SAME team is rejected with TEAM_MEMBER_EXISTS.
test('multi-team TEST2: duplicate membership in same team is rejected', async () => {
  const team = await teamService.createTeam({
    name: 'MT-Team-Beta',
    description: 'Multi-team test beta',
    leadId: 'mock-admin',
    members: ['mock-maya'],
  });

  await assert.rejects(
    () => teamService.addTeamMember(team.id, { userId: 'mock-maya', role: 'MEMBER' }),
    (error) => {
      assert.equal(error.code, 'TEAM_MEMBER_EXISTS');
      return true;
    }
  );
});

// TEST 3 — user already in Team A can be added to Team B (multi-team is allowed).
test('multi-team TEST3: user in Team A can be added to Team B', async () => {
  const teamA = await teamService.createTeam({
    name: 'MT-Team-Gamma-A',
    description: 'Multi-team test gamma A',
    leadId: 'mock-admin',
    members: ['mock-maya'],
  });

  const teamB = await teamService.createTeam({
    name: 'MT-Team-Gamma-B',
    description: 'Multi-team test gamma B',
    leadId: 'mock-admin',
  });

  // mock-maya is in teamA — adding to teamB must succeed
  const member = await teamService.addTeamMember(teamB.id, { userId: 'mock-maya', role: 'DEVELOPER' });
  assert.equal(member.userId, 'mock-maya');

  // Verify mock-maya is now in both teams
  const membersA = await teamService.listTeamMembers(teamA.id);
  const membersB = await teamService.listTeamMembers(teamB.id);
  assert.ok(membersA.some((m) => m.userId === 'mock-maya'), 'mock-maya should still be in Team A');
  assert.ok(membersB.some((m) => m.userId === 'mock-maya'), 'mock-maya should now be in Team B');
});

// TEST 4 — getUserTeams returns the correct teams for a user who belongs to multiple teams.
test('multi-team TEST4: getUserTeams returns all teams a user belongs to', async () => {
  // Create two fresh teams with mock-alex as a member
  const teamX = await teamService.createTeam({
    name: 'MT-Team-Delta-X',
    description: 'Multi-team test delta X',
    leadId: 'mock-admin',
    members: ['mock-alex'],
  });

  const teamY = await teamService.createTeam({
    name: 'MT-Team-Delta-Y',
    description: 'Multi-team test delta Y',
    leadId: 'mock-admin',
    members: ['mock-alex'],
  });

  const teams = await userRepository.getUserTeams('mock-alex');
  const teamNames = teams.map((t) => t.name);

  assert.ok(teamNames.includes('MT-Team-Delta-X'), 'should include Delta-X');
  assert.ok(teamNames.includes('MT-Team-Delta-Y'), 'should include Delta-Y');
});

// TEST 5 — user in Team A and Team B can be added to Team C.
test('multi-team TEST5: user in two teams can be added to a third team', async () => {
  const teamA = await teamService.createTeam({
    name: 'MT-Team-Epsilon-A',
    description: 'Multi-team test epsilon A',
    leadId: 'mock-admin',
    members: ['mock-maya'],
  });

  const teamB = await teamService.createTeam({
    name: 'MT-Team-Epsilon-B',
    description: 'Multi-team test epsilon B',
    leadId: 'mock-admin',
    members: ['mock-maya'],
  });

  const teamC = await teamService.createTeam({
    name: 'MT-Team-Epsilon-C',
    description: 'Multi-team test epsilon C',
    leadId: 'mock-admin',
  });

  // mock-maya is in A and B — adding to C must succeed
  const member = await teamService.addTeamMember(teamC.id, { userId: 'mock-maya', role: 'QA_TESTER' });
  assert.equal(member.userId, 'mock-maya');

  // Verify getUserTeams lists all three
  const teams = await userRepository.getUserTeams('mock-maya');
  const teamNames = teams.map((t) => t.name);
  assert.ok(teamNames.includes('MT-Team-Epsilon-A'), 'should include Epsilon-A');
  assert.ok(teamNames.includes('MT-Team-Epsilon-B'), 'should include Epsilon-B');
  assert.ok(teamNames.includes('MT-Team-Epsilon-C'), 'should include Epsilon-C');
});
