/**
 * Seed script for Team Management module.
 *
 * Usage:
 *   node scripts/seedTeams.js
 *
 * Seeds the team module's in-memory store with sample teams and members.
 * Safe to run multiple times — each run is additive. Use --reset to
 * replace the entire in-memory store.
 */

const teamService = require("../src/modules/teams/team.service");

const SEED_TEAMS = [
  {
    name: "Platform Engineering",
    description: "Core platform and tooling delivery",
    leadId: "mock-admin",
    projectIds: ["project-1"],
    members: ["mock-maya", "mock-alex"],
  },
  {
    name: "Frontend Core",
    description: "Frontend architecture and component library",
    leadId: "mock-maya",
    projectIds: ["project-1"],
    members: ["mock-alex"],
  },
  {
    name: "QA & Testing",
    description: "Quality assurance and test automation",
    leadId: "mock-admin",
    members: [],
  },
  {
    name: "DevOps",
    description: "CI/CD, infrastructure, and deployment",
    leadId: "mock-admin",
    members: ["mock-maya"],
  },
];

const run = async () => {
  const args = process.argv.slice(2);
  const reset = args.includes("--reset");
  let count = 0;

  console.log(`Seeding teams (reset=${reset})...\n`);

  for (const data of SEED_TEAMS) {
    let existing = false;
    try {
      const list = await teamService.listTeams({ search: data.name });
      existing = list.items.length > 0;
    } catch {
      // ignore
    }

    if (existing) {
      console.log(`  SKIP  "${data.name}" — already exists`);
      continue;
    }

    try {
      const team = await teamService.createTeam(data);
      console.log(`  OK    "${data.name}" — id=${team.id} (${team.members.length} members)`);
      count++;
    } catch (error) {
      console.error(`  FAIL  "${data.name}" — ${error.message}`);
    }
  }

  console.log(`\nCreated ${count} team(s).`);
  process.exit(0);
};

run().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
