const projectRepository = require("./project.repository");
const userRepository = require("../users/user.repository");
const { toProjectDTO, toProjectMemberDTO } = require("./project.mapper");
const {
  validateCreateProject,
  validateListQuery,
  validateProjectId,
  validateUpdateProject,
  validateProjectMemberInput,
  isValidObjectId,
} = require("./project.validation");

const createError = (code, message, statusCode = 400, field = null) => {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  if (field) error.field = field;
  return error;
};

const getWorkspaceId = (context = {}) => context.workspaceId || null;

const resolveProjectManagerId = async (managerReference) => {
  const reference = String(managerReference || "").trim();
  if (!reference) return null;

  // Project forms can use either a user's MongoDB ID or their employee/custom ID.
  let manager = await userRepository.findByCustomId(reference);
  if (!manager && isValidObjectId(reference)) {
    manager = await userRepository.findById(reference);
  }

  if (!manager || manager.isDeleted || manager.status !== "ACTIVE") {
    throw createError("USER_NOT_FOUND", "Project manager must be a valid active user.", 404, "projectManagerId");
  }

  return String(manager._id || manager.id);
};

const toProjectDTOWithManager = async (project) => {
  const dto = toProjectDTO(project);
  if (!dto?.projectManagerId) return dto;

  try {
    const manager = await userRepository.findById(dto.projectManagerId);
    return {
      ...dto,
      projectManagerCustomId: manager?.customId || null,
    };
  } catch {
    return { ...dto, projectManagerCustomId: null };
  }
};

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
    items: await Promise.all(items.map(toProjectDTOWithManager)),
    pagination: { page, pageSize, totalItems, totalPages },
  };
};

const getProjectById = async (projectId, context = {}) => {
  validateProjectId(projectId);
  const project = await projectRepository.findProjectById(projectId);
  if (!project) {
    throw createError("PROJECT_NOT_FOUND", "Project not found.", 404);
  }
  return toProjectDTOWithManager(project);
};

const createProject = async (payload, context = {}) => {
  const validated = validateCreateProject(payload);
  const workspaceId = getWorkspaceId(context) || 'default';

  const existing = await projectRepository.findProjectByKey(workspaceId, validated.key);
  if (existing) {
    throw createError("PROJECT_KEY_EXISTS", "Project key already exists in this workspace.", 409, "key");
  }

  const projectManagerId = validated.projectManagerId
    ? await resolveProjectManagerId(validated.projectManagerId)
    : null;

  const projectData = {
    workspaceId,
    name: validated.name,
    key: validated.key,
    description: validated.description,
    projectManagerId,
    status: validated.status,
    priority: validated.priority,
    startDate: validated.startDate,
    targetEndDate: validated.targetEndDate,
    createdBy: context.user?.id || null,
    updatedBy: context.user?.id || null,
  };

  const project = await projectRepository.createProject(projectData);
  return toProjectDTOWithManager(project);
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

  if (validated.projectManagerId !== undefined) {
    validated.projectManagerId = validated.projectManagerId
      ? await resolveProjectManagerId(validated.projectManagerId)
      : null;
  }

  const updated = await projectRepository.updateProject(projectId, {
    ...validated,
    updatedBy: context.user?.id || null,
  });
  return toProjectDTOWithManager(updated);
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

  const enriched = await Promise.all(
    result.items.map(async (member) => {
      try {
        const uid = String(member.userId);
        if (/^[a-f0-9]{24}$/i.test(uid)) {
          const user = await userRepository.findById(uid);
          if (user) {
            member.userName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || null;
            member.customId = user.customId || null;
          }
        }
      } catch { /* skip */ }
      return member;
    })
  );



   

  return {
    items: enriched.map(toProjectMemberDTO),
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

  // resolve customId → real MongoDB _id, reject if not found
  let resolvedUserId = null;
  let resolvedUserName = null;
  let resolvedCustomId = null;

  const userByCustomId = await userRepository.findByCustomId(memberInput.userId);
  if (userByCustomId) {
    if (userByCustomId.isDeleted || userByCustomId.status === "DISABLED") {
      throw createError("USER_NOT_FOUND", "Member user must be valid and active.", 404, "userId");
    }
    resolvedUserId = String(userByCustomId._id || userByCustomId.id);
    resolvedUserName = [userByCustomId.firstName, userByCustomId.lastName].filter(Boolean).join(' ') || userByCustomId.email || null;
    resolvedCustomId = userByCustomId.customId || null;
  } else {
    // fallback: try as MongoDB ObjectId
    if (/^[a-f0-9]{24}$/i.test(memberInput.userId)) {
      const user = await userRepository.findById(memberInput.userId);
      if (!user || user.isDeleted || user.status === "DISABLED") {
        throw createError("USER_NOT_FOUND", "No user found with that ID.", 404, "userId");
      }
      resolvedUserId = String(user._id || user.id);
      resolvedUserName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || null;
      resolvedCustomId = user.customId || null;
    } else {
      throw createError("USER_NOT_FOUND", "No user found with that ID.", 404, "userId");
    }
  }

  const existing = await projectRepository.findProjectMember(projectId, resolvedUserId);
  if (existing) {
    throw createError("PROJECT_MEMBER_EXISTS", "User is already a project member.", 409, "userId");
  }

  const created = await projectRepository.createProjectMember({
    projectId,
    userId: resolvedUserId,
    projectRole: memberInput.projectRole,
    allocationPercentage: memberInput.allocationPercentage,
    addedBy: context.user?.id || null,
  });

  try {
    const uid = String(resolvedUserId);
    if (/^[a-f0-9]{24}$/i.test(uid)) {
      const user = await userRepository.findById(uid);
      if (user) {
        created.userName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || null;
      }
    }
  } catch { /* skip */ }

  
  try {
    const uid = String(resolvedUserId);
    if (/^[a-f0-9]{24}$/i.test(uid)) {
      const user = await userRepository.findById(uid);
      if (user) {
        created.userName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || null;
      }
    }
  } catch { /* skip */ }

  const plain = typeof created.toObject === 'function' ? created.toObject() : { ...created };
  plain.userName = resolvedUserName;
  plain.customId = resolvedCustomId;

  return toProjectMemberDTO(plain);
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

const getProjectTaskSummary = async (projectId, context = {}, query = {}) => {
  validateProjectId(projectId);
  const project = await projectRepository.findProjectById(projectId);
  if (!project) {
    throw createError("PROJECT_NOT_FOUND", "Project not found.", 404);
  }

  const summary = await projectRepository.getTaskSummary(projectId, { sprintId: query.sprintId });
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
