const express = require('express');
const authenticate = require('../../middleware/authenticate');
const teamController = require('./team.controller');

const router = express.Router();

router.get('/', authenticate, teamController.listTeams);
router.post('/', authenticate, teamController.createTeam);
router.get('/:teamId', authenticate, teamController.getTeam);
router.patch('/:teamId', authenticate, teamController.updateTeam);
router.delete('/:teamId', authenticate, teamController.deleteTeam);
router.get('/:teamId/members', authenticate, teamController.listMembers);
router.post('/:teamId/members', authenticate, teamController.addMember);
router.delete('/:teamId/members/:userId', authenticate, teamController.removeMember);

module.exports = router;
