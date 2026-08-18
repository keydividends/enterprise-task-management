const mongoose = require("mongoose");

const timeTrackingSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    description: { type: String, default: "" },
    startedAt: { type: Date, required: true, index: true },
    endedAt: { type: Date, default: null, index: true },
    durationMinutes: { type: Number, min: 0, required: true },
    entryType: { type: String, enum: ["TIMER", "MANUAL"], default: "MANUAL" },
    status: { type: String, enum: ["ACTIVE", "COMPLETED"], default: "COMPLETED" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

timeTrackingSchema.index({ workspaceId: 1, projectId: 1, taskId: 1, userId: 1 });

timeTrackingSchema.index({ startedAt: 1, endedAt: 1 });

const TimeTracking = mongoose.models.TimeTracking || mongoose.model("TimeTracking", timeTrackingSchema);

module.exports = { TimeTracking };
