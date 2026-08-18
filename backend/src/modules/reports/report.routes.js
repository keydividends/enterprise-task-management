const express = require("express");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const workspaceScope = require("../../middleware/workspaceScope");
const controller = require("./report.controller");

const router = express.Router();
router.use(authenticate, workspaceScope, authorize("REPORT_VIEW"));
router.get("/projects/progress", controller.projectProgress);
router.get("/tasks/status", controller.taskStatus);
router.get("/tasks/overdue", controller.overdueTasks);
router.get("/teams/workload", controller.teamWorkload);
router.get("/users/performance", controller.performance);
router.get("/projects/allocation", controller.allocation);
router.get("/tasks/cycle-time", controller.cycleTime);
router.get("/tasks/throughput", controller.throughput);
router.get("/sprints/:sprintId", controller.sprint);
router.get("/time", controller.time);
router.get("/activity", controller.activity);
router.get("/audit", controller.audit);
router.get("/tasks/export", controller.taskExport);
router.get("/projects/:projectId/export", controller.projectExport);

module.exports = router;