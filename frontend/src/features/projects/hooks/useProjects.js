import { useCallback, useEffect, useMemo, useState } from 'react';
import projectService from '../services/projectService';

const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, totalItems: 0, totalPages: 0 });

  const fetchProjects = useCallback(async (search = '') => {
    setLoading(true);
    try {
      const result = await projectService.getProjects({ search });
      setProjects(result.items || []);
      setPagination(result.pagination || { page: 1, pageSize: 20, totalItems: result.items?.length || 0, totalPages: 1 });
      setError(null);
      return result;
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to load projects.');
      return { items: [], pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 } };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects('');
  }, [fetchProjects]);

  const createProject = useCallback(async (payload) => {
    try {
      const project = await projectService.createProject(payload);
      setProjects((current) => [project, ...current]);
      setError(null);
      return project;
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Unable to create project.';
      setError(message);
      throw err;
    }
  }, []);

  const updateProject = useCallback(async (projectId, payload) => {
    try {
      const project = await projectService.updateProject(projectId, payload);
      setProjects((current) => current.map((item) => (item.id === projectId ? project : item)));
      setError(null);
      return project;
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Unable to update project.';
      setError(message);
      throw err;
    }
  }, []);

  const deleteProject = useCallback(async (projectId) => {
    try {
      const result = await projectService.deleteProject(projectId);
      setProjects((current) => current.filter((item) => item.id !== projectId));
      setError(null);
      return result;
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Unable to delete project.';
      setError(message);
      throw err;
    }
  }, []);

  const refresh = useCallback(async (search = '') => fetchProjects(search), [fetchProjects]);

  return useMemo(() => ({ projects, loading, error, pagination, fetchProjects, refresh, createProject, updateProject, deleteProject }), [projects, loading, error, pagination, fetchProjects, refresh, createProject, updateProject, deleteProject]);
};

export default useProjects;
