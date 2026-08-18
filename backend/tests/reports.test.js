const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const { startDatabase, clearDatabase, stopDatabase } = require("./testDatabase");
const { Project } = require("../src/modules/projects/project.model");
const { Task, TaskHistory } = require("../src/modules/tasks/task.model");
const { TimeTracking } = require("../src/modules/timeTracking/timeTracking.model");

const authHeader = "Bearer mock-token";
const adminAuthHeader = "Bearer mock-token";
const workspaceId = new mongoose.Types.ObjectId("64a000000000000000000001");
const projectId = new mongoose.Types.ObjectId("64a200000000000000000001");
const userId = new mongoose.Types.ObjectId("64a100000000000000000001");

const timeTrackingData = [
  {
    workspaceId,
    projectId,
    taskId: new mongoose.Types.ObjectId(),
    userId,
    description: "Worked on task details",
    startedAt: new Date("2026-08-01T08:00:00.000Z"),
    endedAt: new Date("2026-08-01T10:00:00.000Z"),
    durationMinutes: 120,
    entryType: "MANUAL",
    status: "COMPLETED",
    createdBy: userId,
  },
];

const taskHistoryData = [
  {
    taskId: timeTrackingData[0].taskId,
    changedBy: userId,
    field: "status",
    oldValue: "TODO",
    newValue: "IN_PROGRESS",
    changedAt: new Date("2026-08-01T10:00:00.000Z"),
  },
];

test.before(async () => { await startDatabase(); });
test.after(async () => { await stopDatabase(); });
test.beforeEach(async () => {
  await clearDatabase();
  await Project.create({ _id: projectId, workspaceId, name: "Report Project", key: "RPT", status: "ACTIVE" });
  await Task.create({ _id: timeTrackingData[0].taskId, workspaceId, projectId, taskNumber: 1, taskKey: "RPT-1", title: "Report Task", status: "DONE", priority: "HIGH", primaryAssigneeId: userId, reporterId: userId, createdBy: userId, completedAt: new Date("2026-08-01T10:00:00.000Z") });
  await TimeTracking.create(timeTrackingData);
  await TaskHistory.create(taskHistoryData);
});

test("time report requires date range and returns entries", async () => {
  const missing = await request(app).get("/api/v1/reports/time").set("Authorization", authHeader);
  assert.equal(missing.status, 400);
  assert.equal(missing.body.code, "VALIDATION_ERROR");

  const response = await request(app)
    .get("/api/v1/reports/time")
    .query({ fromDate: "2026-08-01", toDate: "2026-08-02" })
    .set("Authorization", authHeader);

  assert.equal(response.status, 200);
  assert.equal(response.body.data.totalMinutes, 120);
  assert.equal(response.body.data.entries.length, 1);
  assert.equal(response.body.data.entries[0].durationMinutes, 120);
});

test("audit report requires admin and returns history entries", async () => {
  const response = await request(app)
    .get("/api/v1/reports/audit")
    .query({ page: 1, pageSize: 20 })
    .set("Authorization", adminAuthHeader);

  assert.equal(response.status, 200);
  assert.equal(response.body.data.length, 1);
  assert.equal(response.body.data[0].action, "TASK_FIELD_CHANGED");
  assert.equal(response.body.data[0].entityType, "TASK");
});

module.exports = {};
