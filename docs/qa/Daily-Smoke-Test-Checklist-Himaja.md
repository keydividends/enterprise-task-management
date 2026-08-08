# Daily Smoke Test Checklist — Himaja

**Last Updated:** Phase 3 — actual test run completed
**Runner:** `node --test` (Node.js v22.16.0, no live server)

---

## Actual Test Run Results — `node --test`

| Test File | Tests | Pass | Fail | Notes |
|-----------|-------|------|------|-------|
| `auth.test.js` | 21 | 21 | 0 | All pass |
| `projects.test.js` | 9 | 7 | 2 | BUG-011: addMember/removeMember fail (USER_NOT_FOUND) |
| `role.repository.test.js` | 1 | 1 | 0 | Pass |
| `role.service.test.js` | 4 | 4 | 0 | Pass |
| `roles.test.js` | 0 | 0 | CRASH | BUG-009: Jest syntax in node:test runner |
| `task.api.test.js` | 0 | 0 | CRASH | BUG-010: missing mongodb-memory-server |
| `task.test.js` | 24 | 24 | 0 | All pass |
| `teams.multiteam.test.js` | 5 | 5 | 0 | NEW — all 5 multi-team scenarios pass |
| `teams.test.js` | 16 | 16 | 0 | All pass |
| `users.test.js` | 11 | 11 | 0 | All pass |
| **TOTAL** | **93** | **89** | **4** | 2 assertion failures + 2 file crashes |

---

## Standard Daily Smoke Flow (requires live server + MongoDB)

### Step 1 — Backend Startup

| # | Test | Status | Notes |
|---|------|--------|-------|
| 1.1 | Backend starts without errors (`npm run dev`) | NOT TESTED | Requires local run |
| 1.2 | `GET /health` returns `{ success: true }` | NOT TESTED | |
| 1.3 | No unhandled errors in startup log | NOT TESTED | |

### Step 2 — Frontend Startup

| # | Test | Status | Notes |
|---|------|--------|-------|
| 2.1 | Frontend builds without errors (`npm run dev`) | NOT TESTED | |
| 2.2 | `http://localhost:5173` loads | NOT TESTED | |
| 2.3 | Unauthenticated `/dashboard` redirects to `/login` | NOT TESTED | |
| 2.4 | No console errors on `/login` page load | NOT TESTED | |

### Step 3 — Login

| # | Test | Status | Notes |
|---|------|--------|-------|
| 3.1 | POST `/api/v1/auth/login` (admin@etms.com / Admin@123) → 200 | NOT TESTED | |
| 3.2 | Response contains `accessToken`, `refreshToken`, `user` | NOT TESTED | |
| 3.3 | `user.role` = ADMIN, `user.status` = ACTIVE | NOT TESTED | |
| 3.4 | Login with wrong password → 401 AUTH_INVALID_CREDENTIALS | NOT TESTED | |
| 3.5 | Login with disabled@etms.com → 401 USER_INACTIVE | NOT TESTED | |
| 3.6 | Frontend login form submits and stores token in localStorage | NOT TESTED | |
| 3.7 | After login, redirect to `/dashboard` | NOT TESTED | |

### Step 4 — Auth / Current User

| # | Test | Status | Notes |
|---|------|--------|-------|
| 4.1 | GET `/api/v1/auth/me` with valid token → 200 | NOT TESTED | |
| 4.2 | GET `/api/v1/auth/me` without token → 401 AUTH_REQUIRED | NOT TESTED | |
| 4.3 | GET `/api/v1/auth/permissions` with valid token → 200 | NOT TESTED | |
| 4.4 | POST `/api/v1/auth/refresh` with valid refreshToken → 200 | NOT TESTED | |
| 4.5 | POST `/api/v1/auth/forgot-password` → 200 (same message regardless of email) | NOT TESTED | |

### Step 5 — Users

