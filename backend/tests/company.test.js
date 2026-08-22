const test = require("node:test");
const assert = require("node:assert");
const request = require("supertest");
const app = require("../src/app");
const { startDatabase, clearDatabase, stopDatabase } = require("./testDatabase");
const { User } = require("../src/modules/users/user.model");
const { Company } = require("../src/modules/companies/company.model");
const bcrypt = require("bcryptjs");

test.before(async () => {
  await startDatabase();
});

test.after(async () => {
  await stopDatabase();
});

test.beforeEach(async () => {
  await clearDatabase();
});

test("POST /api/v1/companies successfully registers a new company and Company_Admin", async () => {
  const payload = {
    companyName: "Acme Corporation",
    email: "admin@acme.com",
    password: "Password@123",
    address: "123 Innovation Way, Tech Park",
    phoneNumber: "+1 555 123 4567",
  };

  const res = await request(app)
    .post("/api/v1/companies")
    .send(payload)
    .expect(201);

  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.company.name, "Acme Corporation");
  assert.strictEqual(res.body.data.user.email, "admin@acme.com");
  assert.strictEqual(res.body.data.user.role, "COMPANY_ADMIN");

  // Verify stored in DB
  const companyDoc = await Company.findOne({ name: "Acme Corporation" });
  assert.ok(companyDoc);
  assert.strictEqual(companyDoc.phone, "+1 555 123 4567");
  assert.strictEqual(companyDoc.address, "123 Innovation Way, Tech Park");

  const userDoc = await User.findOne({ email: "admin@acme.com" });
  assert.ok(userDoc);
  assert.strictEqual(userDoc.role, "COMPANY_ADMIN");
  assert.strictEqual(String(userDoc.companyId), String(companyDoc._id));
  assert.strictEqual(userDoc.companyName, "Acme Corporation");
});

test("POST /api/v1/companies rejects duplicate company name", async () => {
  const payload = {
    companyName: "Acme Corporation",
    email: "admin1@acme.com",
    password: "Password@123",
    address: "123 Innovation Way",
    phoneNumber: "+1 555 123 4567",
  };

  await request(app).post("/api/v1/companies").send(payload).expect(201);

  const duplicateRes = await request(app)
    .post("/api/v1/companies")
    .send({
      ...payload,
      email: "admin2@acme.com",
    })
    .expect(409);

  assert.strictEqual(duplicateRes.body.success, false);
});

test("GET /api/v1/companies/search returns matching companies for autocomplete dropdown", async () => {
  await Company.create([
    { name: "Acme Corp", email: "contact@acme.com", phone: "1234567", address: "St 1" },
    { name: "Apex Technologies", email: "info@apex.com", phone: "2345678", address: "St 2" },
    { name: "Beta Soft", email: "info@beta.com", phone: "3456789", address: "St 3" },
  ]);

  const searchRes = await request(app)
    .get("/api/v1/companies/search?query=Ap")
    .expect(200);

  assert.strictEqual(searchRes.body.success, true);
  assert.strictEqual(searchRes.body.data.length, 1);
  assert.strictEqual(searchRes.body.data[0].name, "Apex Technologies");

  const allRes = await request(app)
    .get("/api/v1/companies/search")
    .expect(200);

  assert.strictEqual(allRes.body.data.length, 3);
});

test("POST /api/v1/auth/login works with standard email and password", async () => {
  // Seed a company and company admin
  await request(app)
    .post("/api/v1/companies")
    .send({
      companyName: "Zenith Inc",
      email: "admin@zenith.com",
      password: "Password@123",
      address: "456 Skyline Rd",
      phoneNumber: "+1 555 987 6543",
    })
    .expect(201);

  // Login with standard email & password
  const loginRes = await request(app)
    .post("/api/v1/auth/login")
    .send({
      email: "admin@zenith.com",
      password: "Password@123",
    })
    .expect(200);

  assert.ok(loginRes.body.data.accessToken);
  assert.strictEqual(loginRes.body.data.user.companyName, "Zenith Inc");

  // Invalid password returns 401
  const mismatchRes = await request(app)
    .post("/api/v1/auth/login")
    .send({
      email: "admin@zenith.com",
      password: "WrongPassword@123",
    })
    .expect(401);

  assert.strictEqual(mismatchRes.body.success, false);

  // Seed Super_Admin internally
  const superPasswordHash = await bcrypt.hash("Admin@123", 10);
  await User.create({
    firstName: "Global",
    lastName: "Admin",
    email: "superadmin@etms.com",
    passwordHash: superPasswordHash,
    role: "SUPER_ADMIN",
    status: "ACTIVE",
  });

  // Super Admin logs in through standard login form
  const superLoginRes = await request(app)
    .post("/api/v1/auth/login")
    .send({
      email: "superadmin@etms.com",
      password: "Admin@123",
    })
    .expect(200);

  assert.strictEqual(superLoginRes.body.data.user.role, "SUPER_ADMIN");
});

test("POST /api/v1/auth/register supports employee signup with existing company", async () => {
  // 1. Create company
  const company = await Company.create({
    name: "Nexus Labs",
    email: "admin@nexus.com",
    phone: "1234567890",
    address: "789 Tech Park",
    status: "ACTIVE",
  });

  // 2. Register employee with company
  const regRes = await request(app)
    .post("/api/v1/auth/register")
    .send({
      firstName: "John",
      lastName: "Doe",
      email: "john@nexus.com",
      password: "Password@123",
      confirmPassword: "Password@123",
      companyId: company._id.toString(),
    })
    .expect(201);

  assert.strictEqual(regRes.body.data.user.email, "john@nexus.com");
  assert.strictEqual(regRes.body.data.user.companyName, "Nexus Labs");
  assert.strictEqual(regRes.body.data.user.role, "MANAGER");
});

