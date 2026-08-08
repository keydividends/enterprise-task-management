/**
 * Seed script for Team Management module.
 *
 * Usage:
 *   node scripts/seedTeams.js
 *   node scripts/seedTeams.js --reset   (drops all teams first)
 *
 * Requires MongoDB to be running and seedUsers.js to have been run first.
 * Looks up real user _ids by email so team members reference actual MongoDB users.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const { Team } = require("../src/modules/teams/team.model");
const { User } = require("../src/modules/users/user.model");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/enterprise-task-management";

// Seed definitions use email as the stable lookup key — never hardcoded ObjectIds.
const SEED_TEAMS = [
  {
    name: "Platform Engineering",
    description: "Core platform and tooling delivery",
    leadEmail: "admin@etms.com",
    memberEmails: ["demo@etms.com"],
    projectIds: [],
  },
  {
    name: "Frontend Core",
    description: "Frontend architecture and component library",
    leadEmail: "demo@etms.com",
    memberEmails: [],
    projectIds: [],
  },
  {
    name: "QA & Testing",
    description: "Quality assurance and test automation",
    leadEmail: "admin@etms.com",
    memberEmails: [],
    projectIds: [],
  },
  {
    name: "DevOps",
    description: "CI/CD, infrastructure, and deployment",
    leadEmail: "admin@etms.com",
    memberEmails: ["demo@etms.com"],
    projectIds: [],
  },
];

const run = async () => {
  const args = process.argv.slice(2);
  const reset = args.includes("--reset");

  await mongoose.connect(MONGODB_URI);
  console.log(`Connected to ${MONGODB_URI}\n`);

  if (reset) {
    await Team.deleteMany({});
    console.log("Existing teams cleared (--reset).\n");
  }

  // Build email → MongoDB _id map from real seeded users.
  const allEmails = [
    ...new Set(SEED_TEAMS.flatMap((t) => [t.leadEmail, ...t.memberEmails])),
  ];

  const userDocs = await User.find({ email: { $in: allEmails }, isDeleted: false }).lean();
  const emailToId = {};
  for (const u of userDocs) {
    emailToId[u.email] = String(u._id);
  }

  // Verify all required users exist before seeding.
  const missing = allEmails.filter((e) => !emailToId[e]);
  if (missing.length > 0) {
    console.error(`ERROR: The following users were not found in MongoDB:\n  ${missing.join("\n  ")}`);
    console.error("\nRun `node scripts/seedUsers.js` first, then retry.");
    await mongoose.disconnect();
    process.exit(1);
  }

  let created = 0;
  let skipped = 0;

  for (const def of SEED_TEAMS) {
    const existing = await Team.findOne({ name: def.name, isDeleted: false });
    if (existing) {
      console.log(`  SKIP  "${def.name}" — already exists (id=${existing._id})`);
      skipped++;
      continue;
    }

    const leadId = emailToId[def.leadEmail];
    const memberIds = def.memberEmails.map((e) => emailToId[e]);

    const members = [
      { userId: leadId, role: "LEAD", joinedAt: new Date() },
      ...memberIds.map((id) => ({ userId: id, role: "MEMBER", joinedAt: new Date() })),
    ];

    const doc = await Team.create({
      name: def.name,
      description: def.description,
      leadId,
      projectIds: def.projectIds,
      isActive: true,
      isDeleted: false,
      members,
    });

    console.log(
      `  OK    "${def.name}" — id=${doc._id}  lead=${leadId}  members=${members.length}`
    );
    created++;
  }

  console.log(`\nSeed complete. Created: ${created}, Skipped: ${skipped}`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
