# Final Definition of Done — Himaja

**Purpose:** Track DoD status for every module. Updated as modules stabilize.

---

## Global DoD Criteria

For each module to be considered DONE:

1. All assigned API endpoints are implemented and registered
2. All endpoints require authentication (Bearer token)
3. Permission-sensitive endpoints use `authorize()` with correct permission keys
4. Frontend service paths match backend route paths exactly
5. Frontend pages are registered in AppRoutes.jsx
6. Seed data supports the demo flow for this module
7. At least one backend test file exists
8. Postman collection covers the module's endpoints
9. No known Critical or High severity bugs open

---

## Module DoD Status

### Auth — Owner: Yamini

| Criterion | Status | Notes |
|-----------|--------|-------|
| All endpoints implemented | ✅ | 11 routes |
| Authentication required | ✅ | Protected routes use authenticate |
| RBAC applied correctly | ✅ | N/A for auth module |
| Frontend paths match | ✅ | authService.js verified |
| Frontend pages registered | ✅ | Login, Register, ForgotPassword, ResetPassword |
| Seed data ready | ✅ | admin@etms.com, demo@etms.com seeded |
| Backend tests exist | ✅ | auth.test.js — comprehensive |
| Postman collection exists | ✅ | ETMS-Auth.postman_collection.json |
| No open High/Critical bugs | ✅ | None found |
| **DoD Status** | ✅ **COMPLETE** | |

---

### Users — Owner: Raheema

| Criterion | Status | Notes |
|-----------|--------|-------|
| All endpoints implemented | ✅ | 20 routes |
| Authentication required | ✅ | All routes use authenticate |
| RBAC applied correctly | ❌ | BUG-001: No authorize() on any route |
| Frontend paths match | ✅ | userService.js verified |
| Frontend pages registered | ✅ | 5 pages in AppRoutes |
| Seed data ready | ✅ | 3 users seeded |
| Backend tests exist | ✅ | users.test.js exists |
| Postman collection exists | ✅ | ETMS-Users.postman_collection.json |
| No open High/Critical bugs | ❌ | BUG-001 open |
| **DoD Status** | ⚠️ **PARTIAL** | Fix BUG-001 |

---

### Roles & Permissions — Owner: Venkat

| Criterion | Status | Notes |
|-----------|--------|-------|
| All endpoints implemented | ✅ | 8 routes |
| Authentication required | ✅ | |
| RBAC applied correctly | ✅ | ROLE_CREATE/UPDATE/DELETE/MANAGE used |
| Frontend paths match | ✅ | roleService.js verified |
| Frontend pages registered | ✅ | 4 pages in AppRoutes |
| Seed data ready | ✅ | 4 roles, 31 permissions seeded |
| Backend tests exist | ✅ | roles.test.js, role.repository.test.js, role.service.test.js |
| Postman collection exists | ✅ | ETMS-RolePermission.postman_collection.json |
| No open High/Critical bugs | ✅ | None found |
| **DoD Status** | ✅ **COMPLETE** | |

---

### Projects — Owner: Trisha

| Criterion | Status | Notes |
|-----------|--------|-------|
| All endpoints implemented | ✅ | 10 routes |
| Authentication required | ✅ | All routes use authenticate |
| RBAC applied correctly | ❌ | BUG-002: No authorize() on any route |
| Frontend paths match | ✅ | projectService.js verified |
| Frontend pages registered | ✅ | 4 pages in AppRoutes |
| Seed data ready | ⚠️ | BUG-007: ID mismatch with users |
| Backend tests exist | ✅ | projects.test.js exists |
| Postman collection exists | ✅ | ETMS-Projects.postman_collection.json |
| No open High/Critical bugs | ❌ | BUG-002, BUG-003, BUG-007 open |
| **DoD Status** | ⚠️ **PARTIAL** | Fix BUG-002, BUG-003, BUG-007 |

---

### Teams — Owner: LakshmiPrasanna

