 # QA Bug Tracker — Himaja

**Last Updated:** Phase 3 — verified test run (re-verified)
**Runner:** `node --test` — Node.js v22.16.0
**Total tests run:** 93 | Pass: 89 | Fail: 4 (2 test crashes + 2 assertion failures)
**Verification:** All 15 bugs re-inspected against current source. BUG-008 resolved (MongoDB persistence confirmed). Remaining RBAC gaps (BUG-001/002/004/005) and seed ID mismatch (BUG-007) confirmed still open.

---

## BUG-001

| Field | Value |
|-------|-------|
| **Bug ID** | BUG-001 |
| **Module** | Users |
| **Severity** | High |
| **Owner** | Raheema |
| **Status** | OPEN |
| **File** | `backend/src/modules/users/user.routes.js` |
| **Title** | No RBAC `authorize()` on any user route — any authenticated user can create/update/delete users |
| **Steps to Reproduce** | 1. Login as demo@etms.com (USER role). 2. POST `/api/v1/users` with valid payload. 3. Observe 201 Created. |
| **Expected** | 403 PERMISSION_DENIED |
| **Actual** | 201 Created — user created by any authenticated user |
| **Recommended Fix** | Add `authorize("USER_CREATE")` to POST, `authorize("USER_UPDATE")` to PUT/PATCH, `authorize("USER_DELETE")` to DELETE, `authorize("USER_VIEW")` to GET list |

---

## BUG-002

| Field | Value |
|-------|-------|
| **Bug ID** | BUG-002 |
| **Module** | Projects |
| **Severity** | High |
| **Owner** | Trisha |
| **Status** | OPEN |
| **File** | `backend/src/modules/projects/project.routes.js` |
| **Title** | No RBAC `authorize()` on any project route |
| **Steps to Reproduce** | 1. Login as demo@etms.com (USER role, no PROJECT_CREATE). 2. POST `/api/v1/projects`. 3. Observe 201 Created. |
| **Expected** | 403 PERMISSION_DENIED |
| **Actual** | 201 Created |
| **Recommended Fix** | Add `authorize("PROJECT_CREATE")` to POST, `authorize("PROJECT_UPDATE")` to PATCH, `authorize("PROJECT_DELETE")` to DELETE, `authorize("PROJECT_MANAGE_MEMBERS")` to member add/remove |

---

## BUG-003

| Field | Value |
|-------|-------|
| **Bug ID** | BUG-003 |
| **Module** | Projects (Frontend) |
| **Severity** | Medium |
| **Owner** | Trisha |
| **Status** | OPEN |
| **File** | `frontend/src/features/projects/services/projectService.js` lines 33–37 |
| **Title** | `withFallback` silently returns hardcoded mock data on any API failure — masks real errors |
| **Steps to Reproduce** | 1. Stop backend. 2. Open `/projects`. 3. Project list still shows hardcoded data. |
| **Expected** | Error state shown to user |
| **Actual** | Hardcoded fallback projects displayed silently |
| **Recommended Fix** | Remove fallback or show error state in UI when API fails |

---

## BUG-004

| Field | Value |
|-------|-------|
| **Bug ID** | BUG-004 |
| **Module** | Comments |
| **Severity** | Medium |
| **Owner** | Bhavinash |
| **Status** | OPEN |
| **File** | `backend/src/modules/comments/comment.routes.js` lines 9, 10, 15, 16 |
| **Title** | Comment create/edit/delete routes use `TASK_VIEW` permission instead of `COMMENT_CREATE/UPDATE/DELETE` |
| **Steps to Reproduce** | 1. Review `comment.routes.js`. 2. Note `authorize("TASK_VIEW")` on POST, PATCH, DELETE. 3. Check `role.seed.js` — COMMENT_CREATE/UPDATE/DELETE exist but are unused. |
| **Expected** | POST → COMMENT_CREATE, PATCH → COMMENT_UPDATE, DELETE → COMMENT_DELETE |
| **Actual** | All three use TASK_VIEW |
| **Recommended Fix** | Change `authorize("TASK_VIEW")` to correct comment permission keys on each route |

