const express = require("express");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const { authorizeTeamView } = require("../../middleware/authorize");
const teamController = require("./team.controller");

const router = express.Router();

router.get("/", authenticate, authorizeTeamView, teamController.listTeams);
router.post("/", authenticate, authorize("TEAM_CREATE"), teamController.createTeam);

// Specific sub-routes MUST come before parameterized :teamId routes.
router.get("/:teamId/summary", authenticate, authorizeTeamView, teamController.getTeamSummary);
router.get("/:teamId/projects", authenticate, authorizeTeamView, teamController.getTeamProjects);
router.get("/:teamId/members", authenticate, authorizeTeamView, teamController.listMembers);
router.post("/:teamId/members", authenticate, authorize("TEAM_MANAGE_MEMBERS"), teamController.addMember);
router.put("/:teamId/members/:userId", authenticate, authorize("TEAM_MANAGE_MEMBERS"), teamController.updateMember);
router.delete("/:teamId/members/:userId", authenticate, authorize("TEAM_MANAGE_MEMBERS"), teamController.removeMember);
router.patch("/:teamId/lead", authenticate, authorize("TEAM_UPDATE"), teamController.assignLead);

// Lifecycle routes.
router.patch("/:teamId/deactivate", authenticate, authorize("TEAM_UPDATE"), teamController.deactivateTeam);
router.patch("/:teamId/activate", authenticate, authorize("TEAM_UPDATE"), teamController.activateTeam);
router.patch("/:teamId/restore", authenticate, authorize("TEAM_DELETE"), teamController.restoreTeam);

// Individual team routes.
router.get("/:teamId", authenticate, authorizeTeamView, teamController.getTeam);
router.patch("/:teamId", authenticate, authorize("TEAM_UPDATE"), teamController.updateTeam);
router.delete("/:teamId", authenticate, authorize("TEAM_DELETE"), teamController.deleteTeam);

module.exports = router;
