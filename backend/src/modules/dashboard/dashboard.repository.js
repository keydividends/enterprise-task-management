const mongoose = require("mongoose");
const { Task } = require("../tasks/task.model");
const { Project } = require("../projects/project.model");
const { Team } = require("../teams/team.model");
const { User } = require("../users/user.model");
const DashboardWidget = require("./dashboardWidget.model");
const { TaskHistory } = require("../tasks/task.model");

const taskMatch = (context, query = {}) => {
  const match = { isDeleted: false };
  if (context.workspaceId && mongoose.Types.ObjectId.isValid(String(context.workspaceId))) match.workspaceId = new mongoose.Types.ObjectId(context.workspaceId);
  if (query.projectId) match.projectId = new mongoose.Types.ObjectId(query.projectId);
  if (query.sprintId) match.sprintId = new mongoose.Types.ObjectId(query.sprintId);
  if (query.fromDate || query.toDate) {
    match.createdAt = {};
    if (query.fromDate) match.createdAt.$gte = query.fromDate;
    if (query.toDate) match.createdAt.$lt = new Date(query.toDate.getTime() + 86400000);
  }
  return match;
};

const projectMatch = (context) => {
  const match = { isDeleted: false };
  if (context.workspaceId && mongoose.Types.ObjectId.isValid(String(context.workspaceId))) match.workspaceId = new mongoose.Types.ObjectId(context.workspaceId);
  return match;
};

const countTasks = (match) => Task.countDocuments(match);

const getSummary = async (context, query) => {
  const match = taskMatch(context, query);
  const [totalProjects, totalTasks, completedTasks, pendingTasks, overdueTasks] = await Promise.all([
    Project.countDocuments(projectMatch(context)),
    countTasks(match),
    countTasks({ ...match, status: "DONE" }),
    countTasks({ ...match, status: { $nin: ["DONE", "CANCELLED"] } }),
    countTasks({ ...match, status: { $nin: ["DONE", "CANCELLED"] }, dueDate: { $lt: new Date() } }),
  ]);
  return { totalProjects, totalTasks, pendingTasks, completedTasks, overdueTasks };
};

const groupTasks = (field, context, query) => Task.aggregate([
  { $match: taskMatch(context, query) },
  { $group: { _id: `$${field}`, count: { $sum: 1 } } },
  { $project: { _id: 0, [field]: "$_id", count: 1 } },
  { $sort: { [field]: 1 } },
]);

const getProjectProgress = async (context, query) => {
  const projectFilter = projectMatch(context);
  if (query.projectId) projectFilter._id = new mongoose.Types.ObjectId(query.projectId);
  const projects = await Project.find(projectFilter).sort({ createdAt: -1 }).limit(query.limit).lean();
  const ids = projects.map((project) => project._id);
  const counts = await Task.aggregate([
    { $match: { ...taskMatch(context, query), projectId: { $in: ids } } },
    { $group: { _id: "$projectId", total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ["$status", "DONE"] }, 1, 0] } } } },
  ]);
  const byId = new Map(counts.map((item) => [String(item._id), item]));
  return projects.map((project) => {
    const count = byId.get(String(project._id)) || { total: 0, completed: 0 };
    return { projectId: String(project._id), name: project.name, completionPercentage: count.total ? Math.round((count.completed / count.total) * 100) : 0 };
  });
};

const getWorkload = async (context, query) => {
  let userIds = null;
  if (query.teamId) {
    const team = await Team.findOne({ _id: mongoose.Types.ObjectId.isValid(query.teamId) ? query.teamId : null, isDeleted: false }).lean();
    if (!team) return [];
    userIds = (team.members || []).filter((member) => member.status !== "REMOVED" && !member.isDeleted).map((member) => String(member.userId));
  }
  const match = taskMatch(context, query);
  if (userIds) match.primaryAssigneeId = { $in: userIds.filter((id) => mongoose.Types.ObjectId.isValid(id)).map((id) => new mongoose.Types.ObjectId(id)) };
  const rows = await Task.aggregate([
    { $match: match },
    { $group: { _id: "$primaryAssigneeId", assigned: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ["$status", "DONE"] }, 1, 0] } }, overdue: { $sum: { $cond: [{ $and: [{ $lt: ["$dueDate", new Date()] }, { $not: [{ $in: ["$status", ["DONE", "CANCELLED"]] }] }] }, 1, 0] } } } },
    { $sort: { assigned: -1 } },
  ]);
  const users = await User.find({ _id: { $in: rows.filter((row) => row._id).map((row) => row._id) }, isDeleted: false }).select("firstName lastName email").lean();
  const labels = new Map(users.map((user) => [String(user._id), user]));
  return rows.filter((row) => row._id).map((row) => ({ userId: String(row._id), name: `${labels.get(String(row._id))?.firstName || "Unknown"} ${labels.get(String(row._id))?.lastName || ""}`.trim(), assigned: row.assigned, completed: row.completed, overdue: row.overdue }));
};