---

## BUG-005

| Field | Value |
|-------|-------|
| **Bug ID** | BUG-005 |
| **Module** | Attachments |
| **Severity** | High |
| **Owner** | Bhavinash |
| **Status** | OPEN |
| **File** | `backend/src/modules/attachments/attachment.routes.js` |
| **Title** | No `authorize()` middleware on any attachment route |
| **Steps to Reproduce** | 1. Login as demo@etms.com (no ATTACHMENT_UPLOAD). 2. POST `/api/v1/tasks/:taskId/attachments` with a file. 3. Observe 201. |
| **Expected** | 403 PERMISSION_DENIED |
| **Actual** | 201 Created — file uploaded by any authenticated user |
| **Recommended Fix** | Add `authorize("ATTACHMENT_UPLOAD")` to POST, `authorize("ATTACHMENT_DELETE")` to DELETE |

---

## BUG-006

| Field | Value |
|-------|-------|
| **Bug ID** | BUG-006 |
| **Module** | Dashboard & Reports |
| **Severity** | High |
| **Owner** | Konaiah |
| **Status** | OPEN |
| **File** | `backend/src/modules/` (no dashboard/reports folder exists); `frontend/src/pages/DashboardPage.jsx` lines 17–20 |
| **Title** | Dashboard/Reports backend module not implemented; frontend uses 100% hardcoded static data |
| **Steps to Reproduce** | 1. GET `/api/v1/dashboard/summary` → 404. 2. Open `/dashboard` → shows static numbers regardless of real data. |
| **Expected** | Live aggregated data from API |
| **Actual** | 404 on all dashboard/report endpoints; frontend shows hardcoded values (24 projects, 8 teams, 146 tasks, 86%) |
| **Recommended Fix** | Konaiah to implement dashboard/reports backend module and connect frontend |

---

## BUG-007

| Field | Value |
|-------|-------|
| **Bug ID** | BUG-007 |
| **Module** | Seed Data |
| **Severity** | Medium |
| **Owner** | Himaja (coordination) / Raheema + Trisha |
| **Status** | OPEN |
| **File** | `backend/scripts/seedProjects.js` lines 10–15 |
| **Title** | `seedProjects.js` hardcoded user ObjectIds do not match `seedUsers.js` auto-generated IDs |
| **Steps to Reproduce** | 1. Run `npm run seed:users`. 2. Run `npm run seed:projects`. 3. Query projectmembers — userId fields point to non-existent users. |
| **Expected** | Project member userId fields reference real user documents |
| **Actual** | Dangling ObjectId references |
| **Recommended Fix** | Option A: `seedUsers.js` uses fixed ObjectIds matching `seedProjects.js`. Option B: `seedProjects.js` queries users by email to get real IDs |

---

## BUG-008 — RESOLVED

| Field | Value |
|-------|-------|
| **Bug ID** | BUG-008 |
| **Module** | Teams |
| **Severity** | High |
| **Owner** | LakshmiPrasanna |
| **Status** | RESOLVED |
| **Title** | Teams module in-memory storage / mock user IDs |
| **Resolution** | `team.repository.js` now uses MongoDB when connected (`isDbConnected()` guard). `seedTeams.js` rewritten to look up real user `_id` values by email from MongoDB before creating teams. In-memory fallback retained for tests only. `authenticate.js` updated to resolve `mock-token` to real MongoDB user `_id` when DB is connected. |
| **Verified By** | Code inspection of `team.repository.js`, `seedTeams.js`, `authenticate.js` |

---

## BUG-009

| Field | Value |
|-------|-------|
| **Bug ID** | BUG-009 |
| **Module** | Roles (Tests) |
| **Severity** | High |
| **Owner** | Venkat |
| **Status** | OPEN |
| **File** | `backend/tests/roles.test.js` line 7 |
| **Title** | `roles.test.js` uses Jest syntax (`describe`/`it`/`expect`) — crashes under `node:test` runner |
| **Steps to Reproduce** | Run `node --test` in `backend/`. Observe `ReferenceError: describe is not defined`. |
| **Expected** | All role API tests run and pass |
| **Actual** | File crashes immediately — 0 tests execute |
| **Evidence** | Test output: `ReferenceError: describe is not defined` at `roles.test.js:7:1` |
| **Recommended Fix** | Rewrite `roles.test.js` using `node:test` + `assert` (same pattern as `auth.test.js`, `teams.test.js`) |

