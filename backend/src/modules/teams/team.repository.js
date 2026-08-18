const mongoose = require("mongoose");
const { Team, createTeamMemberRecord } = require("./team.model");
const userRepository = require("../users/user.repository");
const authRepository = require("../auth/auth.repository");

const isDbConnected = () =>
  mongoose.connection && mongoose.connection.readyState === 1;

const toObjectId = (value) => {
  if (!value) return value;
  if (mongoose.Types.ObjectId.isValid(value)) return new mongoose.Types.ObjectId(value);
  return value;
};

// ── In-memory fallback store (used ONLY when MongoDB is unavailable) ──────────
// This is intentionally kept for automated tests that run without a DB.
// Production/demo execution always uses MongoDB (isDbConnected() === true).
const { seedTeams } = require("./team.model");
let _inMemoryTeams = null;
const getInMemoryTeams = () => {
  if (!_inMemoryTeams) _inMemoryTeams = seedTeams.map((t) => ({ ...t }));
  return _inMemoryTeams;
};

// ── Normalize a MongoDB document to the shape the service/mapper expects ──────
const normalizeTeam = (doc) => {
  if (!doc) return null;
  const obj = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return {
    id: String(obj._id || obj.id),
    name: obj.name,
    description: obj.description || "",
    leadId: obj.leadId ? String(obj.leadId) : null,
    projectIds: Array.isArray(obj.projectIds) ? obj.projectIds : [],
    workspaceId: obj.workspaceId ? String(obj.workspaceId) : null,
    isActive: obj.isActive !== false,
    isDeleted: Boolean(obj.isDeleted),
    status: obj.status || (obj.isActive !== false ? "ACTIVE" : "INACTIVE"),
    members: Array.isArray(obj.members)
      ? obj.members.map((m) => ({
          userId: String(m.userId),
          role: m.role || "MEMBER",
          joinedAt: m.joinedAt,
        }))
      : [],
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
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
    const filter = { isDeleted: false };
    if (normalized) {
      filter.$or = [
        { name: { $regex: normalized, $options: "i" } },
        { description: { $regex: normalized, $options: "i" } },
      ];
    }
    if (status) filter.status = String(status).toUpperCase();
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
  let items = getInMemoryTeams().filter((t) => !t.isDeleted);
  if (normalized) {
    items = items.filter(
      (t) =>
        t.name.toLowerCase().includes(normalized) ||
        String(t.description || "").toLowerCase().includes(normalized)
    );
  }
  if (status) {
    items = items.filter(
      (t) =>
        String(t.status || (t.isActive ? "ACTIVE" : "INACTIVE")).toUpperCase() ===
        String(status).toUpperCase()
    );
  }
  if (leadId) items = items.filter((t) => String(t.leadId) === String(leadId));

  items.sort((a, b) => {
    const va = a[sortBy] || "", vb = b[sortBy] || "";
    if (va < vb) return sortOrder === 1 ? -1 : 1;
    if (va > vb) return sortOrder === 1 ? 1 : -1;
    return 0;
  });

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    totalItems, page, pageSize, totalPages,
  };
};

// ── findTeamById ──────────────────────────────────────────────────────────────

const findTeamById = async (teamId) => {
  if (!teamId) return null;
  if (isDbConnected()) {
    const doc = await Team.findOne({ _id: toObjectId(teamId), isDeleted: false }).lean();
    return doc ? normalizeTeam(doc) : null;
  }
  return getInMemoryTeams().find((t) => t.id === teamId && !t.isDeleted) || null;
};

// ── createTeam ────────────────────────────────────────────────────────────────

const createTeam = async (payload) => {
  if (isDbConnected()) {
    const doc = await Team.create({
      name: payload.name,
      description: payload.description || "",
      leadId: payload.leadId,
      projectIds: Array.isArray(payload.projectIds) ? payload.projectIds : [],
      members: Array.isArray(payload.members) ? payload.members : [],
      isActive: payload.isActive !== false,
    });
    return normalizeTeam(doc);
  }

  const { createTeamRecord } = require("./team.model");
  const team = createTeamRecord(payload);
  getInMemoryTeams().push(team);
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
      { new: true }
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
      { new: true }
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
      { new: true }
    ).lean();
    return doc ? normalizeTeam(doc) : null;
  }

  const team = getInMemoryTeams().find((t) => t.id === teamId && t.isDeleted);
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
      { new: true }
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
  return team?.members?.find((m) => m.userId === String(userId)) || null;
};

