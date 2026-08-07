const http = require("http");

const BASE = "http://localhost:5000/api/v1";
const TOKEN = "mock-token";

const request = (method, path, body) =>
  new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const u = new URL(BASE + path);
    const options = {
      method,
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
    };
    const req = http.request(options, (res) => {
      let raw = "";
      res.on("data", (c) => (raw += c));
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(raw);
        } catch (e) {
          json = raw;
        }
        resolve({ status: res.statusCode, body: json });
      });
    });
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });

const assert = (cond, msg) => {
  if (!cond) {
    console.log(`FAIL - ${msg}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS - ${msg}`);
  }
};

(async () => {
  // 1. List teams
  const list = await request("GET", "/teams");
  assert(list.status === 200, `GET /teams -> ${list.status}`);
  assert(Array.isArray(list.body?.data), "GET /teams returns array");

  // 2. Create team
  const create = await request("POST", "/teams", {
    name: "API Test Team",
    description: "Created via HTTP",
    leadId: "mock-admin",
    members: ["mock-maya"],
  });
  assert(create.status === 201, `POST /teams -> ${create.status}`);
  const teamId = create.body?.data?.id;
  assert(teamId, "POST /teams returns team id");

  // 3. Get team detail
  const detail = await request("GET", `/teams/${teamId}`);
  assert(detail.status === 200, `GET /teams/:id -> ${detail.status}`);
  assert(detail.body?.data?.name === "API Test Team", "GET /teams/:id returns correct name");

  // 4. Update team
  const update = await request("PATCH", `/teams/${teamId}`, { name: "API Test Team Updated" });
  assert(update.status === 200, `PATCH /teams/:id -> ${update.status}`);
  assert(update.body?.data?.name === "API Test Team Updated", "PATCH updates name");

  // 5. List members
  const members = await request("GET", `/teams/${teamId}/members`);
  assert(members.status === 200, `GET /teams/:id/members -> ${members.status}`);

  // 6. Add member
  const add = await request("POST", `/teams/${teamId}/members`, { userId: "mock-alex" });
  assert(add.status === 201, `POST /teams/:id/members -> ${add.status}`);

  // 7. Duplicate member rejected
  const dup = await request("POST", `/teams/${teamId}/members`, { userId: "mock-alex" });
  assert(dup.status === 409, `POST duplicate member -> ${dup.status}`);

  // 8. Remove member
  const remove = await request("DELETE", `/teams/${teamId}/members/mock-alex`);
  assert(remove.status === 200, `DELETE /teams/:id/members/:uid -> ${remove.status}`);

  // 9. Delete team
  const del = await request("DELETE", `/teams/${teamId}`);
  assert(del.status === 200, `DELETE /teams/:id -> ${del.status}`);

  // 10. Deleted team not found
  const gone = await request("GET", `/teams/${teamId}`);
  assert(gone.status === 404, `GET deleted team -> ${gone.status}`);

  console.log("API CHECK COMPLETE");
})();
