const mongoose = require("mongoose");

const dashboardWidgetSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    widgetType: { type: String, required: true, trim: true },
    title: { type: String, default: "" },
    position: {
      x: { type: Number, min: 0, required: true },
      y: { type: Number, min: 0, required: true },
      width: { type: Number, min: 1, max: 12, required: true },
      height: { type: Number, min: 1, max: 24, required: true },
    },
    configuration: { type: mongoose.Schema.Types.Mixed, default: {} },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "dashboardwidgets" }
);

dashboardWidgetSchema.index({ workspaceId: 1, userId: 1 });

const DashboardWidget = mongoose.models.DashboardWidget || mongoose.model("DashboardWidget", dashboardWidgetSchema);

module.exports = DashboardWidget;