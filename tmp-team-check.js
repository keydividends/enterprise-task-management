const teamService = require('./backend/src/modules/teams/team.service');

(async () => {
  const team = await teamService.createTeam({ name: 'Temp2', description: 'x', leadId: 'mock-admin', members: ['mock-maya'] });
  console.log('created', team.isActive, team.isDeleted);
  const deleted = await teamService.deleteTeam(team.id);
  console.log('deleted', deleted.isActive, deleted.isDeleted);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
