const test = require("node:test");
const assert = require("node:assert/strict");

const userService = require("../src/modules/users/user.service");
const { toUserDTO } = require("../src/modules/users/user.mapper");
const { validateCreateUser, validateStatusUpdate } = require("../src/modules/users/user.validation");

const adminUser = {
  id: "user_admin_1",
  email: "admin@etms.com",
  role: "ADMIN",
  permissions: ["USER_VIEW", "USER_CREATE", "USER_UPDATE", "USER_DELETE"],
};

const standardUser = {
  id: "user_demo_1",
  email: "demo@etms.com",
  role: "USER",
  permissions: ["USER_VIEW"],
};

test("getUsers returns paginated user list", async () => {
  const result = await userService.getUsers({ page: 1, pageSize: 10 });
  assert.ok(Array.isArray(result.data));
  assert.ok(result.pagination);
  assert.equal(result.pagination.page, 1);
  assert.ok(result.data.length > 0);
  assert.equal(result.data[0].passwordHash, undefined);
});

test("getUserById returns user DTO without sensitive fields", async () => {
  const user = await userService.getUserById("user_admin_1");
  assert.equal(user.id, "user_admin_1");
  assert.equal(user.email, "admin@etms.com");
  assert.equal(user.passwordHash, undefined);
});

test("getUserById throws 404 for unknown user", async () => {
  await assert.rejects(
    () => userService.getUserById("unknown_user_id_999"),
    (error) => {
      assert.equal(error.code, "USER_NOT_FOUND");
      assert.equal(error.statusCode, 404);
      return true;
    }
  );
});

test("createUser creates user with hashed password and safe DTO", async () => {
  const newEmail = `raheema.test.${Date.now()}@etms.com`;
  const created = await userService.createUser(
    {
      firstName: "Test",
      lastName: "User",
      email: newEmail,
      department: "Engineering",
      title: "QA Lead",
    },
    adminUser
  );

  assert.ok(created.id);
  assert.equal(created.email, newEmail);
  assert.equal(created.department, "Engineering");
  assert.equal(created.passwordHash, undefined);
});

test("createUser rejects duplicate email", async () => {
  await assert.rejects(
    () =>
      userService.createUser(
        {
          firstName: "Duplicate",
          lastName: "Test",
          email: "admin@etms.com",
        },
        adminUser
      ),
    (error) => {
      assert.equal(error.code, "USER_EMAIL_ALREADY_EXISTS");
      assert.equal(error.statusCode, 409);
      return true;
    }
  );
});

test("updateUser updates user details successfully", async () => {
  const updated = await userService.updateUser("user_demo_1", {
    title: "Senior Engineer",
    department: "Frontend",
  });

  assert.equal(updated.title, "Senior Engineer");
  assert.equal(updated.department, "Frontend");
});

test("deactivateUser updates status to DISABLED", async () => {
  const deactivated = await userService.deactivateUser("user_demo_1", adminUser);
  assert.equal(deactivated.status, "DISABLED");

  // Re-activate for clean state
  const activated = await userService.activateUser("user_demo_1", adminUser);
  assert.equal(activated.status, "ACTIVE");
});

test("deactivateUser prevents self-deactivation of admin", async () => {
  await assert.rejects(
    () => userService.deactivateUser("user_admin_1", { id: "user_admin_1", role: "ADMIN" }),
    (error) => {
      assert.equal(error.code, "PROTECTED_USER");
      assert.equal(error.statusCode, 403);
      return true;
    }
  );
});

test("searchUsers returns matching users", async () => {
  const results = await userService.searchUsers("Admin");
  assert.ok(Array.isArray(results));
  assert.ok(results.some((u) => u.firstName === "Admin"));
});

test("getUserWorkload returns assigned and completed task counts", async () => {
  const workload = await userService.getUserWorkload("user_admin_1");
  assert.ok(typeof workload.assignedTasks === "number");
  assert.ok(typeof workload.completedTasks === "number");
});

test("validateCreateUser validates required fields", () => {
  assert.throws(
    () => validateCreateUser({ firstName: "" }),
    (error) => error.code === "VALIDATION_ERROR"
  );
  assert.throws(
    () => validateCreateUser({ firstName: "John", email: "invalid-email" }),
    (error) => error.code === "VALIDATION_ERROR"
  );
});
