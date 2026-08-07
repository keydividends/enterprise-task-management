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

teamMemberSchema.index({ teamId: 1, userId: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });

const TeamMember = mongoose.models.TeamMember || mongoose.model("TeamMember", teamMemberSchema);

const createTeamMemberRecord = (data) => ({
  userId: data.userId,
  role: data.role || 'MEMBER',
  joinedAt: data.joinedAt || new Date(),
});

module.exports = {
  TeamMember,
  createTeamMemberRecord,
};
