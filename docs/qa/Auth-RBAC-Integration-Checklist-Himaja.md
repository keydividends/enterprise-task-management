# Auth & RBAC Integration Checklist — Himaja

**Baseline:** `docs/Authentication_Contract_Yamini.md` + `docs/intern-tasks/RolePermission_Venkat_Complete.md`

---

## Authentication Middleware — `backend/src/middleware/authenticate.js`

| Check | Result | Notes |
|-------|--------|-------|
| Reads `Authorization: Bearer <token>` header | ✅ | |
| Returns 401 if no token | ✅ | Error code: `AUTH_REQUIRED` |
| Verifies JWT via `verifyAccessToken` | ✅ | |
| Populates `req.user` with id, email, firstName, lastName, role, permissions, status | ✅ | Matches Yamini's contract |
| Handles `TokenExpiredError` → 401 `AUTH_TOKEN_EXPIRED` | ✅ | |
| Handles `JsonWebTokenError` → 401 `AUTH_INVALID_TOKEN` | ✅ | |
| **Mock token bypass present** | ⚠️ | `mock-token` and `mock-member-token` bypass JWT verification — acceptable for dev, must be removed before production |

---

## Authorization Middleware — `backend/src/middleware/authorize.js`

| Check | Result | Notes |
|-------|--------|-------|
| ADMIN role bypasses all permission checks | ✅ | |
| Checks `req.user.permissions` array | ✅ | |
| Returns 403 `PERMISSION_DENIED` if permission missing | ✅ | |
| Passes through if no `requiredPermission` argument | ✅ | |

---

## Frontend Token Strategy — `frontend/src/api/axiosClient.js`

| Check | Result | Notes |
|-------|--------|-------|
| Reads token from `localStorage` key `etms_access_token` | ✅ | Matches Yamini's contract |
| Attaches `Authorization: Bearer <token>` to every request | ✅ | |
| On 401 response: clears `etms_access_token` and `etms_user`, redirects to `/login` | ✅ | |

---

## Permission Keys — Venkat's Contract vs Actual Usage

### Permissions defined in `role.seed.js` (31 total)

| Module | Keys | Used in Routes |
|--------|------|---------------|
| USER | USER_VIEW, USER_CREATE, USER_UPDATE, USER_DELETE | ❌ Not used in user.routes.js |
| ROLE | ROLE_VIEW, ROLE_CREATE, ROLE_UPDATE, ROLE_DELETE, ROLE_MANAGE | ✅ Used in role.routes.js |
| PROJECT | PROJECT_VIEW, PROJECT_CREATE, PROJECT_UPDATE, PROJECT_DELETE, PROJECT_MANAGE_MEMBERS | ❌ Not used in project.routes.js |
| TEAM | TEAM_VIEW, TEAM_CREATE, TEAM_UPDATE, TEAM_DELETE, TEAM_MANAGE_MEMBERS | ✅ Used in team.routes.js |
| TASK | TASK_VIEW, TASK_CREATE, TASK_UPDATE, TASK_ASSIGN, TASK_DELETE | ✅ Used in task.routes.js |
| SPRINT | SPRINT_VIEW, SPRINT_CREATE, SPRINT_UPDATE, SPRINT_MANAGE | ❌ Sprint module not implemented |
| DASHBOARD | DASHBOARD_VIEW | ❌ Dashboard module not implemented |
| REPORT | REPORT_VIEW | ❌ Reports module not implemented |
| NOTIFICATION | NOTIFICATION_VIEW | ❌ Not used anywhere |
| ATTACHMENT | ATTACHMENT_UPLOAD, ATTACHMENT_DELETE | ❌ Not used in attachment.routes.js |
| COMMENT | COMMENT_CREATE, COMMENT_UPDATE, COMMENT_DELETE | ❌ Not used in comment.routes.js (uses TASK_VIEW instead) |

---

## RBAC Coverage by Module

| Module | Routes Protected | Correct Permissions | Issues |
|--------|-----------------|--------------------|----|
| Auth | N/A (public + authenticate only) | ✅ | None |
| Users | authenticate only | ❌ | BUG-001: No authorize() on any user route |
| Roles | authenticate + authorize | ✅ | None |
| Projects | authenticate only | ❌ | BUG-002: No authorize() on any project route |
| Teams | authenticate + authorize | ✅ | None |
| Tasks | authenticate + authorize | ✅ | None |
| Comments | authenticate + authorize(TASK_VIEW) | ⚠️ | BUG-004: Wrong permission keys |
| Attachments | authenticate only | ❌ | BUG-005: No authorize() on attachment routes |
| Dashboard | Not implemented | ❌ | BUG-006 |
| Reports | Not implemented | ❌ | BUG-006 |

---

## Unauthorized Access Tests

| Test | Expected | Status |
|------|----------|--------|
| Request without token → 401 | 401 AUTH_REQUIRED | ✅ Verified via middleware code |
| Request with expired token → 401 | 401 AUTH_TOKEN_EXPIRED | ✅ Verified via auth.test.js |
| Request with invalid token → 401 | 401 AUTH_INVALID_TOKEN | ✅ Verified via auth.test.js |
| MEMBER role accessing ROLE_CREATE → 403 | 403 PERMISSION_DENIED | ✅ Verified via authorize middleware |
| MEMBER role accessing user create → 403 | Should be 403 | ❌ FAILS — no authorize() on user routes (BUG-001) |
| MEMBER role accessing project create → 403 | Should be 403 | ❌ FAILS — no authorize() on project routes (BUG-002) |
| MEMBER role accessing attachment delete → 403 | Should be 403 | ❌ FAILS — no authorize() on attachment routes (BUG-005) |

---

## Summary

- Auth middleware: ✅ Correct and matches contract
- Authorization middleware: ✅ Correct logic
- Frontend token handling: ✅ Correct
- Permission key naming: ✅ Consistent between seed and route usage where applied
- RBAC gaps: Users, Projects, Attachments, Comments (wrong keys) — 4 modules affected
