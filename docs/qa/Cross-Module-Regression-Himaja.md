# Cross-Module Regression — Himaja

**Purpose:** Full end-to-end regression across all modules. Run after major modules are stable.  
**Prerequisite:** Auth, Users, Roles, Projects, Teams, Tasks, Comments, Attachments all passing smoke tests.

---

## Regression Flow

```
Login → Users/Roles → Project → Team → Task → Comment → Attachment → Dashboard → Logout
```

---

## Phase 1 — Authentication

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| R1.1 | POST `/api/v1/auth/login` (admin@etms.com / Admin@123) | 200, accessToken returned | NOT TESTED | |
| R1.2 | Store accessToken, use in all subsequent requests | Token attached via Authorization header | NOT TESTED | |
| R1.3 | GET `/api/v1/auth/me` | 200, user.role = ADMIN | NOT TESTED | |
| R1.4 | GET `/api/v1/auth/permissions` | 200, permissions array | NOT TESTED | |

---

## Phase 2 — User & Role Setup

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| R2.1 | GET `/api/v1/users` | 200, list includes admin and demo users | NOT TESTED | |
| R2.2 | POST `/api/v1/users` (create test user) | 201, user created | NOT TESTED | |
| R2.3 | GET `/api/v1/roles` | 200, includes ADMIN, USER, DEVELOPER, MANAGER | NOT TESTED | |
| R2.4 | GET `/api/v1/permissions` | 200, 31 permissions | NOT TESTED | |
| R2.5 | PUT `/api/v1/roles/:roleId/permissions` (assign perms to role) | 200 | NOT TESTED | |
| R2.6 | Verify new user has correct permissions after role assignment | permissions array matches role | NOT TESTED | |

---

## Phase 3 — Project Creation & Membership

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| R3.1 | POST `/api/v1/projects` (create regression project) | 201, project created | NOT TESTED | |
| R3.2 | GET `/api/v1/projects/:projectId` | 200, project details | NOT TESTED | |
| R3.3 | POST `/api/v1/projects/:projectId/members` (add test user) | 201, member added | NOT TESTED | |
| R3.4 | GET `/api/v1/projects/:projectId/members` | 200, includes test user | NOT TESTED | |
| R3.5 | Verify non-member cannot access project tasks | 403 or empty result | NOT TESTED | Depends on project isolation implementation |

---

## Phase 4 — Team Creation & Membership

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| R4.1 | POST `/api/v1/teams` (create regression team) | 201 | NOT TESTED | |
| R4.2 | GET `/api/v1/teams/:teamId` | 200 | NOT TESTED | |
| R4.3 | POST `/api/v1/teams/:teamId/members` (add test user) | 201 | NOT TESTED | |
| R4.4 | GET `/api/v1/teams/:teamId/members` | 200, includes test user | NOT TESTED | |
| R4.5 | PATCH `/api/v1/teams/:teamId/lead` (assign lead) | 200 | NOT TESTED | |
| R4.6 | Team data persists after backend restart | Data still present | ✅ READY | BUG-008 RESOLVED — team.repository.js uses MongoDB when connected; seedTeams.js resolves real user IDs |

---

## Phase 5 — Task Lifecycle

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| R5.1 | POST `/api/v1/tasks` (create task in regression project) | 201, task with taskKey | NOT TESTED | |
| R5.2 | GET `/api/v1/tasks/:taskId` | 200, task details | NOT TESTED | |
| R5.3 | PATCH `/api/v1/tasks/:taskId/status` (TODO → IN_PROGRESS) | 200 | NOT TESTED | |
| R5.4 | PATCH `/api/v1/tasks/:taskId/status` (IN_PROGRESS → IN_REVIEW) | 200 | NOT TESTED | |
| R5.5 | PATCH `/api/v1/tasks/:taskId/status` (DONE → IN_PROGRESS) | 400 invalid transition | NOT TESTED | |
| R5.6 | PATCH `/api/v1/tasks/:taskId/assignee` (assign test user) | 200 | NOT TESTED | |
| R5.7 | GET `/api/v1/tasks/board` | 200, task appears in correct column | NOT TESTED | |
| R5.8 | GET `/api/v1/projects/:projectId/tasks` | 200, includes regression task | NOT TESTED | |
| R5.9 | POST `/api/v1/tasks/:taskId/checklists` | 201 | NOT TESTED | |
| R5.10 | POST `/api/v1/checklists/:checklistId/items` | 201 | NOT TESTED | |
| R5.11 | PATCH `/api/v1/checklists/:checklistId/items/:itemId/complete` | 200 | NOT TESTED | |

