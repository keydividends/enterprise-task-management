import axiosClient from '../../../api/axiosClient';

const mockTeams = [
  {
    id: 'team-platform',
    name: 'Platform Engineering',
    description: 'Core platform and tooling delivery',
    leadId: 'mock-admin',
    projectIds: ['project-1'],
    isActive: true,
    members: [
      { userId: 'mock-admin', role: 'LEAD' },
      { userId: 'mock-maya', role: 'MEMBER' },
    ],
    createdAt: '2025-01-15T09:00:00.000Z',
    updatedAt: '2025-01-15T09:00:00.000Z',
  },
];

const withFallback = async (request, fallback) => {
  try {
    const response = await request();
    return response.data.data;
  } catch (error) {
    return fallback(error);
  }
};

const teamService = {
  async listTeams(search = '') {
    return withFallback(
      () => axiosClient.get('/teams', { params: { search } }),
      () => ({
        items: mockTeams.filter((team) => !search || team.name.toLowerCase().includes(search.toLowerCase())),
        count: mockTeams.length,
      })
    );
  },

  async getTeam(teamId) {
    return withFallback(
      () => axiosClient.get(`/teams/${teamId}`),
      () => mockTeams.find((team) => team.id === teamId) || null
    );
  },

  async createTeam(payload) {
    return withFallback(
      () => axiosClient.post('/teams', payload),
      () => ({
        ...payload,
        id: `team-${Date.now()}`,
        isActive: true,
        members: [{ userId: payload.leadId || 'mock-admin', role: 'LEAD' }],
      })
    );
  },

  async updateTeam(teamId, payload) {
    return withFallback(
      () => axiosClient.patch(`/teams/${teamId}`, payload),
      () => ({ ...mockTeams.find((team) => team.id === teamId), ...payload })
    );
  },

  async deleteTeam(teamId) {
    return withFallback(
      () => axiosClient.delete(`/teams/${teamId}`),
      () => ({ teamId, deleted: true })
    );
  },

  async listMembers(teamId) {
    return withFallback(
      () => axiosClient.get(`/teams/${teamId}/members`),
      () => (mockTeams.find((team) => team.id === teamId)?.members || [])
    );
  },

  async addMember(teamId, payload) {
    return withFallback(
      () => axiosClient.post(`/teams/${teamId}/members`, payload),
      () => ({ userId: payload.userId, role: 'MEMBER' })
    );
  },

  async removeMember(teamId, userId) {
    return withFallback(
      () => axiosClient.delete(`/teams/${teamId}/members/${userId}`),
      () => ({ teamId, userId, removed: true })
    );
  },
};

export default teamService;
