import axiosClient from '../../../api/axiosClient';

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

const reportService = {
  projectProgress: (params = {}) => axiosClient.get('/reports/projects/progress', { params }).then(unwrap),
  taskStatus: (params = {}) => axiosClient.get('/reports/tasks/status', { params }).then(unwrap),
  overdueTasks: (params = {}) => axiosClient.get('/reports/tasks/overdue', { params }).then(unwrap),
  teamWorkload: (params = {}) => axiosClient.get('/reports/teams/workload', { params }).then(unwrap),
};

export default reportService;