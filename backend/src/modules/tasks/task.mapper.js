const mapTask = (task) => ({
  id: task._id?.toString() || task.id,
  taskKey: task.taskKey,
  taskNumber: task.taskNumber,
  title: task.title,
  description: task.description,
  type: task.type,
  status: task.status,
  priority: task.priority,
  projectId: task.projectId?.toString?.() ?? task.projectId,
  workspaceId: task.workspaceId?.toString?.() ?? task.workspaceId,
  sprintId: task.sprintId?.toString?.() ?? task.sprintId ?? null,
  epicId: task.epicId?.toString?.() ?? task.epicId ?? null,
  parentTaskId: task.parentTaskId?.toString?.() ?? task.parentTaskId ?? null,
  reporterId: task.reporterId?.toString?.() ?? task.reporterId,
  primaryAssigneeId: task.primaryAssigneeId?.toString?.() ?? task.primaryAssigneeId ?? null,
  storyPoints: task.storyPoints ?? null,
  startDate: task.startDate ?? null,
  dueDate: task.dueDate ?? null,
  completedAt: task.completedAt ?? null,
  position: task.position,
  createdBy: task.createdBy?.toString?.() ?? task.createdBy,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});

const mapLabel = (label) => ({
  id: label._id?.toString() || label.id,
  name: label.name,
  color: label.color,
  description: label.description,
  projectId: label.projectId?.toString?.() ?? label.projectId,
  createdAt: label.createdAt,
});

const mapChecklist = (checklist, items = []) => ({
  id: checklist._id?.toString() || checklist.id,
  taskId: checklist.taskId?.toString?.() ?? checklist.taskId,
  title: checklist.title,
  position: checklist.position,
  items: items.map(mapChecklistItem),
  createdAt: checklist.createdAt,
});

const mapChecklistItem = (item) => ({
  id: item._id?.toString() || item.id,
  checklistId: item.checklistId?.toString?.() ?? item.checklistId,
  text: item.text,
  isCompleted: item.isCompleted,
  completedAt: item.completedAt ?? null,
  assigneeId: item.assigneeId?.toString?.() ?? item.assigneeId ?? null,
  dueDate: item.dueDate ?? null,
  position: item.position,
});

const mapHistory = (entry) => ({
  id: entry._id?.toString() || entry.id,
  taskId: entry.taskId?.toString?.() ?? entry.taskId,
  changedBy: entry.changedBy?.toString?.() ?? entry.changedBy,
  field: entry.field,
  oldValue: entry.oldValue,
  newValue: entry.newValue,
  changedAt: entry.changedAt,
});

module.exports = { mapTask, mapLabel, mapChecklist, mapChecklistItem, mapHistory };
