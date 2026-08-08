const express = require("express");
const taskController = require("./task.controller");
const authenticate = require("../../middleware/authenticate");

const taskRouter = express.Router();
const projectLabelRouter = express.Router({ mergeParams: true });
const projectTaskRouter = express.Router({ mergeParams: true });
const checklistItemRouter = express.Router({ mergeParams: true });
const checklistRouter = express.Router();

// Task permissions follow the RBAC matrix.  Keep this local to the task
// module so the shared authorization middleware and other feature modules are
// not changed as part of this task.
const isTaskAdmin = (user) => ["ADMIN", "SUPER_ADMIN"].includes(String(user?.role || "").toUpperCase());
const hasTaskPermission = (user, permission) =>
  isTaskAdmin(user) || (Array.isArray(user?.permissions) && user.permissions.includes(permission));

const authorizeTask = (permission) => (req, res, next) => {
  if (hasTaskPermission(req.user, permission)) return next();
  const error = new Error("Permission denied.");
  error.code = "PERMISSION_DENIED";
  error.statusCode = 403;
  return next(error);
};

// Assignment and reassignment are separate permissions in the supplied
// matrix.  The service determines which one applies after loading the task.
const authorizeAssignmentChange = (req, res, next) => {
  if (hasTaskPermission(req.user, "TASK_ASSIGN") || hasTaskPermission(req.user, "TASK_REASSIGN")) return next();
  const error = new Error("Permission denied.");
  error.code = "PERMISSION_DENIED";
  error.statusCode = 403;
  return next(error);
};

// ---- /api/v1/tasks ----------------------------------------------------------

taskRouter.use(authenticate);

taskRouter.get("/", authorizeTask("TASK_VIEW"), taskController.listTasks);
taskRouter.get("/board", authorizeTask("TASK_VIEW"), taskController.getBoard);
taskRouter.post("/", authorizeTask("TASK_CREATE"), taskController.createTask);

// Specific sub-routes must be registered before the generic /:taskId PATCH
// to prevent Express matching "status", "priority", etc. as taskId values.
taskRouter.patch("/:taskId/restore", authorizeTask("TASK_DELETE"), taskController.restoreTask);
taskRouter.patch("/:taskId/status", authorizeTask("TASK_UPDATE"), taskController.changeStatus);
taskRouter.patch("/:taskId/priority", authorizeTask("TASK_UPDATE"), taskController.changePriority);
taskRouter.patch("/:taskId/assignee", authorizeAssignmentChange, taskController.assignTask);
taskRouter.delete("/:taskId/assignee", authorizeAssignmentChange, taskController.unassignTask);

taskRouter.get("/:taskId/history", authorizeTask("TASK_VIEW"), taskController.getHistory);
taskRouter.post("/:taskId/labels", authorizeTask("TASK_UPDATE"), taskController.addLabelToTask);
taskRouter.delete("/:taskId/labels/:labelId", authorizeTask("TASK_UPDATE"), taskController.removeLabelFromTask);
taskRouter.post("/:taskId/checklists", authorizeTask("TASK_UPDATE"), taskController.createChecklist);
taskRouter.get("/:taskId/checklists", authorizeTask("TASK_VIEW"), taskController.listChecklists);

// Generic task CRUD — must come after all sub-routes.
taskRouter.get("/:taskId", authorizeTask("TASK_VIEW"), taskController.getTask);
taskRouter.put("/:taskId", authorizeTask("TASK_UPDATE"), taskController.updateTask);
taskRouter.patch("/:taskId", authorizeTask("TASK_UPDATE"), taskController.updateTask);
taskRouter.delete("/:taskId", authorizeTask("TASK_DELETE"), taskController.deleteTask);

// ---- /api/v1/projects/:projectId/labels -------------------------------------

projectLabelRouter.use(authenticate);
projectLabelRouter.get("/", authorizeTask("TASK_VIEW"), taskController.listLabels);
projectLabelRouter.post("/", authorizeTask("TASK_UPDATE"), taskController.createLabel);

// ---- /api/v1/projects/:projectId/tasks --------------------------------------

projectTaskRouter.use(authenticate);
projectTaskRouter.get("/", authorizeTask("TASK_VIEW"), (req, res, next) => {
  // Inject projectId from route param into query so listTasks filter picks it up.
  req.query.projectId = req.params.projectId;
  return taskController.listTasks(req, res, next);
});

// ---- /api/v1/checklists/:checklistId (edit / delete checklist) --------------

checklistRouter.use(authenticate);
checklistRouter.patch("/:checklistId", authorizeTask("TASK_UPDATE"), taskController.updateChecklist);
checklistRouter.delete("/:checklistId", authorizeTask("TASK_UPDATE"), taskController.deleteChecklist);

// ---- /api/v1/checklists/:checklistId/items ----------------------------------

checklistItemRouter.use(authenticate);
checklistItemRouter.post("/", authorizeTask("TASK_UPDATE"), taskController.addChecklistItem);
checklistItemRouter.put("/:itemId", authorizeTask("TASK_UPDATE"), taskController.updateChecklistItem);
checklistItemRouter.patch("/:itemId/complete", authorizeTask("TASK_UPDATE"), taskController.completeChecklistItem);
checklistItemRouter.delete("/:itemId", authorizeTask("TASK_UPDATE"), taskController.deleteChecklistItem);

module.exports = { taskRouter, projectLabelRouter, projectTaskRouter, checklistItemRouter, checklistRouter };
