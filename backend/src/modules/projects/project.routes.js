const express = require("express");
const authenticate = require("../../middleware/authenticate");
const projectController = require("./project.controller");

const router = express.Router();

router.get("/", authenticate, projectController.listProjects);
router.post("/", authenticate, projectController.createProject);
router.get("/:projectId", authenticate, projectController.getProject);
router.patch("/:projectId", authenticate, projectController.updateProject);
router.delete("/:projectId", authenticate, projectController.deleteProject);
router.patch("/:projectId/restore", authenticate, projectController.restoreProject);
router.get("/:projectId/members", authenticate, projectController.listProjectMembers);
router.post("/:projectId/members", authenticate, projectController.addProjectMember);
router.delete("/:projectId/members/:userId", authenticate, projectController.removeProjectMember);
router.get("/:projectId/tasks/summary", authenticate, projectController.getProjectTaskSummary);

module.exports = router;
