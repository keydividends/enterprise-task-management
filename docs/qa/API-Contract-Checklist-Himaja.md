# API Contract Checklist — Himaja

**Last Updated:** Initial inspection run  
**Status:** Phase 1 complete — routes inspected against app.js and route files

---

## Legend

- ✅ Implemented & registered
- ⚠️ Partial / needs verification
- ❌ Not implemented
- 🔴 CONTRACT MISMATCH

---

## Auth — Owner: Yamini

| Method | Path | Auth | Permission | Status | Notes |
|--------|------|------|------------|--------|-------|
| POST | `/api/v1/auth/register` | None | None | ✅ | Implemented |
| POST | `/api/v1/auth/login` | None | None | ✅ | Implemented |
| POST | `/api/v1/auth/logout` | Bearer | None | ✅ | Implemented |
| POST | `/api/v1/auth/logout-all` | Bearer | None | ✅ | Implemented |
| GET | `/api/v1/auth/me` | Bearer | None | ✅ | Implemented |
| GET | `/api/v1/auth/permissions` | Bearer | None | ✅ | Extra endpoint not in original spec — acceptable |
| POST | `/api/v1/auth/forgot-password` | None | None | ✅ | Implemented |
| POST | `/api/v1/auth/reset-password` | None | None | ✅ | Implemented |
| POST | `/api/v1/auth/refresh` | None | None | ✅ | Implemented |
| POST | `/api/v1/auth/google` | None | None | ✅ | Implemented |
| POST | `/api/v1/auth/microsoft` | None | None | ✅ | Implemented |

**Frontend service paths:** authService.js uses `/auth/login`, `/auth/me`, `/auth/logout`, `/auth/forgot-password`, `/auth/reset-password` — all match backend routes. ✅  
**Contract doc:** `docs/Authentication_Contract_Yamini.md` published. ✅

---

## Users — Owner: Raheema

| Method | Path | Auth | Permission | Status | Notes |
|--------|------|------|------------|--------|-------|
| GET | `/api/v1/users` | Bearer | None | ✅ | No RBAC guard — see BUG-001 |
| POST | `/api/v1/users` | Bearer | None | ✅ | No RBAC guard — see BUG-001 |
| GET | `/api/v1/users/:userId` | Bearer | None | ✅ | No RBAC guard |
| PUT | `/api/v1/users/:userId` | Bearer | None | ✅ | No RBAC guard — see BUG-001 |
| PATCH | `/api/v1/users/:userId` | Bearer | None | ✅ | No RBAC guard |
| DELETE | `/api/v1/users/:userId` | Bearer | None | ✅ | No RBAC guard — see BUG-001 |
| PATCH | `/api/v1/users/:userId/status` | Bearer | None | ✅ | No RBAC guard |
| PATCH | `/api/v1/users/:userId/deactivate` | Bearer | None | ✅ | No RBAC guard |
| PATCH | `/api/v1/users/:userId/activate` | Bearer | None | ✅ | No RBAC guard |
| PATCH | `/api/v1/users/:userId/restore` | Bearer | None | ✅ | No RBAC guard |
| GET | `/api/v1/users/search` | Bearer | None | ✅ | |
| GET | `/api/v1/users/me/profile` | Bearer | None | ✅ | |
| PUT | `/api/v1/users/me/profile` | Bearer | None | ✅ | |
| POST | `/api/v1/users/me/avatar` | Bearer | None | ✅ | |
| DELETE | `/api/v1/users/me/avatar` | Bearer | None | ✅ | |
| GET | `/api/v1/users/lookup/:customId` | Bearer | None | ✅ | |
| GET | `/api/v1/users/:userId/profile` | Bearer | None | ✅ | |
| GET | `/api/v1/users/:userId/projects` | Bearer | None | ✅ | |
| GET | `/api/v1/users/:userId/teams` | Bearer | None | ✅ | |
| GET | `/api/v1/users/:userId/workload` | Bearer | None | ✅ | |

**Frontend service paths:** userService.js paths all match backend routes. ✅  
**Issue:** No `authorize()` middleware on any user route. Admin-only actions (create, delete, update status) are unprotected by RBAC. → BUG-001

---

## Roles & Permissions — Owner: Venkat

