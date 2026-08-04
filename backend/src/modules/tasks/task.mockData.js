// ---------------------------------------------------------------------------
// Mock reference data used until the real Users / Projects / Sprints / Epics
// modules are merged. Every id is a valid 24-hex ObjectId so Mongoose
// reference fields accept them. `task.contracts.js` swaps these for real
// Mongoose models automatically once those modules register their models.
// ---------------------------------------------------------------------------

const WORKSPACE_ID = "64a000000000000000000001";

const USERS = [
  { id: "64a100000000000000000001", firstName: "Ravi", lastName: "Kumar", email: "ravi@etms.com", fullName: "Ravi Kumar" },
  { id: "64a100000000000000000002", firstName: "Priya", lastName: "Rao", email: "priya@etms.com", fullName: "Priya Rao" },
  { id: "64a100000000000000000003", firstName: "Sneha", lastName: "Reddy", email: "sneha@etms.com", fullName: "Sneha Reddy" },
  { id: "64a100000000000000000004", firstName: "Arjun", lastName: "Nair", email: "arjun@etms.com", fullName: "Arjun Nair" },
  { id: "64a100000000000000000005", firstName: "Kavya", lastName: "Iyer", email: "kavya@etms.com", fullName: "Kavya Iyer" },
];

const PROJECTS = [
  { id: "64a200000000000000000001", key: "ETMS", name: "Enterprise Task Management", status: "ACTIVE", workspaceId: WORKSPACE_ID },
  { id: "64a200000000000000000002", key: "PAY", name: "Payment Gateway", status: "ACTIVE", workspaceId: WORKSPACE_ID },
  { id: "64a200000000000000000003", key: "MOB", name: "Mobile App", status: "ACTIVE", workspaceId: WORKSPACE_ID },
];

// projectId -> list of member userIds
const PROJECT_MEMBERS = {
  "64a200000000000000000001": [
    "64a100000000000000000001",
    "64a100000000000000000002",
    "64a100000000000000000003",
    "64a100000000000000000004",
    "64a100000000000000000005",
  ],
  "64a200000000000000000002": ["64a100000000000000000001", "64a100000000000000000002", "64a100000000000000000004"],
  "64a200000000000000000003": ["64a100000000000000000003", "64a100000000000000000005"],
};

const SPRINTS = [
  { id: "64a300000000000000000001", projectId: "64a200000000000000000001", name: "Sprint 1", status: "COMPLETED" },
  { id: "64a300000000000000000002", projectId: "64a200000000000000000001", name: "Sprint 2", status: "ACTIVE" },
];

const EPICS = [
  { id: "64a400000000000000000001", projectId: "64a200000000000000000001", title: "Authentication" },
  { id: "64a400000000000000000002", projectId: "64a200000000000000000001", title: "Task Workflow" },
];

module.exports = { WORKSPACE_ID, USERS, PROJECTS, PROJECT_MEMBERS, SPRINTS, EPICS };

