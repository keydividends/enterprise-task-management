const mapTeamSummary = (team) => ({
  id: team.id,
  name: team.name,
  description: team.description,
  leadId: team.leadId,
  projectIds: team.projectIds,
  isActive: team.isActive,
  memberCount: team.members?.length || 0,
  createdAt: team.createdAt,
  updatedAt: team.updatedAt,
});

module.exports = {
  mapTeamSummary,
};