| Method | Path | Auth | Permission | Status | Notes |
|--------|------|------|------------|--------|-------|
| GET | `/api/v1/roles` | Bearer | None | ✅ | |
| POST | `/api/v1/roles` | Bearer | ROLE_CREATE | ✅ | |
| GET | `/api/v1/roles/:roleId` | Bearer | None | ✅ | |
| PATCH | `/api/v1/roles/:roleId` | Bearer | ROLE_UPDATE | ✅ | |
| DELETE | `/api/v1/roles/:roleId` | Bearer | ROLE_DELETE | ✅ | |
| GET | `/api/v1/roles/:roleId/permissions` | Bearer | None | ✅ | |
| PUT | `/api/v1/roles/:roleId/permissions` | Bearer | ROLE_MANAGE | ✅ | |
| GET | `/api/v1/permissions` | Bearer | None | ✅ | |

**Frontend service paths:** roleService.js paths all match backend routes. ✅  
**RBAC:** Properly guarded with `authorize()`. ✅

---

## Projects — Owner: Trisha

| Method | Path | Auth | Permission | Status | Notes |
|--------|------|------|------------|--------|-------|
| GET | `/api/v1/projects` | Bearer | None | ✅ | No RBAC guard — see BUG-002 |
| POST | `/api/v1/projects` | Bearer | None | ✅ | No RBAC guard — see BUG-002 |
| GET | `/api/v1/projects/:projectId` | Bearer | None | ✅ | |
| PATCH | `/api/v1/projects/:projectId` | Bearer | None | ✅ | No RBAC guard |
| DELETE | `/api/v1/projects/:projectId` | Bearer | None | ✅ | No RBAC guard |
| PATCH | `/api/v1/projects/:projectId/restore` | Bearer | None | ✅ | |
| GET | `/api/v1/projects/:projectId/members` | Bearer | None | ✅ | |
| POST | `/api/v1/projects/:projectId/members` | Bearer | None | ✅ | No RBAC guard |
| DELETE | `/api/v1/projects/:projectId/members/:userId` | Bearer | None | ✅ | No RBAC guard |
| GET | `/api/v1/projects/:projectId/tasks/summary` | Bearer | None | ✅ | |

**Frontend service paths:** projectService.js paths all match backend routes. ✅  
**Issue:** No `authorize()` middleware on any project route. → BUG-002  
**Issue:** projectService.js uses `withFallback` with hardcoded mock data — silently hides API failures. → BUG-003

---

## Teams — Owner: LakshmiPrasanna

| Method | Path | Auth | Permission | Status | Notes |
|--------|------|------|------------|--------|-------|
| GET | `/api/v1/teams` | Bearer | TEAM_VIEW | ✅ | |
| POST | `/api/v1/teams` | Bearer | TEAM_CREATE | ✅ | |
| GET | `/api/v1/teams/:teamId` | Bearer | TEAM_VIEW | ✅ | |
| PATCH | `/api/v1/teams/:teamId` | Bearer | TEAM_UPDATE | ✅ | |
| DELETE | `/api/v1/teams/:teamId` | Bearer | TEAM_DELETE | ✅ | |
| PATCH | `/api/v1/teams/:teamId/restore` | Bearer | TEAM_DELETE | ✅ | |
| GET | `/api/v1/teams/:teamId/summary` | Bearer | TEAM_VIEW | ✅ | |
| GET | `/api/v1/teams/:teamId/projects` | Bearer | TEAM_VIEW | ✅ | |
| GET | `/api/v1/teams/:teamId/members` | Bearer | TEAM_VIEW | ✅ | |
| POST | `/api/v1/teams/:teamId/members` | Bearer | TEAM_MANAGE_MEMBERS | ✅ | |
| PUT | `/api/v1/teams/:teamId/members/:userId` | Bearer | TEAM_MANAGE_MEMBERS | ✅ | |
| DELETE | `/api/v1/teams/:teamId/members/:userId` | Bearer | TEAM_MANAGE_MEMBERS | ✅ | |
| PATCH | `/api/v1/teams/:teamId/lead` | Bearer | TEAM_UPDATE | ✅ | |
| PATCH | `/api/v1/teams/:teamId/deactivate` | Bearer | TEAM_UPDATE | ✅ | |
| PATCH | `/api/v1/teams/:teamId/activate` | Bearer | TEAM_UPDATE | ✅ | |

