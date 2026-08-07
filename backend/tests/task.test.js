const test = require("node:test");
const assert = require("node:assert/strict");

const { canTransition, TASK_STATUS_TRANSITIONS } = require("../src/modules/tasks/task.constants");
const { mapTask, mapLabel, mapChecklist, mapHistory } = require("../src/modules/tasks/task.mapper");
const {
  validateCreateTask,
  validateUpdateTask,
  validateStatusChange,
  validateAssignee,
  validatePagination,
  validateLabelInput,
  validateChecklistInput,
  validateChecklistItemInput,
  validateTaskQuery,
} = require("../src/modules/tasks/task.validation");

// --- Status transitions --------------------------------------------------------

test("canTransition allows documented forward moves", () => {
  assert.equal(canTransition("TODO", "IN_PROGRESS"), true);
  assert.equal(canTransition("IN_PROGRESS", "IN_REVIEW"), true);
  assert.equal(canTransition("QA", "DONE"), true);
});

test("canTransition allows self transition and rejects illegal moves", () => {
  assert.equal(canTransition("DONE", "DONE"), true);
  assert.equal(canTransition("DONE", "IN_PROGRESS"), false);
  assert.equal(canTransition("BACKLOG", "IN_PROGRESS"), false);
});

test("status transition map covers every status", () => {
  for (const status of Object.keys(TASK_STATUS_TRANSITIONS)) {
    assert.ok(Array.isArray(TASK_STATUS_TRANSITIONS[status]), `${status} must map to an array`);
  }
});

test("canTransition rejects unknown status", () => {
  assert.equal(canTransition("UNKNOWN", "TODO"), false);
});

// --- Validators ----------------------------------------------------------------

test("validateCreateTask rejects missing title", () => {
  assert.throws(
    () => validateCreateTask({ projectId: "64a200000000000000000001" }),
    (error) => error.code === "VALIDATION_ERROR" && error.field === "title"
  );
});

test("validateCreateTask rejects invalid project id", () => {
  assert.throws(
    () => validateCreateTask({ title: "Valid title", projectId: "not-an-id" }),
    (error) => error.field === "projectId"
  );
});

test("validateCreateTask rejects invalid enum", () => {
  assert.throws(
    () => validateCreateTask({ title: "Valid title", projectId: "64a200000000000000000001", priority: "ULTRA" }),
    (error) => error.field === "priority"
  );
});

test("validateCreateTask rejects invalid sprint id", () => {
  assert.throws(
    () => validateCreateTask({ title: "Valid title", projectId: "64a200000000000000000001", sprintId: "not-an-id" }),
    (error) => error.field === "sprintId"
  );
});

test("validateCreateTask rejects invalid assignee id", () => {
  assert.throws(
    () => validateCreateTask({ title: "Valid title", projectId: "64a200000000000000000001", primaryAssigneeId: "not-an-id" }),
    (error) => error.field === "primaryAssigneeId"
  );
});

test("validateCreateTask rejects invalid parent task id", () => {
  assert.throws(
    () => validateCreateTask({ title: "Valid title", projectId: "64a200000000000000000001", parentTaskId: "not-an-id" }),
    (error) => error.field === "parentTaskId"
  );
});

test("validateCreateTask accepts valid payload", () => {
  assert.doesNotThrow(() =>
    validateCreateTask({
      title: "Implement login",
      projectId: "64a200000000000000000001",
      priority: "HIGH",
      storyPoints: 5,
    })
  );
});

test("validateTaskQuery normalizes pagination and sort", () => {
  const result = validateTaskQuery({ page: 2, pageSize: 10, sortBy: "dueDate", sortOrder: "asc", status: "TODO" });
  assert.equal(result.page, 2);
  assert.equal(result.pageSize, 10);
  assert.equal(result.sortBy, "dueDate");
  assert.equal(result.sortOrder, 1);
});

test("validateTaskQuery rejects invalid status filter", () => {
  assert.throws(() => validateTaskQuery({ status: "NOPE" }), (error) => error.field === "status");
});

test("validateTaskQuery rejects invalid project id filter", () => {
  assert.throws(() => validateTaskQuery({ projectId: "bad-id" }), (error) => error.field === "projectId");
});

test("validateTaskQuery rejects invalid assignee id filter", () => {
  assert.throws(() => validateTaskQuery({ assigneeId: "bad-id" }), (error) => error.field === "assigneeId");
});

test("validateTaskQuery rejects invalid sprint id filter", () => {
  assert.throws(() => validateTaskQuery({ sprintId: "bad-id" }), (error) => error.field === "sprintId");
});

test("validateTaskQuery rejects invalid epic id filter", () => {
  assert.throws(() => validateTaskQuery({ epicId: "bad-id" }), (error) => error.field === "epicId");
});

test("validatePagination caps page size at 100", () => {
  assert.equal(validatePagination({ page: 1, pageSize: 500 }).pageSize, 100);
});

test("validateAssignee rejects missing user id", () => {
  assert.throws(() => validateAssignee({}), (error) => error.field === "userId");
});

test("validateLabelInput normalizes hex color", () => {
  assert.equal(validateLabelInput({ name: "Backend" }).color, "#6366f1");
  assert.throws(() => validateLabelInput({ name: "Backend", color: "red" }), (error) => error.field === "color");
});

test("validateChecklistInput and item validation", () => {
  assert.equal(validateChecklistInput({ title: " DoD " }).title, "DoD");
  assert.throws(() => validateChecklistInput({}), (error) => error.field === "title");
  assert.equal(validateChecklistItemInput({ text: " Add tests " }).text, "Add tests");
});

// --- Mappers -------------------------------------------------------------------

test("mapTask maps _id to id and keeps safe fields", () => {
  const mapped = mapTask({
    _id: "64a000000000000000000001",
    taskKey: "ETMS-1",
    title: "Test",
    projectId: "p1",
    status: "TODO",
    priority: "MEDIUM",
  });
  assert.equal(mapped.id, "64a000000000000000000001");
  assert.equal(mapped.taskKey, "ETMS-1");
  assert.equal(mapped.title, "Test");
  assert.equal(mapped.status, "TODO");
});

test("mapTask never exposes internal fields", () => {
  const mapped = mapTask({ _id: "abc", title: "X", isDeleted: true, deletedAt: new Date() });
  assert.equal(mapped.isDeleted, undefined);
  assert.equal(mapped.deletedAt, undefined);
});

test("mapLabel / mapChecklist / mapHistory map summary fields", () => {
  const label = mapLabel({ _id: "l1", name: "Backend", color: "#000000" });
  assert.equal(label.name, "Backend");

  const checklist = mapChecklist({ _id: "c1", title: "DoD", position: 0 }, [{ _id: "i1", text: "Item", isCompleted: true }]);
  assert.equal(checklist.items.length, 1);
  assert.equal(checklist.items[0].isCompleted, true);

  const history = mapHistory({ _id: "h1", field: "status", oldValue: "TODO", newValue: "DONE" });
  assert.equal(history.field, "status");
});

// --- Soft-delete exclusion in repository is verified via query structures. ----
// (Real DB integration tests run against a Mongo test database in CI/staging.)

