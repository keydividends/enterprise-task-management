import axiosClient from '../../../api/axiosClient';

<<<<<<< Updated upstream
// The backend is the single source of truth. This module exposes ONLY the
// REST API through axiosClient. It does NOT silently fall back to local/mock
// data, so a failed create/update/delete surfaces an error to the caller
// instead of creating a "phantom" team that only exists in the browser.

const unwrapData = (response) => response?.data?.data ?? response?.data ?? response;
const unwrapPagination = (response) => response?.data?.pagination ?? {};

const normalizeMember = (member = {}) => ({
  userId: member.userId || '',
  role: member.role || 'MEMBER',
  joinedAt: member.joinedAt,
});

=======
>>>>>>> Stashed changes
const normalizeTeam = (team = {}) => ({
  id: team.id,
  name: team.name || '',
  description: team.description || '',
  leadId: team.leadId || 'mock-admin',
  projectIds: Array.isArray(team.projectIds) ? team.projectIds : [],
  isActive: team.isActive !== false,
  status: team.status || (team.isActive !== false ? 'ACTIVE' : 'INACTIVE'),
  isDeleted: Boolean(team.isDeleted),
  members: Array.isArray(team.members) ? team.members.map(normalizeMember) : [],
  memberCount: team.memberCount ?? team.members?.length ?? 0,
  createdAt: team.createdAt,
  updatedAt: team.updatedAt,
});

<<<<<<< Updated upstream
const teamService = {
  async getTeams(search = '', page = 1, pageSize = 20) {
    const response = await axiosClient.get('/teams', {
      params: { search, page, pageSize },
    });
    const data = unwrapData(response);
    const teams = Array.isArray(data) ? data : [];
    return {
      items: teams.map(normalizeTeam),
      pagination: unwrapPagination(response),
    };
=======
const normalizeListResponse = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeTeam);
  }

  if (value?.data?.data && Array.isArray(value.data.data)) {
    return value.data.data.map(normalizeTeam);
  }

  if (value?.data?.items && Array.isArray(value.data.items)) {
    return value.data.items.map(normalizeTeam);
  }

  if (value?.items && Array.isArray(value.items)) {
    return value.items.map(normalizeTeam);
  }

  return [];
};

const normalizeSingleResponse = (value, fallback = null) => {
  if (value?.data?.data) {
    return normalizeTeam(value.data.data);
  }

  if (value?.data) {
    return normalizeTeam(value.data);
  }

  if (value) {
    return normalizeTeam(value);
  }

  return fallback;
};

const teamService = {
  async getTeams(search = '') {
    const response = await axiosClient.get('/teams', { params: { search } });
    const data = response?.data?.data;
    const items = Array.isArray(data) ? data.map(normalizeTeam) : normalizeListResponse(response);
    return { items, count: items.length };
>>>>>>> Stashed changes
  },

  async listTeams(search = '', page = 1, pageSize = 20) {
    return this.getTeams(search, page, pageSize);
  },

  async getTeam(teamId) {
    const response = await axiosClient.get(`/teams/${teamId}`);
<<<<<<< Updated upstream
    const team = unwrapData(response);
    return normalizeTeam(team);
=======
    return normalizeSingleResponse(response);
>>>>>>> Stashed changes
  },

  async createTeam(payload) {
    const response = await axiosClient.post('/teams', payload);
<<<<<<< Updated upstream
    return normalizeTeam(unwrapData(response));
=======
    return normalizeSingleResponse(response);
>>>>>>> Stashed changes
  },

  async updateTeam(teamId, payload) {
    const response = await axiosClient.patch(`/teams/${teamId}`, payload);
<<<<<<< Updated upstream
    return normalizeTeam(unwrapData(response));
=======
    return normalizeSingleResponse(response);
>>>>>>> Stashed changes
  },

  async deleteTeam(teamId) {
    const response = await axiosClient.delete(`/teams/${teamId}`);
<<<<<<< Updated upstream
    return unwrapData(response) || { teamId, deleted: true };
  },

  async restoreTeam(teamId) {
    const response = await axiosClient.patch(`/teams/${teamId}/restore`);
    return normalizeTeam(unwrapData(response));
=======
    return response?.data?.data || response?.data || { teamId, deleted: true };
>>>>>>> Stashed changes
  },

  async getMembers(teamId) {
    const response = await axiosClient.get(`/teams/${teamId}/members`);
<<<<<<< Updated upstream
    const data = unwrapData(response);
    return Array.isArray(data) ? data.map(normalizeMember) : [];
=======
    const data = response?.data?.data;
    return Array.isArray(data) ? data : [];
>>>>>>> Stashed changes
  },

  async listMembers(teamId) {
    return this.getMembers(teamId);
  },

  async addMember(teamId, payload) {
    const response = await axiosClient.post(`/teams/${teamId}/members`, payload);
<<<<<<< Updated upstream
    return normalizeMember(unwrapData(response) || { userId: payload.userId, role: payload.role || 'MEMBER' });
  },

  async updateMember(teamId, userId, payload) {
    const response = await axiosClient.put(`/teams/${teamId}/members/${userId}`, payload);
    return normalizeMember(unwrapData(response));
=======
    return response?.data?.data || { userId: payload.userId, role: 'MEMBER' };
>>>>>>> Stashed changes
  },

  async removeMember(teamId, userId) {
    const response = await axiosClient.delete(`/teams/${teamId}/members/${userId}`);
<<<<<<< Updated upstream
    return unwrapData(response) || { teamId, userId, removed: true };
  },

  async assignLead(teamId, userId) {
    const response = await axiosClient.patch(`/teams/${teamId}/lead`, { userId });
    return normalizeTeam(unwrapData(response));
=======
    return response?.data?.data || { teamId, userId, removed: true };
>>>>>>> Stashed changes
  },
};

export default teamService;