**Frontend service paths:** teamService.js paths all match backend routes. ✅  
**RBAC:** Fully guarded. ✅  
**Sprint endpoints:** Not implemented — no `/api/v1/sprints` or `/api/v1/teams/:teamId/sprints` routes registered. → BLOCKED

---

## Tasks — Owner: Manasa

| Method | Path | Auth | Permission | Status | Notes |
|--------|------|------|------------|--------|-------|
| GET | `/api/v1/tasks` | Bearer | TASK_VIEW | ✅ | |
| POST | `/api/v1/tasks` | Bearer | TASK_CREATE | ✅ | |
| GET | `/api/v1/tasks/board` | Bearer | TASK_VIEW | ✅ | |
| GET | `/api/v1/tasks/:taskId` | Bearer | TASK_VIEW | ✅ | |
| PUT | `/api/v1/tasks/:taskId` | Bearer | TASK_UPDATE | ✅ | |
| PATCH | `/api/v1/tasks/:taskId` | Bearer | TASK_UPDATE | ✅ | |
| DELETE | `/api/v1/tasks/:taskId` | Bearer | TASK_DELETE | ✅ | |
| PATCH | `/api/v1/tasks/:taskId/restore` | Bearer | TASK_DELETE | ✅ | |
| PATCH | `/api/v1/tasks/:taskId/status` | Bearer | TASK_UPDATE | ✅ | |
| PATCH | `/api/v1/tasks/:taskId/priority` | Bearer | TASK_UPDATE | ✅ | |
| PATCH | `/api/v1/tasks/:taskId/assignee` | Bearer | TASK_ASSIGN | ✅ | |
| DELETE | `/api/v1/tasks/:taskId/assignee` | Bearer | TASK_ASSIGN | ✅ | |
| GET | `/api/v1/tasks/:taskId/history` | Bearer | TASK_VIEW | ✅ | |
| POST | `/api/v1/tasks/:taskId/labels` | Bearer | TASK_UPDATE | ✅ | |
| DELETE | `/api/v1/tasks/:taskId/labels/:labelId` | Bearer | TASK_UPDATE | ✅ | |
| POST | `/api/v1/tasks/:taskId/checklists` | Bearer | TASK_UPDATE | ✅ | |
| GET | `/api/v1/tasks/:taskId/checklists` | Bearer | TASK_VIEW | ✅ | |
| GET | `/api/v1/projects/:projectId/tasks` | Bearer | TASK_VIEW | ✅ | |
| GET | `/api/v1/projects/:projectId/labels` | Bearer | TASK_VIEW | ✅ | |
| POST | `/api/v1/projects/:projectId/labels` | Bearer | TASK_UPDATE | ✅ | |
| PATCH | `/api/v1/checklists/:checklistId` | Bearer | TASK_UPDATE | ✅ | |
| DELETE | `/api/v1/checklists/:checklistId` | Bearer | TASK_UPDATE | ✅ | |
| POST | `/api/v1/checklists/:checklistId/items` | Bearer | TASK_UPDATE | ✅ | |
| PUT | `/api/v1/checklists/:checklistId/items/:itemId` | Bearer | TASK_UPDATE | ✅ | |
| PATCH | `/api/v1/checklists/:checklistId/items/:itemId/complete` | Bearer | TASK_UPDATE | ✅ | |
| DELETE | `/api/v1/checklists/:checklistId/items/:itemId` | Bearer | TASK_UPDATE | ✅ | |

**Frontend service paths:** taskService.js paths all match backend routes. ✅  
**RBAC:** Fully guarded. ✅

---

## Comments — Owner: Bhavinash

| Method | Path | Auth | Permission | Status | Notes |
|--------|------|------|------------|--------|-------|
| GET | `/api/v1/tasks/:taskId/comments` | Bearer | TASK_VIEW | ✅ | |
| POST | `/api/v1/tasks/:taskId/comments` | Bearer | TASK_VIEW | ✅ | ⚠️ Should use COMMENT_CREATE — see BUG-004 |
| PATCH | `/api/v1/comments/:commentId` | Bearer | TASK_VIEW | ✅ | ⚠️ Should use COMMENT_UPDATE — see BUG-004 |
| DELETE | `/api/v1/comments/:commentId` | Bearer | TASK_VIEW | ✅ | ⚠️ Should use COMMENT_DELETE — see BUG-004 |

