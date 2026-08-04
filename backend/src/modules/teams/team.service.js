const teamRepository = require('./team.repository');
const { mapTeamDetail, mapTeamSummary } = require('./team.mapper');

const createAuthError = (code, message, statusCode = 400) => {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
};

const ensureUniqueMembers = (members = []) => {
  const seen = new Set();
  for (const member of members) {
    const normalizedMember = String(member || '').trim();
    if (!normalizedMember) {
      continue;
    }
    if (seen.has(normalizedMember)) {
      throw createAuthError('DUPLICATE_MEMBER', 'Duplicate team members are not allowed.', 409);
    }
    seen.add(normalizedMember);
  }
};

const listTeams = async ({ search } = {}) => {
  const items = await teamRepository.listTeams({ search });
  return { items: items.map(mapTeamSummary), count: items.length };
};

const getTeam = async (teamId) => {
  const team = await teamRepository.findTeamById(teamId);
  if (!team) {
    throw createAuthError('TEAM_NOT_FOUND', 'Team not found.', 404);
  }
  return mapTeamDetail(team);
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
  const seenMembers = new Set();
  for (const memberId of members) {
    const normalizedMemberId = String(memberId || '').trim();
    if (!normalizedMemberId || normalizedMemberId === lead.id || seenMembers.has(normalizedMemberId)) {
      continue;
    }
    seenMembers.add(normalizedMemberId);

    const user = await teamRepository.findUserById(normalizedMemberId);
    if (!user) {
      throw createAuthError('INVALID_MEMBER_USER', 'One or more team members are invalid.', 400);
    }
    normalizedMembers.push({ userId: normalizedMemberId, role: 'MEMBER' });
  }

  const team = await teamRepository.createTeam({
    name: String(name).trim(),
    description: String(description || '').trim(),
    leadId: lead.id,
    projectIds: Array.isArray(projectIds) ? projectIds.filter(Boolean).map((item) => String(item)) : [],
    members: [{ userId: lead.id, role: 'LEAD' }, ...normalizedMembers],
  });

  return mapTeamDetail(team);
};

const updateTeam = async (teamId, payload) => {
  const team = await getTeam(teamId);
  if (payload.name !== undefined && !String(payload.name || '').trim()) {
    throw createAuthError('VALIDATION_ERROR', 'Team name is required.', 400);
  }

  const nextPayload = {
    ...payload,
    name: payload.name !== undefined ? String(payload.name).trim() : team.name,
    description: payload.description !== undefined ? String(payload.description).trim() : team.description,
    projectIds: Array.isArray(payload.projectIds) ? payload.projectIds.filter(Boolean).map((item) => String(item)) : team.projectIds,
  };

  return mapTeamDetail(await teamRepository.updateTeam(teamId, nextPayload));
};

const deleteTeam = async (teamId) => mapTeamDetail(await teamRepository.deleteTeam(teamId));

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

  const normalizedUserId = String(userId || '').trim();
  if (!normalizedUserId) {
    throw createAuthError('VALIDATION_ERROR', 'A user ID is required.', 400);
  }

  const user = await teamRepository.findUserById(normalizedUserId);
  if (!user) {
    throw createAuthError('INVALID_MEMBER_USER', 'The selected user is not valid.', 400);
  }

  return teamRepository.addMember(teamId, { userId: normalizedUserId, role });
};

const removeTeamMember = async (teamId, userId) => {
  const team = await getTeam(teamId);
  const member = team.members?.find((entry) => entry.userId === userId);
  if (!member) {
    throw createAuthError('TEAM_MEMBER_NOT_FOUND', 'Team member not found.', 404);
  }
  return teamRepository.removeMember(teamId, userId);
};

const getTeamSummary = async (teamId) => {
  const team = await getTeam(teamId);
  return {
    id: team.id,
    name: team.name,
    description: team.description,
    leadId: team.leadId,
    projectIds: team.projectIds || [],
    memberCount: team.memberCount || team.members?.length || 0,
    isActive: team.isActive,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
  };
};

const getTeamProjects = async (teamId) => {
  const team = await getTeam(teamId);
  return {
    teamId: team.id,
    projectIds: team.projectIds || [],
    projects: team.projectIds || [],
  };
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
  getTeamSummary,
  getTeamProjects,
};
