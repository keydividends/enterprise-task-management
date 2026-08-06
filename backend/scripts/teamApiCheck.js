/* End-to-end API check for the Team Management module.
 * Starts the app on an ephemeral port and exercises every endpoint.
 */
const http = require("http");
const app = require("../src/app");

const PORT = 5199;

const request = (method, path, { token, body } = {}) =>
  new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const req = http.request(
      { host: "127.0.0.1", port: PORT, path, method, headers },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          let json = null;
          try {
            json = JSON.parse(raw);
          } catch (e) {
            json = raw;
          }
          resolve({ status: res.statusCode, body: json });
        });
      }
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });

const log = (name, result, expectedStatus) => {
  const ok = result.status === expectedStatus;
  console.log(`${ok ? "PASS" : "FAIL"} [${result.status}] ${name}`);
  if (!ok) {
    console.log("   expected:", expectedStatus);
    console.log("   body:", JSON.stringify(result.body));
  }
  return ok;
};

const run = async () => {
  const server = app.listen(PORT, async () => {
    console.log("Testing Team Management API on port", PORT);
    const adminToken = "mock-token";
    const memberToken = "mock-member-token";
    let allPass = true;

    // 1. List teams
    let r = await request("GET", "/api/v1/teams", { token: adminToken });
    allPass = log("GET /teams (list)", r, 200) && allPass;
    console.log("   count:", Array.isArray(r.body?.data) ? r.body.data.length : "?");

    // 2. Create team
    r = await request("POST", "/api/v1/teams", {
      token: adminToken,
      body: { name: "API Check Team", description: "Created via API check", leadId: "mock-admin", members: ["mock-maya"] },
    });
    allPass = log("POST /teams (create)", r, 201) && allPass;
    const newTeamId = r.body?.data?.id;
    console.log("   new team id:", newTeamId);

    // 3. List teams again - verify new team visible
    const listAfterCreate = await request("GET", "/api/v1/teams", { token: adminToken });
    const visibleAfterCreate = Array.isArray(listAfterCreate.body?.data) && listAfterCreate.body.data.some((t) => t.id === newTeamId);
    allPass = log("GET /teams shows newly created team", { status: listAfterCreate.status, body: { visible: visibleAfterCreate } }, 200) && visibleAfterCreate && allPass;

    // 4. Get team detail
    r = await request("GET", `/api/v1/teams/${newTeamId}`, { token: adminToken });
    allPass = log("GET /teams/:id (detail)", r, 200) && allPass;

    // 5. Update team
    r = await request("PATCH", `/api/v1/teams/${newTeamId}`, {
      token: adminToken,
      body: { name: "API Check Team Updated", description: "Updated" },
    });
    allPass = log("PATCH /teams/:id (update)", r, 200) && allPass;
    const updatedName = r.body?.data?.name;
    console.log("   updated name:", updatedName);

    // Verify update persisted
    const detailAfterUpdate = await request("GET", `/api/v1/teams/${newTeamId}`, { token: adminToken });
    const updatePersisted = detailAfterUpdate.body?.data?.name === "API Check Team Updated";
    allPass = log("Update persisted in detail", { status: detailAfterUpdate.status, body: { persisted: updatePersisted } }, 200) && updatePersisted && allPass;

    // 6. Add member
    r = await request("POST", `/api/v1/teams/${newTeamId}/members`, {
      token: adminToken,
      body: { userId: "mock-alex" },
    });
    allPass = log("POST /teams/:id/members (add)", r, 201) && allPass;

    // 7. List members
    r = await request("GET", `/api/v1/teams/${newTeamId}/members`, { token: adminToken });
    allPass = log("GET /teams/:id/members (list)", r, 200) && allPass;
    console.log("   member count:", Array.isArray(r.body?.data) ? r.body.data.length : "?");

    // 8. Duplicate member rejected
    r = await request("POST", `/api/v1/teams/${newTeamId}/members`, {
      token: adminToken,
      body: { userId: "mock-alex" },
    });
    allPass = log("POST duplicate member rejected", r, 409) && allPass;

    // 9. Invalid member rejected
    r = await request("POST", `/api/v1/teams/${newTeamId}/members`, {
      token: adminToken,
      body: { userId: "missing-user" },
    });
    allPass = log("POST invalid member rejected", r, 400) && allPass;

    // 10. Remove member
    r = await request("DELETE", `/api/v1/teams/${newTeamId}/members/mock-alex`, { token: adminToken });
    allPass = log("DELETE /teams/:id/members/:userId (remove)", r, 200) && allPass;

    // 11. Permission denied - member token cannot create team
    r = await request("POST", "/api/v1/teams", {
      token: memberToken,
      body: { name: "Should Fail", leadId: "mock-maya" },
    });
    allPass = log("Member token cannot create team (403)", r, 403) && allPass;

    // 12. Delete team
    r = await request("DELETE", `/api/v1/teams/${newTeamId}`, { token: adminToken });
    allPass = log("DELETE /teams/:id (archive)", r, 200) && allPass;

    // 13. Detail after delete -> not found
    r = await request("GET", `/api/v1/teams/${newTeamId}`, { token: adminToken });
    allPass = log("GET deleted team -> 404", r, 404) && allPass;

    // 14. No auth -> 401
    r = await request("GET", "/api/v1/teams");
    allPass = log("GET /teams without auth -> 401", r, 401) && allPass;

    console.log("\n" + (allPass ? "ALL API CHECKS PASSED" : "SOME API CHECKS FAILED"));
    server.close();
    process.exit(allPass ? 0 : 1);
  });
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
