const request = require("supertest");
const app = require("../../app");
const Role = require("../roles/role.model");
const Permission = require("../roles/permission.model");
const RolePermission = require("../roles/rolePermission.model");

describe("Role and Permission APIs", () => {
  let testRole;
  let testPermission;
  let adminToken = "Bearer test-admin-token"; // Mock token - should be replaced with actual auth

  beforeAll(async () => {
    // Create test permission
    testPermission = await Permission.create({
      key: "TEST_PERMISSION",
      module: "TASK",
      category: "VIEW",
      description: "Test permission",
      isActive: true,
    });
  });

  afterAll(async () => {
    // Clean up test data
    await Role.deleteMany({});
    await Permission.deleteMany({});
    await RolePermission.deleteMany({});
  });

  describe("Role Endpoints", () => {
    describe("POST /api/v1/roles", () => {
      it("should create a new role with valid data", async () => {
        const roleData = {
          name: "TEST_ROLE",
          description: "Test role description",
          permissionIds: [testPermission._id.toString()],
        };

        const response = await request(app)
          .post("/api/v1/roles")
          .set("Authorization", adminToken)
          .send(roleData);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe("TEST_ROLE");
        testRole = response.body.data;
      });

      it("should reject duplicate role name", async () => {
        const roleData = {
          name: testRole.name,
          description: "Another test role",
        };

        const response = await request(app)
          .post("/api/v1/roles")
          .set("Authorization", adminToken)
          .send(roleData);

        expect(response.status).toBe(409);
        expect(response.body.code).toBe("ROLE_NAME_ALREADY_EXISTS");
      });

      it("should reject role with empty name", async () => {
        const roleData = {
          name: "",
          description: "Test",
        };

        const response = await request(app)
          .post("/api/v1/roles")
          .set("Authorization", adminToken)
          .send(roleData);

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("VALIDATION_ERROR");
      });
    });

    describe("GET /api/v1/roles", () => {
      it("should list all roles with pagination", async () => {
        const response = await request(app)
          .get("/api/v1/roles?page=1&pageSize=20")
          .set("Authorization", adminToken);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.pagination).toBeDefined();
        expect(response.body.pagination.page).toBe(1);
      });

      it("should support search filter", async () => {
        const response = await request(app)
          .get("/api/v1/roles?search=TEST")
          .set("Authorization", adminToken);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        const roleNames = response.body.data.map((r) => r.name);
        expect(roleNames.some((name) => name.includes("TEST"))).toBe(true);
      });
    });

    describe("GET /api/v1/roles/:roleId", () => {
      it("should get role by ID", async () => {
        const response = await request(app)
          .get(`/api/v1/roles/${testRole._id}`)
          .set("Authorization", adminToken);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data._id).toBe(testRole._id.toString());
      });

      it("should return 404 for non-existent role", async () => {
        const fakeId = "000000000000000000000000";
        const response = await request(app)
          .get(`/api/v1/roles/${fakeId}`)
          .set("Authorization", adminToken);

        expect(response.status).toBe(404);
        expect(response.body.code).toBe("ROLE_NOT_FOUND");
      });
    });

    describe("PATCH /api/v1/roles/:roleId", () => {
      it("should update role successfully", async () => {
        const updateData = {
          description: "Updated description",
        };

        const response = await request(app)
          .patch(`/api/v1/roles/${testRole._id}`)
          .set("Authorization", adminToken)
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.description).toBe("Updated description");
      });

      it("should prevent updating system roles", async () => {
        // First create a system role
        const systemRole = await Role.create({
          name: "SYSTEM_ROLE",
          isSystem: true,
          description: "System role",
        });

        const updateData = {
          description: "Try to update",
        };

        const response = await request(app)
          .patch(`/api/v1/roles/${systemRole._id}`)
          .set("Authorization", adminToken)
          .send(updateData);

        expect(response.status).toBe(403);
        expect(response.body.code).toBe("SYSTEM_ROLE_PROTECTED");

        await Role.findByIdAndDelete(systemRole._id);
      });
    });

    describe("DELETE /api/v1/roles/:roleId", () => {
      it("should delete a custom role", async () => {
        // Create a new role to delete
        const roleToDelete = await Role.create({
          name: "DELETE_TEST_ROLE",
          description: "Role to delete",
          isSystem: false,
        });

        const response = await request(app)
          .delete(`/api/v1/roles/${roleToDelete._id}`)
          .set("Authorization", adminToken);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        const deletedRole = await Role.findById(roleToDelete._id);
        expect(deletedRole).toBeNull();
      });

      it("should prevent deleting system roles", async () => {
        // Create a system role
        const systemRole = await Role.create({
          name: "SYSTEM_DELETE_TEST",
          isSystem: true,
          description: "System role",
        });

        const response = await request(app)
          .delete(`/api/v1/roles/${systemRole._id}`)
          .set("Authorization", adminToken);

        expect(response.status).toBe(403);
        expect(response.body.code).toBe("SYSTEM_ROLE_PROTECTED");

        await Role.findByIdAndDelete(systemRole._id);
      });
    });
  });

  describe("Permission Endpoints", () => {
    describe("GET /api/v1/permissions", () => {
      it("should list all permissions", async () => {
        const response = await request(app)
          .get("/api/v1/permissions?page=1&pageSize=50")
          .set("Authorization", adminToken);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it("should support module filter", async () => {
        const response = await request(app)
          .get("/api/v1/permissions?module=TASK")
          .set("Authorization", adminToken);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        const modules = response.body.data.map((p) => p.module);
        expect(modules.every((m) => m === "TASK")).toBe(true);
      });
    });

    describe("GET /api/v1/roles/:roleId/permissions", () => {
      it("should get permissions for a role", async () => {
        const response = await request(app)
          .get(`/api/v1/roles/${testRole._id}/permissions`)
          .set("Authorization", adminToken);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });

    describe("PUT /api/v1/roles/:roleId/permissions", () => {
      it("should update role permissions", async () => {
        // Create another permission
        const newPermission = await Permission.create({
          key: "ANOTHER_TEST_PERMISSION",
          module: "PROJECT",
          category: "UPDATE",
          description: "Another test permission",
          isActive: true,
        });

        const updateData = {
          permissionIds: [newPermission._id.toString()],
        };

        const response = await request(app)
          .put(`/api/v1/roles/${testRole._id}/permissions`)
          .set("Authorization", adminToken)
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.permissions).toBeDefined();
      });

      it("should prevent updating system role permissions", async () => {
        const systemRole = await Role.create({
          name: "SYSTEM_PERM_TEST",
          isSystem: true,
          description: "System role",
        });

        const updateData = {
          permissionIds: [testPermission._id.toString()],
        };

        const response = await request(app)
          .put(`/api/v1/roles/${systemRole._id}/permissions`)
          .set("Authorization", adminToken)
          .send(updateData);

        expect(response.status).toBe(403);
        expect(response.body.code).toBe("SYSTEM_ROLE_PROTECTED");

        await Role.findByIdAndDelete(systemRole._id);
      });
    });
  });

  describe("Authorization Checks", () => {
    it("should require authentication for all endpoints", async () => {
      const response = await request(app).get("/api/v1/roles");

      expect(response.status).toBe(401);
      expect(response.body.code).toBe("AUTH_REQUIRED");
    });

    it("should check ROLE_CREATE permission for creating roles", async () => {
      const roleData = {
        name: "UNAUTHORIZED_ROLE",
        description: "Should fail",
      };

      // Assuming we have a user without ROLE_CREATE permission
      const response = await request(app)
        .post("/api/v1/roles")
        .set("Authorization", "Bearer user-without-permission")
        .send(roleData);

      // This would return 403 if permission is not found
      expect([401, 403]).toContain(response.status);
    });
  });
});
