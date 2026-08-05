import axiosClient from '../../../api/axiosClient';

const fallbackProjects = [
  {
    id: '64a200000000000000000001',
    key: 'ETMS',
    name: 'Enterprise Task Management',
    description: 'Internal delivery and reporting platform',
    status: 'ACTIVE',
    priority: 'HIGH',
    projectManagerId: 'user_admin_1',
    startDate: '2026-08-01',
    targetEndDate: '2026-12-31',
    createdAt: '2026-07-01T08:00:00.000Z',
    updatedAt: '2026-07-15T08:00:00.000Z',
  },
  {
    id: '64a200000000000000000002',
    key: 'PAY',
    name: 'Payment Gateway',
    description: 'Payments and wallet integration',
    status: 'PLANNING',
    priority: 'MEDIUM',
    projectManagerId: 'user_demo_1',
    startDate: '2026-09-01',
    targetEndDate: '2027-02-28',
    createdAt: '2026-07-10T08:00:00.000Z',
    updatedAt: '2026-07-10T08:00:00.000Z',
  },
];

const withFallback = async (request, fallback) => {
  try {
    const response = await request();
    return response?.data?.data ?? response?.data ?? response;
  } catch (error) {
    return fallback(error);
  }
};

const projectService = {
  async getProjects(params = {}) {
    return withFallback(
      () => axiosClient.get('/projects', { params }),
      () => ({ items: fallbackProjects, pagination: { page: 1, pageSize: fallbackProjects.length, totalItems: fallbackProjects.length, totalPages: 1 } })
    );
  },

  async getProject(projectId) {
    return withFallback(
      () => axiosClient.get(`/projects/${projectId}`),
      () => fallbackProjects.find((project) => project.id === projectId) || null
    );
  },

  async createProject(payload) {
    return withFallback(
      () => axiosClient.post('/projects', payload),
      () => ({ ...payload, id: `proj-${Date.now()}`, status: payload.status || 'PLANNING' })
    );
  },

  async updateProject(projectId, payload) {
    return withFallback(
      () => axiosClient.patch(`/projects/${projectId}`, payload),
      () => ({ ...fallbackProjects.find((project) => project.id === projectId), ...payload })
    );
  },

  async deleteProject(projectId) {
    return withFallback(
      () => axiosClient.delete(`/projects/${projectId}`),
      () => ({ id: projectId, deleted: true })
    );
  },

  async listProjectMembers(projectId) {
    return withFallback(
      () => axiosClient.get(`/projects/${projectId}/members`),
      () => [
        { id: 'member-1', projectId, userId: 'user_admin_1', projectRole: 'PROJECT_MANAGER', status: 'ACTIVE' },
        { id: 'member-2', projectId, userId: 'user_demo_1', projectRole: 'DEVELOPER', status: 'ACTIVE' },
      ]
    );
  },

  async addProjectMember(projectId, payload) {
    return withFallback(
      () => axiosClient.post(`/projects/${projectId}/members`, payload),
      () => ({ id: `member-${Date.now()}`, projectId, ...payload, status: 'ACTIVE' })
    );
  },

  async removeProjectMember(projectId, userId) {
    return withFallback(
      () => axiosClient.delete(`/projects/${projectId}/members/${userId}`),
      () => ({ projectId, userId, removed: true })
    );
  },

  async getProjectTaskSummary(projectId) {
    return withFallback(
      () => axiosClient.get(`/projects/${projectId}/tasks/summary`),
      () => ({ TODO: 12, IN_PROGRESS: 8, REVIEW: 2, DONE: 22 })
    );
  },
};

export default projectService;
