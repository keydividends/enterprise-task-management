const teamRepository = require("./team.repository");
const { mapTeamDetail, mapTeamSummary, mapTeamMember } = require("./team.mapper");
const {
  validateCreateTeam,
  validateUpdateTeam,
  validateTeamId,
  validateAddMember,
  validateUpdateMember,
  validateListQuery,
} = require("./team.validation");

const createAuthError = (code, message, statusCode = 400) => {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
};

const ensureUniqueMembers = (members = []) => {
  const seen = new Set();
  for (const member of members) {
    const normalizedMember = String(member || "").trim();
    if (!normalizedMember) {
      continue;
    }
    if (seen.has(normalizedMember)) {
      throw createAuthError("DUPLICATE_MEMBER", "Duplicate team members are not allowed.", 409);
    }
    seen.add(normalizedMember);
  }
};

const mapTeamWithManager = async (team) => {
  const mapped = mapTeamDetail(team);
  const manager = await teamRepository.findUserById(mapped.leadId);
  return {
    ...mapped,
    manager: manager ? {
      id: manager.id,
      name: `${manager.firstName || ""} ${manager.lastName || ""}`.trim(),
      email: manager.email || "",
      role: manager.role,
    } : null,
  };
};

const listTeams = async (query = {}) => {
  const validated = validateListQuery(query);
  const result = await teamRepository.listTeams(validated);

  return {
    items: result.items.map(mapTeamSummary),
    pagination: {
      page: result.page,
      pageSize: result.pageSize,
      totalItems: result.totalItems,
      totalPages: result.totalPages,
    },
  };
};

const getTeam = async (teamId) => {
  validateTeamId(teamId);
  const team = await teamRepository.findTeamById(teamId);
  if (!team) {
    throw createAuthError("TEAM_NOT_FOUND", "Team not found.", 404);
  }
  return mapTeamWithManager(team);
};

const createTeam = async (payload) => {
  const validated = validateCreateTeam(payload);

  if (!validated.leadId) {
    throw createAuthError("VALIDATION_ERROR", "Manager is required.", 400);
  }

  ensureUniqueMembers(validated.members);

  let lead = null;
  lead = await teamRepository.findUserById(validated.leadId);
  if (!lead || !teamRepository.isEligibleTeamLead(lead)) {
    throw createAuthError("INVALID_LEAD", "Manager must be an active user with an eligible role.", 400);
  }

  const normalizedMembers = [];
  const seenMembers = new Set();
  for (const memberId of validated.members) {
    const normalizedMemberId = String(memberId || "").trim();
    if (!normalizedMemberId || normalizedMemberId === lead.id || seenMembers.has(normalizedMemberId)) {
      continue;
    }
    seenMembers.add(normalizedMemberId);

    const user = await teamRepository.findUserById(normalizedMemberId);
    if (!user) {
      throw createAuthError("INVALID_MEMBER_USER", "One or more team members are invalid.", 400);
    }
    normalizedMembers.push({ userId: normalizedMemberId, role: "MEMBER" });
  }

  const team = await teamRepository.createTeam({
    name: validated.name,
    description: validated.description,
    leadId: lead.id,
    projectIds: validated.projectIds,
    members: [{ userId: lead.id, role: "LEAD" }, ...normalizedMembers],
  });

  return mapTeamDetail(team);
};

const updateTeam = async (teamId, payload) => {
  validateTeamId(teamId);
  const validated = validateUpdateTeam(payload);

  const team = await getTeam(teamId);

  // If the lead is being changed, validate the new lead.
  if (validated.leadId && validated.leadId !== team.leadId) {
    const newLead = await teamRepository.findUserById(validated.leadId);
    if (!newLead || !teamRepository.isEligibleTeamLead(newLead)) {
      throw createAuthError("INVALID_LEAD", "Manager must be an active user with an eligible role.", 400);
    }

    // The new lead automatically becomes a member (LEAD role).
    const isAlreadyMember = team.members.some((member) => member.userId === validated.leadId);
    if (!isAlreadyMember) {
      await teamRepository.addMember(teamId, { userId: validated.leadId, role: "LEAD" });
    } else {
      await teamRepository.updateMember(teamId, validated.leadId, "LEAD");
    }
  }

  const nextPayload = {
    ...validated,
    name: validated.name ?? team.name,
    description: validated.description ?? team.description,
    projectIds: validated.projectIds ?? team.projectIds,
  };

  if (validated.leadId) {
    nextPayload.leadId = validated.leadId;
  }

  return mapTeamDetail(await teamRepository.updateTeam(teamId, nextPayload));
};

