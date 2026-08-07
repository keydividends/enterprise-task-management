const mapTeamSummary = (team) => {
  const isActive = team.isActive !== false;
  return {
    id: team.id,
    name: team.name,
    description: team.description,
    leadId: team.leadId,
    projectIds: Array.isArray(team.projectIds) ? team.projectIds : [],
    isActive,
    status: team.status || (isActive ? "ACTIVE" : "INACTIVE"),
    isDeleted: Boolean(team.isDeleted),
    memberCount: team.members?.length || 0,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
  };
};

const mapTeamDetail = (team) => ({
  ...mapTeamSummary(team),
  members: Array.isArray(team.members) ? team.members.map(mapTeamMember) : [],
});

const mapTeamMember = (member) => ({
  userId: member.userId,
  role: member.role || "MEMBER",
  joinedAt: member.joinedAt,
});

module.exports = {
  mapTeamSummary,
  mapTeamDetail,
  mapTeamMember,
};
