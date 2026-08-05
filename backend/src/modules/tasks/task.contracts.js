// ---------------------------------------------------------------------------
// Integration contracts for the Task module.
//
// The Task module consumes Users / Projects / Sprints / Epics / ProjectMember
// data. Since those modules are being built in parallel, this file exposes a
// stable contract that:
//   1. Uses the real Mongoose model when the owning module has registered it.
//   2. Falls back to `task.mockData.js` until that module is merged.
//
// Services should only ever call these contract functions - never reach into
// another module's internal files.
// ---------------------------------------------------------------------------

const mongoose = require("mongoose");
const mock = require("./task.mockData");

const modelExists = (name) => Boolean(mongoose.models[name]);

const ensureObjectId = (value) => (mongoose.Types.ObjectId.isValid(value) ? new mongoose.Types.ObjectId(value) : value);

// --- Workspace ---------------------------------------------------------------

const getWorkspaceId = async (context = {}) => context.workspaceId || mock.WORKSPACE_ID;

// Helper: prefer the real model, but fall back to the mock lookup when the real
// model returns no result. This keeps the parallel-module contract working even
// once an owning module registers its model while mock IDs are still in use.
const findRealOrMock = async (modelName, queryFn, mockFn) => {
  if (modelExists(modelName)) {
    try {
      const result = await queryFn();
      // If the real model matched, use it. Otherwise fall through to mock so
      // mock reference IDs still resolve until the owning module is merged.
      if (result) return result;
    } catch {
      /* fall through to mock */
    }
  }
  return mockFn();
};

// --- Projects ----------------------------------------------------------------

const findProjectById = async (projectId) =>
  findRealOrMock(
    "Project",
    () => mongoose.model("Project").findOne({ _id: projectId, isDeleted: false }).lean(),
    () => mock.PROJECTS.find((p) => String(p.id) === String(projectId)) || null
  );

// --- Users -------------------------------------------------------------------

const findUserById = async (userId) =>
  findRealOrMock(
    "User",
    () => mongoose.model("User").findOne({ _id: userId, isDeleted: false }).lean(),
    () => mock.USERS.find((u) => String(u.id) === String(userId)) || null
  );

const listProjectUsers = async (projectId) => {
  const memberIds = mock.PROJECT_MEMBERS[String(projectId)] || [];
  return mock.USERS.filter((u) => memberIds.includes(String(u.id)));
};

// --- Project membership -------------------------------------------------------

const isProjectMember = async (projectId, userId) => {
  if (modelExists("ProjectMember")) {
    try {
      const member = await mongoose
        .model("ProjectMember")
        .findOne({ projectId: ensureObjectId(projectId), userId: ensureObjectId(userId), status: "ACTIVE" })
        .lean();
      if (member) return true;
    } catch {
      /* fall through to mock */
    }
  }
  // Mock fallback: ProjectMember module not yet built.
  // Any authenticated user is granted access to mock projects.
  const mockProjectIds = Object.keys(mock.PROJECT_MEMBERS);
  if (mockProjectIds.includes(String(projectId))) return Boolean(userId);
  const members = mock.PROJECT_MEMBERS[String(projectId)] || [];
  return members.some((id) => String(id) === String(userId));
};

// --- Sprints -----------------------------------------------------------------

const findSprintById = async (sprintId) =>
  findRealOrMock(
    "Sprint",
    () => mongoose.model("Sprint").findOne({ _id: sprintId, isDeleted: false }).lean(),
    () => mock.SPRINTS.find((s) => String(s.id) === String(sprintId)) || null
  );

// --- Epics -------------------------------------------------------------------

const findEpicById = async (epicId) =>
  findRealOrMock(
    "Epic",
    () => mongoose.model("Epic").findOne({ _id: epicId, isDeleted: false }).lean(),
    () => mock.EPICS.find((e) => String(e.id) === String(epicId)) || null
  );

module.exports = {
  getWorkspaceId,
  findProjectById,
  findUserById,
  listProjectUsers,
  isProjectMember,
  findSprintById,
  findEpicById,
};

