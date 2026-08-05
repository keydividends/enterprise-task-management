const express = require("express");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const projectController = require("./project.controller");

const router = express.Router();

router.get("/", authenticate, authorize("PROJECT_VIEW"), projectController.listProjects);
router.post("/", authenticate, authorize("PROJECT_CREATE"), projectController.createProject);
router.get("/:projectId", authenticate, authorize("PROJECT_VIEW"), projectController.getProject);
router.patch("/:projectId", authenticate, authorize("PROJECT_UPDATE"), projectController.updateProject);
router.delete("/:projectId", authenticate, authorize("PROJECT_DELETE"), projectController.deleteProject);
router.patch("/:projectId/restore", authenticate, authorize("PROJECT_DELETE"), projectController.restoreProject);
router.get("/:projectId/members", authenticate, authorize("PROJECT_VIEW"), projectController.listProjectMembers);
router.post("/:projectId/members", authenticate, authorize("PROJECT_UPDATE"), projectController.addProjectMember);
router.delete("/:projectId/members/:userId", authenticate, authorize("PROJECT_UPDATE"), projectController.removeProjectMember);
router.get("/:projectId/tasks/summary", authenticate, authorize("PROJECT_VIEW"), projectController.getProjectTaskSummary);

module.exports = router;