// ── addMember ─────────────────────────────────────────────────────────────────

const addMember = async (teamId, memberPayload) => {
  const newMember = {
    userId: String(memberPayload.userId),
    role: memberPayload.role || "MEMBER",
    joinedAt: new Date(),
  };

  if (isDbConnected()) {
    const doc = await Team.findOneAndUpdate(
      { _id: toObjectId(teamId), isDeleted: false },
      { $push: { members: newMember }, $set: { updatedAt: new Date() } },
      { new: true }
    );
    return doc ? newMember : null;
  }

  const team = await findTeamById(teamId);
  if (!team) return null;
  const record = createTeamMemberRecord(memberPayload);
  team.members.push(record);
  team.updatedAt = new Date();
  return record;
};

// ── updateMember ──────────────────────────────────────────────────────────────

const updateMember = async (teamId, userId, role) => {
  const uid = String(userId);

  if (isDbConnected()) {
    const doc = await Team.findOneAndUpdate(
      { _id: toObjectId(teamId), isDeleted: false, "members.userId": uid },
      { $set: { "members.$.role": role, updatedAt: new Date() } },
      { new: true }
    ).lean();
    if (!doc) return null;
    return normalizeTeam(doc).members.find((m) => m.userId === uid) || null;
  }

  const team = await findTeamById(teamId);
  if (!team) return null;
  const member = team.members.find((m) => m.userId === uid);
  if (!member) return null;
  member.role = role;
  team.updatedAt = new Date();
  return member;
};

// ── removeMember ──────────────────────────────────────────────────────────────

const removeMember = async (teamId, userId) => {
  const uid = String(userId);

  if (isDbConnected()) {
    const doc = await Team.findOneAndUpdate(
      { _id: toObjectId(teamId), isDeleted: false },
      { $pull: { members: { userId: uid } }, $set: { updatedAt: new Date() } },
      { new: true }
    );
    return doc ? true : null;
  }

  const team = await findTeamById(teamId);
  if (!team) return null;
  team.members = team.members.filter((m) => m.userId !== uid);
  team.updatedAt = new Date();
  return true;
};

// ── findUserById ──────────────────────────────────────────────────────────────
// Resolution order:
//   1. Real MongoDB user (primary — used in production/demo)
//   2. Auth module in-memory users (covers users registered before DB connected)
//   3. Mock users from team.model (used ONLY by automated tests without DB)

const { mockUsers } = require("./team.model");
const ELIGIBLE_TEAM_LEAD_ROLES = ["ADMIN", "ORGANIZATION_ADMIN", "MANAGER", "LEAD"];
const isEligibleTeamLead = (user) =>
  Boolean(user) && ELIGIBLE_TEAM_LEAD_ROLES.includes(String(user.role || "").toUpperCase());

const findUserById = async (userId) => {
  if (!userId) return null;
  const uid = String(userId);

  // 1. Real MongoDB user — primary source when DB is connected
  if (isDbConnected() && mongoose.Types.ObjectId.isValid(uid)) {
    try {
      const realUser = await userRepository.findById(uid);
      if (realUser && realUser.status === "ACTIVE") {
        return {
          id: String(realUser._id || realUser.id),
          firstName: realUser.firstName,
          lastName: realUser.lastName,
          role: realUser.role,
          status: realUser.status,
          email: realUser.email,
        };
      }
    } catch (err) {
      if (err && err.name === "CastError") return null;
      throw err;
    }
  }

  // 2. Auth module in-memory (registered users when DB was unavailable)
  try {
    const authUser = await authRepository.findUserById(uid);
    if (authUser && authUser.status === "ACTIVE") {
      return {
        id: String(authUser._id || authUser.id),
        firstName: authUser.firstName,
        lastName: authUser.lastName,
        role: authUser.role,
        status: authUser.status,
        email: authUser.email,
      };
    }
  } catch (err) {
    if (err && err.name === "CastError") return null;
    throw err;
  }

  // 3. Mock users — fallback for automated tests only (no DB)
  if (!isDbConnected()) {
    const mock = mockUsers.find((u) => u.id === uid);
    if (mock) return mock;
  }

  return null;
};

// ── listUsers ─────────────────────────────────────────────────────────────────

const listUsers = async (search = "") => {
  const results = await userRepository.searchUsers(search, 100);
  return (Array.isArray(results) ? results : []).map((u) => ({
    id: String(u._id || u.id),
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
  isEligibleTeamLead,
  getInMemoryTeams,
};
