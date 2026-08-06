const { seedTeams, mockUsers, createTeamRecord, createTeamMemberRecord } = require('./team.model');
const userRepository = require('../users/user.repository');

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

const findUserById = async (userId) => {
  if (!userId) return null;

  // 1. Prefer the real users module (single source of truth).
  //    Handles both in-memory fallback and MongoDB-backed users.
  const realUser = await userRepository.findById(String(userId));
  if (realUser) {
    return {
      id: realUser.id || realUser._id || String(userId),
      firstName: realUser.firstName,
      lastName: realUser.lastName,
      role: realUser.role,
      status: realUser.status,
    };
  }

  // 2. Fall back to the mock users used by the mock-token auth path.
  return mockUsers.find((user) => user.id === String(userId)) || null;
};

const listUsers = async (search = '') => {
  const normalized = String(search || '').trim().toLowerCase();

  // Real users from the users module first.
  const realUsers = Array.isArray(userRepository.inMemoryUsers)
    ? userRepository.inMemoryUsers
    : Array.from(userRepository.inMemoryUsers?.values?.() || []);
  const realList = (realUsers || [])
    .filter((u) => u && u.status === 'ACTIVE' && !u.isDeleted)
    .filter((u) => !normalized || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(normalized))
    .map((u) => ({ id: u.id || u._id, firstName: u.firstName, lastName: u.lastName, role: u.role }));

  return realList;
};

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
  listUsers,
};