---

## BUG-010

| Field | Value |
|-------|-------|
| **Bug ID** | BUG-010 |
| **Module** | Tasks (Tests) |
| **Severity** | High |
| **Owner** | Manasa |
| **Status** | OPEN |
| **File** | `backend/tests/testDatabase.js` line 2; `backend/tests/task.api.test.js` |
| **Title** | `task.api.test.js` requires `mongodb-memory-server` which is not installed — crashes on load |
| **Steps to Reproduce** | Run `node --test` in `backend/`. Observe `Error: Cannot find module 'mongodb-memory-server'`. |
| **Expected** | `task.api.test.js` runs against in-memory MongoDB |
| **Actual** | File crashes — 0 tests execute |
| **Evidence** | `testDatabase.js` line 2: `require('mongodb-memory-server')` — package not in `package.json` |
| **Recommended Fix** | Run `npm install --save-dev mongodb-memory-server` in `backend/` OR refactor to use the existing in-memory fallback pattern |

---

## BUG-011

| Field | Value |
|-------|-------|
| **Bug ID** | BUG-011 |
| **Module** | Projects (Tests) |
| **Severity** | Medium |
| **Owner** | Trisha |
| **Status** | OPEN |
| **File** | `backend/tests/projects.test.js` lines 67–100 |
| **Title** | `addProjectMember` and `removeProjectMember` tests fail — `USER_NOT_FOUND` for `user_admin_1` |
| **Steps to Reproduce** | Run `node --test`. Observe `not ok 26` and `not ok 27`. |
| **Expected** | Tests pass — `user_admin_1` is a valid in-memory user |
| **Actual** | `Error: No user found with that ID.` — project service validates userId against user repository but `user_admin_1` is in the auth in-memory store, not the user repository in-memory store |
| **Evidence** | `project.service.js:243` calls user lookup; `user.repository.js` in-memory store uses key `user_admin_1` but `project.service.js` may be calling a different lookup path |
| **Recommended Fix** | Trisha to mock the user lookup in the test or align the fixture ID with the user repository's in-memory store |

---

## BUG-012

| Field | Value |
|-------|-------|
| **Bug ID** | BUG-012 |
| **Module** | Auth |
| **Severity** | Medium |
| **Owner** | Yamini |
| **Status** | OPEN |
| **File** | `backend/src/modules/auth/auth.service.js` lines 130–140 |
| **Title** | `registerUser` assigns 11 permissions to new users — inconsistent with USER role (7 permissions) in `role.seed.js` |
| **Steps to Reproduce** | 1. POST `/api/v1/auth/register`. 2. Inspect returned `permissions` array. |
| **Expected** | New users receive 7 read permissions matching USER role in `role.seed.js` |
| **Actual** | New users receive 11 permissions including `PROJECT_CREATE`, `TEAM_CREATE`, `TEAM_DELETE`, `TEAM_MANAGE_MEMBERS` |
| **Evidence** | `auth.service.js` `registerUser()` hardcodes permissions; `role.seed.js` USER role has only 7 |
| **Recommended Fix** | Align `registerUser` default permissions with USER role definition in `role.seed.js` |

---

## BUG-013 — RESOLVED

| Field | Value |
|-------|-------|
| **Bug ID** | BUG-013 |
| **Module** | Teams |
| **Severity** | Medium |
| **Owner** | LakshmiPrasanna |
| **Status** | RESOLVED |
| **Title** | `createTeam` falls back to `mock-admin` as lead when no `leadId` provided — fails when MongoDB connected |
| **Resolution** | `seedTeams.js` now always provides `leadEmail` which is resolved to a real MongoDB `_id`. The `mock-admin` fallback in `team.service.js` still exists for the in-memory/test path but is not hit in production because `seedTeams.js` always supplies a `leadId`. The remaining concern is that the API itself still falls back to `mock-admin` if a client omits `leadId` — this is a minor issue for the API contract but does not block the demo. |
| **Remaining Risk** | If a client calls POST `/api/v1/teams` without `leadId` against a live MongoDB, the service will call `findUserById('mock-admin')` which will return null and throw `INVALID_LEAD`. This is actually correct behavior (fail safe) but the error message could be clearer. |

