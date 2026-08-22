const mongoose = require("mongoose");
const repo = require("./task.repository");
const contracts = require("./task.contracts");
const { getWorkspaceId } = require("./task.contracts");
const { mapTask, mapLabel, mapChecklist, mapChecklistItem, mapHistory } = require("./task.mapper");
const {
  TASK_STATUSES,
  TASK_SORT_FIELDS,
  TASK_FILTER_FIELDS,
  canTransition,
} = require("./task.constants");
const {
  validateCreateTask,
  validateUpdateTask,
  validateStatusChange,
  validateAssignee,
  validateLabelInput,
  validateLabelId,
  validateChecklistInput,
  validateChecklistItemInput,
  validateTaskQuery,
  isValidObjectId,
} = require("./task.validation");

const createError = (code, message, statusCode = 400, field = null) => {
  const err = new Error(message);
  err.code = code;
  err.statusCode = statusCode;
  if (field) err.field = field;
  return err;
};

const toObjectId = (id) => (isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : id);

// Task audit fields are MongoDB ObjectId references.  During local/mock API
// flows the auth middleware deliberately exposes the placeholder ids
// "mock-admin" and "mock-demo"; keep that transport concern outside this
// module by translating only those known mock identities to task-module seed
// user ids before persisting audit records.  Real authenticated users retain
// their own ObjectId unchanged.
const getActorId = (context = {}) => {
  const userId = context.userId || context.user?.id;
  if (isValidObjectId(userId)) return userId;

  if (userId === "mock-admin") return "64a100000000000000000001";
  if (userId === "mock-demo") return "64a100000000000000000002";

  return userId;
};

const hasTaskPermission = (context, permission) => {
  const role = String(context.user?.role || "").toUpperCase();
  return ["ADMIN", "SUPER_ADMIN"].includes(role)
    || (Array.isArray(context.user?.permissions) && context.user.permissions.includes(permission));
};

const assertTaskPermission = (context, permission) => {
  if (!hasTaskPermission(context, permission)) {
    throw createError("PERMISSION_DENIED", "Permission denied.", 403);
  }
};

const hasProjectWideTaskAccess = (context = {}) =>
  // Managers have project-management and task-creation permissions. Keep task
  // access consistent with the projects module so a Manager is not blocked
  // from creating a task for a project they can already manage.
  ["ADMIN", "SUPER_ADMIN", "ORG_ADMIN", "COMPANY_ADMIN", "MANAGER", "EMPLOYEE"].includes(
    String(context.user?.role || "").toUpperCase()
  );

// ---------------------------------------------------------------------------
// Access helpers
// ---------------------------------------------------------------------------

const buildTaskKey = (projectKey, taskNumber) => `${projectKey || "ETMS"}-${taskNumber}`;

const assertProjectAccess = async (projectId, userId, context = {}) => {
  const project = await contracts.findProjectById(projectId);
  if (!project) throw createError("PROJECT_NOT_FOUND", "Project not found.", 404);
  // The RBAC matrix grants Admins organization-wide access. They must not be
  // rejected merely because they are not listed as an individual project member.
  if (hasProjectWideTaskAccess(context)) return project;
  const member = await contracts.isProjectMember(projectId, userId);
  if (!member) throw createError("PROJECT_ACCESS_DENIED", "You do not have access to this project.", 403);
  return project;
};

const assertAssigneeEligible = async (projectId, assigneeId) => {
  if (!assigneeId) return;
  const user = await contracts.findUserById(assigneeId);
  if (!user) throw createError("USER_NOT_FOUND", "Assignee user not found.", 404);
  const member = await contracts.isProjectMember(projectId, assigneeId);
  if (!member) throw createError("INVALID_ASSIGNEE", "Assignee must be an active project member.", 400);
};

const assertSprintScoped = async (projectId, sprintId) => {
  if (!sprintId) return;
  const sprint = await contracts.findSprintById(sprintId);
  if (!sprint) throw createError("SPRINT_NOT_FOUND", "Sprint not found.", 404);
  if (String(sprint.projectId) !== String(projectId)) {
    throw createError("SPRINT_PROJECT_MISMATCH", "Sprint does not belong to this project.", 400);
  }
};

