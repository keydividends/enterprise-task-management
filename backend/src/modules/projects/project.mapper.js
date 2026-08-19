const safeDate = (val) => {
  if (!val) return null;
  try { return new Date(val).toISOString(); } catch { return null; }
};

const toProjectDTO = (project) => {
  if (!project) return null;
  return {
    id: String(project._id || project.id),
    workspaceId: project.workspaceId ? String(project.workspaceId) : null,
    name: project.name,
    key: project.key,
    description: project.description || "",
    status: project.status || "PLANNING",
    priority: project.priority || "MEDIUM",
    startDate: safeDate(project.startDate),
    targetEndDate: safeDate(project.targetEndDate),
    completedAt: safeDate(project.completedAt),
    createdBy: project.createdBy ? String(project.createdBy) : null,
    updatedBy: project.updatedBy ? String(project.updatedBy) : null,
    createdAt: safeDate(project.createdAt),
    updatedAt: safeDate(project.updatedAt),
    isDeleted: Boolean(project.isDeleted),
  };
};

const toProjectMemberDTO = (member) => {
  if (!member) return null;
  return {
    id: String(member._id || member.id),
    projectId: String(member.projectId),
    userName: member.userName || null,
    employeeId: member.employeeId || null,
    projectRole: member.projectRole || "DEVELOPER",
    allocationPercentage: member.allocationPercentage ?? 100,
    status: member.status || "ACTIVE",
    joinedAt: safeDate(member.joinedAt),
    removedAt: safeDate(member.removedAt),
    addedBy: member.addedBy ? String(member.addedBy) : null,
    removedBy: member.removedBy ? String(member.removedBy) : null,
    createdAt: safeDate(member.createdAt),
    updatedAt: safeDate(member.updatedAt),
  };
};

module.exports = {
  toProjectDTO,
  toProjectMemberDTO,
};
