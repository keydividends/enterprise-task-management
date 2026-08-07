const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../src/app");
const { startDatabase, clearDatabase, stopDatabase } = require("./testDatabase");
const { Task, Label, TaskLabel, Checklist, ChecklistItem } = require("../src/modules/tasks/task.model");
const mockData = require("../src/modules/tasks/task.mockData");

const authHeader = "Bearer mock-token";
const projectId = mockData.PROJECTS[0].id;
const assigneeId = mockData.USERS[0].id;
const sprintId = mockData.SPRINTS[1].id;

let createdTaskId;

test.before(async () => {
  await startDatabase();
});

test.after(async () => {
  await stopDatabase();
});

test.beforeEach(async () => {
  await clearDatabase();
});

const createTaskPayload = () => ({
  title: "Test task integration",
  description: "Integration test for task creation",
  projectId,
  sprintId,
  primaryAssigneeId: assigneeId,
  type: "STORY",
  status: "TODO",
  priority: "HIGH",
  storyPoints: 5,
  dueDate: "2026-12-31",
});

test("POST /api/v1/tasks creates a task", async () => {
  const response = await request(app)
    .post("/api/v1/tasks")
    .set("Authorization", authHeader)
    .send(createTaskPayload());

  assert.equal(response.status, 201);
  assert.equal(response.body.success, true);
  assert.ok(response.body.data.id);
  assert.equal(response.body.data.title, "Test task integration");
  assert.equal(response.body.data.projectId, projectId);
  createdTaskId = response.body.data.id;
});

test("GET /api/v1/tasks returns created task with pagination", async () => {
  await request(app)
    .post("/api/v1/tasks")
    .set("Authorization", authHeader)
    .send(createTaskPayload());

  const response = await request(app)
    .get("/api/v1/tasks?page=1&pageSize=10")
    .set("Authorization", authHeader);

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.ok(Array.isArray(response.body.data));
  assert.equal(response.body.pagination.page, 1);
  assert.equal(response.body.pagination.pageSize, 10);
  assert.equal(response.body.pagination.totalItems, 1);
  assert.equal(response.body.data[0].title, "Test task integration");
});

test("GET /api/v1/tasks/:taskId returns task details", async () => {
  const createResponse = await request(app)
    .post("/api/v1/tasks")
    .set("Authorization", authHeader)
    .send(createTaskPayload());

  const taskId = createResponse.body.data.id;
  const response = await request(app)
    .get(`/api/v1/tasks/${taskId}`)
    .set("Authorization", authHeader);

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.id, taskId);
  assert.equal(response.body.data.primaryAssigneeId, assigneeId);
  assert.equal(response.body.data.projectId, projectId);
});

test("PATCH /api/v1/tasks/:taskId updates task fields", async () => {
  const createResponse = await request(app)
    .post("/api/v1/tasks")
    .set("Authorization", authHeader)
    .send(createTaskPayload());

  const taskId = createResponse.body.data.id;
  const updateResponse = await request(app)
    .patch(`/api/v1/tasks/${taskId}`)
    .set("Authorization", authHeader)
    .send({ title: "Updated task title", priority: "CRITICAL" });

  assert.equal(updateResponse.status, 200);
  assert.equal(updateResponse.body.success, true);
  assert.equal(updateResponse.body.data.title, "Updated task title");
  assert.equal(updateResponse.body.data.priority, "CRITICAL");
});

test("PATCH /api/v1/tasks/:taskId/status changes task status", async () => {
  const createResponse = await request(app)
    .post("/api/v1/tasks")
    .set("Authorization", authHeader)
    .send(createTaskPayload());

  const taskId = createResponse.body.data.id;
  const response = await request(app)
    .patch(`/api/v1/tasks/${taskId}/status`)
    .set("Authorization", authHeader)
    .send({ status: "IN_PROGRESS" });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.status, "IN_PROGRESS");
});

test("PATCH /api/v1/tasks/:taskId/assignee assigns and unassigns a task", async () => {
  const createResponse = await request(app)
    .post("/api/v1/tasks")
    .set("Authorization", authHeader)
    .send(createTaskPayload());

  const taskId = createResponse.body.data.id;
  const newAssigneeId = mockData.USERS[1].id;

  const assignResponse = await request(app)
    .patch(`/api/v1/tasks/${taskId}/assignee`)
    .set("Authorization", authHeader)
    .send({ userId: newAssigneeId });

  assert.equal(assignResponse.status, 200);
  assert.equal(assignResponse.body.success, true);
  assert.equal(assignResponse.body.data.primaryAssigneeId, newAssigneeId);

  const unassignResponse = await request(app)
    .delete(`/api/v1/tasks/${taskId}/assignee`)
    .set("Authorization", authHeader);

  assert.equal(unassignResponse.status, 200);
  assert.equal(unassignResponse.body.success, true);
  assert.equal(unassignResponse.body.data.id, taskId);

  const detailResponse = await request(app)
    .get(`/api/v1/tasks/${taskId}`)
    .set("Authorization", authHeader);

  assert.equal(detailResponse.status, 200);
  assert.equal(detailResponse.body.data.primaryAssigneeId, null);
});