| # | Test | Status | Notes |
|---|------|--------|-------|
| 5.1 | GET `/api/v1/users` → 200 with list | NOT TESTED | |
| 5.2 | POST `/api/v1/users` (admin) → 201 | NOT TESTED | |
| 5.3 | GET `/api/v1/users/:userId` → 200 | NOT TESTED | |
| 5.4 | GET `/api/v1/users/search?q=admin` → 200 | NOT TESTED | |
| 5.5 | PATCH `/api/v1/users/:userId/status` → 200 | NOT TESTED | |
| 5.6 | POST `/api/v1/users` without token → 401 | NOT TESTED | |
| 5.7 | POST `/api/v1/users` as MEMBER role → 403 | BLOCKED | BUG-001: No RBAC on user routes |

### Step 6 — Roles

| # | Test | Status | Notes |
|---|------|--------|-------|
| 6.1 | GET `/api/v1/roles` → 200 | NOT TESTED | |
| 6.2 | GET `/api/v1/permissions` → 200 | NOT TESTED | |
| 6.3 | POST `/api/v1/roles` (admin) → 201 | NOT TESTED | |
| 6.4 | POST `/api/v1/roles` as MEMBER → 403 | NOT TESTED | |
| 6.5 | GET `/api/v1/roles/:roleId/permissions` → 200 | NOT TESTED | |
| 6.6 | PUT `/api/v1/roles/:roleId/permissions` (admin) → 200 | NOT TESTED | |

### Step 7 — Projects

| # | Test | Status | Notes |
|---|------|--------|-------|
| 7.1 | GET `/api/v1/projects` → 200 | NOT TESTED | |
| 7.2 | POST `/api/v1/projects` (admin) → 201 | NOT TESTED | |
| 7.3 | GET `/api/v1/projects/:projectId` → 200 | NOT TESTED | |
| 7.4 | GET `/api/v1/projects/:projectId/members` → 200 | NOT TESTED | |
| 7.5 | POST `/api/v1/projects/:projectId/members` → 201 | NOT TESTED | |
| 7.6 | POST `/api/v1/projects` as MEMBER → 403 | BLOCKED | BUG-002: No RBAC on project routes |

### Step 8 — Teams

| # | Test | Status | Notes |
|---|------|--------|-------|
| 8.1 | GET `/api/v1/teams` (with TEAM_VIEW) → 200 | NOT TESTED | |
| 8.2 | POST `/api/v1/teams` (with TEAM_CREATE + leadId) → 201 | NOT TESTED | |
| 8.3 | GET `/api/v1/teams/:teamId` → 200 | NOT TESTED | |
| 8.4 | GET `/api/v1/teams/:teamId/members` → 200 | NOT TESTED | |
| 8.5 | POST `/api/v1/teams/:teamId/members` (TEAM_MANAGE_MEMBERS) → 201 | NOT TESTED | |
| 8.6 | GET `/api/v1/teams` without TEAM_VIEW → 403 | NOT TESTED | |
| 8.7 | Add user already in another team → 201 (multi-team allowed) | PASS (unit) | teams.multiteam.test.js TEST3 passes |
| 8.8 | Add user already in same team → 409 TEAM_MEMBER_EXISTS | PASS (unit) | teams.multiteam.test.js TEST2 passes |
| 8.9 | getUserTeams returns all teams for multi-team user | PASS (unit) | teams.multiteam.test.js TEST4 passes |
| 8.10 | Team data persists after backend restart | ✅ READY | BUG-008 RESOLVED — MongoDB persistence confirmed in team.repository.js |

### Step 9 — Tasks