const assertEpicScoped = async (projectId, epicId) => {
  if (!epicId) return;
  const epic = await contracts.findEpicById(epicId);
  if (!epic) throw createError("EPIC_NOT_FOUND", "Epic not found.", 404);
  if (String(epic.projectId) !== String(projectId)) {
    throw createError("EPIC_PROJECT_MISMATCH", "Epic does not belong to this project.", 400);
  }
};

const assertTaskExists = async (taskId, workspaceId) => {
  const task = await repo.findTaskById(taskId, workspaceId);
  if (!task) throw createError("TASK_NOT_FOUND", "Task not found.", 404);
  return task;
};

const assertTaskReadAccess = async (task, context = {}) =>
  assertProjectAccess(task.projectId, getActorId(context), context);

const recordHistory = async (taskId, userId, field, oldValue, newValue) => {
  if (oldValue === newValue) return;
  try {
    await repo.recordHistory({ taskId, changedBy: userId, field, oldValue, newValue });
  } catch {
    // History is best-effort; never fail an operation because of it.
  }
};

const userDisplayName = (user) => {
  if (!user) return null;
  return user.fullName
    || [user.firstName, user.lastName].filter(Boolean).join(" ")
    || user.email
    || user.employeeId
    || null;
};

// Task documents store user references as IDs. Resolve names at the API
// boundary so every task card can display a person rather than an ObjectId.
const mapTasksWithPeople = async (tasks) => {
  const userIds = [...new Set(tasks.flatMap((task) => [task.primaryAssigneeId, task.reporterId])
    .filter(Boolean)
    .map(String))];
  const people = await Promise.all(userIds.map(async (id) => [id, await contracts.findUserById(id)]));
  const names = new Map(people.map(([id, user]) => [id, userDisplayName(user)]));

  return tasks.map((task) => {
    const mapped = mapTask(task);
    mapped.primaryAssigneeName = mapped.primaryAssigneeId ? names.get(String(mapped.primaryAssigneeId)) || null : null;
    mapped.reporterName = mapped.reporterId ? names.get(String(mapped.reporterId)) || null : null;
    return mapped;
  });
};

// ---------------------------------------------------------------------------
// List / detail
// ---------------------------------------------------------------------------

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildFilter = (query = {}) => {
  const filter = {};
  for (const key of TASK_FILTER_FIELDS) {
    if (query[key] === undefined || query[key] === null || query[key] === "") continue;
    switch (key) {
      case "search":
        filter.$or = [
          { title: { $regex: escapeRegex(query.search), $options: "i" } },
          { taskKey: { $regex: escapeRegex(query.search), $options: "i" } },
          { description: { $regex: escapeRegex(query.search), $options: "i" } },
        ];
        break;
      case "dueFrom":
        filter.dueDate = { ...(filter.dueDate || {}), $gte: new Date(query.dueFrom) };
        break;
      case "dueTo":
        filter.dueDate = { ...(filter.dueDate || {}), $lte: new Date(query.dueTo) };
        break;
      default:
        // The API/frontend contract uses "assigneeId"; the DB field is
        // "primaryAssigneeId". Normalize here so documented clients filter
        // correctly (matches getBoard behavior).
        if (key === "assigneeId") {
          filter.primaryAssigneeId = query[key];
        } else {
          filter[key] = query[key];
        }
    }
  }
  return filter;
};

