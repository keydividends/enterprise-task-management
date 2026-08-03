const path = require("path");
const dotenv = require("dotenv");

const backendEnvPath = path.resolve(__dirname, "../.env");
const rootEnvPath = path.resolve(__dirname, "../../.env");
const backendEnvResult = dotenv.config({ path: backendEnvPath, quiet: true });
const loadedEnvPath = backendEnvResult.error ? rootEnvPath : backendEnvPath;

if (backendEnvResult.error) {
  dotenv.config({ path: rootEnvPath, quiet: true });
}

if (process.env.NODE_ENV !== "production") {
  console.log("Environment configuration loaded", {
    path: loadedEnvPath,
    smtpHostConfigured: Boolean(process.env.SMTP_HOST),
    smtpPortConfigured: Boolean(process.env.SMTP_PORT),
    smtpUserConfigured: Boolean(process.env.SMTP_USER),
    smtpPasswordConfigured: Boolean(process.env.SMTP_PASS),
    smtpFromConfigured: Boolean(process.env.SMTP_FROM),
  });
}

const app = require("./app");
const connectDatabase = require("./config/database");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`ETMS API running on port ${PORT}`);
  });
};

startServer();