| Criterion | Status | Notes |
|-----------|--------|-------|
| All endpoints implemented | ✅ | 15 routes |
| Authentication required | ✅ | |
| RBAC applied correctly | ✅ | All team permissions used |
| Frontend paths match | ✅ | teamService.js verified |
| Frontend pages registered | ✅ | 5 pages in AppRoutes |
| Seed data ready | ✅ | BUG-008 RESOLVED — seedTeams.js resolves real user IDs via email lookup; MongoDB persistence confirmed |
| Backend tests exist | ✅ | teams.test.js + teams.multiteam.test.js — comprehensive (21 tests) |
| Postman collection exists | ⚠️ | ETMS-Team.postman_collection.json (BUG-014: hardcoded mock IDs in collection) |
| No open High/Critical bugs | ✅ | BUG-008 resolved; only Low severity BUG-014/015 remain |
| **DoD Status** | ⚠️ **PARTIAL** | Only Low-severity items remain (BUG-014 Postman IDs, BUG-015 lead fallback) |

---

### Tasks — Owner: Manasa

| Criterion | Status | Notes |
|-----------|--------|-------|
| All endpoints implemented | ✅ | 26 routes |
| Authentication required | ✅ | |
| RBAC applied correctly | ✅ | TASK_VIEW/CREATE/UPDATE/DELETE/ASSIGN used |
| Frontend paths match | ✅ | taskService.js verified |
| Frontend pages registered | ✅ | 5 pages in AppRoutes |
| Seed data ready | ✅ | 15 tasks, 5 labels, 1 checklist seeded |
| Backend tests exist | ✅ | task.test.js, task.api.test.js |
| Postman collection exists | ✅ | ETMS-Tasks.postman_collection.json |
| No open High/Critical bugs | ✅ | None found |
| **DoD Status** | ✅ **COMPLETE** | Sprint integration pending (minor) |

---

### Comments & Attachments — Owner: Bhavinash

| Criterion | Status | Notes |
|-----------|--------|-------|
| All endpoints implemented | ✅ | 4 comment + 4 attachment routes |
| Authentication required | ✅ | |
| RBAC applied correctly | ❌ | BUG-004 (wrong comment perms), BUG-005 (no attachment perms) |
| Frontend paths match | ✅ | commentService.js, attachmentService.js verified |
| Frontend pages registered | ✅ | Panels integrated in task detail |
| Seed data ready | ❌ | No seed comments or attachment DB records |
| Backend tests exist | ⚠️ | No dedicated comments/attachments test file found |
| Postman collection exists | ⚠️ | Not found in postman/ directory |
| No open High/Critical bugs | ❌ | BUG-004, BUG-005 open |
| **DoD Status** | ⚠️ **PARTIAL** | Fix BUG-004, BUG-005; add tests and Postman |

---

### Dashboard & Reports — Owner: Konaiah

| Criterion | Status | Notes |
|-----------|--------|-------|
| All endpoints implemented | ❌ | No backend module |
| Authentication required | ❌ | N/A |
| RBAC applied correctly | ❌ | N/A |
| Frontend paths match | ❌ | No feature folder, no service |
| Frontend pages registered | ⚠️ | DashboardPage exists but uses static data |
| Seed data ready | ❌ | No dashboard widgets seeded |
| Backend tests exist | ❌ | None |
| Postman collection exists | ❌ | None |
| No open High/Critical bugs | ❌ | BUG-006 open |
| **DoD Status** | ❌ **NOT STARTED** | Konaiah to implement |

---

## Overall DoD Summary

| Module | DoD Status | Blocking Bugs |
|--------|-----------|---------------|
| Auth | ✅ COMPLETE | None |
| Users | ⚠️ PARTIAL | BUG-001 |
| Roles | ✅ COMPLETE | None |
| Projects | ⚠️ PARTIAL | BUG-002, BUG-003, BUG-007 |
| Teams | ⚠️ PARTIAL | BUG-008 resolved; only Low BUG-014/015 remain |
| Tasks | ✅ COMPLETE | None |
| Comments/Attachments | ⚠️ PARTIAL | BUG-004, BUG-005 |
| Dashboard/Reports | ❌ NOT STARTED | BUG-006 |

**Modules fully done: 3 / 8** (Auth, Roles, Tasks)  
**Modules partially done: 4 / 8** (Users, Projects, Teams, Comments/Attachments)  
**Modules not started: 1 / 8** (Dashboard/Reports)
