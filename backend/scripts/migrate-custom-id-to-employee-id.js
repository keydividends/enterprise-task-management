const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env"), quiet: true });

const run = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required to migrate employee IDs.");
  }

  await mongoose.connect(mongoUri);
  const users = mongoose.connection.collection("Users");
  const legacyUsers = await users.find({ customId: { $exists: true } }).toArray();
  const usersWithEmployeeIds = await users.find({ employeeId: { $exists: true, $ne: null } }).toArray();
  const seenEmployeeIds = new Set(
    usersWithEmployeeIds
      .map((user) => String(user.employeeId || "").trim())
      .filter(Boolean)
  );
  const duplicateEmployeeIds = new Set();

  for (const user of legacyUsers) {
    // A document that already has employeeId keeps that canonical value. The
    // legacy property is simply removed below.
    if (user.employeeId !== undefined && user.employeeId !== null) continue;

    const employeeId = String(user.customId || "").trim();
    if (!employeeId) continue;
    if (seenEmployeeIds.has(employeeId)) duplicateEmployeeIds.add(employeeId);
    seenEmployeeIds.add(employeeId);
  }

  if (duplicateEmployeeIds.size) {
    throw new Error(`Migration stopped: duplicate legacy Employee IDs found: ${[...duplicateEmployeeIds].join(", ")}`);
  }

  const operations = legacyUsers
    .filter((user) => user.employeeId === undefined || user.employeeId === null)
    .map((user) => {
      const employeeId = String(user.customId || "").trim();
      return {
        updateOne: {
          filter: {
            _id: user._id,
            $or: [{ employeeId: { $exists: false } }, { employeeId: null }],
          },
          update: employeeId
            ? { $set: { employeeId }, $unset: { customId: "" } }
            : { $unset: { customId: "" } },
        },
      };
    });

  if (operations.length) {
    await users.bulkWrite(operations, { ordered: true });
  }

  await users.updateMany(
    { customId: { $exists: true }, employeeId: { $exists: true } },
    { $unset: { customId: "" } }
  );
  await users.createIndex({ employeeId: 1 }, { unique: true, sparse: true });

  console.log(`Migrated ${operations.length} user Employee ID field(s).`);
};

run()
  .catch((error) => {
    console.error("Employee ID migration failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
