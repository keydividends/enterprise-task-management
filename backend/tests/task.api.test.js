const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../src/app");
const { startDatabase, clearDatabase, stopDatabase } = require("./testDatabase");
const { Task, Label, TaskLabel, Checklist, ChecklistItem } = require("../src/modules/tasks/task.model");
const mockData = require("../src/modules/tasks/task.mockData");
const taskService = require("../src/modules/tasks/task.service");

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

// --- New coverage: permission, validation, isolation, filters, checklist chain ---

const memberToken = "Bearer mock-member-token"; // MEMBER, TASK_VIEW only

test("Permission: missing token is rejected with 401", async () => {
  const response = await request(app).get("/api/v1/tasks");
  assert.equal(response.status, 401);
  assert.equal(response.body.code, "AUTH_REQUIRED");
});

test("Permission: member without TASK_CREATE is denied create with 403", async () => {
  const response = await request(app)
    .post("/api/v1/tasks")
    .set("Authorization", memberToken)
    .send(createTaskPayload());
  assert.equal(response.status, 403);
  assert.equal(response.body.code, "PERMISSION_DENIED");
});

test("Permission: member with TASK_VIEW can list tasks", async () => {
  await request(app)
    .post("/api/v1/tasks")
    .set("Authorization", authHeader)
    .send(createTaskPayload());

  const response = await request(app)
    .get("/api/v1/tasks?page=1&pageSize=10")
    .set("Authorization", memberToken);

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.pagination.totalItems, 1);
});

test("Permission: manager only lists tasks from assigned or managed projects", async () => {
  await request(app)
    .post("/api/v1/tasks")
    .set("Authorization", authHeader)
    .send(createTaskPayload());

  const result = await taskService.listTasks(
    { page: 1, pageSize: 10 },
    {
      workspaceId: mockData.WORKSPACE_ID,
      userId: "64a1ffffffffffffffffffff",
      user: { role: "MANAGER", permissions: ["TASK_VIEW"] },
    }
  );

  assert.equal(result.pagination.totalItems, 0);
  assert.deepEqual(result.items, []);
});

test("Permission: task mutation requires access to the task project", async () => {
  const created = await request(app)
    .post("/api/v1/tasks")
    .set("Authorization", authHeader)
    .send(createTaskPayload());

  await assert.rejects(
    taskService.updateTask(
      created.body.data.id,
      { title: "Unauthorized update" },
      {
        workspaceId: mockData.WORKSPACE_ID,
        userId: "64a1ffffffffffffffffffff",
        user: { role: "DEVELOPER", permissions: ["TASK_UPDATE"] },
      }
    ),
    (error) => error.code === "PROJECT_ACCESS_DENIED"
  );
});

test("Permission: closing a task requires TASK_CLOSE", async () => {
  const created = await request(app)
    .post("/api/v1/tasks")
    .set("Authorization", authHeader)
    .send({ ...createTaskPayload(), status: "IN_REVIEW" });

  await assert.rejects(
    taskService.changeStatus(
      created.body.data.id,
      { status: "DONE" },
      {
        workspaceId: mockData.WORKSPACE_ID,
        userId: mockData.USERS[0].id,
        user: { role: "DEVELOPER", permissions: ["TASK_UPDATE"] },
      }
    ),
    (error) => error.code === "PERMISSION_DENIED"
  );
});

test("Permission: creating a label requires project access", async () => {
  await assert.rejects(
    taskService.createLabel(
      projectId,
      { name: "Unauthorized label", color: "#123456" },
      {
        workspaceId: mockData.WORKSPACE_ID,
        userId: "64a1ffffffffffffffffffff",
        user: { role: "DEVELOPER", permissions: ["TASK_UPDATE"] },
      }
    ),
    (error) => error.code === "PROJECT_ACCESS_DENIED"
  );
});

