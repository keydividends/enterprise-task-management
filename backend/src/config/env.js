const env = {
  JWT_SECRET: process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || "etms-dev-access-secret",
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "etms-dev-access-secret",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "etms-dev-refresh-secret",
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "1h",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
};

module.exports = env;
