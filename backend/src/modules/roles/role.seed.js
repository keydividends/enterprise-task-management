const Role = require("./role.model");
const Permission = require("./permission.model");
const RolePermission = require("./rolePermission.model");

const permissions = [
  ["LOGIN", "AUTH", "VIEW", "Login"], ["LOGOUT", "AUTH", "VIEW", "Logout"], ["RESET_PASSWORD", "AUTH", "MANAGE", "Reset password"], ["CHANGE_PASSWORD", "AUTH", "UPDATE", "Change password"],
  ["USER_CREATE", "USER", "CREATE", "Create users"], ["USER_VIEW", "USER", "VIEW", "View users"], ["USER_UPDATE", "USER", "UPDATE", "Update users"], ["USER_DELETE", "USER", "DELETE", "Delete users"], ["USER_ACTIVATE", "USER", "MANAGE", "Activate users"], ["USER_DEACTIVATE", "USER", "MANAGE", "Deactivate users"],
  ["ROLE_CREATE", "ROLE", "CREATE", "Create roles"], ["ROLE_VIEW", "ROLE", "VIEW", "View roles"], ["ROLE_UPDATE", "ROLE", "UPDATE", "Update roles"], ["ROLE_DELETE", "ROLE", "DELETE", "Delete roles"],
  ["TEAM_CREATE", "TEAM", "CREATE", "Create teams"], ["TEAM_VIEW", "TEAM", "VIEW", "View teams"], ["TEAM_UPDATE", "TEAM", "UPDATE", "Update teams"], ["TEAM_DELETE", "TEAM", "DELETE", "Delete teams"], ["TEAM_MANAGE_MEMBERS", "TEAM", "MANAGE", "Manage team members"],
  ["PROJECT_CREATE", "PROJECT", "CREATE", "Create projects"], ["PROJECT_VIEW", "PROJECT", "VIEW", "View projects"], ["PROJECT_UPDATE", "PROJECT", "UPDATE", "Update projects"], ["PROJECT_DELETE", "PROJECT", "DELETE", "Delete projects"], ["PROJECT_MANAGE_MEMBERS", "PROJECT", "MANAGE", "Manage project members"],
  ["SPRINT_CREATE", "SPRINT", "CREATE", "Create sprints"], ["SPRINT_VIEW", "SPRINT", "VIEW", "View sprints"], ["SPRINT_UPDATE", "SPRINT", "UPDATE", "Update sprints"], ["SPRINT_DELETE", "SPRINT", "DELETE", "Delete sprints"],
  ["TASK_CREATE", "TASK", "CREATE", "Create tasks"], ["TASK_VIEW", "TASK", "VIEW", "View tasks"], ["TASK_UPDATE", "TASK", "UPDATE", "Update tasks"], ["TASK_DELETE", "TASK", "DELETE", "Delete tasks"], ["TASK_ASSIGN", "TASK", "MANAGE", "Assign tasks"], ["TASK_REASSIGN", "TASK", "MANAGE", "Reassign tasks"], ["TASK_CLOSE", "TASK", "MANAGE", "Close tasks"],
  ["COMMENT_CREATE", "COMMENT", "CREATE", "Create comments"], ["COMMENT_UPDATE", "COMMENT", "UPDATE", "Update comments"], ["COMMENT_DELETE", "COMMENT", "DELETE", "Delete comments"],
  ["ATTACHMENT_UPLOAD", "ATTACHMENT", "CREATE", "Upload attachments"], ["ATTACHMENT_VIEW", "ATTACHMENT", "VIEW", "View attachments"], ["ATTACHMENT_DELETE", "ATTACHMENT", "DELETE", "Delete attachments"],
  ["REPORT_VIEW", "REPORT", "VIEW", "View reports"], ["REPORT_EXPORT", "REPORT", "EXPORT", "Export reports"], ["DASHBOARD_VIEW", "DASHBOARD", "VIEW", "View dashboard"], ["DASHBOARD_CONFIGURE", "DASHBOARD", "MANAGE", "Configure dashboard"], ["AUDIT_VIEW", "AUDIT", "VIEW", "View audit logs"], ["AUDIT_EXPORT", "AUDIT", "EXPORT", "Export audit logs"],
];

