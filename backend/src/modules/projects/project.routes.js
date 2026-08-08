const express = require("express");
const authenticate = require("../../middleware/authenticate");
const projectController = require("./project.controller");

const router = express.Router();

const authorizeProject = (permission) => (req, res, next) => {
  const role = req.user?.role;
  const permissions = Array.isArray(req.user?.permissions) ? req.user.permissions : [];
  const isManager = role === "ADMIN" || role === "MANAGER";
  const canView = isManager || permissions.includes("PROJECT_VIEW");
  if ((permission === "PROJECT_VIEW" && canView) || (permission !== "PROJECT_VIEW" && isManager)) return next();

  const error = new Error("Permission denied.");
  error.code = "PERMISSION_DENIED";
  error.statusCode = 403;
  return next(error);
};

router.get("/", authenticate, authorizeProject("PROJECT_VIEW"), projectController.listProjects);
router.post("/", authenticate, authorizeProject("PROJECT_CREATE"), projectController.createProject);
router.get("/:projectId", authenticate, authorizeProject("PROJECT_VIEW"), projectController.getProject);
router.patch("/:projectId", authenticate, authorizeProject("PROJECT_UPDATE"), projectController.updateProject);
router.delete("/:projectId", authenticate, authorizeProject("PROJECT_DELETE"), projectController.deleteProject);
router.patch("/:projectId/restore", authenticate, authorizeProject("PROJECT_DELETE"), projectController.restoreProject);
router.get("/:projectId/members", authenticate, authorizeProject("PROJECT_VIEW"), projectController.listProjectMembers);
router.post("/:projectId/members", authenticate, authorizeProject("PROJECT_MANAGE_MEMBERS"), projectController.addProjectMember);
router.delete("/:projectId/members/:userId", authenticate, authorizeProject("PROJECT_MANAGE_MEMBERS"), projectController.removeProjectMember);
router.get("/:projectId/tasks/summary", authenticate, authorizeProject("PROJECT_VIEW"), projectController.getProjectTaskSummary);

module.exports = router;
