const projectService = require("./project.service");

const sendSuccess = (res, statusCode, payload) => res.status(statusCode).json(payload);

const listProjects = async (req, res, next) => {
  try {
    const result = await projectService.listProjects(req.query, { user: req.user, workspaceId: req.user.workspaceId });
    sendSuccess(res, 200, { success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getProject = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.projectId, { user: req.user, workspaceId: req.user.workspaceId });
    sendSuccess(res, 200, { success: true, data: project });
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.body, { user: req.user, workspaceId: req.user.workspaceId });
    sendSuccess(res, 201, { success: true, message: "Project created successfully", data: project });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.projectId, req.body, { user: req.user, workspaceId: req.user.workspaceId });
    sendSuccess(res, 200, { success: true, message: "Project updated", data: project });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await projectService.deleteProject(req.params.projectId, { user: req.user, workspaceId: req.user.workspaceId });
    sendSuccess(res, 200, { success: true, message: "Project deleted", data: project });
  } catch (error) {
    next(error);
  }
};

const restoreProject = async (req, res, next) => {
  try {
    const project = await projectService.restoreProject(req.params.projectId, { user: req.user, workspaceId: req.user.workspaceId });
    sendSuccess(res, 200, { success: true, message: "Project restored", data: project });
  } catch (error) {
    next(error);
  }
};

const listProjectMembers = async (req, res, next) => {
  try {
    const result = await projectService.listProjectMembers(req.params.projectId, req.query, { user: req.user, workspaceId: req.user.workspaceId });
    sendSuccess(res, 200, { success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const addProjectMember = async (req, res, next) => {
  try {
    const member = await projectService.addProjectMember(req.params.projectId, req.body, { user: req.user, workspaceId: req.user.workspaceId });
    sendSuccess(res, 201, { success: true, message: "Project member added", data: member });
  } catch (error) {
    next(error);
  }
};

const removeProjectMember = async (req, res, next) => {
  try {
    const member = await projectService.removeProjectMember(req.params.projectId, req.params.employeeId, { user: req.user, workspaceId: req.user.workspaceId });
    sendSuccess(res, 200, { success: true, message: "Project member removed", data: member });
  } catch (error) {
    next(error);
  }
};

const getProjectTaskSummary = async (req, res, next) => {
  try {
    const summary = await projectService.getProjectTaskSummary(
      req.params.projectId,
      { user: req.user, workspaceId: req.user.workspaceId },
      req.query || {}
    );
    sendSuccess(res, 200, { success: true, data: summary });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  restoreProject,
  listProjectMembers,
  addProjectMember,
  removeProjectMember,
  getProjectTaskSummary,
};
