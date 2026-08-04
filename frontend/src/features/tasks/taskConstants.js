export const TASK_STATUSES = ["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "QA", "DONE", "CANCELLED"];

export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export const TASK_TYPES = ["TASK", "STORY", "BUG", "IMPROVEMENT"];

export const TASK_STATUS_TRANSITIONS = {
  BACKLOG: ["TODO"],
  TODO: ["BACKLOG", "IN_PROGRESS"],
  IN_PROGRESS: ["TODO", "IN_REVIEW", "QA"],
  IN_REVIEW: ["IN_PROGRESS", "QA", "DONE"],
  QA: ["IN_PROGRESS", "IN_REVIEW", "DONE"],
  DONE: ["CANCELLED"],
  CANCELLED: ["TODO"],
};

export const canTransition = (fromStatus, toStatus) => {
  if (fromStatus === toStatus) return true;
  return Boolean(TASK_STATUS_TRANSITIONS[fromStatus]?.includes(toStatus));
};

export const STATUS_LABELS = {
  BACKLOG: "Backlog",
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  QA: "QA",
  DONE: "Done",
  CANCELLED: "Cancelled",
};

export const PRIORITY_LABELS = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const TYPE_LABELS = {
  TASK: "Task",
  STORY: "Story",
  BUG: "Bug",
  IMPROVEMENT: "Improvement",
};

// STATUS -> color token used by task badges/board columns.
export const STATUS_COLORS = {
  BACKLOG: "var(--text-soft)",
  TODO: "var(--primary)",
  IN_PROGRESS: "var(--secondary)",
  IN_REVIEW: "var(--warning)",
  QA: "var(--info)",
  DONE: "var(--success)",
  CANCELLED: "var(--danger)",
};

export const PRIORITY_ORDER = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };

const taskConstants = {
  TASK_STATUSES,
  TASK_PRIORITIES,
  TASK_TYPES,
  TASK_STATUS_TRANSITIONS,
  canTransition,
  STATUS_LABELS,
  PRIORITY_LABELS,
  TYPE_LABELS,
  STATUS_COLORS,
  PRIORITY_ORDER,
};

export default taskConstants;
