const mongoose = require("mongoose");
const { User } = require("./user.model");

// In-Memory Seed Store (fallback when Mongoose is disconnected)
const inMemoryUsers = new Map([
  [
    "user_admin_1",
    {
      _id: "user_admin_1",
      id: "user_admin_1",
      firstName: "Admin",
      lastName: "User",
      email: "admin@etms.com",
      passwordHash: "$2b$10$2LHil5UBjkY2Wuvcdln.VeScEors5MVuMy3qX5nkRwyxhHtoJGUUy",
      role: "ADMIN",
      permissions: [
        "USER_VIEW",
        "USER_CREATE",
        "USER_UPDATE",
        "USER_DELETE",
        "PROJECT_VIEW",
        "PROJECT_CREATE",
        "TASK_VIEW",
        "TASK_CREATE",
        "TASK_UPDATE",
        "TEAM_VIEW",
        "TEAM_CREATE",
        "TEAM_UPDATE",
        "TEAM_DELETE",
        "TEAM_MANAGE_MEMBERS",
      ],
      status: "ACTIVE",
      department: "Management",
      title: "System Administrator",
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  [
    "user_demo_1",
    {
      _id: "user_demo_1",
      id: "user_demo_1",
      firstName: "Demo",
      lastName: "User",
      email: "demo@etms.com",
      passwordHash: "$2b$10$XUA4r0D2oshUWDt1W7pej.qBPju9qQRx/FBR7s7o/alBkNZ6kCIUq",
      role: "USER",
      permissions: [
        "USER_VIEW",
        "PROJECT_VIEW",
        "TASK_VIEW",
        "TASK_CREATE",
        "TEAM_VIEW",
        "TEAM_CREATE",
        "TEAM_UPDATE",
        "TEAM_DELETE",
        "TEAM_MANAGE_MEMBERS",
      ],
      status: "ACTIVE",
      department: "Engineering",
      title: "Software Engineer",
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  [
    "user_disabled_1",
    {
      _id: "user_disabled_1",
      id: "user_disabled_1",
      firstName: "Disabled",
      lastName: "User",
      email: "disabled@etms.com",
      passwordHash: "$2a$10$w4O8v893a7K.Xy3wzG0P..73Jd8V0v.FkL2Y1g7Q2P2G7f",
      role: "USER",
      permissions: [],
      status: "DISABLED",
      department: "QA",
      title: "Tester",
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
]);

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

const normalizeEmail = (email = "") => String(email).trim().toLowerCase();

const findAll = async ({ page = 1, pageSize = 20, search = "", status = null, roleId = null, sortBy = "createdAt", sortOrder = -1 }) => {
  if (isDbConnected()) {
    const filter = { isDeleted: false };
    if (status) filter.status = status;
    if (roleId) filter.roleId = roleId;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
      ];
    }

    const totalItems = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const items = await User.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    return { items, totalItems, page, pageSize, totalPages };
  }

  // In-memory fallback
  let list = Array.from(inMemoryUsers.values()).filter((u) => !u.isDeleted);

  if (status) {
    list = list.filter((u) => u.status === status);
  }
  if (roleId) {
    list = list.filter((u) => u.roleId === roleId);
  }
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(
      (u) =>
        u.firstName?.toLowerCase().includes(s) ||
        u.lastName?.toLowerCase().includes(s) ||
        u.email?.toLowerCase().includes(s) ||
        u.department?.toLowerCase().includes(s)
    );
  }

  const totalItems = list.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  list.sort((a, b) => {
    const valA = a[sortBy] || "";
    const valB = b[sortBy] || "";
    if (valA < valB) return sortOrder === 1 ? -1 : 1;
    if (valA > valB) return sortOrder === 1 ? 1 : -1;
    return 0;
  });

  const startIndex = (page - 1) * pageSize;
  const items = list.slice(startIndex, startIndex + pageSize);

  return { items, totalItems, page, pageSize, totalPages };
};

const findByCustomId = async (customId) => {
  if (!customId) return null;
  if (isDbConnected()) {
    return User.findOne({ customId: String(customId).trim(), isDeleted: false });
  }
  return Array.from(inMemoryUsers.values()).find(
    (u) => u.customId === String(customId).trim() && !u.isDeleted
  ) || null;
};

const findById = async (userId) => {
  if (isDbConnected()) {
    return User.findOne({ _id: userId, isDeleted: false });
  }

  const user = inMemoryUsers.get(String(userId));
  return user && !user.isDeleted ? user : null;
};

const findByEmail = async (email) => {
  const normalized = normalizeEmail(email);

  if (isDbConnected()) {
    return User.findOne({ email: normalized, isDeleted: false });
  }

  return Array.from(inMemoryUsers.values()).find(
    (u) => normalizeEmail(u.email) === normalized && !u.isDeleted
  ) || null;
};

const createUser = async (userData) => {
  const normalized = normalizeEmail(userData.email);

  if (isDbConnected()) {
    try {
      return await User.create({ ...userData, email: normalized });
    } catch (error) {
      if (error && error.code === 11000) {
        error.code = "USER_EMAIL_ALREADY_EXISTS";
        error.statusCode = 409;
        error.message = "A user with this email address already exists.";
      }
      throw error;
    }
  }

  const existing = await findByEmail(normalized);
  if (existing) {
    const error = new Error("A user with this email address already exists.");
    error.code = "USER_EMAIL_ALREADY_EXISTS";
    error.statusCode = 409;
    throw error;
  }

  const newId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newUser = {
    _id: newId,
    id: newId,
    firstName: userData.firstName,
    lastName: userData.lastName || "",
    email: normalized,
    passwordHash: userData.passwordHash || "$2a$10$defaultHashValueForTesting",
    mobile: userData.mobile || "",
    department: userData.department || "",
    title: userData.title || "",
    bio: userData.bio || "",
    customId: userData.customId || null,
    role: userData.role || "USER",
    permissions: userData.permissions || [
      "USER_VIEW",
      "PROJECT_VIEW", "PROJECT_CREATE", "PROJECT_UPDATE",
      "TASK_VIEW", "TASK_CREATE", "TASK_UPDATE",
      "TEAM_VIEW", "TEAM_CREATE", "TEAM_UPDATE", "TEAM_DELETE", "TEAM_MANAGE_MEMBERS",
    ],
    status: userData.status || "ACTIVE",
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  inMemoryUsers.set(newId, newUser);
  return newUser;
};

const updateUser = async (userId, updateData) => {
  if (isDbConnected()) {
    return User.findOneAndUpdate(
      { _id: userId, isDeleted: false },
      { $set: { ...updateData, updatedAt: new Date() } },
      { new: true }
    );
  }

  const user = inMemoryUsers.get(String(userId));
  if (!user || user.isDeleted) return null;

  const updated = { ...user, ...updateData, updatedAt: new Date() };
  inMemoryUsers.set(String(userId), updated);
  return updated;
};

const updateUserStatus = async (userId, status) => {
  return updateUser(userId, { status });
};

const softDeleteUser = async (userId) => {
  if (isDbConnected()) {
    return User.findOneAndUpdate(
      { _id: userId, isDeleted: false },
      { $set: { isDeleted: true, status: "DELETED", updatedAt: new Date() } },
      { new: true }
    );
  }

  const user = inMemoryUsers.get(String(userId));
  if (!user || user.isDeleted) return null;

  const updated = { ...user, isDeleted: true, status: "DELETED", updatedAt: new Date() };
  inMemoryUsers.set(String(userId), updated);
  return updated;
};

const restoreUser = async (userId) => {
  if (isDbConnected()) {
    return User.findOneAndUpdate(
      { _id: userId },
      { $set: { isDeleted: false, status: "ACTIVE", updatedAt: new Date() } },
      { new: true }
    );
  }

  const user = inMemoryUsers.get(String(userId));
  if (!user) return null;

  const updated = { ...user, isDeleted: false, status: "ACTIVE", updatedAt: new Date() };
  inMemoryUsers.set(String(userId), updated);
  return updated;
};

const searchUsers = async (query = "", limit = 10) => {
  const s = String(query).trim().toLowerCase();

  if (isDbConnected()) {
    const filter = {
      isDeleted: false,
      status: "ACTIVE",
    };
    if (s) {
      filter.$or = [
        { firstName: { $regex: s, $options: "i" } },
        { lastName: { $regex: s, $options: "i" } },
        { email: { $regex: s, $options: "i" } },
      ];
    }

    return User.find(filter).limit(limit);
  }

  return Array.from(inMemoryUsers.values())
    .filter((u) => !u.isDeleted && u.status === "ACTIVE")
    .filter(
      (u) =>
        !s ||
        u.firstName?.toLowerCase().includes(s) ||
        u.lastName?.toLowerCase().includes(s) ||
        u.email?.toLowerCase().includes(s)
    )
    .slice(0, limit);
};

const getUserProjects = async (userId) => {
  // Returns mock or aggregated project memberships for user
  return [
    { id: "proj_101", name: "Enterprise Task Management System", key: "ETMS", role: "Developer", status: "ACTIVE" },
    { id: "proj_102", name: "Internal Admin Portal", key: "IAP", role: "Contributor", status: "ACTIVE" },
  ];
};

const getUserTeams = async (userId) => {
  // Returns mock or aggregated team memberships for user
  return [
    { id: "team_201", name: "Frontend Core Team", lead: "Raheema", memberCount: 5 },
    { id: "team_202", name: "Backend Architecture", lead: "Yamini", memberCount: 4 },
  ];
};

const getUserWorkload = async (userId) => {
  // Returns workload summary metrics for user
  return {
    assignedTasks: 8,
    completedTasks: 5,
    inProgressTasks: 2,
    overdueTasks: 1,
    loggedMinutes: 1420,
  };
};

module.exports = {
  findAll,
  findById,
  findByEmail,
  createUser,
  updateUser,
  updateUserStatus,
  softDeleteUser,
  restoreUser,
  searchUsers,
  getUserProjects,
  getUserTeams,
  getUserWorkload,
  findByCustomId,
  inMemoryUsers,
};
