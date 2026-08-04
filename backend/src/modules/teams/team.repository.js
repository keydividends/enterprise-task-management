const { seedTeams, mockUsers, createTeamRecord, createTeamMemberRecord } = require('./team.model');

let teams = [...seedTeams];

const listTeams = async ({ search } = {}) => {
  const normalized = String(search || '').trim().toLowerCase();
  const filtered = normalized
    ? teams.filter((team) => team.name.toLowerCase().includes(normalized))
    : teams;

  return filtered.filter((team) => !team.isDeleted);
};

const findTeamById = async (teamId) => teams.find((team) => team.id === teamId && !team.isDeleted) || null;

const createTeam = async (payload) => {
  const team = createTeamRecord(payload);
  teams.push(team);
  return team;
};

const updateTeam = async (teamId, payload) => {
  const team = await findTeamById(teamId);
  if (!team) return null;
  Object.assign(team, payload, { updatedAt: new Date() });
  return team;
};

const deleteTeam = async (teamId) => {
  const team = await findTeamById(teamId);
  if (!team) return null;
  team.isDeleted = true;
  team.isActive = false;
  team.updatedAt = new Date();
  return team;
};

const findMember = async (teamId, userId) => {
  const team = await findTeamById(teamId);
  return team?.members?.find((member) => member.userId === userId) || null;
};

const addMember = async (teamId, memberPayload) => {
  const team = await findTeamById(teamId);
  if (!team) return null;
  const createdMember = createTeamMemberRecord(memberPayload);
  team.members.push(createdMember);
  team.updatedAt = new Date();
  return createdMember;
};

const removeMember = async (teamId, userId) => {
  const team = await findTeamById(teamId);
  if (!team) return null;
  team.members = team.members.filter((member) => member.userId !== userId);
  team.updatedAt = new Date();
  return true;
};

const findUserById = async (userId) => mockUsers.find((user) => user.id === userId) || null;

module.exports = {
  listTeams,
  findTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  findMember,
  addMember,
  removeMember,
  findUserById,
};
