const projectRepository = require("./project.repository");
const userRepository = require("../users/user.repository");
const { toProjectDTO, toProjectMemberDTO } = require("./project.mapper");
const {
  validateCreateProject,
  validateListQuery,
  validateProjectId,
  validateUpdateProject,
  validateProjectMemberInput,
} = require("./project.validation");

const createError = (code, message, statusCode = 400, field = null) => {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  if (field) error.field = field;
  return error;
};

const getWorkspaceId = (context = {}) => context.workspaceId || null;

const listProjects = async (query = {}, context = {}) => {
  const validated = validateListQuery(query);
  const workspaceId = getWorkspaceId(context);
  const { items, totalItems, page, pageSize, totalPages } = await projectRepository.listProjects({
    workspaceId,
    search: validated.search,
    status: validated.status,
    priority: validated.priority,
    managerId: validated.managerId,
    page: validated.page,
    pageSize: validated.pageSize,
    sortBy: validated.sortBy,
    sortOrder: validated.sortOrder,
  });

  return {
    items: items.map(toProjectDTO),
    pagination: { page, pageSize, totalItems, totalPages },
  };
};

const getProjectById = async (projectId, context = {}) => {
  validateProjectId(projectId);
  const project = await projectRepository.findProjectById(projectId);
  if (!project) {
    throw createError("PROJECT_NOT_FOUND", "Project not found.", 404);
  }
  return toProjectDTO(project);
};

const createProject = async (payload, context = {}) => {
  const validated = validateCreateProject(payload);
  const workspaceId = getWorkspaceId(context);
  if (!workspaceId) {
    throw createError("WORKSPACE_REQUIRED", "Workspace context is required.", 400);
  }

  const existing = await projectRepository.findProjectByKey(workspaceId, validated.key);
  if (existing) {
    throw createError("PROJECT_KEY_EXISTS", "Project key already exists in this workspace.", 409, "key");
  }

  if (validated.projectManagerId) {
    try {
      const manager = await userRepository.findById(validated.projectManagerId);
      if (manager && (manager.isDeleted || manager.status === "DISABLED")) {
        throw createError("USER_NOT_FOUND", "Project manager must be a valid active user.", 404, "projectManagerId");
      }
    } catch (err) {
      if (err.code === "USER_NOT_FOUND") throw err;
      // skip validation if user lookup fails
    }
  }

  const projectData = {
    workspaceId,
    name: validated.name,
    key: validated.key,
    description: validated.description,
    projectManagerId: validated.projectManagerId || null,
    status: validated.status,
    priority: validated.priority,
    startDate: validated.startDate,
    targetEndDate: validated.targetEndDate,
    createdBy: context.user?.id || null,
    updatedBy: context.user?.id || null,
  };

  const project = await projectRepository.createProject(projectData);
  return toProjectDTO(project);
};

const updateProject = async (projectId, payload, context = {}) => {
  validateProjectId(projectId);
  const validated = validateUpdateProject(payload);
  const project = await projectRepository.findProjectById(projectId);
  if (!project) {
    throw createError("PROJECT_NOT_FOUND", "Project not found.", 404);
  }

  if (validated.key && validated.key !== project.key) {
    const existing = await projectRepository.findProjectByKey(project.workspaceId, validated.key);
    if (existing && String(existing._id) !== String(projectId)) {
      throw createError("PROJECT_KEY_EXISTS", "Project key already exists.", 409, "key");
    }
  }

  if (validated.projectManagerId) {
    try {
      const manager = await userRepository.findById(validated.projectManagerId);
      if (manager && (manager.isDeleted || manager.status === "DISABLED")) {
        throw createError("USER_NOT_FOUND", "Project manager must be a valid active user.", 404, "projectManagerId");
      }
    } catch (err) {
      if (err.code === "USER_NOT_FOUND") throw err;
      // skip validation if user lookup fails
    }
  }

  const updated = await projectRepository.updateProject(projectId, {
    ...validated,
    updatedBy: context.user?.id || null,
  });
  return toProjectDTO(updated);
};

