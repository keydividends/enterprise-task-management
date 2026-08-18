const express = require("express");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const projectController = require("./project.controller");

const router = express.Router();

const canManageProjects = (req, res, next) => {
  const role = String(req.user?.role || "").toUpperCase();
  if (["SUPER_ADMIN", "ADMIN", "ORGANIZATION_ADMIN", "MANAGER", "PROJECT_MANAGER"].includes(role)) return next();

  const error = new Error("Only administrators and managers can manage projects.");
  error.code = "PROJECT_ACCESS_DENIED";
  error.statusCode = 403;
  return next(error);
};

router.get("/", authenticate, authorize("PROJECT_VIEW"), projectController.listProjects);
router.post("/", authenticate, authorize("PROJECT_CREATE"), canManageProjects, projectController.createProject);
router.get("/:projectId", authenticate, authorize("PROJECT_VIEW"), projectController.getProject);
router.patch("/:projectId", authenticate, authorize("PROJECT_UPDATE"), canManageProjects, projectController.updateProject);
router.delete("/:projectId", authenticate, authorize("PROJECT_DELETE"), canManageProjects, projectController.deleteProject);
router.patch("/:projectId/restore", authenticate, authorize("PROJECT_DELETE"), canManageProjects, projectController.restoreProject);
router.get("/:projectId/members", authenticate, authorize("PROJECT_VIEW"), projectController.listProjectMembers);
router.post("/:projectId/members", authenticate, authorize("PROJECT_MANAGE_MEMBERS"), canManageProjects, projectController.addProjectMember);
router.delete("/:projectId/members/:employeeId", authenticate, authorize("PROJECT_MANAGE_MEMBERS"), canManageProjects, projectController.removeProjectMember);
router.get("/:projectId/tasks/summary", authenticate, authorize("PROJECT_VIEW"), projectController.getProjectTaskSummary);

module.exports = router;
