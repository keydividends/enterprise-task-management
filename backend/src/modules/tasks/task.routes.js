const express = require("express");
const taskController = require("./task.controller");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

const taskRouter = express.Router();
const projectLabelRouter = express.Router();
const checklistItemRouter = express.Router();

// ---- /api/v1/tasks ----------------------------------------------------------

taskRouter.use(authenticate);

taskRouter.get("/", authorize("TASK_VIEW"), taskController.listTasks);
taskRouter.get("/board", authorize("TASK_VIEW"), taskController.getBoard);
taskRouter.post("/", authorize("TASK_CREATE"), taskController.createTask);

taskRouter.get("/:taskId", authorize("TASK_VIEW"), taskController.getTask);
taskRouter.put("/:taskId", authorize("TASK_UPDATE"), taskController.updateTask);
taskRouter.delete("/:taskId", authorize("TASK_DELETE"), taskController.deleteTask);
taskRouter.patch("/:taskId/restore", authorize("TASK_DELETE"), taskController.restoreTask);

taskRouter.patch("/:taskId/status", authorize("TASK_UPDATE"), taskController.changeStatus);
taskRouter.patch("/:taskId/priority", authorize("TASK_UPDATE"), taskController.changePriority);
taskRouter.patch("/:taskId/assignee", authorize("TASK_ASSIGN"), taskController.assignTask);
taskRouter.delete("/:taskId/assignee", authorize("TASK_ASSIGN"), taskController.unassignTask);

taskRouter.get("/:taskId/history", authorize("TASK_VIEW"), taskController.getHistory);

taskRouter.post("/:taskId/labels", authorize("TASK_UPDATE"), taskController.addLabelToTask);
taskRouter.delete("/:taskId/labels/:labelId", authorize("TASK_UPDATE"), taskController.removeLabelFromTask);

taskRouter.post("/:taskId/checklists", authorize("TASK_UPDATE"), taskController.createChecklist);
taskRouter.get("/:taskId/checklists", authorize("TASK_VIEW"), taskController.listChecklists);

// ---- /api/v1/projects/:projectId/labels -------------------------------------

projectLabelRouter.use(authenticate);
projectLabelRouter.get("/", authorize("TASK_VIEW"), taskController.listLabels);
projectLabelRouter.post("/", authorize("TASK_UPDATE"), taskController.createLabel);

// ---- /api/v1/checklists/:checklistId/items ----------------------------------

checklistItemRouter.use(authenticate);
checklistItemRouter.post("/", authorize("TASK_UPDATE"), taskController.addChecklistItem);
checklistItemRouter.put("/:itemId", authorize("TASK_UPDATE"), taskController.updateChecklistItem);
checklistItemRouter.patch("/:itemId/complete", authorize("TASK_UPDATE"), taskController.completeChecklistItem);
checklistItemRouter.delete("/:itemId", authorize("TASK_UPDATE"), taskController.deleteChecklistItem);

module.exports = { taskRouter, projectLabelRouter, checklistItemRouter };
