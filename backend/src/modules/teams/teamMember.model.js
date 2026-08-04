const createTeamMemberRecord = (data) => ({
  userId: data.userId,
  role: data.role || 'MEMBER',
  joinedAt: data.joinedAt || new Date(),
});

module.exports = {
  createTeamMemberRecord,
};