const roleDefinitions = {
  SUPER_ADMIN: { description: "Platform configuration, security, and unrestricted access", grants: "*" },
  ORGANIZATION_ADMIN: { description: "Manages users, teams, projects, and reports for an organization", grants: ["USER_CREATE", "USER_VIEW", "USER_UPDATE", "USER_ACTIVATE", "USER_DEACTIVATE", "TEAM_CREATE", "TEAM_VIEW", "TEAM_UPDATE", "TEAM_DELETE", "TEAM_MANAGE_MEMBERS", "PROJECT_CREATE", "PROJECT_VIEW", "PROJECT_UPDATE", "PROJECT_DELETE", "PROJECT_MANAGE_MEMBERS", "SPRINT_CREATE", "SPRINT_VIEW", "SPRINT_UPDATE", "SPRINT_DELETE", "TASK_CREATE", "TASK_VIEW", "TASK_UPDATE", "TASK_DELETE", "TASK_ASSIGN", "TASK_REASSIGN", "TASK_CLOSE", "COMMENT_CREATE", "COMMENT_UPDATE", "COMMENT_DELETE", "ATTACHMENT_UPLOAD", "ATTACHMENT_VIEW", "ATTACHMENT_DELETE", "REPORT_VIEW", "REPORT_EXPORT", "DASHBOARD_VIEW", "DASHBOARD_CONFIGURE"] },
  COMPANY_ADMIN: { description: "Manages users, teams, projects, and reports for an organization", grants: ["USER_CREATE", "USER_VIEW", "USER_UPDATE", "USER_ACTIVATE", "USER_DEACTIVATE", "TEAM_CREATE", "TEAM_VIEW", "TEAM_UPDATE", "TEAM_DELETE", "TEAM_MANAGE_MEMBERS", "PROJECT_CREATE", "PROJECT_VIEW", "PROJECT_UPDATE", "PROJECT_DELETE", "PROJECT_MANAGE_MEMBERS", "SPRINT_CREATE", "SPRINT_VIEW", "SPRINT_UPDATE", "SPRINT_DELETE", "TASK_CREATE", "TASK_VIEW", "TASK_UPDATE", "TASK_DELETE", "TASK_ASSIGN", "TASK_REASSIGN", "TASK_CLOSE", "COMMENT_CREATE", "COMMENT_UPDATE", "COMMENT_DELETE", "ATTACHMENT_UPLOAD", "ATTACHMENT_VIEW", "ATTACHMENT_DELETE", "REPORT_VIEW", "REPORT_EXPORT", "DASHBOARD_VIEW", "DASHBOARD_CONFIGURE"] },
  MANAGER: { description: "Manages project delivery, project members, and assigned work", grants: ["PROJECT_CREATE", "PROJECT_VIEW", "PROJECT_UPDATE", "PROJECT_DELETE", "PROJECT_MANAGE_MEMBERS", "SPRINT_CREATE", "SPRINT_VIEW", "SPRINT_UPDATE", "SPRINT_DELETE", "TASK_CREATE", "TASK_VIEW", "TASK_UPDATE", "TASK_DELETE", "TASK_ASSIGN", "TASK_REASSIGN", "TASK_CLOSE", "COMMENT_CREATE", "COMMENT_UPDATE", "COMMENT_DELETE", "ATTACHMENT_UPLOAD", "ATTACHMENT_VIEW", "ATTACHMENT_DELETE", "REPORT_VIEW", "DASHBOARD_VIEW"] },
  PROJECT_MANAGER: { description: "Owns project delivery, sprint planning, and task assignment", grants: ["PROJECT_CREATE", "PROJECT_VIEW", "PROJECT_UPDATE", "PROJECT_DELETE", "PROJECT_MANAGE_MEMBERS", "SPRINT_CREATE", "SPRINT_VIEW", "SPRINT_UPDATE", "SPRINT_DELETE", "TASK_CREATE", "TASK_VIEW", "TASK_UPDATE", "TASK_DELETE", "TASK_ASSIGN", "TASK_REASSIGN", "TASK_CLOSE", "COMMENT_CREATE", "COMMENT_UPDATE", "COMMENT_DELETE", "ATTACHMENT_UPLOAD", "ATTACHMENT_VIEW", "ATTACHMENT_DELETE", "REPORT_VIEW", "DASHBOARD_VIEW"] },
  TEAM_LEAD: { description: "Leads team execution, backlog, and task assignment", grants: ["TEAM_VIEW", "TEAM_UPDATE", "PROJECT_VIEW", "PROJECT_UPDATE", "SPRINT_CREATE", "SPRINT_VIEW", "SPRINT_UPDATE", "TASK_CREATE", "TASK_VIEW", "TASK_UPDATE", "TASK_ASSIGN", "TASK_REASSIGN", "TASK_CLOSE", "COMMENT_CREATE", "COMMENT_UPDATE", "COMMENT_DELETE", "ATTACHMENT_UPLOAD", "ATTACHMENT_VIEW", "ATTACHMENT_DELETE", "REPORT_VIEW", "DASHBOARD_VIEW"] },
  SENIOR_DEVELOPER: { description: "Implements features and performs technical reviews", grants: ["PROJECT_VIEW", "SPRINT_VIEW", "TASK_VIEW", "TASK_UPDATE", "COMMENT_CREATE", "COMMENT_UPDATE", "ATTACHMENT_UPLOAD", "ATTACHMENT_VIEW", "REPORT_VIEW", "DASHBOARD_VIEW"] },
  DEVELOPER: { description: "Completes assigned development work", grants: ["PROJECT_VIEW", "SPRINT_VIEW", "TASK_VIEW", "TASK_UPDATE", "COMMENT_CREATE", "COMMENT_UPDATE", "ATTACHMENT_UPLOAD", "ATTACHMENT_VIEW", "REPORT_VIEW", "DASHBOARD_VIEW"] },
  QA_ENGINEER: { description: "Creates and validates defects", grants: ["PROJECT_VIEW", "SPRINT_VIEW", "TASK_VIEW", "TASK_UPDATE", "COMMENT_CREATE", "COMMENT_UPDATE", "ATTACHMENT_UPLOAD", "ATTACHMENT_VIEW", "REPORT_VIEW", "DASHBOARD_VIEW"] },
  INTERN: { description: "Updates assigned task progress and comments", grants: ["PROJECT_VIEW", "SPRINT_VIEW", "TASK_VIEW", "TASK_UPDATE", "COMMENT_CREATE", "ATTACHMENT_UPLOAD", "ATTACHMENT_VIEW", "DASHBOARD_VIEW"] },
  HR_MANAGER: { description: "Manages employee information", grants: ["USER_VIEW", "USER_UPDATE", "REPORT_VIEW", "DASHBOARD_VIEW"] },
  AUDITOR: { description: "Read-only access to records, reports, and audit logs", grants: ["USER_VIEW", "TEAM_VIEW", "PROJECT_VIEW", "SPRINT_VIEW", "TASK_VIEW", "ATTACHMENT_VIEW", "REPORT_VIEW", "REPORT_EXPORT", "DASHBOARD_VIEW", "AUDIT_VIEW", "AUDIT_EXPORT"] },
};

const seedRolesAndPermissions = async () => {
  const permissionDocuments = await Promise.all(permissions.map(([key, module, category, description]) => Permission.findOneAndUpdate(
    { key }, { $set: { key, module, category, description, isActive: true } }, { new: true, upsert: true, setDefaultsOnInsert: true }
  )));
  const permissionIds = new Map(permissionDocuments.map((permission) => [permission.key, permission._id]));

  for (const [name, definition] of Object.entries(roleDefinitions)) {
    const role = await Role.findOneAndUpdate(
      { name }, { $set: { name, description: definition.description, isSystem: true, isActive: true } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    const grants = definition.grants === "*" ? permissionDocuments.map(({ key }) => key) : definition.grants;
    await RolePermission.deleteMany({ roleId: role._id });
    await RolePermission.insertMany(grants.map((key) => ({ roleId: role._id, permissionId: permissionIds.get(key) })));
  }
  console.log(`Seeded ${permissionDocuments.length} permissions and ${Object.keys(roleDefinitions).length} document roles.`);
};

module.exports = { seedRolesAndPermissions };
