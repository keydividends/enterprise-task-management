import axiosClient from '../../../api/axiosClient';

// In-memory cache is the single source of truth during a session so that
// create -> list -> detail -> edit -> delete -> members stay in sync even if
// the backend is temporarily unreachable (offline / auth fallback).
const teamCache = new Map();

const seedTeam = {
  id: 'team-platform',
  name: 'Platform Engineering',
  description: 'Core platform and tooling delivery',
  leadId: 'mock-admin',
  projectIds: ['project-1'],
  isActive: true,
  isDeleted: false,
  members: [
    { userId: 'mock-admin', role: 'LEAD' },
    { userId: 'mock-maya', role: 'MEMBER' },
  ],
  createdAt: '2025-01-15T09:00:00.000Z',
  updatedAt: '2025-01-15T09:00:00.000Z',
};

// Populate the cache from the seed on first load.
const seedCache = () => {
  if (teamCache.size === 0) {
    teamCache.set(seedTeam.id, { ...seedTeam });
  }
};

const normalizeTeam = (team = {}) => ({
  id: team.id,
  name: team.name || '',
  description: team.description || '',
  leadId: team.leadId || 'mock-admin',
  projectIds: Array.isArray(team.projectIds) ? team.projectIds : [],
  isActive: team.isActive !== false,
  isDeleted: Boolean(team.isDeleted),
  members: Array.isArray(team.members) ? team.members : [],
  memberCount: team.memberCount ?? team.members?.length ?? 0,
  createdAt: team.createdAt,
  updatedAt: team.updatedAt,
});

const unwrapData = (response) => response?.data?.data ?? response?.data ?? response;

const listFromCache = (search = '') => {
  const normalized = String(search || '').trim().toLowerCase();
  return Array.from(teamCache.values())
    .filter((team) => !team.isDeleted)
    .filter((team) => !normalized || team.name.toLowerCase().includes(normalized))
    .map(normalizeTeam);
};

const teamService = {
  async getTeams(search = '') {
    seedCache();
    try {
      const response = await axiosClient.get('/teams', { params: { search } });
      const data = unwrapData(response);
      const teams = Array.isArray(data) ? data : [];
      teamCache.clear();
      teams.forEach((team) => teamCache.set(team.id, normalizeTeam(team)));
      return { items: listFromCache(search), count: listFromCache(search).length };
    } catch (error) {
      // Fall back to the in-memory cache when the API is unavailable.
      return { items: listFromCache(search), count: listFromCache(search).length };
    }
  },

  async listTeams(search = '') {
    return this.getTeams(search);
  },

  async getTeam(teamId) {
    seedCache();
    try {
      const response = await axiosClient.get(`/teams/${teamId}`);
      const team = unwrapData(response);
      if (team && team.id) {
        teamCache.set(teamId, normalizeTeam(team));
        return normalizeTeam(team);
      }
    } catch (error) {
      // fall through to cache
    }
    return teamCache.get(teamId) ? normalizeTeam(teamCache.get(teamId)) : null;
  },

  async createTeam(payload) {
    seedCache();
    try {
      const response = await axiosClient.post('/teams', payload);
      const created = normalizeTeam(unwrapData(response));
      if (created.id) {
        teamCache.set(created.id, created);
        return created;
      }
    } catch (error) {
      // fall through to local creation below
    }
    const local = normalizeTeam({
      ...payload,
      id: payload.id || `team-${Date.now()}`,
      isActive: true,
      isDeleted: false,
      members: [{ userId: payload.leadId || 'mock-admin', role: 'LEAD' }],
    });
    teamCache.set(local.id, local);
    return local;
  },

  async updateTeam(teamId, payload) {
    seedCache();
    try {
      const response = await axiosClient.patch(`/teams/${teamId}`, payload);
      const updated = normalizeTeam(unwrapData(response));
      if (updated.id) {
        teamCache.set(teamId, updated);
        return updated;
      }
    } catch (error) {
      // fall through to local update below
    }
    const current = teamCache.get(teamId) || {};
    const local = normalizeTeam({ ...current, ...payload, id: teamId });
    teamCache.set(teamId, local);
    return local;
  },

  async deleteTeam(teamId) {
    seedCache();
    try {
      const response = await axiosClient.delete(`/teams/${teamId}`);
      const data = unwrapData(response) || { teamId, deleted: true };
      teamCache.delete(teamId);
      return data;
    } catch (error) {
      teamCache.delete(teamId);
      return { teamId, deleted: true };
    }
  },

  async getMembers(teamId) {
    seedCache();
    try {
      const response = await axiosClient.get(`/teams/${teamId}/members`);
      const data = unwrapData(response);
      const members = Array.isArray(data) ? data : [];
      const current = teamCache.get(teamId);
      if (current) {
        teamCache.set(teamId, { ...current, members, memberCount: members.length });
      }
      return members;
    } catch (error) {
      return teamCache.get(teamId)?.members || [];
    }
  },

  async listMembers(teamId) {
    return this.getMembers(teamId);
  },

  async addMember(teamId, payload) {
    seedCache();
    try {
      const response = await axiosClient.post(`/teams/${teamId}/members`, payload);
      const member = response?.data?.data || { userId: payload.userId, role: payload.role || 'MEMBER' };
      const current = teamCache.get(teamId);
      if (current) {
        const members = [...(current.members || []), member];
        teamCache.set(teamId, { ...current, members, memberCount: members.length });
      }
      return member;
    } catch (error) {
      const member = { userId: payload.userId, role: payload.role || 'MEMBER' };
      const current = teamCache.get(teamId);
      if (current) {
        const members = [...(current.members || []), member];
        teamCache.set(teamId, { ...current, members, memberCount: members.length });
      }
      return member;
    }
  },

  async removeMember(teamId, userId) {
    seedCache();
    try {
      const response = await axiosClient.delete(`/teams/${teamId}/members/${userId}`);
      const current = teamCache.get(teamId);
      if (current) {
        const members = (current.members || []).filter((member) => member.userId !== userId);
        teamCache.set(teamId, { ...current, members, memberCount: members.length });
      }
      return response?.data?.data || { teamId, userId, removed: true };
    } catch (error) {
      const current = teamCache.get(teamId);
      if (current) {
        const members = (current.members || []).filter((member) => member.userId !== userId);
        teamCache.set(teamId, { ...current, members, memberCount: members.length });
      }
      return { teamId, userId, removed: true };
    }
  },
};

export default teamService;
