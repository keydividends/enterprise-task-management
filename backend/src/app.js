const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const errorHandler = require("./middleware/errorHandler");
const notFoundHandler = require("./middleware/notFound");
const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/users/user.routes");
const { taskRouter, projectLabelRouter, projectTaskRouter, checklistItemRouter, checklistRouter } = require("./modules/tasks/task.routes");
const teamRoutes = require("./modules/teams/team.routes");
const { taskCommentRouter, commentRouter } = require("./modules/comments/comment.routes");
const { taskAttachmentRouter, attachmentRouter } = require("./modules/attachments/attachment.routes");
const projectRoutes = require("./modules/projects/project.routes");
const roleRoutes = require("./modules/roles/role.routes");
const permissionRoutes = require("./modules/roles/permissions.routes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");
const reportRoutes = require("./modules/reports/report.routes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev", {
  // Cached responses are expected during normal frontend navigation and add noise.
  skip: (_req, res) => res.statusCode === 304,
}));

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ETMS API is running",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/projects/:projectId/labels", projectLabelRouter);
app.use("/api/v1/projects/:projectId/tasks", projectTaskRouter);
app.use("/api/v1/checklists/:checklistId/items", checklistItemRouter);
app.use("/api/v1/checklists", checklistRouter);
app.use("/api/v1/teams", teamRoutes);
app.use("/api/v1/tasks/:taskId/comments", taskCommentRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/tasks/:taskId/attachments", taskAttachmentRouter);
app.use("/api/v1/attachments", attachmentRouter);
app.use("/api/v1/roles", roleRoutes);
app.use("/api/v1/permissions", permissionRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/reports", reportRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
