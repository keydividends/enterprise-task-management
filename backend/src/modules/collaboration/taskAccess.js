const taskContracts = require("../tasks/task.contracts");

const createError = (message, statusCode = 403) => {
  const error = new Error(message);
  error.code = "PERMISSION_DENIED";
  error.statusCode = statusCode;
  return error;
};

const isAdministrator = (context = {}) =>
  ["ADMIN", "SUPER_ADMIN", "COMPANY_ADMIN", "ORGANIZATION_ADMIN"].includes(
    String(context.user?.role || "").toUpperCase()
  );

const hasPermission = (context = {}, permission) =>
  isAdministrator(context) || context.user?.permissions?.includes(permission);

// Comments and attachments are task collaboration data.  A global TASK_VIEW
// permission is not enough: the caller must also be allowed into the task's
// project (unless they are an organisation administrator).
const assertTaskCollaborationAccess = async (task, context = {}) => {
  if (isAdministrator(context)) return;

  const userId = context.userId || context.user?.id;
  const isMember = await taskContracts.isProjectMember(task.projectId, userId);
  if (!isMember) throw createError("You do not have access to this task's collaboration data.");
};

module.exports = { assertTaskCollaborationAccess, hasPermission, isAdministrator };