const listTasks = async (query, context = {}) => {
  const workspaceId = await getWorkspaceId(context);
  const userId = getActorId(context);
  const validated = validateTaskQuery(query);
  const { page, pageSize, sortBy, sortOrder } = validated;

  const sortField = TASK_SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt";
  const filter = buildFilter(query);

  if (query.projectId) {
    await assertProjectAccess(query.projectId, userId, context);
  } else if (!hasProjectWideTaskAccess(context)) {
    const accessibleProjectIds = await contracts.listAccessibleProjectIds(userId, workspaceId);
    filter.projectId = { $in: accessibleProjectIds };
  }

  // Only apply workspaceId filter when the context actually provided one.
  // If context.workspaceId is null the mock fallback ID is used, which would
  // exclude tasks created by real users stored under a different workspaceId.
  // When a real projectId filter is present, project-scoping is sufficient.
  if (context.workspaceId) {
    filter.workspaceId = workspaceId;
  } else if (!query.projectId) {
    // No project filter and no real workspaceId — use mock ID to scope.
    filter.workspaceId = workspaceId;
  }

  // Label filter requires a join through tasklabels.
  let labelFilteredIds = null;
  if (query.labelId) {
    labelFilteredIds = await repo.findTaskIdsByLabel(query.labelId);
    filter._id = { $in: labelFilteredIds };
  }

  const skip = (page - 1) * pageSize;
  const needsAggregation = sortField === 'priority' || sortField === 'dueDate';
  const [tasks, totalItems] = await Promise.all([
    needsAggregation
      ? repo.findTasksAggregated(filter, { skip, limit: pageSize, sortField, sortDir: sortOrder })
      : repo.findTasks(filter, { skip, limit: pageSize, sort: { [sortField]: sortOrder } }),
    repo.countTasks(filter),
  ]);

  const taskIds = tasks.map((t) => t._id);
  const labelMap = taskIds.length ? await repo.findLabelsByTaskIds(taskIds) : {};

  const items = await mapTasksWithPeople(tasks);
  items.forEach((mapped, index) => {
    const task = tasks[index];
    mapped.labels = labelMap[String(task._id)] || [];
  });

  return {
    items,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    },
  };
};

const getTaskDetail = async (taskId, context = {}) => {
  const workspaceId = await getWorkspaceId(context);
  if (!isValidObjectId(taskId)) throw createError("INVALID_IDENTIFIER", "Task ID must be valid.", 400);
  const task = await assertTaskExists(taskId, workspaceId);
  await assertTaskReadAccess(task, context);

  const [labels, assignments, checklists, history] = await Promise.all([
    repo.findLabelsByTask(taskId),
    repo.findAssignmentsByTask(taskId),
    repo.findChecklistsByTask(taskId),
    repo.findHistoryByTask(taskId),
  ]);

  const checklistItems = await Promise.all(
    checklists.map(async (cl) => ({ checklist: cl, items: await repo.findItemsByChecklist(cl._id) }))
  );

  const [mapped] = await mapTasksWithPeople([task]);
  // Filter out mappings whose label was soft-deleted/missing before mapping,
  // so mapLabel never receives a null/undefined reference.
  mapped.labels = labels.map((row) => row.labelId).filter(Boolean).map(mapLabel);
  mapped.assignments = assignments.map((a) => ({
    userId: a.userId,
    assignmentType: a.assignmentType,
    assignedAt: a.assignedAt,
  }));
  mapped.checklists = checklistItems.map(({ checklist, items }) => mapChecklist(checklist, items));
  mapped.history = history.map(mapHistory);

  return mapped;
};

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

const createTask = async (payload, context = {}) => {
  validateCreateTask(payload);
  const workspaceId = await getWorkspaceId(context);
  const userId = getActorId(context);

  const project = await assertProjectAccess(payload.projectId, userId, context);
  await assertAssigneeEligible(payload.projectId, payload.primaryAssigneeId);
  await assertSprintScoped(payload.projectId, payload.sprintId);
  await assertEpicScoped(payload.projectId, payload.epicId);

  const taskNumber = await repo.getNextTaskNumber(payload.projectId);
  const taskKey = buildTaskKey(project.key, taskNumber);

  const task = await repo.createTask({
    workspaceId,
    projectId: payload.projectId,
    sprintId: payload.sprintId || null,
    epicId: payload.epicId || null,
    taskNumber,
    taskKey,
    title: String(payload.title).trim(),
    description: payload.description || "",
    type: payload.type || "TASK",
    status: payload.status || "TODO",
    priority: payload.priority || "MEDIUM",
    reporterId: userId,
    primaryAssigneeId: payload.primaryAssigneeId || null,
    storyPoints: payload.storyPoints ?? null,
    startDate: payload.startDate || null,
    dueDate: payload.dueDate || null,
    parentTaskId: payload.parentTaskId || null,
    position: 0,
    createdBy: userId,
    updatedBy: userId,
  });

  if (payload.primaryAssigneeId) {
    await repo.createAssignment({
      taskId: task._id,
      userId: payload.primaryAssigneeId,
      assignmentType: "PRIMARY",
      assignedBy: userId,
    });
  }

  await recordHistory(task._id, userId, "created", null, taskKey);

  return { task: mapTask(task), taskKey };
};

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