const deleteProject = async (projectId, context = {}) => {
  validateProjectId(projectId);
  const project = await projectRepository.findProjectById(projectId);
  if (!project) {
    throw createError("PROJECT_NOT_FOUND", "Project not found.", 404);
  }

  const deleted = await projectRepository.deleteProject(projectId, context.user?.id);
  return toProjectDTO(deleted);
};

const restoreProject = async (projectId, context = {}) => {
  validateProjectId(projectId);
  const restored = await projectRepository.restoreProject(projectId);
  if (!restored) {
    throw createError("PROJECT_NOT_FOUND", "Project not found.", 404);
  }
  return toProjectDTO(restored);
};

const listProjectMembers = async (projectId, query = {}, context = {}) => {
  validateProjectId(projectId);
  const project = await projectRepository.findProjectById(projectId);
  if (!project) {
    throw createError("PROJECT_NOT_FOUND", "Project not found.", 404);
  }

  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 20;
  const role = query.role ? String(query.role).trim().toUpperCase() : undefined;
  const status = query.status ? String(query.status).trim().toUpperCase() : undefined;
  const search = query.search ? String(query.search).trim() : undefined;

  const result = await projectRepository.listProjectMembers({ projectId, page, pageSize, role, status, search });
  return {
    items: result.items.map(toProjectMemberDTO),
    pagination: {
      page: result.page,
      pageSize: result.pageSize,
      totalItems: result.totalItems,
      totalPages: result.totalPages,
    },
  };
};

const addProjectMember = async (projectId, payload, context = {}) => {
  validateProjectId(projectId);
  const project = await projectRepository.findProjectById(projectId);
  if (!project) {
    throw createError("PROJECT_NOT_FOUND", "Project not found.", 404);
  }

  const memberInput = validateProjectMemberInput(payload);
  try {
    const user = await userRepository.findById(memberInput.userId);
    if (user && (user.isDeleted || user.status === "DISABLED")) {
      throw createError("USER_NOT_FOUND", "Member user must be valid and active.", 404, "userId");
    }
  } catch (err) {
    if (err.code === "USER_NOT_FOUND") throw err;
  }

  const existing = await projectRepository.findProjectMember(projectId, memberInput.userId);
  if (existing) {
    throw createError("PROJECT_MEMBER_EXISTS", "User is already a project member.", 409, "userId");
  }

  const created = await projectRepository.createProjectMember({
    projectId,
    userId: memberInput.userId,
    projectRole: memberInput.projectRole,
    allocationPercentage: memberInput.allocationPercentage,
    addedBy: context.user?.id || null,
  });

  return toProjectMemberDTO(created);
};

const removeProjectMember = async (projectId, userId, context = {}) => {
  validateProjectId(projectId);
  if (!userId || !String(userId).trim()) {
    throw createError("VALIDATION_ERROR", "User ID is required.", 400, "userId");
  }

  const project = await projectRepository.findProjectById(projectId);
  if (!project) {
    throw createError("PROJECT_NOT_FOUND", "Project not found.", 404);
  }

  const member = await projectRepository.findProjectMember(projectId, userId);
  if (!member) {
    throw createError("PROJECT_MEMBER_NOT_FOUND", "Project member not found.", 404);
  }

  const removed = await projectRepository.removeProjectMember(projectId, userId, context.user?.id);
  return toProjectMemberDTO(removed);
};

const getProjectTaskSummary = async (projectId, context = {}) => {
  validateProjectId(projectId);
  const project = await projectRepository.findProjectById(projectId);
  if (!project) {
    throw createError("PROJECT_NOT_FOUND", "Project not found.", 404);
  }

  const summary = await projectRepository.getTaskSummary(projectId);
  return summary;
};

module.exports = {
  listProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  restoreProject,
  listProjectMembers,
  addProjectMember,
  removeProjectMember,
  getProjectTaskSummary,
};
