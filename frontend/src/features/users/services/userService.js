import axiosClient from '../../../api/axiosClient';

export const userService = {
  async getUsers(params = {}) {
    const response = await axiosClient.get('/users', { params });
    return response.data;
  },

  async getUserById(userId) {
    const response = await axiosClient.get(`/users/${userId}`);
    return response.data;
  },

  async createUser(userData) {
    const response = await axiosClient.post('/users', userData);
    return response.data;
  },

  async updateUser(userId, userData) {
    const response = await axiosClient.put(`/users/${userId}`, userData);
    return response.data;
  },

  async updateUserStatus(userId, status) {
    const response = await axiosClient.patch(`/users/${userId}/status`, { status });
    return response.data;
  },

  async deactivateUser(userId) {
    const response = await axiosClient.patch(`/users/${userId}/deactivate`);
    return response.data;
  },

  async activateUser(userId) {
    const response = await axiosClient.patch(`/users/${userId}/activate`);
    return response.data;
  },

  async deleteUser(userId) {
    const response = await axiosClient.delete(`/users/${userId}`);
    return response.data;
  },

  async restoreUser(userId) {
    const response = await axiosClient.patch(`/users/${userId}/restore`);
    return response.data;
  },

  async searchUsers(query = '') {
    const response = await axiosClient.get('/users/search', { params: { q: query } });
    return response.data;
  },

  async getMyProfile() {
    const response = await axiosClient.get('/users/me/profile');
    return response.data;
  },

  async updateMyProfile(data) {
    const response = await axiosClient.put('/users/me/profile', data);
    return response.data;
  },

  async uploadAvatar(formData) {
    const response = await axiosClient.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getUserProjects(userId) {
    const response = await axiosClient.get(`/users/${userId}/projects`);
    return response.data;
  },

  async getUserTeams(userId) {
    const response = await axiosClient.get(`/users/${userId}/teams`);
    return response.data;
  },

  async getUserWorkload(userId) {
    const response = await axiosClient.get(`/users/${userId}/workload`);
    return response.data;
  },
};

export default userService;
