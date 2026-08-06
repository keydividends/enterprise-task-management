const mongoose = require("mongoose");

const DEFAULT_MONGODB_URI = "mongodb://localhost:27017/enterprise-task-management";

const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

  if (!mongoUri || typeof mongoUri !== "string") {
    console.warn("MongoDB connection skipped: MONGODB_URI environment variable is missing. Falling back to in-memory data.");
    return false;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log(`MongoDB connected successfully to ${mongoUri}`);
    return true;
  } catch (error) {
    console.warn("MongoDB connection unavailable. Falling back to in-memory data.", error.message);
    return false;
  }
};

module.exports = connectDatabase;