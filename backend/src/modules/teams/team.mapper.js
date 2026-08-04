const mapTeamSummary = (team) => ({
  id: team.id,
  name: team.name,
  description: team.description,
  leadId: team.leadId,
  projectIds: Array.isArray(team.projectIds) ? team.projectIds : [],
  isActive: team.isActive,
  isDeleted: Boolean(team.isDeleted),
  memberCount: team.members?.length || 0,
  createdAt: team.createdAt,
  updatedAt: team.updatedAt,
});

const mapTeamDetail = (team) => ({
  ...mapTeamSummary(team),
  members: Array.isArray(team.members) ? team.members : [],
});

module.exports = {
  mapTeamSummary,
  mapTeamDetail,
};
