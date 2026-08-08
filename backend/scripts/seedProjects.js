// Seed projects and project members. Idempotent – safe to run multiple times.
// Usage: node scripts/seedProjects.js

require("dotenv").config();
const mongoose = require("mongoose");
const { Project, ProjectMember } = require("../src/modules/projects/project.model");
const { User } = require("../src/modules/users/user.model");

const WORKSPACE_ID = new mongoose.Types.ObjectId("64a000000000000000000001");

const SEED_USER_EMAILS = ["admin@etms.com", "demo@etms.com"];

const SEED_PROJECTS = [
  {
    _id: new mongoose.Types.ObjectId("64a200000000000000000001"),
    workspaceId: WORKSPACE_ID,
    name: "Enterprise Task Management",
    key: "ETMS",
    description: "Internal delivery and reporting platform",
    status: "ACTIVE",
    priority: "HIGH",
    projectManagerEmail: "admin@etms.com",
    startDate: new Date("2026-08-01"),
    targetEndDate: new Date("2026-12-31"),
    createdByEmail: "admin@etms.com",
    updatedByEmail: "admin@etms.com",
  },
  {
    _id: new mongoose.Types.ObjectId("64a200000000000000000002"),
    workspaceId: WORKSPACE_ID,
    name: "Payment Gateway",
    key: "PAY",
    description: "Payments and wallet integration",
    status: "PLANNING",
    priority: "MEDIUM",
    projectManagerEmail: "admin@etms.com",
    startDate: new Date("2026-09-01"),
    targetEndDate: new Date("2027-02-28"),
    createdByEmail: "admin@etms.com",
    updatedByEmail: "admin@etms.com",
  },
  {
    _id: new mongoose.Types.ObjectId("64a200000000000000000003"),
    workspaceId: WORKSPACE_ID,
    name: "Mobile App",
    key: "MOB",
    description: "Cross-platform mobile application",
    status: "ON_HOLD",
    priority: "LOW",
    projectManagerEmail: "demo@etms.com",
    startDate: new Date("2026-10-01"),
    targetEndDate: new Date("2027-06-30"),
    createdByEmail: "admin@etms.com",
    updatedByEmail: "admin@etms.com",
  },
];

const SEED_MEMBERS = [
  // ETMS project members
  { projectId: SEED_PROJECTS[0]._id, userEmail: "admin@etms.com", projectRole: "PROJECT_MANAGER" },
  { projectId: SEED_PROJECTS[0]._id, userEmail: "demo@etms.com", projectRole: "DEVELOPER" },
  // PAY project members
  { projectId: SEED_PROJECTS[1]._id, userEmail: "admin@etms.com", projectRole: "PROJECT_MANAGER" },
  { projectId: SEED_PROJECTS[1]._id, userEmail: "demo@etms.com", projectRole: "DEVELOPER" },
  // MOB project members
  { projectId: SEED_PROJECTS[2]._id, userEmail: "demo@etms.com", projectRole: "PROJECT_MANAGER" },
  { projectId: SEED_PROJECTS[2]._id, userEmail: "admin@etms.com", projectRole: "DEVELOPER" },
];

const connect = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/enterprise-task-management";
  await mongoose.connect(uri);
  console.log(`Connected to ${uri}`);
};

const seed = async () => {
  await connect();

  const users = await User.find({
    email: { $in: SEED_USER_EMAILS },
    isDeleted: false,
    status: "ACTIVE",
  }).lean();
  const userIdsByEmail = Object.fromEntries(users.map((user) => [user.email, user._id]));
  const missingEmails = SEED_USER_EMAILS.filter((email) => !userIdsByEmail[email]);
  if (missingEmails.length > 0) {
    throw new Error(`Seed users not found: ${missingEmails.join(", ")}. Run npm run seed:users first.`);
  }

  let projectCount = 0;
  for (const projectData of SEED_PROJECTS) {
    const { _id, projectManagerEmail, createdByEmail, updatedByEmail, ...project } = projectData;
    const resolvedProject = {
      ...project,
      projectManagerId: userIdsByEmail[projectManagerEmail],
      createdBy: userIdsByEmail[createdByEmail],
      updatedBy: userIdsByEmail[updatedByEmail],
    };
    const existing = await Project.findOne({ _id: projectData._id });
    if (!existing) {
      await Project.create({ _id, ...resolvedProject });
      projectCount++;
    } else {
      await Project.updateOne({ _id: existing._id }, { $set: resolvedProject });
    }
  }
  console.log(`Projects seeded: ${projectCount}`);

  let memberCount = 0;
  for (const memberData of SEED_MEMBERS) {
    const userId = userIdsByEmail[memberData.userEmail];
    const existing = await ProjectMember.findOne({
      projectId: memberData.projectId,
      userId,
      isDeleted: false,
    });
    if (!existing) {
      const { userEmail, ...member } = memberData;
      await ProjectMember.create({ ...member, userId, addedBy: userIdsByEmail["admin@etms.com"] });
      memberCount++;
    }
  }
  console.log(`Project members seeded: ${memberCount}`);

  await mongoose.disconnect();
  console.log("Project seed complete.");
};

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
