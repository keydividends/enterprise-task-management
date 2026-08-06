// Seed projects and project members. Idempotent – safe to run multiple times.
// Usage: node scripts/seedProjects.js

require("dotenv").config();
const mongoose = require("mongoose");
const { Project, ProjectMember } = require("../src/modules/projects/project.model");

const WORKSPACE_ID = new mongoose.Types.ObjectId("64a000000000000000000001");

const USERS = [
  { id: new mongoose.Types.ObjectId("64a100000000000000000001"), role: "PROJECT_MANAGER" },
  { id: new mongoose.Types.ObjectId("64a100000000000000000002"), role: "TEAM_LEAD" },
  { id: new mongoose.Types.ObjectId("64a100000000000000000003"), role: "DEVELOPER" },
  { id: new mongoose.Types.ObjectId("64a100000000000000000004"), role: "QA_TESTER" },
  { id: new mongoose.Types.ObjectId("64a100000000000000000005"), role: "VIEWER" },
];

const SEED_PROJECTS = [
  {
    _id: new mongoose.Types.ObjectId("64a200000000000000000001"),
    workspaceId: WORKSPACE_ID,
    name: "Enterprise Task Management",
    key: "ETMS",
    description: "Internal delivery and reporting platform",
    status: "ACTIVE",
    priority: "HIGH",
    projectManagerId: USERS[0].id,
    startDate: new Date("2026-08-01"),
    targetEndDate: new Date("2026-12-31"),
    createdBy: USERS[0].id,
    updatedBy: USERS[0].id,
  },
  {
    _id: new mongoose.Types.ObjectId("64a200000000000000000002"),
    workspaceId: WORKSPACE_ID,
    name: "Payment Gateway",
    key: "PAY",
    description: "Payments and wallet integration",
    status: "PLANNING",
    priority: "MEDIUM",
    projectManagerId: USERS[1].id,
    startDate: new Date("2026-09-01"),
    targetEndDate: new Date("2027-02-28"),
    createdBy: USERS[0].id,
    updatedBy: USERS[0].id,
  },
  {
    _id: new mongoose.Types.ObjectId("64a200000000000000000003"),
    workspaceId: WORKSPACE_ID,
    name: "Mobile App",
    key: "MOB",
    description: "Cross-platform mobile application",
    status: "ON_HOLD",
    priority: "LOW",
    projectManagerId: USERS[2].id,
    startDate: new Date("2026-10-01"),
    targetEndDate: new Date("2027-06-30"),
    createdBy: USERS[0].id,
    updatedBy: USERS[0].id,
  },
];

const SEED_MEMBERS = [
  // ETMS project members
  { projectId: SEED_PROJECTS[0]._id, userId: USERS[0].id, projectRole: "PROJECT_MANAGER" },
  { projectId: SEED_PROJECTS[0]._id, userId: USERS[1].id, projectRole: "TEAM_LEAD" },
  { projectId: SEED_PROJECTS[0]._id, userId: USERS[2].id, projectRole: "DEVELOPER" },
  { projectId: SEED_PROJECTS[0]._id, userId: USERS[3].id, projectRole: "QA_TESTER" },
  { projectId: SEED_PROJECTS[0]._id, userId: USERS[4].id, projectRole: "VIEWER" },
  // PAY project members
  { projectId: SEED_PROJECTS[1]._id, userId: USERS[1].id, projectRole: "PROJECT_MANAGER" },
  { projectId: SEED_PROJECTS[1]._id, userId: USERS[2].id, projectRole: "DEVELOPER" },
  // MOB project members
  { projectId: SEED_PROJECTS[2]._id, userId: USERS[2].id, projectRole: "PROJECT_MANAGER" },
  { projectId: SEED_PROJECTS[2]._id, userId: USERS[4].id, projectRole: "DEVELOPER" },
];

const connect = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/etms";
  await mongoose.connect(uri);
  console.log(`Connected to ${uri}`);
};

const seed = async () => {
  await connect();

  let projectCount = 0;
  for (const projectData of SEED_PROJECTS) {
    const existing = await Project.findOne({ _id: projectData._id });
    if (!existing) {
      await Project.create(projectData);
      projectCount++;
    }
  }
  console.log(`Projects seeded: ${projectCount}`);

  let memberCount = 0;
  for (const memberData of SEED_MEMBERS) {
    const existing = await ProjectMember.findOne({
      projectId: memberData.projectId,
      userId: memberData.userId,
      isDeleted: false,
    });
    if (!existing) {
      await ProjectMember.create({ ...memberData, addedBy: USERS[0].id });
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
