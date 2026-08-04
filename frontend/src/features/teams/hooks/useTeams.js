import { useCallback, useEffect, useMemo, useState } from 'react';
import teamService from '../services/teamService';

const useTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTeams = useCallback(async (search = '') => {
    setLoading(true);
    try {
      const result = await teamService.listTeams(search);
      setTeams(result.items || []);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load teams.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams('');
  }, [fetchTeams]);

  const createTeam = useCallback(async (payload) => {
    const team = await teamService.createTeam(payload);
    setTeams((current) => [team, ...current]);
    return team;
  }, []);

  const refreshTeam = useCallback(async (teamId) => {
    const team = await teamService.getTeam(teamId);
    setTeams((current) => current.map((entry) => (entry.id === teamId ? team : entry)));
    return team;
  }, []);

  return useMemo(() => ({
    teams,
    loading,
    error,
    fetchTeams,
    createTeam,
    refreshTeam,
  }), [teams, loading, error, fetchTeams, createTeam, refreshTeam]);
};

export default useTeams;
