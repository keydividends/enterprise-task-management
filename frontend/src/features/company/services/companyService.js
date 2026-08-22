import axiosClient from '../../../api/axiosClient';

const companyService = {
  async registerCompany(payload) {
    const response = await axiosClient.post('/companies', payload);
    return response.data;
  },

  async searchCompanies(query = '') {
    const response = await axiosClient.get(`/companies/search?query=${encodeURIComponent(query)}`);
    return response.data.data;
  },

  async getCompanyById(companyId) {
    const response = await axiosClient.get(`/companies/${companyId}`);
    return response.data.data;
  },
};

export default companyService;
