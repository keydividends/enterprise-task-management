import { useCallback, useState } from "react";
import taskService from "../services/taskService";
import projectService from "../../projects/services/projectService";
import axiosClient from "../../../api/axiosClient";

// Fallback mock data — used only when the real API is unavailable.
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
  "64a200000000000000000002": [MOCK_USERS[0], MOCK_USERS[1], MOCK_USERS[2]],
  "64a200000000000000000003": [MOCK_USERS[0], MOCK_USERS[1]],
};

// getUserName: resolves a userId to a display name.
// Falls back to mock data when the real user list is not loaded.
export const getUserName = (userId, userList = []) => {
  if (!userId) return "Unassigned";
  const fromList = userList.find((u) => (u.id || u._id) === userId);
  if (fromList) return fromList.fullName || `${fromList.firstName} ${fromList.lastName}`;
  const mock = MOCK_USERS.find((u) => u.id === userId);
  return mock ? mock.fullName : userId;
};

export const getProjectMembers = (projectId) => MOCK_PROJECT_MEMBERS[projectId] || [];

// fetchProjects — calls the real projects API, falls back to mock list.
export const fetchProjects = async () => {
  try {
    const result = await projectService.getProjects({ pageSize: 100 });
    const items = result?.items || result?.data?.items || [];
    return items.length ? items.map((p) => ({ id: p.id || p._id, key: p.key, name: p.name, status: p.status })) : MOCK_PROJECTS;
  } catch {
    return MOCK_PROJECTS;
  }
};

// fetchProjectMembers — calls the real project-members API. The API supplies
// both the member's userId (needed for assignment) and display details, so a
// second users request is unnecessary and can no longer hide valid members.
export const fetchProjectMembers = async (projectId) => {
  if (!projectId) return [];
  try {
    const { data } = await axiosClient.get(`/projects/${projectId}/members`);
    const items = data?.data?.items || data?.data || data?.items || [];
    if (Array.isArray(items)) {
      return items
        .map((member) => {
          const userId = member.userId?._id || member.userId?.id || member.userId;
          const fullName = member.userName || member.displayName || member.fullName
            || [member.firstName, member.lastName].filter(Boolean).join(' ')
            || member.email || member.employeeId;
          return userId && fullName ? { id: String(userId), fullName } : null;
        })
        .filter(Boolean);
    }
  } catch { /* fall through */ }
  return MOCK_PROJECT_MEMBERS[projectId] || [];
};

// fetchProjectSprints — sprint module not yet available; returns mock sprints
// for known mock project IDs and an empty list for real projects.
// When a sprint module is merged and registers GET /projects/:id/sprints,
// uncomment the API call below and it will auto-activate.
export const fetchProjectSprints = async (projectId) => {
  if (!projectId) return [];
  // Uncomment when sprint module is available:
  // try {
  //   const { data } = await axiosClient.get(`/projects/${projectId}/sprints`);
  //   const items = data?.data?.items || data?.data || data?.items || [];
  //   if (items.length) return items.map((s) => ({ id: s.id || s._id, name: s.name, status: s.status, projectId }));
  // } catch { /* fall through */ }
  return MOCK_SPRINTS.filter((s) => s.projectId === projectId);
};

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
      // Backend filter field is primaryAssigneeId; frontend filter uses assigneeId for UX.
      const normalized = { ...params };
      if (normalized.assigneeId) {
        normalized.primaryAssigneeId = normalized.assigneeId;
        delete normalized.assigneeId;
      }
      const result = await taskService.listTasks(normalized);
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