const deleteTeam = async (teamId) => {
  validateTeamId(teamId);
  const deleted = await teamRepository.deleteTeam(teamId);
  if (!deleted) {
    throw createAuthError("TEAM_NOT_FOUND", "Team not found.", 404);
  }
  return mapTeamDetail(deleted);
};

const restoreTeam = async (teamId) => {
  validateTeamId(teamId);
  const restored = await teamRepository.restoreTeam(teamId);
  if (!restored) {
    throw createAuthError("TEAM_NOT_FOUND", "Team not found or it is not archived.", 404);
  }
  return mapTeamDetail(restored);
};

const setTeamStatus = async (teamId, status) => {
  validateTeamId(teamId);
  const normalizedStatus = String(status || "").trim().toUpperCase();
  if (!["ACTIVE", "INACTIVE"].includes(normalizedStatus)) {
    throw createAuthError("VALIDATION_ERROR", "Status must be ACTIVE or INACTIVE.", 400);
  }
  const team = await getTeam(teamId);
  const updated = await teamRepository.setTeamStatus(teamId, normalizedStatus);
  return mapTeamDetail(updated);
};

const listTeamMembers = async (teamId) => {
  const team = await getTeam(teamId);
  return (team.members || []).map(mapTeamMember);
};

const addTeamMember = async (teamId, payload) => {
  validateTeamId(teamId);
  const { userId, role } = validateAddMember(payload);

  const team = await getTeam(teamId);
  const existing = team.members?.find((member) => member.userId === userId);
  if (existing) {
    throw createAuthError("TEAM_MEMBER_EXISTS", "Member already belongs to the team.", 409);
  }

  const user = await teamRepository.findUserById(userId);
  if (!user) {
    throw createAuthError("INVALID_MEMBER_USER", "The selected user is not valid.", 400);
  }

  const created = await teamRepository.addMember(teamId, { userId, role });
  return mapTeamMember(created);
};

const updateTeamMember = async (teamId, userId, payload) => {
  validateTeamId(teamId);
  const { role } = validateUpdateMember(payload);

  const team = await getTeam(teamId);
  const member = team.members?.find((entry) => entry.userId === userId);
  if (!member) {
    throw createAuthError("TEAM_MEMBER_NOT_FOUND", "Team member not found.", 404);
  }

  if (member.role === "LEAD" && role !== "LEAD") {
    throw createAuthError("PROTECTED_TEAM_LEAD", "The team lead cannot have their role changed to a non-lead role.", 403);
  }

  const updated = await teamRepository.updateMember(teamId, userId, role);
  return mapTeamMember(updated);
};

const removeTeamMember = async (teamId, userId) => {
  validateTeamId(teamId);

  const team = await getTeam(teamId);
  const member = team.members?.find((entry) => entry.userId === userId);
  if (!member) {
    throw createAuthError("TEAM_MEMBER_NOT_FOUND", "Team member not found.", 404);
  }

  if (member.role === "LEAD" && team.leadId === userId) {
    throw createAuthError("PROTECTED_TEAM_LEAD", "The team lead cannot be removed from the team.", 403);
  }

  return teamRepository.removeMember(teamId, userId);
};

const assignTeamLead = async (teamId, payload) => {
  validateTeamId(teamId);
  const userId = String(payload?.userId || "").trim();
  if (!userId) {
    throw createAuthError("VALIDATION_ERROR", "A user ID is required to assign a team lead.", 400);
  }

  const team = await getTeam(teamId);
  const user = await teamRepository.findUserById(userId);
  if (!user || !teamRepository.isEligibleTeamLead(user)) {
    throw createAuthError("INVALID_LEAD", "Manager must be an active user with an eligible role.", 400);
  }

  // Ensure the new lead is a member (role LEAD).
  const existing = team.members.find((member) => member.userId === userId);
  if (existing) {
    if (existing.role !== "LEAD") {
      await teamRepository.updateMember(teamId, userId, "LEAD");
    }
  } else {
    await teamRepository.addMember(teamId, { userId, role: "LEAD" });
  }

  const updated = await teamRepository.updateTeam(teamId, { leadId: userId });
  return mapTeamDetail(updated);
};

const getTeamSummary = async (teamId) => {
  const team = await getTeam(teamId);
  return {
    id: team.id,
    name: team.name,
    description: team.description,
    leadId: team.leadId,
    projectIds: team.projectIds || [],
    memberCount: team.memberCount || team.members?.length || 0,
    isActive: team.isActive,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
  };
};

const getTeamProjects = async (teamId) => {
  const team = await getTeam(teamId);
  return {
    teamId: team.id,
    projectIds: team.projectIds || [],
    projects: team.projectIds || [],
  };
};

module.exports = {
  listTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  restoreTeam,
  setTeamStatus,
  listTeamMembers,
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
  assignTeamLead,
  getTeamSummary,
  getTeamProjects,
};
