const teamService = require("./team.service");

const sendSuccess = (res, statusCode, payload) => res.status(statusCode).json(payload);

const listTeams = async (req, res, next) => {
  try {
    const result = await teamService.listTeams(req.query);
    sendSuccess(res, 200, { success: true, data: result.items, pagination: result.pagination });
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
    sendSuccess(res, 201, { success: true, message: "Team created successfully", data: team });
  } catch (error) {
    next(error);
  }
};

const updateTeam = async (req, res, next) => {
  try {
    const team = await teamService.updateTeam(req.params.teamId, req.body);
    sendSuccess(res, 200, { success: true, message: "Team updated", data: team });
  } catch (error) {
    next(error);
  }
};

const deleteTeam = async (req, res, next) => {
  try {
    const team = await teamService.deleteTeam(req.params.teamId);
    sendSuccess(res, 200, { success: true, message: "Team deleted", data: team });
  } catch (error) {
    next(error);
  }
};

const restoreTeam = async (req, res, next) => {
  try {
    const team = await teamService.restoreTeam(req.params.teamId);
    sendSuccess(res, 200, { success: true, message: "Team restored", data: team });
  } catch (error) {
    next(error);
  }
};

const deactivateTeam = async (req, res, next) => {
  try {
    const team = await teamService.setTeamStatus(req.params.teamId, "INACTIVE");
    sendSuccess(res, 200, { success: true, message: "Team deactivated", data: team });
  } catch (error) {
    next(error);
  }
};

const activateTeam = async (req, res, next) => {
  try {
    const team = await teamService.setTeamStatus(req.params.teamId, "ACTIVE");
    sendSuccess(res, 200, { success: true, message: "Team activated", data: team });
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
    sendSuccess(res, 201, { success: true, message: "Team member added", data: member });
  } catch (error) {
    next(error);
  }
};

const updateMember = async (req, res, next) => {
  try {
    const member = await teamService.updateTeamMember(req.params.teamId, req.params.userId, req.body);
    sendSuccess(res, 200, { success: true, message: "Team member updated", data: member });
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const result = await teamService.removeTeamMember(req.params.teamId, req.params.userId);
    sendSuccess(res, 200, { success: true, message: "Team member removed", data: result });
  } catch (error) {
    next(error);
  }
};

const assignLead = async (req, res, next) => {
  try {
    const team = await teamService.assignTeamLead(req.params.teamId, req.body);
    sendSuccess(res, 200, { success: true, message: "Team lead assigned", data: team });
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
  restoreTeam,
  deactivateTeam,
  activateTeam,
  listMembers,
  addMember,
  updateMember,
  removeMember,
  assignLead,
  getTeamSummary,
  getTeamProjects,
};
