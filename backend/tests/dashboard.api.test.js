const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const { startDatabase, clearDatabase, stopDatabase } = require("./testDatabase");
const { Project } = require("../src/modules/projects/project.model");
const { Task } = require("../src/modules/tasks/task.model");

const authHeader = "Bearer mock-token";
const workspaceId = new mongoose.Types.ObjectId("64a000000000000000000001");
const projectId = new mongoose.Types.ObjectId("64a200000000000000000001");
const userId = new mongoose.Types.ObjectId("64a100000000000000000001");
const otherWorkspaceId = new mongoose.Types.ObjectId("64a000000000000000000002");
const otherProjectId = new mongoose.Types.ObjectId("64a200000000000000000002");

test.before(async () => { await startDatabase(); });
test.after(async () => { await stopDatabase(); });
test.beforeEach(async () => {
  await clearDatabase();
  await Project.create({ _id: projectId, workspaceId, name: "Dashboard Project", key: "DASH", status: "ACTIVE" });
  await Project.create({ _id: otherProjectId, workspaceId: otherWorkspaceId, name: "Other Workspace Project", key: "OTHER", status: "ACTIVE" });
  await Task.create([
    { workspaceId, projectId, taskNumber: 1, taskKey: "DASH-1", title: "Todo", status: "TODO", priority: "HIGH", primaryAssigneeId: userId, reporterId: userId, createdBy: userId },
    { workspaceId, projectId, taskNumber: 2, taskKey: "DASH-2", title: "Done", status: "DONE", priority: "LOW", primaryAssigneeId: userId, reporterId: userId, createdBy: userId, completedAt: new Date() },
    { workspaceId, projectId, taskNumber: 3, taskKey: "DASH-3", title: "Cancelled", status: "CANCELLED", priority: "MEDIUM", primaryAssigneeId: userId, reporterId: userId, createdBy: userId },
    { workspaceId, projectId, taskNumber: 4, taskKey: "DASH-4", title: "Overdue", status: "IN_PROGRESS", priority: "CRITICAL", primaryAssigneeId: userId, reporterId: userId, createdBy: userId, dueDate: new Date(Date.now() - 86400000) },
  ]);
  await Task.create({ workspaceId: otherWorkspaceId, projectId: otherProjectId, taskNumber: 1, taskKey: "OTHER-1", title: "Hidden task", status: "TODO", priority: "HIGH", reporterId: userId, createdBy: userId });
});

test("dashboard summary excludes cancelled tasks from pending and overdue counts", async () => {
  const response = await request(app).get("/api/v1/dashboard/summary").set("Authorization", authHeader);
  assert.equal(response.status, 200);
  assert.deepEqual(response.body.data, { totalProjects: 1, totalTasks: 4, pendingTasks: 2, completedTasks: 1, overdueTasks: 1 });
});

test("dashboard status and priority groups return counts", async () => {
  const status = await request(app).get("/api/v1/dashboard/tasks-by-status").set("Authorization", authHeader);
  const priority = await request(app).get("/api/v1/dashboard/tasks-by-priority").set("Authorization", authHeader);
  assert.equal(status.status, 200);
  assert.equal(status.body.data.find((row) => row.status === "DONE").count, 1);
  assert.equal(priority.status, 200);
  assert.equal(priority.body.data.find((row) => row.priority === "CRITICAL").count, 1);
});

test("overdue report returns only incomplete overdue tasks", async () => {
  const response = await request(app).get("/api/v1/reports/tasks/overdue").set("Authorization", authHeader);
  assert.equal(response.status, 200);
  assert.deepEqual(response.body.data.map((task) => task.taskKey), ["DASH-4"]);
  assert.equal(response.body.data[0].assigneeId, userId.toString());
});

test("report endpoints require REPORT_VIEW", async () => {
  const response = await request(app).get("/api/v1/reports/tasks/status").set("Authorization", "Bearer mock-member-token");
  assert.equal(response.status, 403);
  assert.equal(response.body.code, "PERMISSION_DENIED");
});

test("widget layout rejects unsupported widget types", async () => {
  const response = await request(app).put("/api/v1/dashboard/widgets").set("Authorization", authHeader).send({ widgets: [{ widgetType: "UNKNOWN", position: { x: 0, y: 0, width: 4, height: 4 } }] });
  assert.equal(response.status, 400);
  assert.equal(response.body.code, "VALIDATION_ERROR");
});

test("dashboard metrics do not include another workspace", async () => {
  const response = await request(app).get("/api/v1/dashboard/summary").set("Authorization", authHeader);
  assert.equal(response.body.data.totalProjects, 1);
  assert.equal(response.body.data.totalTasks, 4);
});