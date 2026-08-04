const taskService = require("./task.service");

const getUserContext = (req) => ({
  userId: req.user?.id,
  user: req.user,
  workspaceId: req.user?.workspaceId || null,
});

const sendJson = (res, statusCode, message, data, pagination) => {
  const body = { success: true };
  if (message) body.message = message;
  if (data !== undefined) body.data = data;
  if (pagination) body.pagination = pagination;
  return res.status(statusCode).json(body);
};

// --- Task CRUD ---------------------------------------------------------------

const listTasks = async (req, res, next) => {
  try {
    const result = await taskService.listTasks(req.query, getUserContext(req));
    const { items, pagination } = result;
    return sendJson(res, 200, null, items, pagination);
  } catch (error) {
    next(error);
  }
};

const getTask = async (req, res, next) => {
  try {
    const task = await taskService.getTaskDetail(req.params.taskId, getUserContext(req));
    return sendJson(res, 200, null, task);
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const result = await taskService.createTask(req.body, getUserContext(req));
    return sendJson(res, 201, "Task created", result.task);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(req.params.taskId, req.body, getUserContext(req));
    return sendJson(res, 200, "Task updated", task);
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const result = await taskService.deleteTask(req.params.taskId, getUserContext(req));
    return sendJson(res, 200, "Task deleted", result);
  } catch (error) {
    next(error);
  }
};

const restoreTask = async (req, res, next) => {
  try {
    const task = await taskService.restoreTask(req.params.taskId, getUserContext(req));
    return sendJson(res, 200, "Task restored", task);
  } catch (error) {
    next(error);
  }
};

// --- Status / priority / assignment ------------------------------------------

const changeStatus = async (req, res, next) => {
  try {
    const task = await taskService.changeStatus(req.params.taskId, req.body, getUserContext(req));
    return sendJson(res, 200, "Task status changed", task);
  } catch (error) {
    next(error);
  }
};

const changePriority = async (req, res, next) => {
  try {
    const task = await taskService.changePriority(req.params.taskId, req.body, getUserContext(req));
    return sendJson(res, 200, "Task priority changed", task);
  } catch (error) {
    next(error);
  }
};

const assignTask = async (req, res, next) => {
  try {
    const task = await taskService.assignTask(req.params.taskId, req.body, getUserContext(req));
    return sendJson(res, 200, "Task assigned", task);
  } catch (error) {
    next(error);
  }
};

const unassignTask = async (req, res, next) => {
  try {
    const task = await taskService.unassignTask(req.params.taskId, getUserContext(req));
    return sendJson(res, 200, "Task unassigned", task);
  } catch (error) {
    next(error);
  }
};

// --- Board -------------------------------------------------------------------

const getBoard = async (req, res, next) => {
  try {
    const board = await taskService.getBoard(req.query, getUserContext(req));
    return sendJson(res, 200, null, board);
  } catch (error) {
    next(error);
  }
};

// --- Labels ------------------------------------------------------------------

const listLabels = async (req, res, next) => {
  try {
    const labels = await taskService.listLabels(req.params.projectId, req.query, getUserContext(req));
    return sendJson(res, 200, null, labels);
  } catch (error) {
    next(error);
  }
};

const createLabel = async (req, res, next) => {
  try {
    const label = await taskService.createLabel(req.params.projectId, req.body, getUserContext(req));
    return sendJson(res, 201, "Label created", label);
  } catch (error) {
    next(error);
  }
};

const addLabelToTask = async (req, res, next) => {
  try {
    const result = await taskService.addLabelToTask(req.params.taskId, req.body, getUserContext(req));
    return sendJson(res, 200, "Label added", result);
  } catch (error) {
    next(error);
  }
};

const removeLabelFromTask = async (req, res, next) => {
  try {
    const result = await taskService.removeLabelFromTask(req.params.taskId, req.params.labelId, getUserContext(req));
    return sendJson(res, 200, "Label removed", result);
  } catch (error) {
    next(error);
  }
};

// --- Checklists ---------------------------------------------------------------

const createChecklist = async (req, res, next) => {
  try {
    const checklist = await taskService.createChecklist(req.params.taskId, req.body, getUserContext(req));
    return sendJson(res, 201, "Checklist created", checklist);
  } catch (error) {
    next(error);
  }
};

const listChecklists = async (req, res, next) => {
  try {
    const checklists = await taskService.listChecklists(req.params.taskId, getUserContext(req));
    return sendJson(res, 200, null, checklists);
  } catch (error) {
    next(error);
  }
};

const addChecklistItem = async (req, res, next) => {
  try {
    const item = await taskService.addChecklistItem(req.params.checklistId, req.body, getUserContext(req));
    return sendJson(res, 201, "Checklist item added", item);
  } catch (error) {
    next(error);
  }
};

const updateChecklistItem = async (req, res, next) => {
  try {
    const item = await taskService.updateChecklistItem(req.params.checklistId, req.params.itemId, req.body, getUserContext(req));
    return sendJson(res, 200, "Checklist item updated", item);
  } catch (error) {
    next(error);
  }
};

const completeChecklistItem = async (req, res, next) => {
  try {
    const item = await taskService.completeChecklistItem(req.params.checklistId, req.params.itemId, getUserContext(req));
    return sendJson(res, 200, "Checklist item updated", item);
  } catch (error) {
    next(error);
  }
};

const deleteChecklistItem = async (req, res, next) => {
  try {
    const result = await taskService.deleteChecklistItem(req.params.checklistId, req.params.itemId, getUserContext(req));
    return sendJson(res, 200, "Checklist item deleted", result);
  } catch (error) {
    next(error);
  }
};

// --- History -----------------------------------------------------------------

const getHistory = async (req, res, next) => {
  try {
    const history = await taskService.getHistory(req.params.taskId, getUserContext(req));
    return sendJson(res, 200, null, history);
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
  getHistory,
};
