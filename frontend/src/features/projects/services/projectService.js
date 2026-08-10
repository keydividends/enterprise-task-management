import axiosClient from '../../../api/axiosClient';

const unwrapResponse = (response) => response?.data?.data ?? response?.data ?? response;

const projectService = {
  async getProjects(params = {}) {
    return unwrapResponse(await axiosClient.get('/projects', { params }));
  },

  async getProject(projectId) {
    return unwrapResponse(await axiosClient.get(`/projects/${projectId}`));
  },

  async createProject(payload) {
    return unwrapResponse(await axiosClient.post('/projects', payload));
  },

  async updateProject(projectId, payload) {
    return unwrapResponse(await axiosClient.patch(`/projects/${projectId}`, payload));
  },

  async deleteProject(projectId) {
    return unwrapResponse(await axiosClient.delete(`/projects/${projectId}`));
  },

  async listProjectMembers(projectId) {
    return unwrapResponse(await axiosClient.get(`/projects/${projectId}/members`));
  },

  async addProjectMember(projectId, payload) {
    return unwrapResponse(await axiosClient.post(`/projects/${projectId}/members`, payload));
  },

  async removeProjectMember(projectId, employeeId) {
    return unwrapResponse(await axiosClient.delete(`/projects/${projectId}/members/${encodeURIComponent(employeeId)}`));
  },

  async getProjectTaskSummary(projectId, params = {}) {
    return unwrapResponse(await axiosClient.get(`/projects/${projectId}/tasks/summary`, { params }));
  },
};

export default projectService;
