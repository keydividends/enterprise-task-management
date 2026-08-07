import axiosClient from '../../../api/axiosClient';

// The backend is the single source of truth.

const unwrapData = (response) => response?.data?.data ?? response?.data ?? response;
const unwrapPagination = (response) => response?.data?.pagination ?? {};

const normalizeMember = (member = {}) => ({
  userId: member.userId || '',
  role: member.role || 'MEMBER',
  joinedAt: member.joinedAt,
});

const normalizeTeam = (team = {}) => ({
  id: team.id,
  name: team.name || '',
  description: team.description || '',
  leadId: team.leadId || 'mock-admin',
  projectIds: Array.isArray(team.projectIds) ? team.projectIds : [],
  isActive: team.isActive !== false,
  status: team.status || (team.isActive !== false ? 'ACTIVE' : 'INACTIVE'),
  isDeleted: Boolean(team.isDeleted),
  members: Array.isArray(team.members)
    ? team.members.map(normalizeMember)
    : [],
  memberCount: team.memberCount ?? team.members?.length ?? 0,
  createdAt: team.createdAt,
  updatedAt: team.updatedAt,
});

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
  },

  async listTeams(search = '', page = 1, pageSize = 20) {
    return this.getTeams(search, page, pageSize);
  },

  async getTeam(teamId) {
    const response = await axiosClient.get(`/teams/${teamId}`);
    return normalizeTeam(unwrapData(response));
  },

  async createTeam(payload) {
    const response = await axiosClient.post('/teams', payload);
    return normalizeTeam(unwrapData(response));
  },

  async updateTeam(teamId, payload) {
    const response = await axiosClient.patch(`/teams/${teamId}`, payload);
    return normalizeTeam(unwrapData(response));
  },

  async deleteTeam(teamId) {
    const response = await axiosClient.delete(`/teams/${teamId}`);
    return unwrapData(response) || { teamId, deleted: true };
  },

  async restoreTeam(teamId) {
    const response = await axiosClient.patch(`/teams/${teamId}/restore`);
    return normalizeTeam(unwrapData(response));
  },

  async getMembers(teamId) {
    const response = await axiosClient.get(`/teams/${teamId}/members`);
    const data = unwrapData(response);
    return Array.isArray(data) ? data.map(normalizeMember) : [];
  },

  async listMembers(teamId) {
    return this.getMembers(teamId);
  },

  async addMember(teamId, payload) {
    const response = await axiosClient.post(
      `/teams/${teamId}/members`,
      payload
    );

    return normalizeMember(
      unwrapData(response) || {
        userId: payload.userId,
        role: payload.role || 'MEMBER',
      }
    );
  },

  async updateMember(teamId, userId, payload) {
    const response = await axiosClient.put(
      `/teams/${teamId}/members/${userId}`,
      payload
    );

    return normalizeMember(unwrapData(response));
  },

  async removeMember(teamId, userId) {
    const response = await axiosClient.delete(
      `/teams/${teamId}/members/${userId}`
    );

    return unwrapData(response) || {
      teamId,
      userId,
      removed: true,
    };
  },

  async assignLead(teamId, userId) {
    const response = await axiosClient.patch(
      `/teams/${teamId}/lead`,
      { userId }
    );

    return normalizeTeam(unwrapData(response));
  },
};

export default teamService;