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
    projectManagerId: project.projectManagerId ? String(project.projectManagerId) : null,
    startDate: project.startDate ? project.startDate.toISOString() : null,
    targetEndDate: project.targetEndDate ? project.targetEndDate.toISOString() : null,
    completedAt: project.completedAt ? project.completedAt.toISOString() : null,
    createdBy: project.createdBy ? String(project.createdBy) : null,
    updatedBy: project.updatedBy ? String(project.updatedBy) : null,
    createdAt: project.createdAt ? project.createdAt.toISOString() : null,
    updatedAt: project.updatedAt ? project.updatedAt.toISOString() : null,
    isDeleted: Boolean(project.isDeleted),
  };
};

const toProjectMemberDTO = (member) => {
  if (!member) return null;
  return {
    id: String(member._id || member.id),
    projectId: String(member.projectId),
    userId: String(member.userId),
    projectRole: member.projectRole || "DEVELOPER",
    allocationPercentage: member.allocationPercentage ?? 100,
    status: member.status || "ACTIVE",
    joinedAt: member.joinedAt ? member.joinedAt.toISOString() : null,
    removedAt: member.removedAt ? member.removedAt.toISOString() : null,
    addedBy: member.addedBy ? String(member.addedBy) : null,
    removedBy: member.removedBy ? String(member.removedBy) : null,
    createdAt: member.createdAt ? member.createdAt.toISOString() : null,
    updatedAt: member.updatedAt ? member.updatedAt.toISOString() : null,
  };
};

module.exports = {
  toProjectDTO,
  toProjectMemberDTO,
};
