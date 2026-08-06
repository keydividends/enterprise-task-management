import axiosClient from '../../../api/axiosClient';

const authService = {
  async register(payload) {
    const response = await axiosClient.post('/auth/register', payload);
    return response.data.data;
  },

  async login(credentials) {
    const response = await axiosClient.post('/auth/login', credentials);
    return response.data.data;
  },

  async googleLogin(payload) {
    const response = await axiosClient.post('/auth/google', payload);
    return response.data.data;
  },

  async microsoftLogin(payload) {
    const response = await axiosClient.post('/auth/microsoft', payload);
    return response.data.data;
  },

  async forgotPassword(email) {
    const response = await axiosClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(payload) {
    const response = await axiosClient.post('/auth/reset-password', payload);
    return response.data;
  },

  async getCurrentUser() {
    const response = await axiosClient.get('/auth/me');
    return response.data.data;
  },

  async logout() {
    const response = await axiosClient.post('/auth/logout');
    return response.data;
  },
};

export default authService;