const updateTask = async (taskId, payload, context = {}) => {
  validateUpdateTask(payload);
  const workspaceId = await getWorkspaceId(context);
  const userId = getActorId(context);
  const task = await assertTaskExists(taskId, workspaceId);
  await assertTaskReadAccess(task, context);

  const allowed = {};
  const fields = ["title", "description", "type", "priority", "storyPoints", "startDate", "dueDate", "parentTaskId", "sprintId", "epicId"];
  for (const field of fields) {
    if (payload[field] !== undefined) allowed[field] = payload[field];
  }

  if (payload.sprintId !== undefined) await assertSprintScoped(task.projectId, payload.sprintId);
  if (payload.epicId !== undefined) await assertEpicScoped(task.projectId, payload.epicId);

  if (Object.keys(allowed).length === 0) {
    throw createError("VALIDATION_ERROR", "No updatable fields provided.", 400);
  }

  allowed.updatedBy = userId;
  const updated = await repo.updateTask(taskId, workspaceId, allowed);

  // Record field diffs in history.
  for (const field of Object.keys(allowed)) {
    if (field === "updatedBy") continue;
    await recordHistory(taskId, userId, field, task[field], updated[field]);
  }

  return mapTask(updated);
};

// ---------------------------------------------------------------------------
// Status / priority
// ---------------------------------------------------------------------------

const changeStatus = async (taskId, payload, context = {}) => {
  validateStatusChange(payload);
  const workspaceId = await getWorkspaceId(context);
  const userId = getActorId(context);
  const task = await assertTaskExists(taskId, workspaceId);
  await assertTaskReadAccess(task, context);

  if (payload.status === "DONE") assertTaskPermission(context, "TASK_CLOSE");

  if (!canTransition(task.status, payload.status)) {
    throw createError(
      "INVALID_STATE_TRANSITION",
      `Cannot move task from ${task.status} to ${payload.status}.`,
      409
    );
  }

  const update = {
    status: payload.status,
    updatedBy: userId,
    completedAt: payload.status === "DONE" ? new Date() : task.status === "DONE" ? null : task.completedAt,
  };
  const updated = await repo.updateTask(taskId, workspaceId, update);
  await recordHistory(taskId, userId, "status", task.status, payload.status);

  return mapTask(updated);
};

