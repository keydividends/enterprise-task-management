const seedTeams = [
  {
    id: 'team-platform',
    name: 'Platform Engineering',
    description: 'Core platform and tooling delivery',
    leadId: 'mock-admin',
    projectIds: ['project-1'],
    isActive: true,
    isDeleted: false,
    members: [
      { userId: 'mock-admin', role: 'LEAD' },
      { userId: 'mock-maya', role: 'MEMBER' },
    ],
    createdAt: new Date('2025-01-15T09:00:00.000Z'),
    updatedAt: new Date('2025-01-15T09:00:00.000Z'),
  },
];

const mockUsers = [
  { id: 'mock-admin', firstName: 'Ava', lastName: 'Cole', role: 'ADMIN' },
  { id: 'mock-maya', firstName: 'Maya', lastName: 'Singh', role: 'MEMBER' },
  { id: 'mock-alex', firstName: 'Alex', lastName: 'Chen', role: 'MEMBER' },
];

const createTeamRecord = (data) => ({
  id: data.id || `team-${Date.now()}`,
  name: data.name,
  description: data.description || '',
  leadId: data.leadId || 'mock-admin',
  projectIds: Array.isArray(data.projectIds) ? data.projectIds : [],
  isActive: data.isActive !== false,
  isDeleted: false,
  members: Array.isArray(data.members) ? data.members : [],
  createdAt: data.createdAt || new Date(),
  updatedAt: data.updatedAt || new Date(),
});

const createTeamMemberRecord = (data) => ({
  userId: data.userId,
  role: data.role || 'MEMBER',
  joinedAt: data.joinedAt || new Date(),
});

module.exports = {
  seedTeams,
  mockUsers,
  createTeamRecord,
  createTeamMemberRecord,
};
