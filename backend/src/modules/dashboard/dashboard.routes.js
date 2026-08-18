const express = require("express");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const workspaceScope = require("../../middleware/workspaceScope");
const controller = require("./dashboard.controller");

const authorizeAny = (...permissions) => (req, res, next) => {
	if (req.user?.role === "ADMIN" || permissions.some((permission) => req.user?.permissions?.includes(permission))) return next();
	const error = new Error("Permission denied.");
	error.code = "PERMISSION_DENIED";
	error.statusCode = 403;
	return next(error);
};

const router = express.Router();
router.get("/summary", authenticate, workspaceScope, authorize("DASHBOARD_VIEW"), controller.summary);
router.get("/my-work", authenticate, workspaceScope, controller.myWork);
router.get("/tasks-by-status", authenticate, workspaceScope, authorize("DASHBOARD_VIEW"), controller.status);
router.get("/tasks-by-priority", authenticate, workspaceScope, authorize("DASHBOARD_VIEW"), controller.priority);
router.get("/project-progress", authenticate, workspaceScope, authorize("DASHBOARD_VIEW"), controller.projectProgress);
router.get("/team-workload", authenticate, workspaceScope, authorizeAny("DASHBOARD_VIEW", "REPORT_VIEW"), controller.workload);
router.get("/upcoming-deadlines", authenticate, workspaceScope, controller.upcomingDeadlines);
router.get("/recent-activity", authenticate, workspaceScope, controller.recentActivity);
router.get("/widgets", authenticate, workspaceScope, controller.widgets);
router.put("/widgets", authenticate, workspaceScope, controller.saveWidgets);

module.exports = router;