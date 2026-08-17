import { useCallback, useEffect, useState } from 'react';
import dashboardService from '../services/dashboardService';

const useDashboard = (params = {}) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        dashboardService.getSummary(params),
        dashboardService.getMyWork(params),
        dashboardService.getStatus(params),
        dashboardService.getPriority(params),
        dashboardService.getProjectProgress({ ...params, limit: 5 }),
        dashboardService.getWorkload(params),
        dashboardService.getDeadlines({ ...params, days: 7, limit: 5 }),
        dashboardService.getActivity({ ...params, limit: 5 }),
      ]);
      const val = (index, fallback) => (results[index].status === 'fulfilled' && results[index].value ? results[index].value : fallback);
      setData({
        summary: val(0, { totalProjects: 0, totalTasks: 0, pendingTasks: 0, completedTasks: 0, overdueTasks: 0 }),
        myWork: val(1, { assigned: 0, inProgress: 0, completed: 0, dueSoon: 0, overdue: 0 }),
        status: val(2, []),
        priority: val(3, []),
        projectProgress: val(4, []),
        workload: val(5, []),
        deadlines: val(6, []),
        activity: val(7, []),
      });
      setError(null);
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, [params]);

  // The initial request is the hook's external-data subscription point.
  useEffect(() => {
    load();
  }, [load]);

  return { data, error, loading, refresh: load };
};

export default useDashboard;