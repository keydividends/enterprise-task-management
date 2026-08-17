import axiosClient from '../../../api/axiosClient';

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

const dashboardService = {
  getSummary: (params = {}) => axiosClient.get('/dashboard/summary', { params }).then(unwrap),
  getStatus: (params = {}) => axiosClient.get('/dashboard/tasks-by-status', { params }).then(unwrap),
  getPriority: (params = {}) => axiosClient.get('/dashboard/tasks-by-priority', { params }).then(unwrap),
  getProjectProgress: (params = {}) => axiosClient.get('/dashboard/project-progress', { params }).then(unwrap),
  getWorkload: (params = {}) => axiosClient.get('/dashboard/team-workload', { params }).then(unwrap),
  getDeadlines: (params = {}) => axiosClient.get('/dashboard/upcoming-deadlines', { params }).then(unwrap),
  getActivity: (params = {}) => axiosClient.get('/dashboard/recent-activity', { params }).then(unwrap),
  getWidgets: () => axiosClient.get('/dashboard/widgets').then(unwrap),
  saveWidgets: (widgets) => axiosClient.put('/dashboard/widgets', { widgets }).then(unwrap),
};

export default dashboardService;