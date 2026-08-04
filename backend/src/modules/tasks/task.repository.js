const { Task, TaskAssignment, Label, TaskLabel, Checklist, ChecklistItem, TaskHistory } = require("./task.model");

// ── Task ──────────────────────────────────────────────────────────────────────

const getNextTaskNumber = async (projectId) => {
  const last = await Task.findOne({ projectId }).sort({ taskNumber: -1 }).select("taskNumber").lean();
  return last ? last.taskNumber + 1 : 1;
};

const createTask = (data) => Task.create(data);

const findTaskById = (taskId, workspaceId) =>
  Task.findOne({ _id: taskId, workspaceId, isDeleted: false });

const findTasks = (filter, { skip = 0, limit = 20, sort = { createdAt: -1 } } = {}) =>
  Task.find({ ...filter, isDeleted: false }).sort(sort).skip(skip).limit(limit).lean();

const countTasks = (filter) => Task.countDocuments({ ...filter, isDeleted: false });

const updateTask = (taskId, workspaceId, update) =>
  Task.findOneAndUpdate(
    { _id: taskId, workspaceId, isDeleted: false },
    { ...update },
    { new: true, runValidators: true }
  );

const softDeleteTask = (taskId, workspaceId, deletedBy) =>
  Task.findOneAndUpdate(
    { _id: taskId, workspaceId, isDeleted: false },
    { isDeleted: true, deletedAt: new Date(), deletedBy },
    { new: true }
  );

const restoreTask = (taskId, workspaceId) =>
  Task.findOneAndUpdate(
    { _id: taskId, workspaceId, isDeleted: true },
    { isDeleted: false, deletedAt: null, deletedBy: null },
    { new: true }
  );

const findBoardTasks = (projectId, workspaceId, extraFilter = {}) =>
  Task.find({ projectId, workspaceId, isDeleted: false, ...extraFilter })
    .sort({ position: 1, createdAt: -1 })
    .lean();

// ── Task Assignment ───────────────────────────────────────────────────────────

const createAssignment = (data) => TaskAssignment.create(data);

const findActiveAssignment = (taskId, userId) =>
  TaskAssignment.findOne({ taskId, userId, status: "ACTIVE" });

const findAssignmentsByTask = (taskId) =>
  TaskAssignment.find({ taskId, status: "ACTIVE" }).lean();

const removeAssignment = (assignmentId) =>
  TaskAssignment.findByIdAndUpdate(assignmentId, { status: "REMOVED", unassignedAt: new Date() }, { new: true });

// ── Label ─────────────────────────────────────────────────────────────────────

const createLabel = (data) => Label.create(data);

const findLabelsByProject = (projectId, search) => {
  const filter = { projectId, isDeleted: false };
  if (search) filter.name = { $regex: search, $options: "i" };
  return Label.find(filter).lean();
};

const findLabelById = (labelId, projectId) =>
  Label.findOne({ _id: labelId, projectId, isDeleted: false });

// ── Task Label ────────────────────────────────────────────────────────────────

const addLabelToTask = (data) => TaskLabel.create(data);

const findTaskLabel = (taskId, labelId) => TaskLabel.findOne({ taskId, labelId });

const removeLabelFromTask = (taskId, labelId) => TaskLabel.findOneAndDelete({ taskId, labelId });

const findLabelsByTask = (taskId) =>
  TaskLabel.find({ taskId }).populate("labelId").lean();

const findTaskIdsByLabel = (labelId) => TaskLabel.find({ labelId }).distinct("taskId");

const findLabelsByTaskIds = (taskIds) =>
  TaskLabel.find({ taskId: { $in: taskIds } })
    .populate("labelId")
    .lean()
    .then((rows) =>
      rows.reduce((acc, row) => {
        if (!row.labelId) return acc;
        const key = String(row.taskId);
        if (!acc[key]) acc[key] = [];
        acc[key].push(row.labelId);
        return acc;
      }, {})
    );

// ── Checklist ─────────────────────────────────────────────────────────────────

const createChecklist = (data) => Checklist.create(data);

const findChecklistsByTask = (taskId) =>
  Checklist.find({ taskId, isDeleted: false }).sort({ position: 1 }).lean();

const findChecklistById = (checklistId) =>
  Checklist.findOne({ _id: checklistId, isDeleted: false });

const getNextChecklistPosition = async (taskId) => {
  const last = await Checklist.findOne({ taskId, isDeleted: false }).sort({ position: -1 }).select("position").lean();
  return last ? last.position + 1 : 0;
};

const updateChecklist = (checklistId, update) =>
  Checklist.findOneAndUpdate({ _id: checklistId, isDeleted: false }, update, { new: true });

const softDeleteChecklist = (checklistId) =>
  Checklist.findOneAndUpdate({ _id: checklistId, isDeleted: false }, { isDeleted: true, deletedAt: new Date() }, { new: true });

// ── Checklist Item ────────────────────────────────────────────────────────────

const createChecklistItem = (data) => ChecklistItem.create(data);

const findItemsByChecklist = (checklistId) =>
  ChecklistItem.find({ checklistId, isDeleted: false }).sort({ position: 1 }).lean();

const findChecklistItemById = (itemId, checklistId) =>
  ChecklistItem.findOne({ _id: itemId, checklistId, isDeleted: false });

const getNextChecklistItemPosition = async (checklistId) => {
  const last = await ChecklistItem.findOne({ checklistId, isDeleted: false }).sort({ position: -1 }).select("position").lean();
  return last ? last.position + 1 : 0;
};

const updateChecklistItem = (itemId, checklistId, update) =>
  ChecklistItem.findOneAndUpdate(
    { _id: itemId, checklistId, isDeleted: false },
    update,
    { new: true }
  );

const softDeleteChecklistItem = (itemId, checklistId) =>
  ChecklistItem.findOneAndUpdate(
    { _id: itemId, checklistId, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );

// ── Task History ──────────────────────────────────────────────────────────────

const recordHistory = (data) => TaskHistory.create(data);

const findHistoryByTask = (taskId, { skip = 0, limit = 20 } = {}) =>
  TaskHistory.find({ taskId }).sort({ changedAt: -1 }).skip(skip).limit(limit).lean();

module.exports = {
  getNextTaskNumber,
  createTask,
  findTaskById,
  findTasks,
  countTasks,
  updateTask,
  softDeleteTask,
  restoreTask,
  findBoardTasks,
  createAssignment,
  findActiveAssignment,
  findAssignmentsByTask,
  removeAssignment,
  createLabel,
  findLabelsByProject,
  findLabelById,
  addLabelToTask,
  findTaskLabel,
  removeLabelFromTask,
  findLabelsByTask,
  findTaskIdsByLabel,
  findLabelsByTaskIds,
  createChecklist,
  findChecklistsByTask,
  findChecklistById,
  getNextChecklistPosition,
  updateChecklist,
  softDeleteChecklist,
  createChecklistItem,
  findItemsByChecklist,
  findChecklistItemById,
  getNextChecklistItemPosition,
  updateChecklistItem,
  softDeleteChecklistItem,
  recordHistory,
  findHistoryByTask,
};