test("Project label and task label workflows work", async () => {
  const labelResponse = await request(app)
    .post(`/api/v1/projects/${projectId}/labels`)
    .set("Authorization", authHeader)
    .send({ name: "Test Label", color: "#123abc" });

  assert.equal(labelResponse.status, 201);
  assert.equal(labelResponse.body.success, true);
  assert.equal(labelResponse.body.data.name, "Test Label");

  const taskResponse = await request(app)
    .post("/api/v1/tasks")
    .set("Authorization", authHeader)
    .send(createTaskPayload());

  const taskId = taskResponse.body.data.id;
  const labelId = labelResponse.body.data.id;

  const addLabelResponse = await request(app)
    .post(`/api/v1/tasks/${taskId}/labels`)
    .set("Authorization", authHeader)
    .send({ labelId });

  assert.equal(addLabelResponse.status, 200);
  assert.equal(addLabelResponse.body.success, true);

  const taskDetail = await request(app)
    .get(`/api/v1/tasks/${taskId}`)
    .set("Authorization", authHeader);

  assert.equal(taskDetail.status, 200);
  assert.ok(Array.isArray(taskDetail.body.data.labels));
  assert.ok(taskDetail.body.data.labels.some((label) => label.id === labelId));
});

test("Checklist creation and retrieval works", async () => {
  const taskResponse = await request(app)
    .post("/api/v1/tasks")
    .set("Authorization", authHeader)
    .send(createTaskPayload());

  const taskId = taskResponse.body.data.id;
  const checklistResponse = await request(app)
    .post(`/api/v1/tasks/${taskId}/checklists`)
    .set("Authorization", authHeader)
    .send({ title: "QA Checklist" });

  assert.equal(checklistResponse.status, 201);
  assert.equal(checklistResponse.body.success, true);
  assert.equal(checklistResponse.body.data.title, "QA Checklist");

  const listResponse = await request(app)
    .get(`/api/v1/tasks/${taskId}/checklists`)
    .set("Authorization", authHeader);

  assert.equal(listResponse.status, 200);
  assert.equal(listResponse.body.success, true);
  assert.equal(listResponse.body.data.length, 1);
  assert.equal(listResponse.body.data[0].title, "QA Checklist");
});

test("GET /api/v1/tasks/board returns tasks grouped by status", async () => {
  const todoPayload = createTaskPayload();
  await request(app).post("/api/v1/tasks").set("Authorization", authHeader).send(todoPayload);

  const inProgressPayload = { ...createTaskPayload(), title: "In progress task", status: "IN_PROGRESS" };
  await request(app).post("/api/v1/tasks").set("Authorization", authHeader).send(inProgressPayload);

  const boardResponse = await request(app)
    .get(`/api/v1/tasks/board?projectId=${projectId}`)
    .set("Authorization", authHeader);

  assert.equal(boardResponse.status, 200);
  assert.equal(boardResponse.body.success, true);
  assert.ok(boardResponse.body.data.TODO);
  assert.ok(boardResponse.body.data.IN_PROGRESS);
  assert.equal(boardResponse.body.data.TODO.length, 1);
  assert.equal(boardResponse.body.data.IN_PROGRESS.length, 1);
});

test("DELETE /api/v1/tasks/:taskId soft deletes the task and restore works", async () => {
  const taskResponse = await request(app)
    .post("/api/v1/tasks")
    .set("Authorization", authHeader)
    .send(createTaskPayload());

  const taskId = taskResponse.body.data.id;
  const deleteResponse = await request(app)
    .delete(`/api/v1/tasks/${taskId}`)
    .set("Authorization", authHeader);

  assert.equal(deleteResponse.status, 200);
  assert.equal(deleteResponse.body.success, true);

  const missingTask = await request(app)
    .get(`/api/v1/tasks/${taskId}`)
    .set("Authorization", authHeader);

  assert.equal(missingTask.status, 404);

  const restoreResponse = await request(app)
    .patch(`/api/v1/tasks/${taskId}/restore`)
    .set("Authorization", authHeader);

  assert.equal(restoreResponse.status, 200);
  assert.equal(restoreResponse.body.success, true);
  assert.equal(restoreResponse.body.data.id, taskId);
});
