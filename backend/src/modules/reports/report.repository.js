const dashboardRepository = require("../dashboard/dashboard.repository");
const mongoose = require("mongoose");
const { Task, TaskHistory } = require("../tasks/task.model");
const { Project, ProjectMember } = require("../projects/project.model");
const { TimeTracking } = require("../timeTracking/timeTracking.model");

const taskRows = async (context, query) => Task.find(dashboardRepository.taskMatch(context, query)).lean();
const dateKey = (value, interval) => {
  const date = new Date(value);
  if (interval === "month") return date.toISOString().slice(0, 7);
  if (interval === "week") {
    const first = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((date - first) / 86400000) + first.getUTCDay() + 1) / 7);
    return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
  }
  return date.toISOString().slice(0, 10);
};
const csvValue = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
const toCsv = (rows) => {
  if (!rows.length) return "";
  const columns = Object.keys(rows[0]);
  return `${columns.join(",")}\n${rows.map((row) => columns.map((column) => csvValue(row[column])).join(",")).join("\n")}\n`;
};

const reportRepository = {
  projectProgress: async (context, query) => {
    const progress = await dashboardRepository.getProjectProgress(context, query);
    const { Task } = require("../tasks/task.model");
    const match = dashboardRepository.taskMatch(context, query);
    const projectIds = progress.map((row) => row.projectId).filter((id) => mongoose.Types.ObjectId.isValid(id)).map((id) => new mongoose.Types.ObjectId(id));
    const overdue = await Task.aggregate([
      { $match: { ...match, status: { $nin: ["DONE", "CANCELLED"] }, dueDate: { $lt: new Date() }, projectId: { $in: projectIds } } },
      { $group: { _id: "$projectId", overdueTasks: { $sum: 1 } } },
    ]);
    const byProject = new Map(overdue.map((row) => [String(row._id), row.overdueTasks]));
    return progress.map((row) => ({ projectId: row.projectId, completionPercentage: row.completionPercentage, overdueTasks: byProject.get(row.projectId) || 0 }));
  },
  taskStatus: (context, query) => dashboardRepository.groupTasks("status", context, query),
  overdueTasks: async (context, query) => {
    const match = dashboardRepository.taskMatch(context, query);
    match.status = { $nin: ["DONE", "CANCELLED"] };
    match.dueDate = { $lt: new Date() };
    const { Task } = require("../tasks/task.model");
    const tasks = await Task.find(match).sort({ dueDate: 1 }).skip(((Number(query.page) || 1) - 1) * (Number(query.pageSize) || 20)).limit(Number(query.pageSize) || 20).select("taskKey dueDate primaryAssigneeId").lean();
    return tasks.map((task) => ({ taskKey: task.taskKey, dueDate: task.dueDate, assigneeId: task.primaryAssigneeId ? String(task.primaryAssigneeId) : null }));
  },
  teamWorkload: dashboardRepository.getWorkload,
  performance: async (context, query) => {
    const match = dashboardRepository.taskMatch(context, query);
    if (query.userId) match.primaryAssigneeId = new mongoose.Types.ObjectId(query.userId);
    const rows = await Task.aggregate([
      { $match: match },
      { $group: { _id: "$primaryAssigneeId", completedTasks: { $sum: { $cond: [{ $eq: ["$status", "DONE"] }, 1, 0] } }, storyPoints: { $sum: { $cond: [{ $eq: ["$status", "DONE"] }, { $ifNull: ["$storyPoints", 0] }, 0] } } } },
      { $sort: { completedTasks: -1 } },
    ]);
    return rows.filter((row) => row._id).map((row) => ({ userId: String(row._id), completedTasks: row.completedTasks, storyPoints: row.storyPoints, loggedMinutes: 0 }));
  },
  allocation: async (context, query) => {
    const filter = { isDeleted: false };
    if (query.projectId) filter.projectId = new mongoose.Types.ObjectId(query.projectId);
    const projects = await Project.find(dashboardRepository.projectMatch ? dashboardRepository.projectMatch(context) : { isDeleted: false }).select("_id").lean();
    if (context.workspaceId) filter.projectId = filter.projectId || { $in: projects.map((project) => project._id) };
    if (query.userId) filter.userId = new mongoose.Types.ObjectId(query.userId);
    const members = await ProjectMember.find(filter).select("userId projectId allocationPercentage").lean();
    return members.map((member) => ({ userId: String(member.userId), projectId: String(member.projectId), allocationPercentage: member.allocationPercentage }));
  },
  cycleTime: async (context, query) => {
    const tasks = await taskRows(context, query);
    const durations = tasks.filter((task) => task.completedAt && task.createdAt).map((task) => (new Date(task.completedAt) - new Date(task.createdAt)) / 3600000);
    return { averageCycleTimeHours: durations.length ? Number((durations.reduce((sum, value) => sum + value, 0) / durations.length).toFixed(2)) : 0 };
  },
  throughput: async (context, query) => {
    const tasks = (await taskRows(context, query)).filter((task) => task.status === "DONE" && task.completedAt);
    const counts = new Map();
    tasks.forEach((task) => { const key = dateKey(task.completedAt, query.interval); counts.set(key, (counts.get(key) || 0) + 1); });
    return Array.from(counts, ([period, completed]) => ({ period, completed })).sort((a, b) => a.period.localeCompare(b.period));
  },
  sprint: async (context, query) => {
    const tasks = await taskRows(context, { ...query, sprintId: query.sprintId });
    const committed = tasks.length;
    const completed = tasks.filter((task) => task.status === "DONE").length;
    return { committed, completed, spillover: tasks.filter((task) => task.status !== "DONE" && task.dueDate && new Date(task.dueDate) < new Date()).length, completionPercentage: committed ? Math.round((completed / committed) * 100) : 0 };
  },
  activity: async (context, query) => {
    const tasks = await taskRows(context, query);
    if (!tasks.length) return [];
    const taskMap = new Map(tasks.map((task) => [String(task._id), task.taskKey]));
    const filter = { taskId: { $in: tasks.map((task) => task._id) } };
    if (query.actorId) filter.changedBy = new mongoose.Types.ObjectId(query.actorId);
    if (query.fromDate || query.toDate) filter.changedAt = {};
    if (query.fromDate) filter.changedAt.$gte = query.fromDate;
    if (query.toDate) filter.changedAt.$lt = new Date(query.toDate.getTime() + 86400000);
    const entries = await TaskHistory.find(filter).sort({ changedAt: -1 }).skip((query.page - 1) * query.pageSize).limit(query.pageSize).lean();
    return entries.map((entry) => ({ taskKey: taskMap.get(String(entry.taskId)), actorId: String(entry.changedBy), action: "TASK_FIELD_CHANGED", entityType: "TASK", field: entry.field, changedAt: entry.changedAt }));
  },
  time: async (context, query) => {
    if (!query.fromDate || !query.toDate) {
      const error = new Error("fromDate and toDate are required for the time report.");
      error.code = "VALIDATION_ERROR";
      error.statusCode = 400;
      throw error;
    }

    const filter = {};
    if (context.workspaceId && mongoose.Types.ObjectId.isValid(String(context.workspaceId))) {
      filter.workspaceId = new mongoose.Types.ObjectId(context.workspaceId);
    }
    if (query.projectId) filter.projectId = new mongoose.Types.ObjectId(query.projectId);
    if (query.taskId) filter.taskId = new mongoose.Types.ObjectId(query.taskId);
    if (query.userId) filter.userId = new mongoose.Types.ObjectId(query.userId);
    filter.startedAt = { $gte: query.fromDate, $lt: new Date(query.toDate.getTime() + 86400000) };

    const entries = await TimeTracking.find(filter).sort({ startedAt: 1 }).lean();
    const totalMinutes = entries.reduce((sum, entry) => sum + (entry.durationMinutes || 0), 0);

    return {
      totalMinutes,
      entries: entries.map((entry) => ({
        id: String(entry._id),
        taskId: String(entry.taskId),
        projectId: String(entry.projectId),
        userId: String(entry.userId),
        durationMinutes: entry.durationMinutes,
        entryType: entry.entryType,
        status: entry.status,
        startedAt: entry.startedAt,
        endedAt: entry.endedAt,
        description: entry.description,
      })),
    };
  },
  audit: async (context, query) => {
    if (context.user?.role !== "ADMIN") {
      const error = new Error("Permission denied.");
      error.code = "PERMISSION_DENIED";
      error.statusCode = 403;
      throw error;
    }

    if (query.entityType && query.entityType !== "TASK") return [];
    if (query.action && query.action !== "TASK_FIELD_CHANGED") return [];

    const taskIds = await Task.find(dashboardRepository.taskMatch(context, query)).distinct("_id");
    const filter = { taskId: { $in: taskIds } };
    if (query.actorId) filter.changedBy = new mongoose.Types.ObjectId(query.actorId);
    if (query.fromDate || query.toDate) {
      filter.changedAt = {};
      if (query.fromDate) filter.changedAt.$gte = query.fromDate;
      if (query.toDate) filter.changedAt.$lt = new Date(query.toDate.getTime() + 86400000);
    }

    const entries = await TaskHistory.find(filter).sort({ changedAt: -1 }).skip((query.page - 1) * query.pageSize).limit(query.pageSize).lean();
    return entries.map((entry) => ({
      action: "TASK_FIELD_CHANGED",
      actorId: String(entry.changedBy),
      entityType: "TASK",
      field: entry.field,
      oldValue: entry.oldValue,
      newValue: entry.newValue,
      changedAt: entry.changedAt,
      taskId: String(entry.taskId),
    }));
  },
  taskExport: async (context, query) => {
    const tasks = await taskRows(context, query);
    return toCsv(tasks.map((task) => ({ taskKey: task.taskKey, title: task.title, status: task.status, priority: task.priority, projectId: task.projectId, assigneeId: task.primaryAssigneeId, dueDate: task.dueDate })));
  },
  projectExport: async (context, query) => {
    const projectFilter = { _id: new mongoose.Types.ObjectId(query.projectId), isDeleted: false };
    if (context.workspaceId) projectFilter.workspaceId = new mongoose.Types.ObjectId(context.workspaceId);
    const project = await Project.findOne(projectFilter).lean();
    if (!project) return query.format === "csv" ? "" : {};
    const tasks = await Task.find({ ...dashboardRepository.taskMatch(context, { projectId: query.projectId }) }).select("taskKey title status priority dueDate").lean();
    const result = { projectId: String(project._id), name: project.name, key: project.key, tasks };
    return query.format === "csv" ? toCsv(tasks) : result;
  },
};

module.exports = reportRepository;