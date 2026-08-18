const service = require("./report.service");

const context = (req) => ({ userId: req.user?.id, user: req.user, workspaceId: req.user?.workspaceId || null });
const handle = (method) => async (req, res, next) => {
  try {
    return res.status(200).json({ success: true, data: await service[method]({ ...req.query, ...req.params }, context(req)) });
  } catch (error) {
    return next(error);
  }
};

const exportHandle = (method) => async (req, res, next) => {
  try {
    const result = await service[method]({ ...req.query, ...req.params }, context(req));
    if (req.query.format === "csv") {
      res.type("text/csv").set("Content-Disposition", `attachment; filename=${method}.csv`);
      return res.send(result);
    }
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  projectProgress: handle("projectProgress"),
  taskStatus: handle("taskStatus"),
  overdueTasks: handle("overdueTasks"),
  teamWorkload: handle("teamWorkload"),
  performance: handle("performance"),
  allocation: handle("allocation"),
  cycleTime: handle("cycleTime"),
  throughput: handle("throughput"),
  sprint: handle("sprint"),
  activity: handle("activity"),
  audit: handle("audit"),
  time: handle("time"),
  taskExport: exportHandle("taskExport"),
  projectExport: exportHandle("projectExport"),
};