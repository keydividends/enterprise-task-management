// ---------------------------------------------------------------------------
// Seed roles and permissions for RBAC.
// Idempotent: safe to run multiple times.
//
// Usage: node scripts/seedRoles.js
// ---------------------------------------------------------------------------

require("dotenv").config();
const mongoose = require("mongoose");
const { seedRolesAndPermissions } = require("../src/modules/roles/role.seed");

const connect = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/enterprise-task-management";
  await mongoose.connect(uri);
  console.log(`Connected to ${uri}`);
};

const seed = async () => {
  await connect();
  await seedRolesAndPermissions();
  await mongoose.disconnect();
  console.log("Role and permission seed complete.");
};

seed().catch((error) => {
  console.error("Role seed failed:", error);
  process.exit(1);
});