const getUpcomingDeadlines = async (context, query) => {
  const now = new Date();
  const until = new Date(now.getTime() + query.days * 86400000);
  return Task.find({ ...taskMatch(context, query), status: { $nin: ["DONE", "CANCELLED"] }, dueDate: { $gte: now, $lte: until } }).sort({ dueDate: 1 }).limit(query.limit).select("taskKey title dueDate projectId").lean();
};

const getMyWork = async (context, query) => {
  const match = taskMatch(context, query);
  if (context.userId) {
    const assigneeConditions = [context.userId];
    if (mongoose.Types.ObjectId.isValid(String(context.userId))) {
      assigneeConditions.push(new mongoose.Types.ObjectId(context.userId));
    }
    match.primaryAssigneeId = { $in: assigneeConditions };
  }
  const now = new Date();
  const dueSoon = new Date(now.getTime() + 7 * 86400000);
  const [assigned, inProgress, overdue, dueSoonCount, completed] = await Promise.all([
    countTasks(match),
    countTasks({ ...match, status: "IN_PROGRESS" }),
    countTasks({ ...match, status: { $nin: ["DONE", "CANCELLED"] }, dueDate: { $lt: now } }),
    countTasks({ ...match, status: { $nin: ["DONE", "CANCELLED"] }, dueDate: { $gte: now, $lte: dueSoon } }),
    countTasks({ ...match, status: "DONE" }),
  ]);
  return { assigned, inProgress, dueSoon: dueSoonCount, overdue, completed };
};

const getRecentActivity = async (context, query) => {
  const match = { ...taskMatch(context, query) };
  const taskIds = await Task.find(match).select("_id taskKey").lean();
  if (!taskIds.length) return [];
  const taskKeys = new Map(taskIds.map((task) => [String(task._id), task.taskKey]));
  const history = await TaskHistory.find({ taskId: { $in: taskIds.map((task) => task._id) } }).sort({ changedAt: -1 }).limit(query.limit).lean();
  return history.map((entry) => ({ action: "TASK_FIELD_CHANGED", taskKey: taskKeys.get(String(entry.taskId)), field: entry.field, summary: `${taskKeys.get(String(entry.taskId)) || "Task"} ${entry.field} changed`, changedAt: entry.changedAt }));
};

const getWidgets = async (context) => {
  if (!mongoose.Types.ObjectId.isValid(String(context.userId)) || !mongoose.Types.ObjectId.isValid(String(context.workspaceId))) return [];
  return DashboardWidget.find({ userId: context.userId, workspaceId: context.workspaceId }).sort({ "position.y": 1, "position.x": 1 }).lean();
};

const saveWidgets = async (context, widgets) => {
  if (!mongoose.Types.ObjectId.isValid(String(context.userId)) || !mongoose.Types.ObjectId.isValid(String(context.workspaceId))) return widgets.map((widget, index) => ({ ...widget, id: `widget-${index + 1}` }));
  await DashboardWidget.deleteMany({ userId: context.userId, workspaceId: context.workspaceId });
  return DashboardWidget.insertMany(widgets.map((widget) => ({ ...widget, userId: context.userId, workspaceId: context.workspaceId })));
};

module.exports = { getSummary, getMyWork, groupTasks, getProjectProgress, getWorkload, getUpcomingDeadlines, getRecentActivity, getWidgets, saveWidgets, taskMatch, projectMatch };