**Frontend service paths:** commentService.js paths all match backend routes. ✅  
**Issue:** Comment routes use `TASK_VIEW` permission for create/edit/delete instead of `COMMENT_CREATE`/`COMMENT_UPDATE`/`COMMENT_DELETE`. Permissions exist in seed but are not used. → BUG-004

---

## Attachments — Owner: Bhavinash

| Method | Path | Auth | Permission | Status | Notes |
|--------|------|------|------------|--------|-------|
| GET | `/api/v1/tasks/:taskId/attachments` | Bearer | None | ✅ | ⚠️ No permission guard |
| POST | `/api/v1/tasks/:taskId/attachments` | Bearer | None | ✅ | ⚠️ No ATTACHMENT_UPLOAD guard — see BUG-005 |
| GET | `/api/v1/attachments/:attachmentId/download` | Bearer | None | ✅ | ⚠️ No permission guard |
| DELETE | `/api/v1/attachments/:attachmentId` | Bearer | None | ✅ | ⚠️ No ATTACHMENT_DELETE guard — see BUG-005 |

**Frontend service paths:** attachmentService.js paths all match backend routes. ✅  
**Issue:** Attachment routes have no `authorize()` middleware at all. → BUG-005

---

## Dashboard & Reports — Owner: Konaiah

| Method | Path | Auth | Permission | Status | Notes |
|--------|------|------|------------|--------|-------|
| GET | `/api/v1/dashboard/summary` | Bearer | `DASHBOARD_VIEW` | ✅ | Implemented |
| GET | `/api/v1/dashboard/tasks-by-status` | Bearer | `DASHBOARD_VIEW` | ✅ | Implemented |
| GET | `/api/v1/dashboard/tasks-by-priority` | Bearer | `DASHBOARD_VIEW` | ✅ | Implemented |
| GET | `/api/v1/dashboard/team-workload` | Bearer | `DASHBOARD_VIEW` or `REPORT_VIEW` | ✅ | Implemented |
| GET | `/api/v1/dashboard/widgets` | Bearer | Authenticated | ✅ | Implemented |
| PUT | `/api/v1/dashboard/widgets` | Bearer | Authenticated | ✅ | Implemented |
| GET | `/api/v1/reports/projects/progress` | Bearer | `REPORT_VIEW` | ✅ | Implemented |
| GET | `/api/v1/reports/tasks/status` | Bearer | `REPORT_VIEW` | ✅ | Implemented |
| GET | `/api/v1/reports/tasks/overdue` | Bearer | `REPORT_VIEW` | ✅ | Implemented |
| GET | `/api/v1/reports/teams/workload` | Bearer | `REPORT_VIEW` | ✅ | Implemented |

**Frontend:** Dashboard and reports pages use dashboard/report services and include loading, empty, error, permission, filter, and widget-save states. ✅
**Status: IMPLEMENTED — runtime regression is pending local Node/dependency compatibility.**

---

## Summary

| Module | Routes Registered | RBAC Applied | Frontend Paths Match | Status |
|--------|------------------|--------------|----------------------|--------|
| Auth | ✅ 11 routes | ✅ | ✅ | COMPLETE |
| Users | ✅ 20 routes | ❌ Missing | ✅ | PARTIAL |
| Roles | ✅ 8 routes | ✅ | ✅ | COMPLETE |
| Projects | ✅ 10 routes | ❌ Missing | ✅ | PARTIAL |
| Teams | ✅ 15 routes | ✅ | ✅ | COMPLETE |
| Tasks | ✅ 26 routes | ✅ | ✅ | COMPLETE |
| Comments | ✅ 4 routes | ⚠️ Wrong perms | ✅ | PARTIAL |
| Attachments | ✅ 4 routes | ❌ Missing | ✅ | PARTIAL |
| Dashboard | ❌ 0 routes | ❌ | ❌ | NOT STARTED |
| Reports | ❌ 0 routes | ❌ | ❌ | NOT STARTED |
