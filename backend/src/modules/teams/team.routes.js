const express = require('express');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const teamController = require('./team.controller');

const router = express.Router();

router.get('/', authenticate, authorize('TEAM_VIEW'), teamController.listTeams);
router.post('/', authenticate, authorize('TEAM_CREATE'), teamController.createTeam);
router.get('/:teamId/summary', authenticate, authorize('TEAM_VIEW'), teamController.getTeamSummary);
router.get('/:teamId/projects', authenticate, authorize('TEAM_VIEW'), teamController.getTeamProjects);
router.get('/:teamId/members', authenticate, authorize('TEAM_VIEW'), teamController.listMembers);
router.post('/:teamId/members', authenticate, authorize('TEAM_MANAGE_MEMBERS'), teamController.addMember);
router.delete('/:teamId/members/:userId', authenticate, authorize('TEAM_MANAGE_MEMBERS'), teamController.removeMember);
router.get('/:teamId', authenticate, authorize('TEAM_VIEW'), teamController.getTeam);
router.patch('/:teamId', authenticate, authorize('TEAM_UPDATE'), teamController.updateTeam);
router.delete('/:teamId', authenticate, authorize('TEAM_DELETE'), teamController.deleteTeam);

module.exports = router;
