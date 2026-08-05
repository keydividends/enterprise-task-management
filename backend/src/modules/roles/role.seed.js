const Role = require("./role.model");
const Permission = require("./permission.model");
const RolePermission = require("./rolePermission.model");

const seedRolesAndPermissions = async () => {
  try {
    // Check if data already seeded
    const existingRoles = await Role.countDocuments();
    if (existingRoles > 0) {
      console.log("Roles and permissions already seeded. Skipping...");
      return;
    }

    // Define all permissions
    const permissionsData = [
      // User Permissions
      { key: "USER_VIEW", module: "USER", category: "VIEW", description: "View users" },
      { key: "USER_CREATE", module: "USER", category: "CREATE", description: "Create users" },
      { key: "USER_UPDATE", module: "USER", category: "UPDATE", description: "Update users" },
      { key: "USER_DELETE", module: "USER", category: "DELETE", description: "Delete users" },

      // Role Permissions
      { key: "ROLE_VIEW", module: "ROLE", category: "VIEW", description: "View roles" },
      { key: "ROLE_CREATE", module: "ROLE", category: "CREATE", description: "Create roles" },
      { key: "ROLE_UPDATE", module: "ROLE", category: "UPDATE", description: "Update roles" },
      { key: "ROLE_DELETE", module: "ROLE", category: "DELETE", description: "Delete roles" },
      { key: "ROLE_MANAGE", module: "ROLE", category: "MANAGE", description: "Manage role permissions" },

      // Project Permissions
      { key: "PROJECT_VIEW", module: "PROJECT", category: "VIEW", description: "View projects" },
      { key: "PROJECT_CREATE", module: "PROJECT", category: "CREATE", description: "Create projects" },
      { key: "PROJECT_UPDATE", module: "PROJECT", category: "UPDATE", description: "Update projects" },
      { key: "PROJECT_DELETE", module: "PROJECT", category: "DELETE", description: "Delete projects" },
      { key: "PROJECT_MANAGE_MEMBERS", module: "PROJECT", category: "MANAGE", description: "Manage project members" },

      // Team Permissions
      { key: "TEAM_VIEW", module: "TEAM", category: "VIEW", description: "View teams" },
      { key: "TEAM_CREATE", module: "TEAM", category: "CREATE", description: "Create teams" },
      { key: "TEAM_UPDATE", module: "TEAM", category: "UPDATE", description: "Update teams" },
      { key: "TEAM_DELETE", module: "TEAM", category: "DELETE", description: "Delete teams" },
      { key: "TEAM_MANAGE_MEMBERS", module: "TEAM", category: "MANAGE", description: "Manage team members" },

      // Task Permissions
      { key: "TASK_VIEW", module: "TASK", category: "VIEW", description: "View tasks" },
      { key: "TASK_CREATE", module: "TASK", category: "CREATE", description: "Create tasks" },
      { key: "TASK_UPDATE", module: "TASK", category: "UPDATE", description: "Update tasks" },
      { key: "TASK_ASSIGN", module: "TASK", category: "MANAGE", description: "Assign tasks to users" },
      { key: "TASK_DELETE", module: "TASK", category: "DELETE", description: "Delete tasks" },

      // Sprint Permissions
      { key: "SPRINT_VIEW", module: "SPRINT", category: "VIEW", description: "View sprints" },
      { key: "SPRINT_CREATE", module: "SPRINT", category: "CREATE", description: "Create sprints" },
      { key: "SPRINT_UPDATE", module: "SPRINT", category: "UPDATE", description: "Update sprints" },
      { key: "SPRINT_MANAGE", module: "SPRINT", category: "MANAGE", description: "Manage sprint tasks" },

      // Dashboard Permissions
      { key: "DASHBOARD_VIEW", module: "DASHBOARD", category: "VIEW", description: "View dashboard" },

      // Report Permissions
      { key: "REPORT_VIEW", module: "REPORT", category: "VIEW", description: "View reports" },

      // Notification Permissions
      { key: "NOTIFICATION_VIEW", module: "NOTIFICATION", category: "VIEW", description: "View notifications" },

      // Attachment Permissions
      { key: "ATTACHMENT_UPLOAD", module: "ATTACHMENT", category: "CREATE", description: "Upload attachments" },
      { key: "ATTACHMENT_DELETE", module: "ATTACHMENT", category: "DELETE", description: "Delete attachments" },

      // Comment Permissions
      { key: "COMMENT_CREATE", module: "COMMENT", category: "CREATE", description: "Create comments" },
      { key: "COMMENT_UPDATE", module: "COMMENT", category: "UPDATE", description: "Update comments" },
      { key: "COMMENT_DELETE", module: "COMMENT", category: "DELETE", description: "Delete comments" },
    ];

    // Create permissions
    const createdPermissions = await Permission.insertMany(permissionsData);
    console.log(`Created ${createdPermissions.length} permissions`);

    // Create roles
    const adminRole = new Role({
      name: "ADMIN",
      description: "Administrator with full access",
      isSystem: true,
      isActive: true,
    });
    await adminRole.save();

    const userRole = new Role({
      name: "USER",
      description: "Standard user with basic permissions",
      isSystem: true,
      isActive: true,
    });
    await userRole.save();

    const developerRole = new Role({
      name: "DEVELOPER",
      description: "Developer with task and project permissions",
      isSystem: false,
      isActive: true,
    });
    await developerRole.save();

    const managerRole = new Role({
      name: "MANAGER",
      description: "Manager with team and project management permissions",
      isSystem: false,
      isActive: true,
    });
    await managerRole.save();

    console.log("Created 4 roles: ADMIN, USER, DEVELOPER, MANAGER");

    // Map permission keys to IDs
    const permissionMap = {};
    createdPermissions.forEach((p) => {
      permissionMap[p.key] = p._id;
    });

    // Assign permissions to ADMIN role (all permissions)
    const adminPermissions = createdPermissions.map((p) => ({
      roleId: adminRole._id,
      permissionId: p._id,
    }));
    await RolePermission.insertMany(adminPermissions);
    console.log(`Assigned ${adminPermissions.length} permissions to ADMIN role`);

    // Assign permissions to USER role (basic read permissions)
    const userPermissions = [
      "USER_VIEW",
      "TASK_VIEW",
      "PROJECT_VIEW",
      "TEAM_VIEW",
      "SPRINT_VIEW",
      "DASHBOARD_VIEW",
      "NOTIFICATION_VIEW",
    ].map((key) => ({
      roleId: userRole._id,
      permissionId: permissionMap[key],
    }));
    await RolePermission.insertMany(userPermissions);
    console.log(`Assigned ${userPermissions.length} permissions to USER role`);

    // Assign permissions to DEVELOPER role
    const developerPermissions = [
      "USER_VIEW",
      "TASK_VIEW",
      "TASK_CREATE",
      "TASK_UPDATE",
      "TASK_ASSIGN",
      "PROJECT_VIEW",
      "TEAM_VIEW",
      "SPRINT_VIEW",
      "DASHBOARD_VIEW",
      "NOTIFICATION_VIEW",
      "ATTACHMENT_UPLOAD",
      "ATTACHMENT_DELETE",
      "COMMENT_CREATE",
      "COMMENT_UPDATE",
      "COMMENT_DELETE",
    ].map((key) => ({
      roleId: developerRole._id,
      permissionId: permissionMap[key],
    }));
    await RolePermission.insertMany(developerPermissions);
    console.log(`Assigned ${developerPermissions.length} permissions to DEVELOPER role`);

    // Assign permissions to MANAGER role
    const managerPermissions = [
      "USER_VIEW",
      "USER_CREATE",
      "USER_UPDATE",
      "TASK_VIEW",
      "TASK_CREATE",
      "TASK_UPDATE",
      "TASK_ASSIGN",
      "TASK_DELETE",
      "PROJECT_VIEW",
      "PROJECT_CREATE",
      "PROJECT_UPDATE",
      "PROJECT_MANAGE_MEMBERS",
      "TEAM_VIEW",
      "TEAM_CREATE",
      "TEAM_UPDATE",
      "TEAM_MANAGE_MEMBERS",
      "SPRINT_VIEW",
      "SPRINT_CREATE",
      "SPRINT_UPDATE",
      "SPRINT_MANAGE",
      "DASHBOARD_VIEW",
      "REPORT_VIEW",
      "NOTIFICATION_VIEW",
      "ATTACHMENT_UPLOAD",
      "ATTACHMENT_DELETE",
      "COMMENT_CREATE",
      "COMMENT_UPDATE",
      "COMMENT_DELETE",
    ].map((key) => ({
      roleId: managerRole._id,
      permissionId: permissionMap[key],
    }));
    await RolePermission.insertMany(managerPermissions);
    console.log(`Assigned ${managerPermissions.length} permissions to MANAGER role`);

    console.log("✓ Successfully seeded roles and permissions");
  } catch (error) {
    console.error("Error seeding roles and permissions:", error);
    throw error;
  }
};

module.exports = { seedRolesAndPermissions };
