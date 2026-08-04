const teamService = require('./team.service');

const sendSuccess = (res, statusCode, payload) => res.status(statusCode).json(payload);

const listTeams = async (req, res, next) => {
  try {
    const result = await teamService.listTeams({ search: req.query.search });
    sendSuccess(res, 200, { success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getTeam = async (req, res, next) => {
  try {
    const team = await teamService.getTeam(req.params.teamId);
    sendSuccess(res, 200, { success: true, data: team });
  } catch (error) {
    next(error);
  }
};

const createTeam = async (req, res, next) => {
  try {
    const team = await teamService.createTeam(req.body);
    sendSuccess(res, 201, { success: true, data: team });
  } catch (error) {
    next(error);
  }
};

const updateTeam = async (req, res, next) => {
  try {
    const team = await teamService.updateTeam(req.params.teamId, req.body);
    sendSuccess(res, 200, { success: true, data: team });
  } catch (error) {
    next(error);
  }
};

const deleteTeam = async (req, res, next) => {
  try {
    const team = await teamService.deleteTeam(req.params.teamId);
    sendSuccess(res, 200, { success: true, data: team });
  } catch (error) {
    next(error);
  }
};

const listMembers = async (req, res, next) => {
  try {
    const members = await teamService.listTeamMembers(req.params.teamId);
    sendSuccess(res, 200, { success: true, data: members });
  } catch (error) {
    next(error);
  }
};

const addMember = async (req, res, next) => {
  try {
    const member = await teamService.addTeamMember(req.params.teamId, req.body);
    sendSuccess(res, 201, { success: true, data: member });
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const result = await teamService.removeTeamMember(req.params.teamId, req.params.userId);
    sendSuccess(res, 200, { success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getTeamSummary = async (req, res, next) => {
  try {
    const summary = await teamService.getTeamSummary(req.params.teamId);
    sendSuccess(res, 200, { success: true, data: summary });
  } catch (error) {
    next(error);
  }
};

const getTeamProjects = async (req, res, next) => {
  try {
    const result = await teamService.getTeamProjects(req.params.teamId);
    sendSuccess(res, 200, { success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  listMembers,
  addMember,
  removeMember,
  getTeamSummary,
  getTeamProjects,
};