---

## Phase 6 — Comments

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| R6.1 | POST `/api/v1/tasks/:taskId/comments` | 201, comment created | NOT TESTED | |
| R6.2 | GET `/api/v1/tasks/:taskId/comments` | 200, includes new comment | NOT TESTED | |
| R6.3 | PATCH `/api/v1/comments/:commentId` (edit) | 200 | NOT TESTED | |
| R6.4 | DELETE `/api/v1/comments/:commentId` | 200 | NOT TESTED | |
| R6.5 | POST comment without auth → 401 | 401 | NOT TESTED | |

---

## Phase 7 — Attachments

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| R7.1 | POST `/api/v1/tasks/:taskId/attachments` (upload file) | 201, attachment metadata | NOT TESTED | |
| R7.2 | GET `/api/v1/tasks/:taskId/attachments` | 200, includes uploaded file | NOT TESTED | |
| R7.3 | GET `/api/v1/attachments/:attachmentId/download` | 200/redirect to file | NOT TESTED | |
| R7.4 | DELETE `/api/v1/attachments/:attachmentId` | 200 | NOT TESTED | |
| R7.5 | Upload without auth → 401 | 401 | NOT TESTED | |

---

## Phase 8 — Dashboard & Reports

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| R8.1 | GET `/api/v1/dashboard/summary` | 200, counts match seeded data | READY | Dashboard API test added |
| R8.2 | GET `/api/v1/dashboard/tasks-by-status` | 200, status groups | READY | Dashboard API test added |
| R8.3 | GET `/api/v1/reports/projects/progress` | 200 | READY | Canonical route implemented |
| R8.4 | GET `/api/v1/reports/tasks/overdue` | 200 | READY | Canonical route implemented |
| R8.5 | Dashboard numbers reflect tasks created in R5 | Counts updated | READY | Live dashboard service connected |

---

## Phase 9 — RBAC Cross-Module

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| R9.1 | Login as MEMBER user (no TASK_CREATE) | 200 | NOT TESTED | |
| R9.2 | POST `/api/v1/tasks` as MEMBER → 403 | 403 PERMISSION_DENIED | NOT TESTED | |
| R9.3 | POST `/api/v1/roles` as MEMBER → 403 | 403 PERMISSION_DENIED | NOT TESTED | |
| R9.4 | GET `/api/v1/teams` as MEMBER (no TEAM_VIEW) → 403 | 403 PERMISSION_DENIED | NOT TESTED | |
| R9.5 | POST `/api/v1/users` as MEMBER → should 403 | BLOCKED | BUG-001 |
| R9.6 | POST `/api/v1/projects` as MEMBER → should 403 | BLOCKED | BUG-002 |

---

## Phase 10 — Logout

| # | Step | Expected | Status | Notes |
|---|------|----------|--------|-------|
| R10.1 | POST `/api/v1/auth/logout` | 200 | NOT TESTED | |
| R10.2 | GET `/api/v1/auth/me` after logout → 401 | 401 | NOT TESTED | |

---

## Regression Readiness

| Module | Ready for Regression | Blocker |
|--------|---------------------|---------|
| Auth | ✅ Ready | None |
| Users | ⚠️ Partial | BUG-001 (RBAC missing) |
| Roles | ✅ Ready | None |
| Projects | ⚠️ Partial | BUG-002 (RBAC missing), BUG-007 (seed IDs) |
| Teams | ✅ Ready | BUG-008 resolved (MongoDB persistence) |
| Tasks | ✅ Ready | None |
| Comments | ⚠️ Partial | BUG-004 (wrong permissions) |
| Attachments | ⚠️ Partial | BUG-005 (no RBAC) |
| Dashboard | ⚠️ Code Ready | Runtime test requires compatible Node/dependencies |
| Reports | ⚠️ Code Ready | Runtime test requires compatible Node/dependencies |

**Full regression cannot run until BUG-006 (Dashboard/Reports) is resolved.** BUG-008 (Teams persistence) is resolved, so teams are regression-ready.
