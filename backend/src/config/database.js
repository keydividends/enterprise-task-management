const mongoose = require("mongoose");

const DEFAULT_MONGODB_URI = "mongodb://localhost:27017/enterprise-task-management";

const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

  if (!mongoUri || typeof mongoUri !== "string") {
    console.error("MongoDB connection failed: MONGODB_URI environment variable is missing.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log(`MongoDB connected successfully to ${mongoUri}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDatabase;