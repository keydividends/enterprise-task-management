import axiosClient from "../../../api/axiosClient";

// ---- Tasks -------------------------------------------------------------------

const listTasks = async (params = {}) => {
  const { data } = await axiosClient.get("/tasks", { params });
  return data; // { data: [...], pagination }
};

const getTask = async (taskId) => {
  const { data } = await axiosClient.get(`/tasks/${taskId}`);
  return data.data; // task detail incl. labels, assignments, checklists, history
};

const createTask = async (payload) => {
  const { data } = await axiosClient.post("/tasks", payload);
  return data.data; // task
};

const updateTask = async (taskId, payload) => {
  const { data } = await axiosClient.put(`/tasks/${taskId}`, payload);
  return data.data; // task
};

const deleteTask = async (taskId) => {
  const { data } = await axiosClient.delete(`/tasks/${taskId}`);
  return data.data;
};

const restoreTask = async (taskId) => {
  const { data } = await axiosClient.patch(`/tasks/${taskId}/restore`);
  return data.data;
};

const changeStatus = async (taskId, status) => {
  const { data } = await axiosClient.patch(`/tasks/${taskId}/status`, { status });
  return data.data;
};

const changePriority = async (taskId, priority) => {
  const { data } = await axiosClient.patch(`/tasks/${taskId}/priority`, { priority });
  return data.data;
};

const assignTask = async (taskId, userId) => {
  const { data } = await axiosClient.patch(`/tasks/${taskId}/assignee`, { userId });
  return data.data;
};

const unassignTask = async (taskId) => {
  const { data } = await axiosClient.delete(`/tasks/${taskId}/assignee`);
  return data.data;
};

const getBoard = async (params = {}) => {
  const { data } = await axiosClient.get("/tasks/board", { params });
  return data.data; // { BACKLOG: [...], TODO: [...], ... }
};

const getHistory = async (taskId, params = {}) => {
  const { data } = await axiosClient.get(`/tasks/${taskId}/history`, { params });
  return data.data;
};

// ---- Labels ------------------------------------------------------------------

const listLabels = async (projectId, params = {}) => {
  const { data } = await axiosClient.get(`/projects/${projectId}/labels`, { params });
  return data.data;
};

const createLabel = async (projectId, payload) => {
  const { data } = await axiosClient.post(`/projects/${projectId}/labels`, payload);
  return data.data;
};

const addLabelToTask = async (taskId, labelId) => {
  const { data } = await axiosClient.post(`/tasks/${taskId}/labels`, { labelId });
  return data.data;
};

const removeLabelFromTask = async (taskId, labelId) => {
  const { data } = await axiosClient.delete(`/tasks/${taskId}/labels/${labelId}`);
  return data.data;
};

// ---- Checklists --------------------------------------------------------------

const createChecklist = async (taskId, title) => {
  const { data } = await axiosClient.post(`/tasks/${taskId}/checklists`, { title });
  return data.data;
};

const listChecklists = async (taskId) => {
  const { data } = await axiosClient.get(`/tasks/${taskId}/checklists`);
  return data.data;
};

const addChecklistItem = async (checklistId, payload) => {
  const { data } = await axiosClient.post(`/checklists/${checklistId}/items`, payload);
  return data.data;
};

const updateChecklistItem = async (checklistId, itemId, payload) => {
  const { data } = await axiosClient.put(`/checklists/${checklistId}/items/${itemId}`, payload);
  return data.data;
};

const completeChecklistItem = async (checklistId, itemId) => {
  const { data } = await axiosClient.patch(`/checklists/${checklistId}/items/${itemId}/complete`);
  return data.data;
};

const deleteChecklistItem = async (checklistId, itemId) => {
  const { data } = await axiosClient.delete(`/checklists/${checklistId}/items/${itemId}`);
  return data.data;
};

const taskService = {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  restoreTask,
  changeStatus,
  changePriority,
  assignTask,
  unassignTask,
  getBoard,
  getHistory,
  listLabels,
  createLabel,
  addLabelToTask,
  removeLabelFromTask,
  createChecklist,
  listChecklists,
  addChecklistItem,
  updateChecklistItem,
  completeChecklistItem,
  deleteChecklistItem,
};

export default taskService;
