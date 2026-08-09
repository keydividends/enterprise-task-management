// ---------------------------------------------------------------------------
// Integration contracts for the Task module.
//
// The Task module consumes Users / Projects / Sprints / Epics / ProjectMember
// data. This file exposes a stable contract that delegates to the REAL owning
// modules' repositories (read-only lookups) so the task module never reaches
// into another module's internal files or mutates their data.
//
//   - Projects / ProjectMember  -> projects module repository
//   - Users                     -> users module repository
//   - Sprints / Epics           -> mock fallback until those modules exist
//
// Services should only ever call these contract functions - never reach into
// another module's internal files.
// ---------------------------------------------------------------------------

const projectRepository = require("../projects/project.repository");
const userRepository = require("../users/user.repository");
const mock = require("./task.mockData");

// --- Workspace ---------------------------------------------------------------

const getWorkspaceId = async (context = {}) => context.workspaceId || mock.WORKSPACE_ID;

// --- Projects ----------------------------------------------------------------

// Look up a project through the real projects module repository. If the real
// module is not connected (no DB / no seeded data) it falls back to the mock
// project list so test/mock flows keep working during integration.
const findProjectById = async (projectId) => {
  if (!projectId) return null;
  try {
    const project = await projectRepository.findProjectById(projectId);
    if (project) return project;
  } catch {
    /* fall through to mock */
  }
  return mock.PROJECTS.find((p) => String(p.id) === String(projectId)) || null;
};

// --- Users -------------------------------------------------------------------

const findUserById = async (userId) => {
  if (!userId) return null;
  try {
    const user = await userRepository.findById(String(userId));
    if (user) return user;
  } catch {
    /* fall through to mock */
  }
  return mock.USERS.find((u) => String(u.id) === String(userId)) || null;
};

// List users for a project through the real projects + users modules. Falls
// back to mock members for mock project IDs.
const listProjectUsers = async (projectId) => {
  if (projectId) {
    try {
      const { items } = await projectRepository.listProjectMembers({ projectId, page: 1, pageSize: 200 });
      if (items && items.length) {
        const userIds = items.map((m) => m.userId);
        const users = await Promise.all(
          userIds.map(async (uid) => {
            const u = await userRepository.findById(uid);
            return u
              ? { id: String(u.id || u._id), firstName: u.firstName, lastName: u.lastName, email: u.email, fullName: `${u.firstName} ${u.lastName || ""}`.trim() }
              : null;
          })
        );
        const resolved = users.filter(Boolean);
        if (resolved.length) return resolved;
      }
    } catch {
      /* fall through to mock */
    }
  }
  const memberIds = mock.PROJECT_MEMBERS[String(projectId)] || [];
  return mock.USERS.filter((u) => memberIds.includes(String(u.id)));
};

// --- Project membership ------------------------------------------------------

const isProjectMember = async (projectId, userId) => {
  if (!projectId || !userId) return false;
  try {
    const member = await projectRepository.findProjectMember(projectId, userId);
    if (member) return true;
  } catch {
    /* fall through to mock */
  }

  // Project owner/manager check: users who created or manage the project are
  // considered authorized members even if not in the member collection.
  try {
    const project = await projectRepository.findProjectById(projectId);
    if (project) {
      const isCreator = project.createdBy && String(project.createdBy) === String(userId);
      const isManager = project.projectManagerId && String(project.projectManagerId) === String(userId);
      if (isCreator || isManager) return true;
    }
  } catch {
    /* fall through to mock */
  }

  // Mock fallback for mock project IDs.
  const members = mock.PROJECT_MEMBERS[String(projectId)];
  if (members) return members.some((id) => String(id) === String(userId));
  return false;
};

// Resolve the project ids a non-admin caller may read. The task service uses
// this only for an unfiltered task list; project-specific reads call
// isProjectMember directly through assertProjectAccess.
const listAccessibleProjectIds = async (userId, workspaceId = null) => {
  if (!userId) return [];

  let projects = [];
  try {
    const result = await projectRepository.listProjects({ workspaceId, page: 1, pageSize: 100 });
    projects = result?.items || [];
  } catch {
    /* fall through to mock projects */
  }

  if (!projects.length) {
    projects = mock.PROJECTS.filter(
      (project) => !workspaceId || String(project.workspaceId) === String(workspaceId)
    );
  }

  const access = await Promise.all(
    projects.map(async (project) => {
      const projectId = String(project.id || project._id);
      return (await isProjectMember(projectId, userId)) ? projectId : null;
    })
  );

  return access.filter(Boolean);
};

// --- Sprints -----------------------------------------------------------------
// No Sprint module exists yet; keep mock fallback until one is merged.

const findSprintById = async (sprintId) =>
  mock.SPRINTS.find((s) => String(s.id) === String(sprintId)) || null;

// --- Epics -------------------------------------------------------------------
// No Epic module exists yet; keep mock fallback until one is merged.

const findEpicById = async (epicId) =>
  mock.EPICS.find((e) => String(e.id) === String(epicId)) || null;

module.exports = {
  getWorkspaceId,
  findProjectById,
  findUserById,
  listProjectUsers,
  isProjectMember,
  listAccessibleProjectIds,
  findSprintById,
  findEpicById,
};
