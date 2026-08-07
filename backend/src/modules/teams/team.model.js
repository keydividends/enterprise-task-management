const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema(
  {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
    userId: { type: String, required: true, index: true },
    role: {
      type: String,
      enum: ["LEAD", "MEMBER"],
      default: "MEMBER",
    },
    joinedAt: { type: Date, default: Date.now },
    removedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["ACTIVE", "REMOVED"],
      default: "ACTIVE",
    },
    addedBy: { type: String, default: null },
    removedBy: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// NOTE: Members are embedded as subdocuments inside the Team document.
// teamId is intentionally left null on each embedded member (it is implied by
// the parent Team). Because of this, a unique index on (teamId, userId) would
// collide across teams (e.g. the same lead/member in two teams). Uniqueness of
// members WITHIN a team is enforced in the service layer (addTeamMember /
// createTeam), so no DB unique index is needed on the embedded members array.
const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    leadId: { type: String, default: "mock-admin" },
    projectIds: { type: [String], default: [] },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, default: null },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: String, default: null },
    members: { type: [teamMemberSchema], default: [] },
  },
  { timestamps: true }
);

teamSchema.index({ name: 1 });
teamSchema.index({ isDeleted: 1 });
teamSchema.index({ leadId: 1 });

const Team = mongoose.models.Team || mongoose.model("Team", teamSchema);

const seedTeams = [
  {
    id: "team-platform",
    name: "Platform Engineering",
    description: "Core platform and tooling delivery",
    leadId: "mock-admin",
    projectIds: ["project-1"],
    isActive: true,
    isDeleted: false,
    status: "ACTIVE",
    members: [
      { userId: "mock-admin", role: "LEAD", joinedAt: new Date("2025-01-15T09:00:00.000Z") },
      { userId: "mock-maya", role: "MEMBER", joinedAt: new Date("2025-01-15T09:00:00.000Z") },
      { userId: "mock-alex", role: "DEVELOPER", joinedAt: new Date("2025-02-01T10:00:00.000Z") },
    ],
    createdAt: new Date("2025-01-15T09:00:00.000Z"),
    updatedAt: new Date("2025-01-15T09:00:00.000Z"),
  },
];

const mockUsers = [
  { id: "mock-admin", firstName: "Ava", lastName: "Cole", role: "ADMIN" },
  { id: "mock-maya", firstName: "Maya", lastName: "Singh", role: "MEMBER" },
  { id: "mock-alex", firstName: "Alex", lastName: "Chen", role: "MEMBER" },
];

const createTeamRecord = (data) => {
  const isActive = data.isActive !== false;
  return {
    id: data.id || `team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: data.name,
    description: data.description || "",
    leadId: data.leadId || "mock-admin",
    projectIds: Array.isArray(data.projectIds) ? data.projectIds : [],
    isActive,
    isDeleted: false,
    status: data.status || (isActive ? "ACTIVE" : "INACTIVE"),
    members: Array.isArray(data.members) ? data.members : [],
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
  };
};

const createTeamMemberRecord = (data) => ({
  userId: data.userId,
  role: data.role || "MEMBER",
  joinedAt: data.joinedAt || new Date(),
  updatedAt: data.updatedAt || new Date(),
});

module.exports = {
  Team,
  seedTeams,
  mockUsers,
  createTeamRecord,
  createTeamMemberRecord,
};
