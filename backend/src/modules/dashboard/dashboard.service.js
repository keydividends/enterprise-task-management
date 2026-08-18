const repository = require("./dashboard.repository");
const { validateQuery, validateWidgets } = require("./dashboard.validation");

const getContext = (context = {}) => ({ workspaceId: context.workspaceId, userId: context.userId, user: context.user });

const dashboardService = {
  getSummary: (query, context) => repository.getSummary(getContext(context), validateQuery(query)),
  getMyWork: (query, context) => repository.getMyWork(getContext(context), validateQuery(query)),
  getStatus: (query, context) => repository.groupTasks("status", getContext(context), validateQuery(query)),
  getPriority: (query, context) => repository.groupTasks("priority", getContext(context), validateQuery(query)),
  getProjectProgress: (query, context) => repository.getProjectProgress(getContext(context), validateQuery(query)),
  getWorkload: (query, context) => repository.getWorkload(getContext(context), validateQuery(query)),
  getUpcomingDeadlines: (query, context) => repository.getUpcomingDeadlines(getContext(context), validateQuery(query)),
  getRecentActivity: (query, context) => repository.getRecentActivity(getContext(context), validateQuery(query)),
  getWidgets: (context) => repository.getWidgets(getContext(context)),
  saveWidgets: (body, context) => repository.saveWidgets(getContext(context), validateWidgets(body)),
};

module.exports = dashboardService;