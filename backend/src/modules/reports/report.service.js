const repository = require("./report.repository");
const { validateReportQuery } = require("./report.validation");

const context = (value = {}) => ({ workspaceId: value.workspaceId, userId: value.userId, user: value.user });

const reportService = {
  projectProgress: (query, userContext) => repository.projectProgress(context(userContext), validateReportQuery(query)),
  taskStatus: (query, userContext) => repository.taskStatus(context(userContext), validateReportQuery(query)),
  overdueTasks: (query, userContext) => repository.overdueTasks(context(userContext), validateReportQuery(query)),
  teamWorkload: (query, userContext) => repository.teamWorkload(context(userContext), validateReportQuery(query)),
  performance: (query, userContext) => repository.performance(context(userContext), validateReportQuery(query)),
  allocation: (query, userContext) => repository.allocation(context(userContext), validateReportQuery(query)),
  cycleTime: (query, userContext) => repository.cycleTime(context(userContext), validateReportQuery(query)),
  throughput: (query, userContext) => repository.throughput(context(userContext), validateReportQuery(query)),
  sprint: (query, userContext) => repository.sprint(context(userContext), validateReportQuery(query)),
  activity: (query, userContext) => repository.activity(context(userContext), validateReportQuery(query)),
  audit: (query, userContext) => repository.audit(context(userContext), validateReportQuery(query)),
  time: (query, userContext) => repository.time(context(userContext), validateReportQuery(query)),
  taskExport: (query, userContext) => repository.taskExport(context(userContext), validateReportQuery(query)),
  projectExport: (query, userContext) => repository.projectExport(context(userContext), validateReportQuery(query)),
};

module.exports = reportService;