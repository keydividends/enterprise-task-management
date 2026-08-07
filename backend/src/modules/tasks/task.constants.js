const { TASK_STATUSES, TASK_PRIORITIES, TASK_TYPES } = require("./task.model");

// Workflow: which statuses a task may move to.
const TASK_STATUS_TRANSITIONS = {
  BACKLOG: ["TODO"],
  TODO: ["BACKLOG", "IN_PROGRESS"],
  IN_PROGRESS: ["TODO", "IN_REVIEW", "QA"],
  IN_REVIEW: ["IN_PROGRESS", "QA", "DONE"],
  QA: ["IN_PROGRESS", "IN_REVIEW", "DONE"],
  DONE: ["CANCELLED"],
  CANCELLED: ["TODO"],
};

const canTransition = (fromStatus, toStatus) => {
  if (fromStatus === toStatus) return true;
  return Boolean(TASK_STATUS_TRANSITIONS[fromStatus]?.includes(toStatus));
};

// Allowlisted sort fields (Document 04 / 16.6).
const TASK_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "dueDate",
  "priority",
  "status",
  "title",
  "position",
  "storyPoints",
  "taskNumber",
];

// Allowlisted list/filter fields.
// NOTE: "assigneeId" is the frontend/API query param; it maps to "primaryAssigneeId" in MongoDB.
// Both "assigneeId" (documented client param) and "primaryAssigneeId" (raw DB field) are
// allowlisted so the service's buildFilter() case can normalize assigneeId -> primaryAssigneeId.
const TASK_FILTER_FIELDS = [
  "search",
  "projectId",
  "sprintId",
  "epicId",
  "status",
  "priority",
  "type",
  "assigneeId",
  "primaryAssigneeId",
  "reporterId",
  "labelId",
  "dueFrom",
  "dueTo",
  "parentTaskId",
];

const STATUS_PRIORITY_RANK = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };

module.exports = {
  TASK_STATUS_TRANSITIONS,
  canTransition,
  TASK_SORT_FIELDS,
  TASK_FILTER_FIELDS,
  STATUS_PRIORITY_RANK,
  TASK_STATUSES,
  TASK_PRIORITIES,
  TASK_TYPES,
};

