import { useCallback, useEffect, useState } from "react";
import taskService from "../services/taskService";

// Local mirror of the mock reference data used by the backend until the real
// Users / Projects / Sprints modules are merged. Kept in sync with
// backend/src/modules/tasks/task.mockData.js.
export const MOCK_PROJECTS = [
  { id: "64a200000000000000000001", key: "ETMS", name: "Enterprise Task Management", status: "ACTIVE" },
  { id: "64a200000000000000000002", key: "PAY", name: "Payment Gateway", status: "ACTIVE" },
  { id: "64a200000000000000000003", key: "MOB", name: "Mobile App", status: "ACTIVE" },
];

export const MOCK_USERS = [
  { id: "64a100000000000000000001", firstName: "Ravi", lastName: "Kumar", fullName: "Ravi Kumar" },
  { id: "64a100000000000000000002", firstName: "Priya", lastName: "Rao", fullName: "Priya Rao" },
  { id: "64a100000000000000000003", firstName: "Sneha", lastName: "Reddy", fullName: "Sneha Reddy" },
  { id: "64a100000000000000000004", firstName: "Arjun", lastName: "Nair", fullName: "Arjun Nair" },
  { id: "64a100000000000000000005", firstName: "Kavya", lastName: "Iyer", fullName: "Kavya Iyer" },
];

export const MOCK_SPRINTS = [
  { id: "64a300000000000000000001", projectId: "64a200000000000000000001", name: "Sprint 1", status: "COMPLETED" },
  { id: "64a300000000000000000002", projectId: "64a200000000000000000001", name: "Sprint 2", status: "ACTIVE" },
];

export const MOCK_PROJECT_MEMBERS = {
  "64a200000000000000000001": MOCK_USERS,
  "64a200000000000000000002": [MOCK_USERS[0], MOCK_USERS[1], MOCK_USERS[3]],
  "64a200000000000000000003": [MOCK_USERS[2], MOCK_USERS[4]],
};

export const getProjectMembers = (projectId) => MOCK_PROJECT_MEMBERS[projectId] || [];

export const getProjectsForUser = (userId) => MOCK_PROJECTS;

const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [board, setBoard] = useState({});
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [boardLoading, setBoardLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, totalItems: 0, totalPages: 0 });

  const fetchTasks = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await taskService.listTasks(params);
      setTasks(result.data || []);
      setPagination(result.pagination || { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 });
      return result;
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load tasks.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBoard = useCallback(async (params = {}) => {
    setBoardLoading(true);
    setError(null);
    try {
      const result = await taskService.getBoard(params);
      setBoard(result || {});
      return result;
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load board.");
      return null;
    } finally {
      setBoardLoading(false);
    }
  }, []);

  const fetchLabels = useCallback(async (projectId, params = {}) => {
    try {
      const result = await taskService.listLabels(projectId, params);
      setLabels(result || []);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load labels.");
      return [];
    }
  }, []);

  const getTask = useCallback(async (taskId) => taskService.getTask(taskId), []);

  const createTask = useCallback(async (payload) => {
    const task = await taskService.createTask(payload);
    await fetchTasks();
    return task;
  }, [fetchTasks]);

  const updateTask = useCallback(async (taskId, payload) => {
    const task = await taskService.updateTask(taskId, payload);
    await fetchTasks();
    return task;
  }, [fetchTasks]);

  const removeTask = useCallback(async (taskId) => {
    const result = await taskService.deleteTask(taskId);
    await fetchTasks();
    return result;
  }, [fetchTasks]);

  const changeStatus = useCallback(async (taskId, status) => {
    const task = await taskService.changeStatus(taskId, status);
    await fetchTasks();
    return task;
  }, [fetchTasks]);

  const changePriority = useCallback(async (taskId, priority) => {
    const task = await taskService.changePriority(taskId, priority);
    await fetchTasks();
    return task;
  }, [fetchTasks]);

  const assignTask = useCallback(async (taskId, userId) => {
    const task = await taskService.assignTask(taskId, userId);
    await fetchTasks();
    return task;
  }, [fetchTasks]);

  const unassignTask = useCallback(async (taskId) => {
    const task = await taskService.unassignTask(taskId);
    await fetchTasks();
    return task;
  }, [fetchTasks]);

  const addLabel = useCallback(async (taskId, labelId) => {
    const result = await taskService.addLabelToTask(taskId, labelId);
    await fetchTasks();
    return result;
  }, [fetchTasks]);

  const removeLabel = useCallback(async (taskId, labelId) => {
    const result = await taskService.removeLabelFromTask(taskId, labelId);
    await fetchTasks();
    return result;
  }, [fetchTasks]);

  return {
    tasks,
    board,
    labels,
    loading,
    boardLoading,
    error,
    pagination,
    fetchTasks,
    fetchBoard,
    fetchLabels,
    getTask,
    createTask,
    updateTask,
    removeTask,
    changeStatus,
    changePriority,
    assignTask,
    unassignTask,
    addLabel,
    removeLabel,
  };
};

export default useTasks;
