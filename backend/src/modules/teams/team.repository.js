const mongoose = require("mongoose");
const { seedTeams, mockUsers, createTeamRecord, createTeamMemberRecord } = require("./team.model");
const { Team } = require("./team.model");
const userRepository = require("../users/user.repository");
const authRepository = require("../auth/auth.repository");

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

const toObjectId = (value) => {
  if (!value) return value;
  if (mongoose.Types.ObjectId.isValid(value)) return new mongoose.Types.ObjectId(value);
  return value;
};

// In-memory seed store (fallback when Mongoose is disconnected)
let teams = [...seedTeams];

// ── MongoDB helpers ───────────────────────────────────────────────────────────

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
    status: obj.status || (obj.isActive !== false ? "ACTIVE" : "INACTIVE"),
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

// ── listTeams ─────────────────────────────────────────────────────────────────

const listTeams = async ({
  search = "",
  status,
  leadId,
  page = 1,
  pageSize = 20,
  sortBy = "createdAt",
  sortOrder = -1,
} = {}) => {
  const normalized = String(search).trim().toLowerCase();

  if (isDbConnected()) {
    await seedDatabase();
    const filter = { isDeleted: false };
    if (normalized) {
      filter.$or = [
        { name: { $regex: normalized, $options: "i" } },
        { description: { $regex: normalized, $options: "i" } },
      ];
    }
    if (status) filter.status = status.toUpperCase();
    if (leadId) filter.leadId = String(leadId);

    const totalItems = await Team.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const docs = await Team.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    return { items: docs.map(normalizeTeam), totalItems, page, pageSize, totalPages };
  }

  // In-memory fallback
  let items = teams.filter((team) => !team.isDeleted);

  if (normalized) {
    items = items.filter(
      (team) =>
        team.name.toLowerCase().includes(normalized) ||
        String(team.description || "").toLowerCase().includes(normalized)
    );
  }
  if (status) {
    items = items.filter(
      (team) =>
        String(team.status || (team.isActive ? "ACTIVE" : "INACTIVE")).toUpperCase() ===
        String(status).toUpperCase()
    );
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
  const pagedItems = items.slice((page - 1) * pageSize, page * pageSize);

  return { items: pagedItems, totalItems, page, pageSize, totalPages };
};

// ── findTeamById ──────────────────────────────────────────────────────────────

const findTeamById = async (teamId) => {
  if (!teamId) return null;
  if (isDbConnected()) {
    const doc = await Team.findOne({ _id: toObjectId(teamId), isDeleted: false }).lean();
    return doc ? normalizeTeam(doc) : null;
  }
  return teams.find((team) => team.id === teamId && !team.isDeleted) || null;
};

// ── createTeam ────────────────────────────────────────────────────────────────

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

// ── updateTeam ────────────────────────────────────────────────────────────────

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

// ── deleteTeam ────────────────────────────────────────────────────────────────

const deleteTeam = async (teamId) => {
  if (isDbConnected()) {
    const doc = await Team.findOneAndUpdate(
      { _id: toObjectId(teamId), isDeleted: false },
      { $set: { isDeleted: true, isActive: false, status: "ARCHIVED", deletedAt: new Date(), updatedAt: new Date() } },
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

// ── restoreTeam ───────────────────────────────────────────────────────────────

const restoreTeam = async (teamId) => {
  if (isDbConnected()) {
    const doc = await Team.findOneAndUpdate(
      { _id: toObjectId(teamId), isDeleted: true },
      { $set: { isDeleted: false, isActive: true, status: "ACTIVE", updatedAt: new Date() } },
      { returnDocument: "after" }
    ).lean();
    return doc ? normalizeTeam(doc) : null;
  }

  const team = teams.find((entry) => entry.id === teamId && entry.isDeleted);
  if (!team) return null;
  team.isDeleted = false;
  team.isActive = true;
  team.status = "ACTIVE";
  team.updatedAt = new Date();
  return team;
};

// ── setTeamStatus ─────────────────────────────────────────────────────────────

const setTeamStatus = async (teamId, status) => {
  if (isDbConnected()) {
    const doc = await Team.findOneAndUpdate(
      { _id: toObjectId(teamId), isDeleted: false },
      { $set: { status, isActive: status === "ACTIVE", updatedAt: new Date() } },
      { returnDocument: "after" }
    ).lean();
    return doc ? normalizeTeam(doc) : null;
  }

  const team = await findTeamById(teamId);
  if (!team) return null;
  team.isActive = status === "ACTIVE";
  team.status = status;
  team.updatedAt = new Date();
  return team;
};

// ── findMember ────────────────────────────────────────────────────────────────

const findMember = async (teamId, userId) => {
  const team = await findTeamById(teamId);
  return team?.members?.find((member) => member.userId === userId) || null;
};

// ── addMember ─────────────────────────────────────────────────────────────────

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

// ── updateMember ──────────────────────────────────────────────────────────────

const updateMember = async (teamId, userId, role) => {
  if (isDbConnected()) {
    const doc = await Team.findOneAndUpdate(
      { _id: toObjectId(teamId), isDeleted: false, "members.userId": userId },
      { $set: { "members.$.role": role, updatedAt: new Date() } },
      { returnDocument: "after" }
    ).lean();
    if (!doc) return null;
    return normalizeTeam(doc).members.find((m) => m.userId === userId) || null;
  }

  const team = await findTeamById(teamId);
  if (!team) return null;
  const member = team.members.find((entry) => entry.userId === userId);
  if (!member) return null;
  member.role = role;
  member.updatedAt = new Date();
  team.updatedAt = new Date();
  return member;
};

// ── removeMember ──────────────────────────────────────────────────────────────

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

// ── findUserById ──────────────────────────────────────────────────────────────

const findUserById = async (userId) => {
  if (!userId) return null;
  const normalizedId = String(userId);

  // 1. Mock users — always valid regardless of DB state (used by mock-token auth)
  const mockUser = mockUsers.find((user) => user.id === normalizedId);
  if (mockUser) return mockUser;

  // 2. Real users module (MongoDB or in-memory fallback)
  if (isDbConnected() && mongoose.Types.ObjectId.isValid(normalizedId)) {
    try {
      const realUser = await userRepository.findById(normalizedId);
      if (realUser) {
        return {
          id: String(realUser.id || realUser._id),
          firstName: realUser.firstName,
          lastName: realUser.lastName,
          role: realUser.role,
          status: realUser.status,
        };
      }
    } catch (error) {
      if (error && error.name === "CastError") return null;
      throw error;
    }
  }

  // 3. Auth module in-memory users (covers users registered before DB was connected)
  try {
    const authUser = await authRepository.findUserById(normalizedId);
    if (authUser) {
      return {
        id: String(authUser.id || authUser._id),
        firstName: authUser.firstName,
        lastName: authUser.lastName,
        role: authUser.role,
        status: authUser.status,
      };
    }
  } catch (error) {
    if (error && error.name === "CastError") return null;
    throw error;
  }

  return null;
};

// ── listUsers ─────────────────────────────────────────────────────────────────

const listUsers = async (search = "") => {
  const results = await userRepository.searchUsers(search, 100);
  return (Array.isArray(results) ? results : []).map((u) => ({
    id: String(u.id || u._id),
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
  }));
};

// ── exports ───────────────────────────────────────────────────────────────────

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