test("Validation: invalid project is rejected with 404", async () => {
  const response = await request(app)
    .post("/api/v1/tasks")
    .set("Authorization", authHeader)
    .send({ title: "Bad project", projectId: "64a2ffffffffffffffffffff" });
  assert.equal(response.status, 404);
  assert.equal(response.body.code, "PROJECT_NOT_FOUND");
});

test("Validation: invalid assignee (non-project member) is rejected", async () => {
  // PROJECTS[1] (PAY) members are USERS[0,1,3]; USERS[2] is not a PAY member.
  const payProjectId = mockData.PROJECTS[1].id;
  const nonMemberId = mockData.USERS[2].id;

  // Rejected at creation time.
  const createResponse = await request(app)
    .post("/api/v1/tasks")
    .set("Authorization", authHeader)
    .send({ title: "PAY task", projectId: payProjectId, primaryAssigneeId: nonMemberId });

  assert.equal(createResponse.status, 400);
  assert.equal(createResponse.body.code, "INVALID_ASSIGNEE");

  // Same via the assignee sub-route on an existing PAY task.
  // Note: must NOT reuse the ETMS sprint (createTaskPayload sets one), or the
  // sprint-scoping check fires before assignee validation.
  const payTask = await request(app)
    .post("/api/v1/tasks")
    .set("Authorization", authHeader)
    .send({ title: "PAY assignee target", projectId: payProjectId });
  assert.equal(payTask.status, 201);
  const taskId = payTask.body.data.id;

  const assignResponse = await request(app)
    .patch(`/api/v1/tasks/${taskId}/assignee`)
    .set("Authorization", authHeader)
    .send({ userId: nonMemberId });

  assert.equal(assignResponse.status, 400);
  assert.equal(assignResponse.body.code, "INVALID_ASSIGNEE");
});

test("Project isolation: listing one project never returns another project's tasks", async () => {
  await request(app)
    .post("/api/v1/tasks")
    .set("Authorization", authHeader)
    .send(createTaskPayload()); // ETMS project

  await request(app)
    .post("/api/v1/tasks")
    .set("Authorization", authHeader)
    .send({ ...createTaskPayload(), title: "PAY-only task", projectId: mockData.PROJECTS[1].id });

  const response = await request(app)
    .get(`/api/v1/tasks?projectId=${projectId}&pageSize=100`)
    .set("Authorization", authHeader);

  assert.equal(response.status, 200);
  assert.equal(response.body.pagination.totalItems, 1);
  assert.equal(response.body.data[0].projectId, projectId);
});

test("Filters: status, priority, assignee, search, and due range are applied", async () => {
  const high = createTaskPayload();
  await request(app).post("/api/v1/tasks").set("Authorization", authHeader).send(high);

  const inProgress = { ...createTaskPayload(), title: "Boards work", status: "IN_PROGRESS", priority: "LOW", dueDate: "2026-06-01" };
  await request(app).post("/api/v1/tasks").set("Authorization", authHeader).send(inProgress);

  // status filter
  let res = await request(app).get("/api/v1/tasks?status=IN_PROGRESS").set("Authorization", authHeader);
  assert.equal(res.body.pagination.totalItems, 1);
  assert.equal(res.body.data[0].status, "IN_PROGRESS");

  // priority filter
  res = await request(app).get("/api/v1/tasks?priority=HIGH").set("Authorization", authHeader);
  assert.equal(res.body.pagination.totalItems, 1);
  assert.equal(res.body.data[0].priority, "HIGH");

  // search filter
  res = await request(app).get("/api/v1/tasks?search=Boards").set("Authorization", authHeader);
  assert.equal(res.body.pagination.totalItems, 1);
  assert.equal(res.body.data[0].title, "Boards work");

  // assignee filter (documented client param -> primaryAssigneeId)
  res = await request(app).get(`/api/v1/tasks?assigneeId=${assigneeId}`).set("Authorization", authHeader);
  assert.equal(res.body.pagination.totalItems, 2);
  res.body.data.forEach((t) => assert.equal(t.primaryAssigneeId, assigneeId));

  // due range filter
  res = await request(app).get("/api/v1/tasks?dueFrom=2026-05-01&dueTo=2026-12-31").set("Authorization", authHeader);
  assert.equal(res.body.pagination.totalItems, 2);
  res.body.data.forEach((t) => {
    assert.ok(new Date(t.dueDate) >= new Date("2026-05-01"));
    assert.ok(new Date(t.dueDate) <= new Date("2026-12-31"));
  });
});

