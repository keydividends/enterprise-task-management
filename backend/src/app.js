const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const errorHandler = require("./middleware/errorHandler");
const notFoundHandler = require("./middleware/notFound");
const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/users/user.routes");
const { taskRouter, projectLabelRouter, checklistItemRouter } = require("./modules/tasks/task.routes");
const teamRoutes = require("./modules/teams/team.routes");
const projectRoutes = require("./modules/projects/project.routes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

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
app.use("/api/v1/checklists/:checklistId/items", checklistItemRouter);
app.use("/api/v1/teams", teamRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;