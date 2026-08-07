const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, required: false, index: true, default: null },
    name: { type: String, required: true, trim: true },
    key: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    projectManagerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: {
      type: String,
      enum: ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"],
      default: "PLANNING",
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
    },
    startDate: { type: Date, default: null },
    targetEndDate: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

projectSchema.index({ workspaceId: 1, key: 1 }, { unique: true, sparse: true, partialFilterExpression: { isDeleted: false } });
projectSchema.index({ workspaceId: 1, status: 1 });
projectSchema.index({ projectManagerId: 1, status: 1 });
projectSchema.index({ targetEndDate: 1 });
projectSchema.index({ isDeleted: 1 });

const projectMemberSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    projectRole: {
      type: String,
      enum: ["PROJECT_MANAGER", "TEAM_LEAD", "DEVELOPER", "QA_TESTER", "VIEWER"],
      default: "DEVELOPER",
    },
    allocationPercentage: { type: Number, default: 100 },
    joinedAt: { type: Date, default: Date.now },
    removedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["ACTIVE", "REMOVED"],
      default: "ACTIVE",
    },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    removedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

projectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
projectMemberSchema.index({ projectId: 1, status: 1 });
projectMemberSchema.index({ userId: 1, status: 1 });

const Project = mongoose.models.Project || mongoose.model("Project", projectSchema);
const ProjectMember = mongoose.models.ProjectMember || mongoose.model("ProjectMember", projectMemberSchema);

module.exports = { Project, ProjectMember };
