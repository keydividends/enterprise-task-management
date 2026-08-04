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

// --- Projects ----------------------------------------------------------------

const findProjectById = async (projectId) => {
  if (modelExists("Project")) {
    try {
      return await mongoose.model("Project").findOne({ _id: projectId, isDeleted: false }).lean();
    } catch {
      /* fall through to mock */
    }
  }
  return mock.PROJECTS.find((p) => String(p.id) === String(projectId)) || null;
};

// --- Users -------------------------------------------------------------------

const findUserById = async (userId) => {
  if (modelExists("User")) {
    try {
      return await mongoose.model("User").findOne({ _id: userId, isDeleted: false }).lean();
    } catch {
      /* fall through to mock */
    }
  }
  return mock.USERS.find((u) => String(u.id) === String(userId)) || null;
};

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
      return Boolean(member);
    } catch {
      /* fall through to mock */
    }
  }
  const members = mock.PROJECT_MEMBERS[String(projectId)] || [];
  return members.some((id) => String(id) === String(userId));
};

// --- Sprints -----------------------------------------------------------------

const findSprintById = async (sprintId) => {
  if (modelExists("Sprint")) {
    try {
      return await mongoose.model("Sprint").findOne({ _id: sprintId, isDeleted: false }).lean();
    } catch {
      /* fall through to mock */
    }
  }
  return mock.SPRINTS.find((s) => String(s.id) === String(sprintId)) || null;
};

// --- Epics -------------------------------------------------------------------

const findEpicById = async (epicId) => {
  if (modelExists("Epic")) {
    try {
      return await mongoose.model("Epic").findOne({ _id: epicId, isDeleted: false }).lean();
    } catch {
      /* fall through to mock */
    }
  }
  return mock.EPICS.find((e) => String(e.id) === String(epicId)) || null;
};

module.exports = {
  getWorkspaceId,
  findProjectById,
  findUserById,
  listProjectUsers,
  isProjectMember,
  findSprintById,
  findEpicById,
};

