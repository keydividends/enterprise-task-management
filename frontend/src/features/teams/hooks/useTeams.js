import { useCallback, useEffect, useMemo, useState } from 'react';
import teamService from '../services/teamService';

const useTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 1,
  });

  const fetchTeams = useCallback(async (search = '', page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const result = await teamService.getTeams(search, page, pageSize);
      const nextTeams = Array.isArray(result?.items) ? result.items : [];
      setTeams(nextTeams);
      setPagination({
        page: result?.pagination?.page ?? page,
        pageSize: result?.pagination?.pageSize ?? pageSize,
        totalItems: result?.pagination?.totalItems ?? nextTeams.length,
        totalPages: result?.pagination?.totalPages ?? 1,
      });
      setError(null);
      return result;
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to load teams.';
      setError(message);
      return { items: [], pagination: {} };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams('', 1, 20);
  }, [fetchTeams]);

  const createTeam = useCallback(async (payload) => {
    try {
      const team = await teamService.createTeam(payload);
      setTeams((current) => [team, ...current]);
      setError(null);
      return team;
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to create the team.';
      setError(message);
      throw err;
    }
  }, []);

  const updateTeam = useCallback(async (teamId, payload) => {
    try {
      const team = await teamService.updateTeam(teamId, payload);
      setTeams((current) => current.map((entry) => (entry.id === teamId ? team : entry)));
      setError(null);
      return team;
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to update the team.';
      setError(message);
      throw err;
    }
  }, []);

  const deleteTeam = useCallback(async (teamId) => {
    try {
      const result = await teamService.deleteTeam(teamId);
      setTeams((current) => current.filter((entry) => entry.id !== teamId));
      setError(null);
      return result;
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to delete the team.';
      setError(message);
      throw err;
    }
  }, []);

  const refresh = useCallback(async (search = '', page = 1, pageSize = 20) => fetchTeams(search, page, pageSize), [fetchTeams]);

  return useMemo(() => ({
    teams,
    loading,
    error,
    pagination,
    fetchTeams,
    refresh,
    createTeam,
    updateTeam,
    deleteTeam,
  }), [teams, loading, error, pagination, fetchTeams, refresh, createTeam, updateTeam, deleteTeam]);
};

export default useTeams;
