// ---------------------------------------------------------------------------
// Seed tasks / labels / checklists / checklist items for board & dashboard
// testing. Idempotent: safe to run multiple times.
//
//   Requires a running MongoDB instance.
//   Usage: node scripts/seedTasks.js
// ---------------------------------------------------------------------------

require("dotenv").config();
const mongoose = require("mongoose");
const {
  Task,
  Label,
  TaskLabel,
  Checklist,
  ChecklistItem,
} = require("../src/modules/tasks/task.model");
const mock = require("../src/modules/tasks/task.mockData");

const WORKSPACE_ID = mock.WORKSPACE_ID;
const PROJECT = mock.PROJECTS[0]; // ETMS
const MEMBERS = mock.PROJECT_MEMBERS[PROJECT.id];
const SPRINT = mock.SPRINTS[1]; // Sprint 2 (active)

const LABELS = [
  { name: "Frontend", color: "#6366f1", description: "React UI work" },
  { name: "Backend", color: "#10b981", description: "API/server work" },
  { name: "Bug", color: "#ef4444", description: "Defect" },
  { name: "High Prio", color: "#f59e0b", description: "Needs attention" },
  { name: "Design", color: "#ec4899", description: "UI/UX design" },
];

const SEED_TASKS = [
  { title: "Design Kanban board layout", type: "IMPROVEMENT", status: "TODO", priority: "MEDIUM", storyPoints: 3, sprintId: SPRINT.id },
  { title: "Implement task list API filters", type: "STORY", status: "IN_PROGRESS", priority: "HIGH", storyPoints: 5, sprintId: SPRINT.id },
  { title: "Fix board drag-and-drop glitch", type: "BUG", status: "QA", priority: "CRITICAL", storyPoints: 2, sprintId: SPRINT.id },
  { title: "Add label color picker", type: "TASK", status: "BACKLOG", priority: "LOW", storyPoints: 1, sprintId: SPRINT.id },
  { title: "Unit test status transitions", type: "STORY", status: "IN_REVIEW", priority: "MEDIUM", storyPoints: 3, sprintId: SPRINT.id },
  { title: "Load balancing for report service", type: "IMPROVEMENT", status: "DONE", priority: "HIGH", storyPoints: 8, sprintId: SPRINT.id },
  { title: "Checklist item completion sync", type: "BUG", status: "TODO", priority: "MEDIUM", storyPoints: 2, sprintId: SPRINT.id },
  { title: "Migrate tasks to taskKey format", type: "TASK", status: "DONE", priority: "LOW", storyPoints: 2, sprintId: SPRINT.id },
];

const safeObjectId = (id) => new mongoose.Types.ObjectId(String(id));

const connect = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/etms";
  await mongoose.connect(uri);
  console.log(`Connected to ${uri}`);
};

const seed = async () => {
  await connect();

  // Labels
  const labelDocs = [];
  for (const label of LABELS) {
    let existing = await Label.findOne({ projectId: safeObjectId(PROJECT.id), name: label.name, isDeleted: false });
    if (!existing) {
      existing = await Label.create({
        workspaceId: safeObjectId(WORKSPACE_ID),
        projectId: safeObjectId(PROJECT.id),
        name: label.name,
        color: label.color,
        description: label.description,
        createdBy: safeObjectId(MEMBERS[0]),
      });
    }
    labelDocs.push(existing);
  }
  console.log(`Labels ready: ${labelDocs.length}`);

  // Tasks
  let createdCount = 0;
  for (let i = 0; i < SEED_TASKS.length; i += 1) {
    const seedTask = SEED_TASKS[i];
    const existing = await Task.findOne({ projectId: safeObjectId(PROJECT.id), title: seedTask.title, isDeleted: false });
    if (existing) continue;

    const taskNumber = i + 1;
    const assignee = MEMBERS[i % MEMBERS.length];
    const task = await Task.create({
      workspaceId: safeObjectId(WORKSPACE_ID),
      projectId: safeObjectId(PROJECT.id),
      sprintId: safeObjectId(seedTask.sprintId),
      taskNumber,
      taskKey: `${PROJECT.key}-${taskNumber}`,
      title: seedTask.title,
      description: seedTask.title,
      type: seedTask.type,
      status: seedTask.status,
      priority: seedTask.priority,
      reporterId: safeObjectId(MEMBERS[0]),
      primaryAssigneeId: safeObjectId(assignee),
      storyPoints: seedTask.storyPoints,
      position: i * 1000,
      createdBy: safeObjectId(MEMBERS[0]),
      updatedBy: safeObjectId(MEMBERS[0]),
    });

    // Attach 1-2 labels
    const taskLabels = [labelDocs[i % labelDocs.length]];
    if (i % 2 === 0) taskLabels.push(labelDocs[(i + 2) % labelDocs.length]);
    for (const label of taskLabels) {
      const mapping = await TaskLabel.findOne({ taskId: task._id, labelId: label._id });
      if (!mapping) {
        await TaskLabel.create({ taskId: task._id, labelId: label._id, addedBy: safeObjectId(MEMBERS[0]) });
      }
    }

    // Checklist for the in-review task
    if (seedTask.status === "IN_REVIEW") {
      const checklist = await Checklist.create({
        taskId: task._id,
        title: "Definition of Done",
        position: 0,
        createdBy: safeObjectId(MEMBERS[0]),
      });
      await ChecklistItem.create([
        { checklistId: checklist._id, text: "Code reviewed", isCompleted: true, position: 0, createdBy: safeObjectId(MEMBERS[0]) },
        { checklistId: checklist._id, text: "Tests pass", isCompleted: true, position: 1, createdBy: safeObjectId(MEMBERS[0]) },
        { checklistId: checklist._id, text: "Deployed to staging", isCompleted: false, position: 2, createdBy: safeObjectId(MEMBERS[0]) },
      ]);
    }

    createdCount += 1;
  }
  console.log(`Tasks created: ${createdCount}`);

  await mongoose.disconnect();
  console.log("Seed complete.");
};

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