const changePriority = async (taskId, payload, context = {}) => {
  if (!payload.priority || !["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(payload.priority)) {
    throw createError("VALIDATION_ERROR", "Priority must be one of: LOW, MEDIUM, HIGH, CRITICAL.", 400, "priority");
  }
  const workspaceId = await getWorkspaceId(context);
  const userId = getActorId(context);
  const task = await assertTaskExists(taskId, workspaceId);
  await assertTaskReadAccess(task, context);

  const updated = await repo.updateTask(taskId, workspaceId, { priority: payload.priority, updatedBy: userId });
  await recordHistory(taskId, userId, "priority", task.priority, payload.priority);

  return mapTask(updated);
};

// ---------------------------------------------------------------------------
// Assignment
// ---------------------------------------------------------------------------

const assignTask = async (taskId, payload, context = {}) => {
  validateAssignee(payload);
  const workspaceId = await getWorkspaceId(context);
  const userId = getActorId(context);
  const task = await assertTaskExists(taskId, workspaceId);
  await assertTaskReadAccess(task, context);

  const isReassignment = task.primaryAssigneeId && String(task.primaryAssigneeId) !== String(payload.userId);
  assertTaskPermission(context, isReassignment ? "TASK_REASSIGN" : "TASK_ASSIGN");

  await assertAssigneeEligible(task.projectId, payload.userId);

  const existing = await repo.findActiveAssignment(taskId, payload.userId);
  if (existing) {
    throw createError("TASK_ASSIGNMENT_EXISTS", "User is already assigned to this task.", 409);
  }

  // A task has one primary assignee. Archive any prior active assignment so
  // its assignment history remains accurate and no stale active rows remain.
  if (isReassignment) {
    const assignments = await repo.findAssignmentsByTask(taskId);
    for (const assignment of assignments) await repo.removeAssignment(assignment._id);
  }

  await repo.createAssignment({
    taskId,
    userId: payload.userId,
    assignmentType: "PRIMARY",
    assignedBy: userId,
  });

  const updated = await repo.updateTask(taskId, workspaceId, { primaryAssigneeId: payload.userId, updatedBy: userId });
  await recordHistory(taskId, userId, "primaryAssigneeId", task.primaryAssigneeId || null, payload.userId);

  return mapTask(updated);
};

const unassignTask = async (taskId, context = {}) => {
  const workspaceId = await getWorkspaceId(context);
  const userId = getActorId(context);
  const task = await assertTaskExists(taskId, workspaceId);
  await assertTaskReadAccess(task, context);

  assertTaskPermission(context, "TASK_REASSIGN");

  const assignments = await repo.findAssignmentsByTask(taskId);
  for (const assignment of assignments) {
    await repo.removeAssignment(assignment._id);
  }

  const updated = await repo.updateTask(taskId, workspaceId, { primaryAssigneeId: null, updatedBy: userId });
  await recordHistory(taskId, userId, "primaryAssigneeId", task.primaryAssigneeId || null, null);

  return mapTask(updated);
};

// ---------------------------------------------------------------------------
// Delete / restore
// ---------------------------------------------------------------------------

const deleteTask = async (taskId, context = {}) => {
  const workspaceId = await getWorkspaceId(context);
  const userId = getActorId(context);
  const task = await assertTaskExists(taskId, workspaceId);
  await assertTaskReadAccess(task, context);
  await repo.softDeleteTask(taskId, workspaceId, userId);
  await recordHistory(taskId, userId, "isDeleted", false, true);
  return { id: taskId };
};

const restoreTask = async (taskId, context = {}) => {
  const workspaceId = await getWorkspaceId(context);
  const userId = getActorId(context);
  const deletedTask = await repo.findDeletedTaskById(taskId, workspaceId);
  if (!deletedTask) throw createError("TASK_NOT_FOUND", "Task not found or not deleted.", 404);
  await assertTaskReadAccess(deletedTask, context);
  const task = await repo.restoreTask(taskId, workspaceId);
  await recordHistory(taskId, userId, "isDeleted", true, false);
  return mapTask(task);
};

// ---------------------------------------------------------------------------
// Board
// ---------------------------------------------------------------------------

const getBoard = async (query, context = {}) => {
  const workspaceId = await getWorkspaceId(context);
  const projectId = query.projectId;
  if (!projectId) throw createError("VALIDATION_ERROR", "projectId is required for the board.", 400, "projectId");
  await assertProjectAccess(projectId, getActorId(context), context);

  const extraFilter = {};
  if (query.sprintId) extraFilter.sprintId = query.sprintId;
  if (query.assigneeId) extraFilter.primaryAssigneeId = query.assigneeId;
  if (query.priority) extraFilter.priority = query.priority;

  const tasks = await repo.findBoardTasks(projectId, workspaceId, extraFilter);
  const taskIds = tasks.map((t) => t._id);
  const labelMap = taskIds.length ? await repo.findLabelsByTaskIds(taskIds) : {};

  const columns = {};
  for (const status of TASK_STATUSES) columns[status] = [];

  const mappedTasks = await mapTasksWithPeople(tasks);
  mappedTasks.forEach((mapped, index) => {
    const task = tasks[index];
    mapped.labels = labelMap[String(task._id)] || [];
    columns[task.status] = columns[task.status] || [];
    columns[task.status].push(mapped);
  });

  return columns;
};

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

const listLabels = async (projectId, query = {}, context = {}) => {
  const workspaceId = await getWorkspaceId(context);
  const project = await contracts.findProjectById(projectId);
  if (!project || String(project.workspaceId) !== String(workspaceId)) {
    throw createError("PROJECT_NOT_FOUND", "Project not found.", 404);
  }
  await assertProjectAccess(projectId, getActorId(context), context);
  const labels = await repo.findLabelsByProject(projectId, query.search);
  return labels.map(mapLabel);
};

const createLabel = async (projectId, payload, context = {}) => {
  const { name, color } = validateLabelInput(payload);
  const workspaceId = await getWorkspaceId(context);
  const userId = getActorId(context);
  const project = await contracts.findProjectById(projectId);
  if (!project || String(project.workspaceId) !== String(workspaceId)) {
    throw createError("PROJECT_NOT_FOUND", "Project not found.", 404);
  }
  await assertProjectAccess(projectId, userId, context);
  const existing = await repo.findLabelsByProject(projectId, name);
  if (existing.some((l) => l.name.toLowerCase() === name.toLowerCase())) {
    throw createError("LABEL_EXISTS", "A label with this name already exists.", 409);
  }
  const label = await repo.createLabel({
    workspaceId,
    projectId,
    name,
    color,
    description: payload.description || "",
    createdBy: userId,
  });
  return mapLabel(label);
};

const addLabelToTask = async (taskId, payload, context = {}) => {
  validateLabelId(payload);
  const workspaceId = await getWorkspaceId(context);
  const userId = getActorId(context);
  const task = await assertTaskExists(taskId, workspaceId);
  await assertTaskReadAccess(task, context);

  const label = await repo.findLabelById(payload.labelId, task.projectId);
  if (!label) throw createError("LABEL_NOT_FOUND", "Label not found in this project.", 404);

  const existing = await repo.findTaskLabel(taskId, payload.labelId);
  if (existing) throw createError("TASK_LABEL_EXISTS", "Label already added to this task.", 409);

  await repo.addLabelToTask({ taskId, labelId: payload.labelId, addedBy: userId });
  return { taskId, labelId: payload.labelId };
};

const removeLabelFromTask = async (taskId, labelId, context = {}) => {
  const workspaceId = await getWorkspaceId(context);
  const task = await assertTaskExists(taskId, workspaceId);
  await assertTaskReadAccess(task, context);
  const removed = await repo.removeLabelFromTask(taskId, labelId);
  if (!removed) throw createError("TASK_LABEL_NOT_FOUND", "Label mapping not found.", 404);
  return { taskId, labelId };
};

// ---------------------------------------------------------------------------
// Checklists
// ---------------------------------------------------------------------------

const createChecklist = async (taskId, payload, context = {}) => {
  const { title } = validateChecklistInput(payload);
  const workspaceId = await getWorkspaceId(context);
  const userId = getActorId(context);
  const task = await assertTaskExists(taskId, workspaceId);
  await assertTaskReadAccess(task, context);

  const position = await repo.getNextChecklistPosition(taskId);
  const checklist = await repo.createChecklist({ taskId, title, position, createdBy: userId });
  return mapChecklist(checklist, []);
};

const listChecklists = async (taskId, context = {}) => {
  const workspaceId = await getWorkspaceId(context);
  const task = await assertTaskExists(taskId, workspaceId);
  await assertTaskReadAccess(task, context);
  const checklists = await repo.findChecklistsByTask(taskId);
  const result = await Promise.all(
    checklists.map(async (cl) => {
      const items = await repo.findItemsByChecklist(cl._id);
      return mapChecklist(cl, items);
    })
  );
  return result;
};

const updateChecklist = async (checklistId, payload, context = {}) => {
  const { title } = validateChecklistInput(payload);
  const workspaceId = await getWorkspaceId(context);
  const userId = getActorId(context);
  const checklist = await repo.findChecklistById(checklistId);
  if (!checklist) throw createError("CHECKLIST_NOT_FOUND", "Checklist not found.", 404);

  const task = await repo.findTaskById(checklist.taskId, workspaceId);
  if (!task) throw createError("TASK_NOT_FOUND", "Task not found.", 404);
  await assertTaskReadAccess(task, context);

  const updated = await repo.updateChecklist(checklistId, { title, updatedBy: userId });
  const items = await repo.findItemsByChecklist(checklistId);
  return mapChecklist(updated, items);
};

const deleteChecklist = async (checklistId, context = {}) => {
  const workspaceId = await getWorkspaceId(context);
  const checklist = await repo.findChecklistById(checklistId);
  if (!checklist) throw createError("CHECKLIST_NOT_FOUND", "Checklist not found.", 404);

  const task = await repo.findTaskById(checklist.taskId, workspaceId);
  if (!task) throw createError("TASK_NOT_FOUND", "Task not found.", 404);
  await assertTaskReadAccess(task, context);

  await repo.softDeleteChecklist(checklistId);
  return { id: checklistId };
};

const addChecklistItem = async (checklistId, payload, context = {}) => {
  const { text } = validateChecklistItemInput(payload);
  const workspaceId = await getWorkspaceId(context);
  const userId = getActorId(context);
  const checklist = await repo.findChecklistById(checklistId);
  if (!checklist) throw createError("CHECKLIST_NOT_FOUND", "Checklist not found.", 404);

  const task = await repo.findTaskById(checklist.taskId, workspaceId);
  if (!task) throw createError("TASK_NOT_FOUND", "Task not found.", 404);
  await assertTaskReadAccess(task, context);

  if (payload.assigneeId) await assertAssigneeEligible(task.projectId, payload.assigneeId);

  const position = await repo.getNextChecklistItemPosition(checklistId);
  const item = await repo.createChecklistItem({
    checklistId,
    text,
    assigneeId: payload.assigneeId || null,
    dueDate: payload.dueDate || null,
    position,
    createdBy: userId,
  });
  return mapChecklistItem(item);
};

const updateChecklistItem = async (checklistId, itemId, payload, context = {}) => {
  const workspaceId = await getWorkspaceId(context);
  const userId = getActorId(context);
  if (!isValidObjectId(itemId)) throw createError("INVALID_IDENTIFIER", "Item ID must be valid.", 400);

  const item = await repo.findChecklistItemById(itemId, checklistId);
  if (!item) throw createError("CHECKLIST_ITEM_NOT_FOUND", "Checklist item not found.", 404);

  const checklist = await repo.findChecklistById(checklistId);
  const task = await repo.findTaskById(checklist.taskId, workspaceId);
  if (!task) throw createError("TASK_NOT_FOUND", "Task not found.", 404);
  await assertTaskReadAccess(task, context);

  const update = { updatedBy: userId };
  if (payload.text !== undefined) update.text = String(payload.text).trim();
  if (payload.assigneeId !== undefined) {
    if (payload.assigneeId) await assertAssigneeEligible(task.projectId, payload.assigneeId);
    update.assigneeId = payload.assigneeId || null;
  }
  if (payload.dueDate !== undefined) update.dueDate = payload.dueDate || null;

  const updated = await repo.updateChecklistItem(itemId, checklistId, update);
  return mapChecklistItem(updated);
};

const completeChecklistItem = async (checklistId, itemId, context = {}) => {
  const workspaceId = await getWorkspaceId(context);
  const userId = getActorId(context);
  const item = await repo.findChecklistItemById(itemId, checklistId);
  if (!item) throw createError("CHECKLIST_ITEM_NOT_FOUND", "Checklist item not found.", 404);

  const checklist = await repo.findChecklistById(checklistId);
  const task = await repo.findTaskById(checklist.taskId, workspaceId);
  if (!task) throw createError("TASK_NOT_FOUND", "Task not found.", 404);
  await assertTaskReadAccess(task, context);

  const updated = await repo.updateChecklistItem(itemId, checklistId, {
    isCompleted: !item.isCompleted,
    completedBy: item.isCompleted ? null : userId,
    completedAt: item.isCompleted ? null : new Date(),
    updatedBy: userId,
  });
  return mapChecklistItem(updated);
};

const deleteChecklistItem = async (checklistId, itemId, context = {}) => {
  const workspaceId = await getWorkspaceId(context);
  const item = await repo.findChecklistItemById(itemId, checklistId);
  if (!item) throw createError("CHECKLIST_ITEM_NOT_FOUND", "Checklist item not found.", 404);
  const checklist = await repo.findChecklistById(checklistId);
  const task = await repo.findTaskById(checklist.taskId, workspaceId);
  if (!task) throw createError("TASK_NOT_FOUND", "Task not found.", 404);
  await assertTaskReadAccess(task, context);
  await repo.softDeleteChecklistItem(itemId, checklistId);
  return { id: itemId };
};

// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------

const getHistory = async (taskId, context = {}) => {
  const workspaceId = await getWorkspaceId(context);
  const task = await assertTaskExists(taskId, workspaceId);
  await assertTaskReadAccess(task, context);
  const history = await repo.findHistoryByTask(taskId);
  return history.map(mapHistory);
};

module.exports = {
  listTasks,
  getTaskDetail,
  createTask,
  updateTask,
  changeStatus,
  changePriority,
  assignTask,
  unassignTask,
  deleteTask,
  restoreTask,
  getBoard,
  listLabels,
  createLabel,
addLabelToTask,
  removeLabelFromTask,
  createChecklist,
  listChecklists,
  updateChecklist,
  deleteChecklist,
  addChecklistItem,
  updateChecklistItem,
  completeChecklistItem,
  deleteChecklistItem,
  getHistory,
  canTransition,
  TASK_STATUSES,
};
