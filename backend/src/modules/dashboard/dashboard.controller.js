const service = require("./dashboard.service");

const context = (req) => ({ userId: req.user?.id, user: req.user, workspaceId: req.user?.workspaceId || null });
const send = (res, data, message) => res.status(200).json({ success: true, ...(message ? { message } : {}), data });
const handle = (method) => async (req, res, next) => {
  try { return send(res, await service[method](req.query, context(req))); } catch (error) { return next(error); }
};

module.exports = {
  summary: handle("getSummary"),
  myWork: handle("getMyWork"),
  status: handle("getStatus"),
  priority: handle("getPriority"),
  projectProgress: handle("getProjectProgress"),
  workload: handle("getWorkload"),
  upcomingDeadlines: handle("getUpcomingDeadlines"),
  recentActivity: handle("getRecentActivity"),
  widgets: async (req, res, next) => { try { return send(res, await service.getWidgets(context(req))); } catch (error) { return next(error); } },
  saveWidgets: async (req, res, next) => { try { return send(res, await service.saveWidgets(req.body, context(req)), "Dashboard layout saved"); } catch (error) { return next(error); } },
};