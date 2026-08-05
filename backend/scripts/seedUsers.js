// ---------------------------------------------------------------------------
// Seed users for User Management testing & initial database setup.
// Idempotent: safe to run multiple times.
//
// Usage: node scripts/seedUsers.js
// ---------------------------------------------------------------------------

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { User } = require("../src/modules/users/user.model");

const SEED_USERS = [
  {
    firstName: "Admin",
    lastName: "User",
    email: "admin@etms.com",
    password: "Admin@123",
    role: "ADMIN",
    permissions: [
      "USER_VIEW",
      "USER_CREATE",
      "USER_UPDATE",
      "USER_DELETE",
      "PROJECT_VIEW",
      "PROJECT_CREATE",
      "TASK_VIEW",
      "TASK_CREATE",
      "TASK_UPDATE",
    ],
    status: "ACTIVE",
    department: "Management",
    title: "System Administrator",
    mobile: "9876543210",
    bio: "System Administrator for ETMS Platform.",
  },
  {
    firstName: "Raheema",
    lastName: "Shariff",
    email: "raheema@etms.com",
    password: "User@123",
    role: "ADMIN",
    permissions: ["USER_VIEW", "USER_CREATE", "USER_UPDATE", "USER_DELETE", "PROJECT_VIEW", "TASK_VIEW"],
    status: "ACTIVE",
    department: "User Management",
    title: "User Management Module Lead",
    mobile: "9876543211",
    bio: "Module owner for User Management in ETMS.",
  },
  {
    firstName: "Yamini",
    lastName: "K",
    email: "yamini@etms.com",
    password: "User@123",
    role: "USER",
    permissions: ["USER_VIEW", "PROJECT_VIEW", "TASK_VIEW"],
    status: "ACTIVE",
    department: "Authentication",
    title: "Auth Module Lead",
    mobile: "9876543212",
    bio: "Module owner for Authentication & Security.",
  },
  {
    firstName: "Demo",
    lastName: "User",
    email: "demo@etms.com",
    password: "User@123",
    role: "USER",
    permissions: ["USER_VIEW", "PROJECT_VIEW", "TASK_VIEW", "TASK_CREATE"],
    status: "ACTIVE",
    department: "Engineering",
    title: "Software Engineer",
    mobile: "9876543213",
    bio: "Software Engineer on ETMS development team.",
  },
  {
    firstName: "Disabled",
    lastName: "Account",
    email: "disabled@etms.com",
    password: "User@123",
    role: "USER",
    permissions: [],
    status: "DISABLED",
    department: "QA",
    title: "Inactive Account",
    mobile: "9876543214",
    bio: "Disabled test account for status testing.",
  },
];

const connect = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/enterprise-task-management";
  await mongoose.connect(uri);
  console.log(`Connected to MongoDB at ${uri}`);
};

const seed = async () => {
  await connect();

  let createdCount = 0;
  let skippedCount = 0;

  for (const userData of SEED_USERS) {
    const normalizedEmail = userData.email.toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail, isDeleted: false });

    if (existing) {
      skippedCount += 1;
      continue;
    }

    const passwordHash = await bcrypt.hash(userData.password, 10);
    await User.create({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: normalizedEmail,
      passwordHash,
      role: userData.role,
      permissions: userData.permissions,
      status: userData.status,
      department: userData.department,
      title: userData.title,
      mobile: userData.mobile,
      bio: userData.bio,
    });

    createdCount += 1;
  }

  console.log(`Seeding finished. Created: ${createdCount}, Skipped (Existing): ${skippedCount}`);
  await mongoose.disconnect();
};

seed().catch((error) => {
  console.error("User seed failed:", error);
  process.exit(1);
});
// ---------------------------------------------------------------------------
// Seed users for authentication / user-management testing.
// Idempotent: safe to run multiple times.
//
//   Requires a running MongoDB instance.
//   Usage: node scripts/seedUsers.js
//
// Creates:
//   admin@etms.com     - ADMIN  (full permissions, ACTIVE)
//   demo@etms.com      - USER   (basic task permissions, ACTIVE)
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
    permissions: ["USER_VIEW", "PROJECT_VIEW", "TASK_VIEW", "TASK_CREATE", "TASK_UPDATE", "TASK_DELETE", "TASK_ASSIGN"],
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

