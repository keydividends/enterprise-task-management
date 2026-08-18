const { Project, ProjectMember } = require("./project.model");
const { User } = require("../users/user.model");
const mongoose = require("mongoose");

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;
const toObjectId = (value) => {
  if (!value) return value;
  if (mongoose.Types.ObjectId.isValid(value)) return new mongoose.Types.ObjectId(value);
  return value;
};

const inMemoryProjects = new Map();
const inMemoryProjectMembers = new Map();

const makeProjectId = () => `project_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const makeMemberKey = (projectId, userId) => `${projectId}:${userId}`;
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const listProjects = async ({ workspaceId, search, status, priority, managerId, userId, page = 1, pageSize = 20, sortBy = "createdAt", sortOrder = -1 }) => {
  if (isDbConnected()) {
    const filter = { isDeleted: false };
    if (workspaceId) filter.workspaceId = toObjectId(workspaceId);
    if (userId) {
      const memberships = await ProjectMember.find({ userId: toObjectId(userId), isDeleted: false, status: "ACTIVE" })
        .select("projectId")
        .lean();
      filter.$and = [{
        $or: [
          { projectManagerId: toObjectId(userId) },
          { _id: { $in: memberships.map((membership) => membership.projectId) } },
        ],
      }];
    }
    if (search) {
      const searchFilter = {
        $or: [
        { name: { $regex: search, $options: "i" } },
        { key: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        ],
      };
      if (filter.$and) filter.$and.push(searchFilter);
      else Object.assign(filter, searchFilter);
    }
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (managerId) filter.projectManagerId = toObjectId(managerId);

    const totalItems = await Project.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const items = await Project.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    return { items, totalItems, page, pageSize, totalPages };
  }

  let items = Array.from(inMemoryProjects.values()).filter((project) => !project.isDeleted);
  if (workspaceId) items = items.filter((project) => String(project.workspaceId) === String(workspaceId));
  if (userId) {
    const memberProjectIds = new Set(
      Array.from(inMemoryProjectMembers.values())
        .filter((member) => String(member.userId) === String(userId) && !member.isDeleted && member.status === "ACTIVE")
        .map((member) => String(member.projectId))
    );
    items = items.filter((project) => String(project.projectManagerId) === String(userId) || memberProjectIds.has(String(project._id || project.id)));
  }
  if (search) {
    const normalized = String(search).toLowerCase();
    items = items.filter(
      (project) =>
        String(project.name).toLowerCase().includes(normalized) ||
        String(project.key).toLowerCase().includes(normalized) ||
        String(project.description || "").toLowerCase().includes(normalized)
    );
  }
  if (status) items = items.filter((project) => project.status === status);
  if (priority) items = items.filter((project) => project.priority === priority);
  if (managerId) items = items.filter((project) => String(project.projectManagerId) === String(managerId));

  items.sort((a, b) => {
    const valA = a[sortBy] || "";
    const valB = b[sortBy] || "";
    if (valA < valB) return sortOrder === 1 ? -1 : 1;
    if (valA > valB) return sortOrder === 1 ? 1 : -1;
    return 0;
  });

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const pagedItems = items.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

  return { items: pagedItems, totalItems, page, pageSize, totalPages };
};

const findProjectById = async (projectId, workspaceId = null, includeDeleted = false) => {
  if (!projectId) return null;
  if (isDbConnected()) {
    const filter = { _id: toObjectId(projectId) };
    if (!includeDeleted) filter.isDeleted = false;
    if (workspaceId) filter.workspaceId = toObjectId(workspaceId);
    return Project.findOne(filter).lean();
  }

  const project = inMemoryProjects.get(String(projectId));
  return project && (includeDeleted || !project.isDeleted) && (!workspaceId || String(project.workspaceId) === String(workspaceId)) ? project : null;
};

const findProjectByKey = async (workspaceId, key) => {
  if (!workspaceId || !key) return null;
  if (isDbConnected()) {
    return Project.findOne({ workspaceId: toObjectId(workspaceId), key: String(key).trim(), isDeleted: false }).lean();
  }

  return Array.from(inMemoryProjects.values()).find(
    (project) =>
      !project.isDeleted &&
      String(project.workspaceId) === String(workspaceId) &&
      String(project.key).trim() === String(key).trim()
  );
};

const createProject = async (projectData) => {
  if (isDbConnected()) {
    const project = await Project.create(projectData);
    return project.toObject();
  }

  const projectId = makeProjectId();
  const project = {
    _id: projectId,
    id: projectId,
    ...projectData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  inMemoryProjects.set(String(projectId), project);
  return project;
};

const updateProject = async (projectId, payload) => {
  if (isDbConnected()) {
    return Project.findOneAndUpdate(
      { _id: toObjectId(projectId), isDeleted: false },
      { $set: payload },
      { returnDocument: "after" }
    ).lean();
  }

  const project = inMemoryProjects.get(String(projectId));
  if (!project || project.isDeleted) return null;
  const updated = {
    ...project,
    ...payload,
    updatedAt: new Date(),
  };
  inMemoryProjects.set(String(projectId), updated);
  return updated;
};

const deleteProject = async (projectId, deletedBy) => {
  if (isDbConnected()) {
    return Project.findOneAndUpdate(
      { _id: toObjectId(projectId), isDeleted: false },
      { $set: { isDeleted: true, status: "ARCHIVED", deletedAt: new Date(), deletedBy: deletedBy ? toObjectId(deletedBy) : null } },
      { returnDocument: "after" }
    ).lean();
  }

  const project = inMemoryProjects.get(String(projectId));
  if (!project || project.isDeleted) return null;
  const updated = {
    ...project,
    isDeleted: true,
    status: "ARCHIVED",
    deletedAt: new Date(),
    deletedBy: deletedBy || null,
    updatedAt: new Date(),
  };
  inMemoryProjects.set(String(projectId), updated);
  return updated;
};

const restoreProject = async (projectId) => {
  if (isDbConnected()) {
    return Project.findOneAndUpdate(
      { _id: toObjectId(projectId), isDeleted: true },
      { $set: { isDeleted: false, status: "PLANNING", deletedAt: null, deletedBy: null } },
      { returnDocument: "after" }
    ).lean();
  }

  const project = inMemoryProjects.get(String(projectId));
  if (!project || !project.isDeleted) return null;
  const updated = {
    ...project,
    isDeleted: false,
    status: "PLANNING",
    deletedAt: null,
    deletedBy: null,
    updatedAt: new Date(),
  };
  inMemoryProjects.set(String(projectId), updated);
  return updated;
};

const listProjectMembers = async ({ projectId, page = 1, pageSize = 20, role, status, search }) => {
  if (isDbConnected()) {
    const filter = { projectId: toObjectId(projectId), isDeleted: false };
    if (role) filter.projectRole = role;
    if (status) filter.status = status;
    if (search) {
      const pattern = new RegExp(escapeRegex(search), "i");
      const users = await User.find({
        isDeleted: false,
        $or: [
          { employeeId: pattern },
          { email: pattern },
          { firstName: pattern },
          { lastName: pattern },
        ],
      }).select("_id").lean();
      filter.userId = { $in: users.map((user) => user._id) };
    }

    const totalItems = await ProjectMember.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const items = await ProjectMember.find(filter).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean();
    return { items, totalItems, page, pageSize, totalPages };
  }

  let items = Array.from(inMemoryProjectMembers.values()).filter(
    (member) => String(member.projectId) === String(projectId) && !member.isDeleted
  );
  if (role) items = items.filter((member) => member.projectRole === role);
  if (status) items = items.filter((member) => member.status === status);
  if (search) {
    const normalized = String(search).toLowerCase();
    items = items.filter((member) => String(member.userId).toLowerCase().includes(normalized));
  }

  items.sort((a, b) => b.createdAt - a.createdAt);
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const pagedItems = items.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

  return { items: pagedItems, totalItems, page, pageSize, totalPages };
};

const findProjectMember = async (projectId, userId) => {
  if (isDbConnected()) {
    return ProjectMember.findOne({ projectId: toObjectId(projectId), userId: toObjectId(userId), isDeleted: false }).lean();
  }

  const member = inMemoryProjectMembers.get(makeMemberKey(projectId, userId));
  return member && !member.isDeleted ? member : null;
};

const createProjectMember = async (payload) => {
  if (isDbConnected()) {
    const member = await ProjectMember.create(payload);
    return member.toObject();
  }

  const key = makeMemberKey(payload.projectId, payload.userId);
  const member = {
    _id: key,
    id: key,
    ...payload,
    status: payload.status || "ACTIVE",
    isDeleted: false,
    addedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  inMemoryProjectMembers.set(key, member);
  return member;
};

const removeProjectMember = async (projectId, userId, removedBy) => {
  if (isDbConnected()) {
    return ProjectMember.findOneAndUpdate(
      { projectId: toObjectId(projectId), userId: toObjectId(userId), isDeleted: false },
      { $set: { isDeleted: true, status: "REMOVED", removedAt: new Date(), removedBy: removedBy ? toObjectId(removedBy) : null } },
      { returnDocument: "after" }
    ).lean();
  }

  const key = makeMemberKey(projectId, userId);
  const member = inMemoryProjectMembers.get(key);
  if (!member || member.isDeleted) return null;
  const updated = {
    ...member,
    isDeleted: true,
    status: "REMOVED",
    removedAt: new Date(),
    removedBy: removedBy || null,
    updatedAt: new Date(),
  };
  inMemoryProjectMembers.set(key, updated);
  return updated;
};

const getTaskSummary = async (projectId, options = {}) => {
  const sprintId = options.sprintId ? toObjectId(options.sprintId) : null;

  if (isDbConnected()) {
    try {
      const { Task } = require("../tasks/task.model");
      const match = { projectId: toObjectId(projectId), isDeleted: false };
      if (sprintId) match.sprintId = sprintId;

      const aggregation = await Task.aggregate([
        { $match: match },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);
      return aggregation.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {});
    } catch {
      return {};
    }
  }

  return {};
};

module.exports = {
  listProjects,
  findProjectById,
  findProjectByKey,
  createProject,
  updateProject,
  deleteProject,
  restoreProject,
  listProjectMembers,
  findProjectMember,
  createProjectMember,
  removeProjectMember,
  getTaskSummary,
};