| # | Test | Status | Notes |
|---|------|--------|-------|
| 9.1 | GET `/api/v1/tasks` (TASK_VIEW) → 200 | NOT TESTED | |
| 9.2 | POST `/api/v1/tasks` (TASK_CREATE) → 201 | NOT TESTED | |
| 9.3 | GET `/api/v1/tasks/board` → 200 | NOT TESTED | |
| 9.4 | PATCH `/api/v1/tasks/:taskId/status` → 200 | NOT TESTED | |
| 9.5 | PATCH `/api/v1/tasks/:taskId/assignee` → 200 | NOT TESTED | |
| 9.6 | GET `/api/v1/tasks` without TASK_VIEW → 403 | NOT TESTED | |
| 9.7 | Status transition DONE → IN_PROGRESS → 400 | PASS (unit) | task.test.js canTransition tests pass |

### Step 10 — Comments

| # | Test | Status | Notes |
|---|------|--------|-------|
| 10.1 | GET `/api/v1/tasks/:taskId/comments` → 200 | NOT TESTED | |
| 10.2 | POST `/api/v1/tasks/:taskId/comments` → 201 | NOT TESTED | |
| 10.3 | PATCH `/api/v1/comments/:commentId` → 200 | NOT TESTED | |
| 10.4 | DELETE `/api/v1/comments/:commentId` → 200 | NOT TESTED | |
| 10.5 | POST comment without token → 401 | NOT TESTED | |
| 10.6 | POST comment as MEMBER (no COMMENT_CREATE) → 403 | BLOCKED | BUG-004: wrong permission key used |

### Step 11 — Attachments

| # | Test | Status | Notes |
|---|------|--------|-------|
| 11.1 | GET `/api/v1/tasks/:taskId/attachments` → 200 | NOT TESTED | |
| 11.2 | POST `/api/v1/tasks/:taskId/attachments` (file upload) → 201 | NOT TESTED | |
| 11.3 | GET `/api/v1/attachments/:attachmentId/download` → 200/redirect | NOT TESTED | |
| 11.4 | DELETE `/api/v1/attachments/:attachmentId` → 200 | NOT TESTED | |
| 11.5 | Upload without token → 401 | NOT TESTED | |
| 11.6 | Upload as MEMBER (no ATTACHMENT_UPLOAD) → 403 | BLOCKED | BUG-005: no authorize() on attachment routes |

### Step 12 — Dashboard

| # | Test | Status | Notes |
|---|------|--------|-------|
| 12.1 | GET `/api/v1/dashboard/summary` → 200 | NOT IMPLEMENTED | BUG-006 |
| 12.2 | GET `/api/v1/dashboard/tasks-by-status` → 200 | NOT IMPLEMENTED | BUG-006 |
| 12.3 | Frontend `/dashboard` page loads | NOT TESTED | Page exists but uses static data |
| 12.4 | Dashboard stats reflect real data | NOT IMPLEMENTED | BUG-006 |

### Step 13 — Logout

| # | Test | Status | Notes |
|---|------|--------|-------|
| 13.1 | POST `/api/v1/auth/logout` → 200 | NOT TESTED | |
| 13.2 | GET `/api/v1/auth/me` after logout → 401 | NOT TESTED | |
| 13.3 | Frontend clears localStorage on logout | NOT TESTED | |
| 13.4 | Frontend redirects to `/login` after logout | NOT TESTED | |

---

## Smoke Test Summary

```
Date: Phase 3 verification
Tester: Himaja
Method: node --test (unit/service layer, no live server)

Unit/Service Tests:
  PASS: 89
  FAIL: 4 (2 assertion failures + 2 file crashes)
  BLOCKED: 4 (RBAC gaps on users/projects/comments/attachments)
  NOT IMPLEMENTED: 4 (all dashboard/reports)
  NOT TESTED: ~30 (require live server + MongoDB)

Key findings:
  - Auth: 21/21 pass
  - Teams: 21/21 pass (including 5 new multi-team tests)
  - Tasks (unit): 24/24 pass
  - Users: 11/11 pass
  - Projects: 7/9 pass (BUG-011)
  - Roles API tests: 0 run (BUG-009 crash)
  - Task API tests: 0 run (BUG-010 crash)
```
