// ---------------------------------------------------------------------------
// Seed users for authentication / user-management testing.
// Idempotent: safe to run multiple times.
//
//   Requires a running MongoDB instance.
//   Usage: node scripts/seedUsers.js
//
// Creates:
//   admin@etms.com     - ADMIN  (full permissions, ACTIVE)
//   demo@etms.com      - USER   (task + team permissions, ACTIVE)
//   disabled@etms.com  - USER   (no permissions, DISABLED)
//
// Documented demo password: Admin@123
// ---------------------------------------------------------------------------

require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { User } = require("../src/modules/users/user.model");

const SEED_PASSWORD = "Admin@123";

const SEED_USERS = [
  {
    email: "superadmin@etms.com",
    firstName: "Super",
    lastName: "Admin",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    department: "Platform Operations",
    title: "Global Platform Administrator",
    permissions: [
      "USER_VIEW",
      "USER_CREATE",
      "USER_UPDATE",
      "USER_DELETE",
      "PROJECT_VIEW",
      "PROJECT_CREATE",
      "PROJECT_UPDATE",
      "PROJECT_DELETE",
      "PROJECT_MANAGE_MEMBERS",
      "TASK_VIEW",
      "TASK_CREATE",
      "TASK_UPDATE",
      "TASK_DELETE",
      "TASK_ASSIGN",
      "TASK_REASSIGN",
      "TASK_CLOSE",
      "TEAM_VIEW",
      "TEAM_CREATE",
      "TEAM_UPDATE",
      "TEAM_DELETE",
      "TEAM_MANAGE_MEMBERS",
      "ROLE_CREATE",
      "ROLE_VIEW",
      "ROLE_UPDATE",
      "ROLE_DELETE",
      "REPORT_VIEW",
      "REPORT_EXPORT",
      "DASHBOARD_VIEW",
      "DASHBOARD_CONFIGURE",
      "AUDIT_VIEW",
      "AUDIT_EXPORT"
    ],
  },
  {
    email: "admin@etms.com",
    firstName: "Admin",
    lastName: "User",
    role: "ADMIN",
    status: "ACTIVE",
    department: "Management",
    title: "System Administrator",
    permissions: [
      "USER_VIEW",
      "USER_CREATE",
      "USER_UPDATE",
      "USER_DELETE",
      "PROJECT_VIEW",
      "PROJECT_CREATE",
      "PROJECT_MANAGE_MEMBERS",
      "TASK_VIEW",
      "TASK_CREATE",
      "TASK_UPDATE",
      "TASK_DELETE",
      "TASK_ASSIGN",
      "TEAM_VIEW",
      "TEAM_CREATE",
      "TEAM_UPDATE",
      "TEAM_DELETE",
      "TEAM_MANAGE_MEMBERS",
    ],
  },
  {
    email: "demo@etms.com",
    firstName: "Demo",
    lastName: "User",
    role: "USER",
    status: "ACTIVE",
    department: "Engineering",
    title: "Software Engineer",
    permissions: [
      "USER_VIEW",
      "PROJECT_VIEW",
      "TASK_VIEW",
      "TASK_CREATE",
      "TASK_UPDATE",
      "TASK_DELETE",
      "TASK_ASSIGN",
      "TEAM_VIEW",
      "TEAM_CREATE",
      "TEAM_UPDATE",
      "TEAM_DELETE",
      "TEAM_MANAGE_MEMBERS",
    ],
  },
  {
    email: "disabled@etms.com",
    firstName: "Disabled",
    lastName: "User",
    role: "USER",
    status: "DISABLED",
    department: "QA",
    title: "Tester",
    permissions: [],
  },
];

const connect = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/enterprise-task-management";
  await mongoose.connect(uri);
  console.log(`Connected to ${uri}`);
};

const seed = async () => {
  await connect();

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
  console.log(`Password hash generated for "${SEED_PASSWORD}": ${passwordHash}`);

  let createdCount = 0;
  let updatedCount = 0;

  for (const seedUser of SEED_USERS) {
    const existing = await User.findOne({ email: seedUser.email, isDeleted: false });

    if (existing) {
      // Ensure the documented demo password and permission set stay in sync.
      await User.findOneAndUpdate(
        { _id: existing._id },
        {
          $set: {
            passwordHash: existing.passwordHash.startsWith("$2") ? existing.passwordHash : passwordHash,
            role: seedUser.role,
            status: seedUser.status,
            department: seedUser.department,
            title: seedUser.title,
            permissions: seedUser.permissions,
          },
        },
        { new: true }
      );
      updatedCount += 1;
      console.log(`Updated ${seedUser.email}`);
      continue;
    }

    await User.create({
      email: seedUser.email,
      passwordHash,
      firstName: seedUser.firstName,
      lastName: seedUser.lastName,
      role: seedUser.role,
      status: seedUser.status,
      department: seedUser.department,
      title: seedUser.title,
      permissions: seedUser.permissions,
      isDeleted: false,
    });
    createdCount += 1;
    console.log(`Created ${seedUser.email}`);
  }

  console.log(`\nSeed complete. Created: ${createdCount}, Updated: ${updatedCount}`);

  await mongoose.disconnect();
};

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