test("Label edge cases: duplicate name -> 409, wrong-project label -> 404", async () => {
  await request(app)
    .post(`/api/v1/projects/${projectId}/labels`)
    .set("Authorization", authHeader)
    .send({ name: "Edge", color: "#ff0000" });

  const dup = await request(app)
    .post(`/api/v1/projects/${projectId}/labels`)
    .set("Authorization", authHeader)
    .send({ name: "Edge", color: "#00ff00" });
  assert.equal(dup.status, 409);
  assert.equal(dup.body.code, "LABEL_EXISTS");

  // Create a label in ETMS project, then try to add it to a PAY project task => scoped denial.
  // Note: build the PAY task from scratch (no ETMS sprint) so sprint-scoping does not interfere.
  const payProjectId = mockData.PROJECTS[1].id;
  const payTask = await request(app)
    .post("/api/v1/tasks")
    .set("Authorization", authHeader)
    .send({ title: "PAY label target", projectId: payProjectId });
  assert.equal(payTask.status, 201);
  const taskId = payTask.body.data.id;

  // Find the ETMS label id from list and attempt to attach it across projects.
  const labelsRes = await request(app)
    .get(`/api/v1/projects/${projectId}/labels`)
    .set("Authorization", authHeader);
  const etmsLabelId = labelsRes.body.data[0].id;

  const cross = await request(app)
    .post(`/api/v1/tasks/${taskId}/labels`)
    .set("Authorization", authHeader)
    .send({ labelId: etmsLabelId });
  assert.equal(cross.status, 404);
  assert.equal(cross.body.code, "LABEL_NOT_FOUND");
});

test("Checklist item chain: add -> update -> complete -> delete", async () => {
  const taskResponse = await request(app)
    .post("/api/v1/tasks")
    .set("Authorization", authHeader)
    .send(createTaskPayload());
  const taskId = taskResponse.body.data.id;

  const clResponse = await request(app)
    .post(`/api/v1/tasks/${taskId}/checklists`)
    .set("Authorization", authHeader)
    .send({ title: "Chain Checklist" });
  const checklistId = clResponse.body.data.id;

  const addResponse = await request(app)
    .post(`/api/v1/checklists/${checklistId}/items`)
    .set("Authorization", authHeader)
    .send({ text: "Write test" });
  assert.equal(addResponse.status, 201);
  const itemId = addResponse.body.data.id;

  const updateResponse = await request(app)
    .put(`/api/v1/checklists/${checklistId}/items/${itemId}`)
    .set("Authorization", authHeader)
    .send({ text: "Write unit test" });
  assert.equal(updateResponse.status, 200);
  assert.equal(updateResponse.body.data.text, "Write unit test");

  const completeResponse = await request(app)
    .patch(`/api/v1/checklists/${checklistId}/items/${itemId}/complete`)
    .set("Authorization", authHeader);
  assert.equal(completeResponse.status, 200);
  assert.equal(completeResponse.body.data.isCompleted, true);

  const deleteResponse = await request(app)
    .delete(`/api/v1/checklists/${checklistId}/items/${itemId}`)
    .set("Authorization", authHeader);
  assert.equal(deleteResponse.status, 200);

  const listResponse = await request(app)
    .get(`/api/v1/tasks/${taskId}/checklists`)
    .set("Authorization", authHeader);
  assert.equal(listResponse.status, 200);
  assert.equal(listResponse.body.data[0].items.length, 0);
});
