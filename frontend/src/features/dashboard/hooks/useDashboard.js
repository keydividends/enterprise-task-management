import { useCallback, useEffect, useState } from 'react';
import dashboardService from '../services/dashboardService';

const useDashboard = (params = {}) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [summary, status, priority, projectProgress, workload, deadlines, activity] = await Promise.all([
        dashboardService.getSummary(params),
        dashboardService.getStatus(params),
        dashboardService.getPriority(params),
        dashboardService.getProjectProgress({ ...params, limit: 5 }),
        dashboardService.getWorkload(params),
        dashboardService.getDeadlines({ ...params, days: 7, limit: 5 }),
        dashboardService.getActivity({ ...params, limit: 5 }),
      ]);
      setData({ summary, status, priority, projectProgress, workload, deadlines, activity });
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