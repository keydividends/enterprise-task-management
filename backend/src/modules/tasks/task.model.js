const mongoose = require("mongoose");

const TASK_STATUSES = ["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "QA", "DONE", "CANCELLED"];
const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const TASK_TYPES = ["TASK", "STORY", "BUG", "IMPROVEMENT"];

const taskSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    sprintId: { type: mongoose.Schema.Types.ObjectId, ref: "Sprint", default: null },
    epicId: { type: mongoose.Schema.Types.ObjectId, ref: "Epic", default: null },
    taskNumber: { type: Number, required: true },
    taskKey: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 250 },
    description: { type: String, default: "" },
    type: { type: String, enum: TASK_TYPES, default: "TASK" },
    status: { type: String, enum: TASK_STATUSES, default: "TODO", index: true },
    priority: { type: String, enum: TASK_PRIORITIES, default: "MEDIUM" },
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    primaryAssigneeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    storyPoints: { type: Number, min: 0, default: null },
    startDate: { type: Date, default: null },
    dueDate: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    parentTaskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", default: null },
    position: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

taskSchema.index({ workspaceId: 1, projectId: 1, taskNumber: 1 }, { unique: true });
taskSchema.index({ projectId: 1, status: 1, isDeleted: 1, createdAt: -1 });
taskSchema.index({ primaryAssigneeId: 1, status: 1, isDeleted: 1 });
taskSchema.index({ projectId: 1, sprintId: 1, status: 1, isDeleted: 1 });
taskSchema.index({ dueDate: 1, status: 1, isDeleted: 1 });

const taskAssignmentSchema = new mongoose.Schema(
  {
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignmentType: { type: String, enum: ["PRIMARY", "SECONDARY"], default: "PRIMARY" },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedAt: { type: Date, default: Date.now },
    unassignedAt: { type: Date, default: null },
    status: { type: String, enum: ["ACTIVE", "REMOVED"], default: "ACTIVE" },
  },
  { timestamps: true }
);

taskAssignmentSchema.index({ taskId: 1, status: 1 });
taskAssignmentSchema.index({ userId: 1, status: 1 });
taskAssignmentSchema.index({ taskId: 1, userId: 1, status: 1 });

const labelSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    name: { type: String, required: true, trim: true },
    color: { type: String, default: "#6366f1" },
    description: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

labelSchema.index({ projectId: 1, name: 1 });

const taskLabelSchema = new mongoose.Schema(
  {
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    labelId: { type: mongoose.Schema.Types.ObjectId, ref: "Label", required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

taskLabelSchema.index({ taskId: 1, labelId: 1 }, { unique: true });

const checklistSchema = new mongoose.Schema(
  {
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    title: { type: String, required: true, trim: true },
    position: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

checklistSchema.index({ taskId: 1, position: 1 });

const checklistItemSchema = new mongoose.Schema(
  {
    checklistId: { type: mongoose.Schema.Types.ObjectId, ref: "Checklist", required: true },
    text: { type: String, required: true, trim: true },
    isCompleted: { type: Boolean, default: false },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    completedAt: { type: Date, default: null },
    assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    dueDate: { type: Date, default: null },
    position: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

checklistItemSchema.index({ checklistId: 1, position: 1 });
checklistItemSchema.index({ checklistId: 1, isCompleted: 1 });

const taskHistorySchema = new mongoose.Schema(
  {
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    field: { type: String, required: true },
    oldValue: { type: mongoose.Schema.Types.Mixed, default: null },
    newValue: { type: mongoose.Schema.Types.Mixed, default: null },
    changedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

taskHistorySchema.index({ taskId: 1, changedAt: -1 });

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);
const TaskAssignment = mongoose.models.TaskAssignment || mongoose.model("TaskAssignment", taskAssignmentSchema);
const Label = mongoose.models.Label || mongoose.model("Label", labelSchema);
const TaskLabel = mongoose.models.TaskLabel || mongoose.model("TaskLabel", taskLabelSchema);
const Checklist = mongoose.models.Checklist || mongoose.model("Checklist", checklistSchema);
const ChecklistItem = mongoose.models.ChecklistItem || mongoose.model("ChecklistItem", checklistItemSchema);
const TaskHistory = mongoose.models.TaskHistory || mongoose.model("TaskHistory", taskHistorySchema);

module.exports = { Task, TaskAssignment, Label, TaskLabel, Checklist, ChecklistItem, TaskHistory, TASK_STATUSES, TASK_PRIORITIES, TASK_TYPES };