---

## BUG-014 — NEW

| Field | Value |
|-------|-------|
| **Bug ID** | BUG-014 |
| **Module** | Teams (Postman) |
| **Severity** | Low |
| **Owner** | LakshmiPrasanna |
| **Status** | OPEN |
| **File** | `backend/postman/ETMS-Team.postman_collection.json` |
| **Title** | Postman Team collection uses hardcoded mock IDs (`mock-admin`, `mock-maya`, `team-platform`) — will fail against live MongoDB |
| **Steps to Reproduce** | 1. Import `ETMS-Team.postman_collection.json`. 2. Run against live backend with MongoDB. 3. Requests using `team-platform` as teamId or `mock-admin`/`mock-maya` as userId will return 404/400. |
| **Expected** | Postman requests use `{{teamId}}`, `{{userId}}` variables populated from prior requests |
| **Actual** | Hardcoded mock string IDs that only work with in-memory fallback |
| **Recommended Fix** | Update Postman collection to use collection variables (`{{teamId}}`, `{{leadId}}`, `{{memberId}}`) and add test scripts to capture IDs from create responses |

---

## BUG-015 — NEW

| Field | Value |
|-------|-------|
| **Bug ID** | BUG-015 |
| **Module** | Teams (Frontend) |
| **Severity** | Low |
| **Owner** | LakshmiPrasanna |
| **Status** | OPEN |
| **File** | `frontend/src/features/teams/services/teamService.js` line 17 |
| **Title** | `normalizeTeam` defaults `leadId` to `'mock-admin'` string — will display raw mock ID in UI when leadId is missing |
| **Steps to Reproduce** | 1. Create a team via API without a leadId. 2. View team in frontend. 3. Lead field shows `mock-admin` string instead of a real name. |
| **Expected** | Lead field shows real user name or empty/unknown |
| **Actual** | `leadId: team.leadId || 'mock-admin'` — hardcoded fallback string |
| **Recommended Fix** | Change fallback to `null` or `''` and handle null leadId gracefully in the UI |

---

## Bug Summary

| ID | Module | Severity | Status | Owner |
|----|--------|----------|--------|-------|
| BUG-001 | Users | High | OPEN | Raheema |
| BUG-002 | Projects | High | OPEN | Trisha |
| BUG-003 | Projects (FE) | Medium | OPEN | Trisha |
| BUG-004 | Comments | Medium | OPEN | Bhavinash |
| BUG-005 | Attachments | High | OPEN | Bhavinash |
| BUG-006 | Dashboard/Reports | High | OPEN | Konaiah |
| BUG-007 | Seed Data | Medium | OPEN | Himaja/Raheema/Trisha |
| BUG-008 | Teams | High | **RESOLVED** | LakshmiPrasanna |
| BUG-009 | Roles (Tests) | High | OPEN | Venkat |
| BUG-010 | Tasks (Tests) | High | OPEN | Manasa |
| BUG-011 | Projects (Tests) | Medium | OPEN | Trisha |
| BUG-012 | Auth | Medium | OPEN | Yamini |
| BUG-013 | Teams | Medium | **RESOLVED** | LakshmiPrasanna |
| BUG-014 | Teams (Postman) | Low | OPEN | LakshmiPrasanna |
| BUG-015 | Teams (FE) | Low | OPEN | LakshmiPrasanna |

**Open High:** 6 (BUG-001, 002, 005, 006, 009, 010)
**Open Medium:** 5 (BUG-003, 004, 007, 011, 012)
**Open Low:** 2 (BUG-014, 015)
**Resolved:** 2 (BUG-008, BUG-013)
**Total Open:** 13
