/* Verify team permissions + full member workflow for real JWT users. */
const http = require("http");
const app = require("../src/app");
const authService = require("../src/modules/auth/auth.service");

const PORT = 5201;

const request = (method, path, { token, body } = {}) =>
  new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const req = http.request(
      { host: "127.0.0.1", port: PORT, path, method, headers },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          let json = null;
          try { json = JSON.parse(raw); } catch { json = raw; }
          resolve({ status: res.statusCode, body: json });
        });
      }
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });

const run = async () => {
  const server = app.listen(PORT, async () => {
    console.log("Team full workflow check (real JWT users) on port", PORT);
    let allPass = true;

    const adminLogin = await authService.loginUser({ email: "admin@etms.com", password: "Admin@123" });
    const adminToken = adminLogin.accessToken;
    const adminId = adminLogin.user.id;

    // Create team with real admin as lead
    let r = await request("POST", "/api/v1/teams", { token: adminToken, body: { name: "Real Admin Team", leadId: adminId } });
    const create = r.status === 201;
    console.log(`  ${create ? "PASS" : "FAIL"} [${r.status}] POST /teams (real lead)`);
    allPass = create && allPass;
    const teamId = r.body?.data?.id;

    // Add real demo user as member
    const demoLogin = await authService.loginUser({ email: "demo@etms.com", password: "Admin@123" });
    const demoId = demoLogin.user.id;
    r = await request("POST", `/api/v1/teams/${teamId}/members`, { token: adminToken, body: { userId: demoId } });
    const add = r.status === 201;
    console.log(`  ${add ? "PASS" : "FAIL"} [${r.status}] add real member`);
    allPass = add && allPass;

    // List members
    r = await request("GET", `/api/v1/teams/${teamId}/members`, { token: adminToken });
    const listMembers = r.status === 200 && Array.isArray(r.body?.data) && r.body.data.some((m) => m.userId === demoId);
    console.log(`  ${listMembers ? "PASS" : "FAIL"} [${r.status}] list members includes real user`);
    allPass = listMembers && allPass;

    // Remove real member
    r = await request("DELETE", `/api/v1/teams/${teamId}/members/${demoId}`, { token: adminToken });
    const remove = r.status === 200;
    console.log(`  ${remove ? "PASS" : "FAIL"} [${r.status}] remove real member`);
    allPass = remove && allPass;

    // Update team
    r = await request("PATCH", `/api/v1/teams/${teamId}`, { token: adminToken, body: { name: "Real Admin Team Updated" } });
    const update = r.status === 200;
    console.log(`  ${update ? "PASS" : "FAIL"} [${r.status}] PATCH /teams/:id`);
    allPass = update && allPass;

    // Delete team
    r = await request("DELETE", `/api/v1/teams/${teamId}`, { token: adminToken });
    const del = r.status === 200;
    console.log(`  ${del ? "PASS" : "FAIL"} [${r.status}] DELETE /teams/:id`);
    allPass = del && allPass;

    console.log("\n" + (allPass ? "ALL FULL WORKFLOW CHECKS PASSED" : "SOME CHECKS FAILED"));
    server.close();
    process.exit(allPass ? 0 : 1);
  });
};

run().catch((e) => { console.error(e); process.exit(1); });
