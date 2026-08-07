const mongoose = require("mongoose");
<<<<<<< Updated upstream
const { seedTeams, mockUsers, createTeamRecord, createTeamMemberRecord } = require("./team.model");
const userRepository = require("../users/user.repository");
const authRepository = require("../auth/auth.repository");
=======
const { Team } = require("./team.model");
const { seedTeams, mockUsers, createTeamRecord, createTeamMemberRecord } = require("./team.model");
const userRepository = require("../users/user.repository");
>>>>>>> Stashed changes

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// In-memory seed store (fallback when Mongoose is disconnected)
let teams = [...seedTeams];

<<<<<<< Updated upstream
const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;
=======
const toObjectId = (value) => {
  if (!value) return value;
  if (mongoose.Types.ObjectId.isValid(value)) return new mongoose.Types.ObjectId(value);
  return value;
};

const normalizeTeam = (doc) => {
  if (!doc) return null;
  const obj = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return {
    id: obj._id ? String(obj._id) : obj.id,
    name: obj.name,
    description: obj.description || "",
    leadId: obj.leadId || "mock-admin",
    projectIds: Array.isArray(obj.projectIds) ? obj.projectIds : [],
    workspaceId: obj.workspaceId ? String(obj.workspaceId) : null,
    isActive: obj.isActive !== false,
    isDeleted: Boolean(obj.isDeleted),
    members: Array.isArray(obj.members)
      ? obj.members.map((member) => ({
          userId: member.userId,
          role: member.role || "MEMBER",
          joinedAt: member.joinedAt,
        }))
      : [],
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
};

const seedDatabase = async () => {
  const existing = await Team.countDocuments();
  if (existing > 0) return;
  await Team.create(
    seedTeams.map((team) => ({
      name: team.name,
      description: team.description,
      leadId: team.leadId,
      projectIds: team.projectIds,
      isActive: team.isActive,
      members: team.members,
    }))
  );
};

const listTeams = async ({ search } = {}) => {
  if (isDbConnected()) {
    await seedDatabase();
    const filter = { isDeleted: false };
    const normalized = String(search || "").trim().toLowerCase();
    if (normalized) {
      filter.name = { $regex: normalized, $options: "i" };
    }
    const docs = await Team.find(filter).sort({ createdAt: -1 }).lean();
    return docs.map(normalizeTeam);
  }

  const normalized = String(search || "").trim().toLowerCase();
  const filtered = normalized
    ? teams.filter((team) => team.name.toLowerCase().includes(normalized))
    : teams;
>>>>>>> Stashed changes

const listTeams = async ({ search = "", status, leadId, page = 1, pageSize = 20, sortBy = "createdAt", sortOrder = -1 } = {}) => {
  if (isDbConnected()) {
    // Future MongoDB-backed team storage.
    // The current sprint keeps the in-memory mock repository (see below).
    // This branch is intentionally fallback-free so mocks stay authoritative.
  }

  const normalized = String(search).trim().toLowerCase();

  let items = teams.filter((team) => !team.isDeleted);

  if (normalized) {
    items = items.filter(
      (team) =>
        team.name.toLowerCase().includes(normalized) ||
        String(team.description || "").toLowerCase().includes(normalized)
    );
  }

  if (status) {
    items = items.filter((team) => String(team.status || (team.isActive ? "ACTIVE" : "INACTIVE")).toUpperCase() === String(status).toUpperCase());
  }

  if (leadId) {
    items = items.filter((team) => String(team.leadId) === String(leadId));
  }

  items.sort((a, b) => {
    const valA = a[sortBy] || "";
    const valB = b[sortBy] || "";
    if (valA < valB) return sortOrder === 1 ? -1 : 1;
    if (valA > valB) return sortOrder === 1 ? 1 : -1;
    return 0;
  });

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (page - 1) * pageSize;
  const pagedItems = items.slice(startIndex, startIndex + pageSize);

  return { items: pagedItems, totalItems, page, pageSize, totalPages };
};

const findTeamById = async (teamId) => {
  if (!teamId) return null;
<<<<<<< Updated upstream
=======
  if (isDbConnected()) {
    const doc = await Team.findOne({ _id: toObjectId(teamId), isDeleted: false }).lean();
    return doc ? normalizeTeam(doc) : null;
  }
>>>>>>> Stashed changes
  return teams.find((team) => team.id === teamId && !team.isDeleted) || null;
};

const createTeam = async (payload) => {
  if (isDbConnected()) {
    await seedDatabase();
    const doc = await Team.create({
      name: payload.name,
      description: payload.description || "",
      leadId: payload.leadId || "mock-admin",
      projectIds: Array.isArray(payload.projectIds) ? payload.projectIds : [],
      members: Array.isArray(payload.members) ? payload.members : [],
      isActive: payload.isActive !== false,
    });
    return normalizeTeam(doc);
  }

  const team = createTeamRecord(payload);
  teams.push(team);
  return team;
};

const updateTeam = async (teamId, payload) => {
  if (isDbConnected()) {
    const update = { ...payload, updatedAt: new Date() };
    delete update.id;
    delete update._id;
    delete update.members;
    const doc = await Team.findOneAndUpdate(
      { _id: toObjectId(teamId), isDeleted: false },
      { $set: update },
      { returnDocument: "after" }
    ).lean();
    return doc ? normalizeTeam(doc) : null;
  }

  const team = await findTeamById(teamId);
  if (!team) return null;
  Object.assign(team, payload, { updatedAt: new Date() });
  return team;
};

const deleteTeam = async (teamId) => {
  if (isDbConnected()) {
    const doc = await Team.findOneAndUpdate(
      { _id: toObjectId(teamId), isDeleted: false },
      { $set: { isDeleted: true, isActive: false, deletedAt: new Date(), updatedAt: new Date() } },
      { returnDocument: "after" }
    ).lean();
    return doc ? normalizeTeam(doc) : null;
  }

  const team = await findTeamById(teamId);
  if (!team) return null;
  team.isDeleted = true;
  team.isActive = false;
  team.status = "ARCHIVED";
  team.updatedAt = new Date();
  return team;
};

const restoreTeam = async (teamId) => {
  const team = teams.find((entry) => entry.id === teamId && entry.isDeleted);
  if (!team) return null;
  team.isDeleted = false;
  team.isActive = true;
  team.status = "ACTIVE";
  team.updatedAt = new Date();
  return team;
};

const setTeamStatus = async (teamId, status) => {
  const team = await findTeamById(teamId);
  if (!team) return null;
  team.isActive = status === "ACTIVE";
  team.status = status;
  team.updatedAt = new Date();
  return team;
};

const findMember = async (teamId, userId) => {
  const team = await findTeamById(teamId);
  return team?.members?.find((member) => member.userId === userId) || null;
};

const addMember = async (teamId, memberPayload) => {
  if (isDbConnected()) {
    const createdMember = {
      userId: memberPayload.userId,
      role: memberPayload.role || "MEMBER",
      joinedAt: new Date(),
    };
    const doc = await Team.findOneAndUpdate(
      { _id: toObjectId(teamId), isDeleted: false },
      { $push: { members: createdMember }, $set: { updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    return doc ? createdMember : null;
  }

  const team = await findTeamById(teamId);
  if (!team) return null;
  const createdMember = createTeamMemberRecord(memberPayload);
  team.members.push(createdMember);
  team.updatedAt = new Date();
  return createdMember;
};

const updateMember = async (teamId, userId, role) => {
  const team = await findTeamById(teamId);
  if (!team) return null;
  const member = team.members.find((entry) => entry.userId === userId);
  if (!member) return null;
  member.role = role;
  member.updatedAt = new Date();
  team.updatedAt = new Date();
  return member;
};

const removeMember = async (teamId, userId) => {
  if (isDbConnected()) {
    const doc = await Team.findOneAndUpdate(
      { _id: toObjectId(teamId), isDeleted: false },
      { $pull: { members: { userId } }, $set: { updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    return doc ? true : null;
  }

  const team = await findTeamById(teamId);
  if (!team) return null;
  team.members = team.members.filter((member) => member.userId !== userId);
  team.updatedAt = new Date();
  return true;
};

const findUserById = async (userId) => {
  if (!userId) return null;

<<<<<<< Updated upstream
  // 1. Prefer the team module's own mock users (mock-admin, mock-maya, ...).
  //    These are the canonical IDs used by the team module and the mock-token
  //    auth path, and they are always valid regardless of DB connectivity.
  const mockUser = mockUsers.find((user) => user.id === String(userId));
  if (mockUser) {
    return mockUser;
  }

  // 2. Fall back to the real users module (single source of truth).
  //    Handles both in-memory fallback and MongoDB-backed users.
  try {
    const realUser = await userRepository.findById(String(userId));
    if (realUser) {
      return {
        id: realUser.id || realUser._id || String(userId),
        firstName: realUser.firstName,
        lastName: realUser.lastName,
        role: realUser.role,
        status: realUser.status,
      };
    }
  } catch (error) {
    // If the user ID is not a valid Mongo ObjectId (e.g. a string mock ID),
    // treat it as not found rather than crashing with a CastError.
    if (error && error.name === "CastError") {
      return null;
    }
    throw error;
  }

  // 3. Fall back to the auth module's in-memory users (real registered users).
  //    This keeps team membership in sync with users created through the
  //    auth/register flow even before the real users module is wired to the
  //    same store.
  try {
    const authUser = await authRepository.findUserById(String(userId));
    if (authUser) {
      return {
        id: authUser.id || authUser._id || String(userId),
        firstName: authUser.firstName,
        lastName: authUser.lastName,
        role: authUser.role,
        status: authUser.status,
      };
    }
  } catch (error) {
    if (error && error.name === "CastError") {
      return null;
    }
    throw error;
  }

  return null;
};

const listUsers = async (search = "") => {
  const normalized = String(search || "").trim().toLowerCase();

  // Real users from the users module first.
  const realUsers = Array.isArray(userRepository.inMemoryUsers)
    ? userRepository.inMemoryUsers
    : Array.from(userRepository.inMemoryUsers?.values?.() || []);
  const realList = (realUsers || [])
    .filter((u) => u && u.status === "ACTIVE" && !u.isDeleted)
    .filter((u) => !normalized || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(normalized))
    .map((u) => ({ id: u.id || u._id, firstName: u.firstName, lastName: u.lastName, role: u.role }));

  return realList;
=======
  const normalizedId = String(userId);

  // The users module is backed by MongoDB ObjectId documents. Guard the query
  // so non-ObjectId ids (mock ids like "mock-maya", or arbitrary strings) do
  // NOT throw a CastError and instead fall through to the mock lookup below.
  if (isDbConnected() && mongoose.Types.ObjectId.isValid(normalizedId)) {
    const realUser = await userRepository.findById(normalizedId);
    if (realUser) {
      return {
        id: realUser.id || realUser._id || normalizedId,
        firstName: realUser.firstName,
        lastName: realUser.lastName,
        role: realUser.role,
        status: realUser.status,
      };
    }
  }

  // Fall back to the mock users used by the mock-token auth path.
  return mockUsers.find((user) => user.id === normalizedId) || null;
};

const listUsers = async (search = "") => {
  // Use the users repository's public search API (single source of truth).
  const realUsers = await userRepository.searchUsers(search, 100);
  return (Array.isArray(realUsers) ? realUsers : []).map((u) => ({
    id: u.id || u._id,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
  }));
>>>>>>> Stashed changes
};

module.exports = {
  listTeams,
  findTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  restoreTeam,
  setTeamStatus,
  findMember,
  addMember,
  updateMember,
  removeMember,
  findUserById,
  listUsers,
};
