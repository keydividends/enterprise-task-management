const teamRepository = require('./team.repository');

const createAuthError = (code, message, statusCode = 400) => {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
};

const ensureUniqueMembers = (members = []) => {
  const seen = new Set();
  for (const member of members) {
    if (seen.has(member)) {
      throw createAuthError('DUPLICATE_MEMBER', 'Duplicate team members are not allowed.', 409);
    }
    seen.add(member);
  }
};

const listTeams = async ({ search } = {}) => {
  const items = await teamRepository.listTeams({ search });
  return { items, count: items.length };
};

const getTeam = async (teamId) => {
  const team = await teamRepository.findTeamById(teamId);
  if (!team) {
    throw createAuthError('TEAM_NOT_FOUND', 'Team not found.', 404);
  }
  return team;
};

const createTeam = async ({ name, description, leadId, projectIds, members = [] }) => {
  if (!String(name || '').trim()) {
    throw createAuthError('VALIDATION_ERROR', 'Team name is required.', 400);
  }

  ensureUniqueMembers(members);

  const lead = await teamRepository.findUserById(leadId || 'mock-admin');
  if (!lead) {
    throw createAuthError('INVALID_LEAD', 'Team lead must be a valid active user.', 400);
  }

  const normalizedMembers = [];
  for (const memberId of members) {
    const user = await teamRepository.findUserById(memberId);
    if (!user) {
      throw createAuthError('INVALID_MEMBER_USER', 'One or more team members are invalid.', 400);
    }
    normalizedMembers.push({ userId: memberId, role: 'MEMBER' });
  }

  const team = await teamRepository.createTeam({
    name: String(name).trim(),
    description: String(description || '').trim(),
    leadId: lead.id,
    projectIds: Array.isArray(projectIds) ? projectIds : [],
    members: [{ userId: lead.id, role: 'LEAD' }, ...normalizedMembers],
  });

  return team;
};

const updateTeam = async (teamId, payload) => {
  const team = await getTeam(teamId);
  if (payload.name && !String(payload.name).trim()) {
    throw createAuthError('VALIDATION_ERROR', 'Team name is required.', 400);
  }

  return teamRepository.updateTeam(teamId, {
    ...payload,
    name: payload.name ? String(payload.name).trim() : team.name,
    description: payload.description !== undefined ? String(payload.description).trim() : team.description,
  });
};

const deleteTeam = async (teamId) => teamRepository.deleteTeam(teamId);

const listTeamMembers = async (teamId) => {
  const team = await getTeam(teamId);
  return team.members || [];
};

const addTeamMember = async (teamId, { userId, role = 'MEMBER' }) => {
  const team = await getTeam(teamId);
  const existing = team.members?.find((member) => member.userId === userId);
  if (existing) {
    throw createAuthError('DUPLICATE_MEMBER', 'Member already belongs to the team.', 409);
  }

  const user = await teamRepository.findUserById(userId);
  if (!user) {
    throw createAuthError('INVALID_MEMBER_USER', 'The selected user is not valid.', 400);
  }

  return teamRepository.addMember(teamId, { userId, role });
};

const removeTeamMember = async (teamId, userId) => {
  const team = await getTeam(teamId);
  const member = team.members?.find((entry) => entry.userId === userId);
  if (!member) {
    throw createAuthError('TEAM_MEMBER_NOT_FOUND', 'Team member not found.', 404);
  }
  return teamRepository.removeMember(teamId, userId);
};

module.exports = {
  listTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  listTeamMembers,
  addTeamMember,
  removeTeamMember,
};
