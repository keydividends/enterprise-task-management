const bcrypt = require("bcryptjs");

const { UserAuth } = require("../auth/auth.model");
const { getEffectivePermissions } = require("./rolePermissions");

const getConfiguredSuperAdminCredentials = () => {
  const email = String(
    process.env.SUPER_ADMIN_EMAIL || ""
  )
    .trim()
    .toLowerCase();

  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    return null;
  }

  return {
    email,
    password: String(password),
  };
};

const ensureSuperAdmin = async () => {
  const credentials = getConfiguredSuperAdminCredentials();
  if (!credentials) {
    return null;
  }

  const permissions = getEffectivePermissions({
    role: "SUPER_ADMIN",
  });

  
  const existing = await UserAuth.findOne({
    email: credentials.email,
    isDeleted: false,
  });

  if (existing) {
    return existing;
  }
  const passwordHash = await bcrypt.hash(
    credentials.password,
    10
  );

  return UserAuth.create({
    firstName: "Super",
    lastName: "Admin",
    email: credentials.email,
    passwordHash,
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    isDeleted: false,
    permissions,
    title: "Platform Super Administrator",
    department: "Platform",
  });
};

module.exports = {
  ensureSuperAdmin,
  getConfiguredSuperAdminCredentials,
};