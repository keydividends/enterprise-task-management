# Document 05 -- React UI Blueprint

**Project:** Enterprise Task Management System (ETMS)\
**Document Type:** Frontend / React UI Blueprint\
**Version:** 1.0\
**Frontend:** React + Vite\
**Styling:** Bootstrap-compatible component architecture\
**API Contract:** Document 04 -- REST API Specification\
**Scope:** 50 application screens

------------------------------------------------------------------------

# 1. Purpose

This document defines the complete React user-interface blueprint for
ETMS. It translates the SRS, architecture, database model and REST API
contract into pages, routes, reusable components, user actions,
validations, permissions and API integrations.

The objective is to let frontend interns work independently while
maintaining one consistent application structure.

# 2. Frontend Principles

-   Route-based feature modules.
-   Reusable components instead of duplicated page markup.
-   Centralized API client and authentication handling.
-   Permission-aware navigation and actions.
-   Backend authorization remains authoritative.
-   Loading, empty, success and error states on every data-driven
    screen.
-   Responsive layouts for desktop, tablet and usable mobile views.
-   Accessible labels, keyboard interaction and semantic controls.
-   Paginate large datasets.
-   Keep server state separate from transient form/UI state.
-   Never hardcode access tokens, user IDs, project IDs or API base
    URLs.

# 3. Recommended React Structure

``` text
frontend/
└── src/
    ├── app/
    │   ├── App.jsx
    │   ├── router.jsx
    │   └── providers/
    ├── assets/
    ├── components/
    │   ├── common/
    │   ├── forms/
    │   ├── layout/
    │   ├── feedback/
    │   └── tables/
    ├── features/
    │   ├── auth/
    │   ├── users/
    │   ├── roles/
    │   ├── projects/
    │   ├── teams/
    │   ├── tasks/
    │   ├── sprints/
    │   ├── calendar/
    │   ├── reports/
    │   ├── notifications/
    │   ├── profile/
    │   └── settings/
    ├── hooks/
    ├── services/
    ├── utils/
    ├── constants/
    └── styles/
```

# 4. Application Shell

Authenticated pages use a shared shell:

``` text
+------------------------------------------------------+
| Top Header: Search | Notifications | User Menu       |
+---------------+--------------------------------------+
| Sidebar       | Breadcrumb / Page Header             |
| Dashboard     |                                      |
| My Work       | Main Page Content                    |
| Projects      |                                      |
| Teams         |                                      |
| Tasks         |                                      |
| Calendar      |                                      |
| Reports       |                                      |
| Settings      |                                      |
+---------------+--------------------------------------+
```

Core shared components should include `AppLayout`, `Sidebar`,
`TopNavbar`, `Breadcrumbs`, `PageHeader`, `PermissionGate`,
`LoadingSpinner`, `EmptyState`, `ErrorState`, `ConfirmModal`,
`Pagination`, `SearchInput`, `StatusBadge`, `UserAvatar`, `DataTable`,
`FormField`, and `Toast`.

# 5. Routing and Guards

Use public routes for authentication screens and protected routes for
application screens.

``` jsx
<Route path="/login" element={<LoginPage />} />
<Route element={<ProtectedRoute />}>
  <Route element={<AppLayout />}>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/users" element={<UsersPage />} />
    <Route path="/projects" element={<ProjectsPage />} />
    <Route path="/tasks" element={<TasksPage />} />
  </Route>
</Route>
```

A `PermissionRoute` or `PermissionGate` can control UI access, but API
authorization must still be enforced by the backend.

------------------------------------------------------------------------

# 5. Complete Screen Catalog

## 1. Login

**Route:** `/login`\
**Access:** Public

### Purpose

Email/password authentication, validation, show/hide password,
remember-session option, login errors, redirect to dashboard.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`POST /api/v1/auth/login`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **Public**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 2. Forgot Password

**Route:** `/forgot-password`\
**Access:** Public

### Purpose

Request password reset without exposing whether an account exists.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`POST /api/v1/auth/forgot-password`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **Public**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 3. Reset Password

**Route:** `/reset-password`\
**Access:** Public

### Purpose

Validate reset token, enter new password and confirmation, display
password-policy rules.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`POST /api/v1/auth/reset-password/validate; POST /api/v1/auth/reset-password`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **Public**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 4. Accept Invitation

**Route:** `/accept-invitation`\
**Access:** Public

### Purpose

Accept workspace invitation and establish initial password.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`POST /api/v1/auth/invitations/accept`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **Public**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 5. Dashboard

**Route:** `/dashboard`\
**Access:** DASHBOARD_VIEW

### Purpose

KPI cards, task status, priorities, project progress, workload,
deadlines and recent activity.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET /api/v1/dashboard/summary; /tasks-by-status; /tasks-by-priority; /project-progress; /recent-activity`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **DASHBOARD_VIEW**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 6. My Work

**Route:** `/my-work`\
**Access:** Authenticated

### Purpose

Personal task queue with assigned, in-progress, due-soon and overdue
work.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET /api/v1/dashboard/my-work; GET /api/v1/tasks`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **Authenticated**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 7. Users

**Route:** `/users`\
**Access:** USER_VIEW

### Purpose

Searchable/paginated user directory with status, role and actions.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET /api/v1/users`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **USER_VIEW**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 8. Create User

**Route:** `/users/new`\
**Access:** USER_CREATE

### Purpose

Create employee/user with identity, contact, status and workspace/role
data.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`POST /api/v1/users`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **USER_CREATE**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 9. User Details

**Route:** `/users/:userId`\
**Access:** USER_VIEW

### Purpose

User summary, projects, teams, workload and account status.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET /api/v1/users/:userId; /projects; /teams; /workload`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **USER_VIEW**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 10. Edit User

**Route:** `/users/:userId/edit`\
**Access:** USER_UPDATE

### Purpose

Edit permitted user fields; activate/deactivate account.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`PUT /api/v1/users/:userId; PATCH /activate; PATCH /deactivate`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **USER_UPDATE**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 11. Roles

**Route:** `/roles`\
**Access:** Authorization admin

### Purpose

Role directory, descriptions, member counts and protected system-role
indicators.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`Role/permission APIs defined by authorization module`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **Authorization admin**.
Hidden or disabled UI is only a usability layer; the server remains
responsible for authorization.

------------------------------------------------------------------------

## 12. Role Details & Permissions

**Route:** `/roles/:roleId`\
**Access:** Authorization admin

### Purpose

Permission matrix grouped by module with controlled role updates.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`Role/permission APIs defined by authorization module`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **Authorization admin**.
Hidden or disabled UI is only a usability layer; the server remains
responsible for authorization.

------------------------------------------------------------------------

## 13. Projects

**Route:** `/projects`\
**Access:** PROJECT_VIEW

### Purpose

Project list/grid with search, status, priority, manager and progress.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET /api/v1/projects`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **PROJECT_VIEW**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 14. Create Project

**Route:** `/projects/new`\
**Access:** PROJECT_CREATE

### Purpose

Project metadata, key, manager, dates, priority and description.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`POST /api/v1/projects`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **PROJECT_CREATE**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 15. Project Overview

**Route:** `/projects/:projectId`\
**Access:** PROJECT_VIEW

### Purpose

Project KPIs, description, progress, members, sprint summary and recent
activity.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET /api/v1/projects/:projectId; /statistics; /activity`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **PROJECT_VIEW**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 16. Edit Project

**Route:** `/projects/:projectId/edit`\
**Access:** PROJECT_UPDATE

### Purpose

Edit project properties and lifecycle state.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`PUT /api/v1/projects/:projectId; PATCH /status`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **PROJECT_UPDATE**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 17. Project Members

**Route:** `/projects/:projectId/members`\
**Access:** PROJECT_VIEW / PROJECT_MANAGE_MEMBERS

### Purpose

Member list, roles, allocation, add/update/remove actions.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET/POST /api/v1/projects/:projectId/members; PUT/DELETE member`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **PROJECT_VIEW /
PROJECT_MANAGE_MEMBERS**. Hidden or disabled UI is only a usability
layer; the server remains responsible for authorization.

------------------------------------------------------------------------

## 18. Epics

**Route:** `/projects/:projectId/epics`\
**Access:** PROJECT_VIEW

### Purpose

Epic list with owner, status, dates and task grouping.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET /api/v1/projects/:projectId/epics`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **PROJECT_VIEW**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 19. Epic Details

**Route:** `/projects/:projectId/epics/:epicId`\
**Access:** PROJECT_VIEW

### Purpose

Epic metadata and associated task list.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET project epics; GET /api/v1/tasks?epicId=`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **PROJECT_VIEW**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 20. Teams

**Route:** `/teams`\
**Access:** TEAM_VIEW

### Purpose

Team directory with lead, status and member count.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET /api/v1/teams`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **TEAM_VIEW**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 21. Create Team

**Route:** `/teams/new`\
**Access:** TEAM_CREATE

### Purpose

Create team, code, description and lead.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`POST /api/v1/teams`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **TEAM_CREATE**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 22. Team Details

**Route:** `/teams/:teamId`\
**Access:** TEAM_VIEW

### Purpose

Team profile, members, projects, workload and activity.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET /api/v1/teams/:teamId; /members; /projects; /workload; /activity`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **TEAM_VIEW**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 23. Edit Team

**Route:** `/teams/:teamId/edit`\
**Access:** TEAM_UPDATE

### Purpose

Edit team metadata, lead and lifecycle state.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`PUT /api/v1/teams/:teamId; PATCH /lead`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **TEAM_UPDATE**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 24. Team Members

**Route:** `/teams/:teamId/members`\
**Access:** TEAM_VIEW / TEAM_MANAGE_MEMBERS

### Purpose

Manage team membership and roles.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET/POST /api/v1/teams/:teamId/members; PUT/DELETE member`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **TEAM_VIEW /
TEAM_MANAGE_MEMBERS**. Hidden or disabled UI is only a usability layer;
the server remains responsible for authorization.

------------------------------------------------------------------------

## 25. Tasks

**Route:** `/tasks`\
**Access:** TASK_VIEW

### Purpose

Advanced searchable task table with project, sprint, status, priority,
assignee, labels and due dates.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET /api/v1/tasks`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **TASK_VIEW**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 26. Create Task

**Route:** `/tasks/new`\
**Access:** TASK_CREATE

### Purpose

Create task with project, epic, sprint, assignee, type, priority, points
and due date.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`POST /api/v1/tasks`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **TASK_CREATE**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 27. Task Details

**Route:** `/tasks/:taskId`\
**Access:** TASK_VIEW

### Purpose

Task header, description, status, assignees, labels, checklist,
comments, attachments, history and time.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET /api/v1/tasks/:taskId and related task APIs`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **TASK_VIEW**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 28. Edit Task

**Route:** `/tasks/:taskId/edit`\
**Access:** TASK_UPDATE

### Purpose

Edit permitted task fields with relationship validation.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`PUT /api/v1/tasks/:taskId`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **TASK_UPDATE**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 29. Task Board

**Route:** `/board`\
**Access:** TASK_VIEW

### Purpose

Project/sprint board with filters and workflow columns.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET /api/v1/tasks; GET /api/v1/sprints/:sprintId/board`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **TASK_VIEW**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 30. Kanban

**Route:** `/kanban`\
**Access:** TASK_VIEW / TASK_UPDATE

### Purpose

Drag-and-drop workflow board; status transitions persist through API.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET sprint board; PATCH /api/v1/tasks/:taskId/status`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **TASK_VIEW / TASK_UPDATE**.
Hidden or disabled UI is only a usability layer; the server remains
responsible for authorization.

------------------------------------------------------------------------

## 31. Backlog

**Route:** `/projects/:projectId/backlog`\
**Access:** TASK_VIEW

### Purpose

Unscheduled tasks, ranking, sprint assignment and quick task creation.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET /api/v1/tasks?projectId=&sprintId=null; PATCH task sprint`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **TASK_VIEW**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 32. Sprints

**Route:** `/projects/:projectId/sprints`\
**Access:** SPRINT_VIEW

### Purpose

Planned, active and completed sprint list.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET /api/v1/projects/:projectId/sprints`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **SPRINT_VIEW**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 33. Create Sprint

**Route:** `/projects/:projectId/sprints/new`\
**Access:** SPRINT_CREATE

### Purpose

Sprint name, goal, dates and project.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`POST /api/v1/sprints`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **SPRINT_CREATE**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 34. Sprint Details

**Route:** `/sprints/:sprintId`\
**Access:** SPRINT_VIEW

### Purpose

Sprint goal, dates, statistics, tasks, velocity and burndown.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET /api/v1/sprints/:sprintId; /statistics; /velocity; /burndown`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **SPRINT_VIEW**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 35. Sprint Board

**Route:** `/sprints/:sprintId/board`\
**Access:** SPRINT_VIEW

### Purpose

Sprint-specific board with assignee, priority and label filters.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET /api/v1/sprints/:sprintId/board`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **SPRINT_VIEW**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 36. Calendar

**Route:** `/calendar`\
**Access:** TASK_VIEW

### Purpose

Monthly/weekly task calendar using due dates and sprint/project filters.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET /api/v1/tasks with dueFrom/dueTo filters`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **TASK_VIEW**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 37. Time Tracking

**Route:** `/time-tracking`\
**Access:** Authenticated

### Purpose

My timers and manual entries; project/task/date filtering.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`POST task time start/stop; POST/GET task time`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **Authenticated**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 38. Reports

**Route:** `/reports`\
**Access:** REPORT_VIEW

### Purpose

Report landing page with report categories and saved filter entry
points.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET /api/v1/reports/*`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **REPORT_VIEW**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 39. Project Reports

**Route:** `/reports/projects`\
**Access:** REPORT_VIEW

### Purpose

Project progress, allocation and export controls.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET /api/v1/reports/projects/progress; /projects/allocation; project export`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **REPORT_VIEW**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 40. Task Reports

**Route:** `/reports/tasks`\
**Access:** REPORT_VIEW

### Purpose

Status, overdue, cycle-time and throughput analytics.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET /api/v1/reports/tasks/status; /overdue; /cycle-time; /throughput`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **REPORT_VIEW**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 41. Team & User Reports

**Route:** `/reports/people`\
**Access:** REPORT_VIEW

### Purpose

Performance and workload analytics.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET /api/v1/reports/users/performance; /teams/workload`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **REPORT_VIEW**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 42. Time Reports

**Route:** `/reports/time`\
**Access:** REPORT_VIEW

### Purpose

Logged-time analytics by user, project and task.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET /api/v1/reports/time`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **REPORT_VIEW**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 43. Notifications

**Route:** `/notifications`\
**Access:** Authenticated

### Purpose

Notification inbox, read/unread filters, bulk actions and deep links.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET /api/v1/notifications; PATCH read/unread/read-all; DELETE`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **Authenticated**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 44. Notification Settings

**Route:** `/settings/notifications`\
**Access:** Authenticated

### Purpose

Configure in-app/email notification preferences.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET/PUT /api/v1/notifications/preferences`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **Authenticated**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 45. Profile

**Route:** `/profile`\
**Access:** Authenticated

### Purpose

Personal information, avatar and account overview.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET /api/v1/auth/me; PUT /api/v1/users/me/profile; POST/DELETE avatar`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **Authenticated**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 46. Security & Sessions

**Route:** `/profile/security`\
**Access:** Authenticated

### Purpose

Change password and review/revoke active sessions.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`PUT /api/v1/auth/change-password; GET/DELETE /api/v1/auth/sessions`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **Authenticated**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 47. Settings

**Route:** `/settings`\
**Access:** Authenticated / admin sections permission-based

### Purpose

Settings hub for profile, notifications, workspace and system
configuration.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`Multiple settings APIs`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **Authenticated / admin
sections permission-based**. Hidden or disabled UI is only a usability
layer; the server remains responsible for authorization.

------------------------------------------------------------------------

## 48. Dashboard Customization

**Route:** `/settings/dashboard`\
**Access:** Authenticated

### Purpose

Show/hide/reorder dashboard widgets and save layout.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET/PUT /api/v1/dashboard/widgets`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **Authenticated**. Hidden or
disabled UI is only a usability layer; the server remains responsible
for authorization.

------------------------------------------------------------------------

## 49. Activity Log

**Route:** `/activity`\
**Access:** PROJECT_VIEW / appropriate scope

### Purpose

Operational activity timeline with actor, entity, action and date
filters.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET project/team activity; GET /api/v1/reports/activity`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **PROJECT_VIEW / appropriate
scope**. Hidden or disabled UI is only a usability layer; the server
remains responsible for authorization.

------------------------------------------------------------------------

## 50. Audit Log

**Route:** `/admin/audit`\
**Access:** Restricted admin/security permission

### Purpose

Security-sensitive audit viewer with filters and read-only detail.

### Main UI

-   Page header with title, breadcrumb and context-aware actions.
-   Responsive content area using reusable ETMS components.
-   Loading indicator during requests.
-   Empty state when no records exist.
-   Error state with safe retry where appropriate.
-   Success/error toast feedback for mutations.

### API Integration

`GET /api/v1/reports/audit`

### Validation & UX

-   Validate required fields before submission on form-based screens.
-   Disable duplicate submissions while a mutation is pending.
-   Display field-level server validation errors when supplied.
-   Confirm destructive or lifecycle-changing actions.
-   Preserve useful search/filter state during normal navigation where
    practical.

### Permission Behavior

The route and action controls must respect **Restricted admin/security
permission**. Hidden or disabled UI is only a usability layer; the
server remains responsible for authorization.

------------------------------------------------------------------------

# 6. Detailed UI Patterns

## 6.1 Login Form Pattern

``` jsx
function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login(form);
      authService.storeSession(response.data);
      navigate("/dashboard");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />
      <input
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
      />
      {error && <div role="alert">{error}</div>}
      <button disabled={loading}>
        {loading ? "Signing in..." : "Login"}
      </button>
    </form>
  );
}
```

## 6.2 List Page Pattern

Used by Users, Projects, Teams, Tasks, Sprints, Notifications and logs.

``` text
Page Header
   ↓
Search + Filters + Primary Action
   ↓
Data Table / Cards
   ↓
Loading | Empty | Error | Results
   ↓
Pagination
```

Query state should normally include:

``` js
{
  page: 1,
  pageSize: 20,
  search: "",
  sortBy: "createdAt",
  sortOrder: "desc"
}
```

## 6.3 Form Page Pattern

``` text
Breadcrumb
Page Title
Form Sections
Validation Messages
Cancel | Save
```

Create and edit pages should reuse feature-specific forms such as:

``` text
UserForm
ProjectForm
TeamForm
TaskForm
SprintForm
```

## 6.4 Detail Page Pattern

``` text
Header + Status + Actions
Tabs:
  Overview
  Members / Assignments
  Tasks
  Activity
  Attachments
  History
```

Only relevant tabs should appear for each entity.

## 6.5 Kanban Interaction

Recommended task card:

``` text
ETMS-104
Implement JWT protected routes
[HIGH] [security]
Assignee Avatar        5 SP
Due Aug 10
```

Drag/drop flow:

``` text
User drags card
      ↓
Validate target workflow state
      ↓
Optimistically move only if chosen strategy supports rollback
      ↓
PATCH task status
      ↓
Success → retain new state
Failure → restore previous column + show error
```

## 6.6 Calendar Interaction

Calendar events are tasks with due dates. Filters can include project,
sprint, assignee, priority and status. Selecting an event should open
task detail or a task quick-view panel.

## 6.7 Dashboard Widgets

Suggested widgets:

-   My Tasks
-   Total Projects
-   Task Status
-   Task Priority
-   Project Progress
-   Team Workload
-   Upcoming Deadlines
-   Recent Activity

Widgets should be independently loadable where practical so one failed
data source does not blank the entire dashboard.

# 7. Navigation Blueprint

``` text
Dashboard
My Work

Work
├── Projects
├── Teams
├── Tasks
├── Task Board
├── Kanban
├── Calendar
└── Time Tracking

Agile
├── Backlog
├── Sprints
└── Epics

People
├── Users
└── Roles

Insights
├── Reports
└── Activity Log

Administration
├── Audit Log
└── Settings
```

Sidebar entries must be permission-aware.

# 8. Frontend Service Layer

Recommended services:

``` text
services/
├── apiClient.js
├── authService.js
├── userService.js
├── roleService.js
├── projectService.js
├── teamService.js
├── taskService.js
├── sprintService.js
├── dashboardService.js
├── reportService.js
├── notificationService.js
└── attachmentService.js
```

Example:

``` js
export const getUsers = (params) =>
  apiClient.get("/users", { params });

export const createUser = (payload) =>
  apiClient.post("/users", payload);

export const updateUser = (id, payload) =>
  apiClient.put(`/users/${id}`, payload);
```

# 9. API Client

``` js
import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});
```

A request interceptor can attach the access token. A controlled response
strategy should handle expired authentication without creating infinite
refresh loops.

# 10. State Categories

## Authentication State

Current user, session status, permissions and active workspace.

## Server State

Users, projects, teams, tasks, sprints, dashboard and reports.

## Local UI State

Modal visibility, selected tab, temporary filters and form input.

Do not put every state value into one global store.

# 11. Forms and Validation

Every form should define:

-   required fields;
-   format rules;
-   minimum/maximum lengths;
-   enum selections;
-   date relationships;
-   duplicate-server validation;
-   permission-sensitive fields.

Client validation improves UX but never replaces backend validation.

# 12. Loading, Empty and Error States

Every API-driven screen must explicitly handle:

``` jsx
if (loading) return <LoadingSpinner />;
if (error) return <ErrorState message={error} onRetry={reload} />;
if (!items.length) return <EmptyState />;
```

Do not render an empty table while the application is still loading.

# 13. Destructive Actions

Require confirmation for:

``` text
Delete user
Delete project
Delete team
Delete task
Delete attachment
Remove project/team member
Cancel sprint
Archive project
Revoke session
```

Confirmation text must clearly identify the action and affected entity.

# 14. Notifications UX

The top bar should show unread count. Selecting a notification should
mark it read as appropriate and navigate to the referenced entity when a
valid deep link exists.

# 15. Responsive Design

Desktop is the primary productivity layout. Tablet should preserve core
workflows. On smaller screens:

-   collapse the sidebar;
-   stack forms;
-   allow tables to scroll or switch to cards;
-   keep primary actions reachable;
-   avoid unusable wide Kanban columns without horizontal scrolling.

# 16. Accessibility

-   Inputs require associated labels.
-   Buttons require understandable text or accessible names.
-   Do not communicate status by color alone.
-   Modals must support keyboard focus.
-   Error messages should be perceivable by assistive technology.
-   Interactive cards must not replace proper buttons/links without
    keyboard support.

# 17. Frontend Security

-   Never store passwords.
-   Do not expose privileged navigation to unauthorized users.
-   Treat frontend permission checks as convenience, not security.
-   Sanitize/escape user-generated display content appropriately.
-   Do not render raw HTML from comments/descriptions unless a safe
    sanitization strategy exists.
-   Avoid logging tokens or sensitive payloads.
-   Validate attachment types before upload for UX, while backend
    performs authoritative validation.

# 18. Suggested Intern Ownership

  Intern   Frontend Ownership
  -------- ------------------------------------------------------
  1        Authentication, forgot/reset password, session UI
  2        Users, profile
  3        Roles, permissions, settings authorization UI
  4        Projects, project members, epics
  5        Teams, sprints, backlog
  6        Tasks, task details, task forms
  7        Kanban, comments, attachments, calendar/time UI
  8        Dashboard, notifications, reports, activity/audit UI

Shared components, router changes, API client changes and application
shell changes should receive lead review.

# 19. UI Definition of Done

A screen is complete only when:

1.  Route is registered.
2.  Authentication/permission behavior is correct.
3.  API integration uses the service layer.
4.  Loading state is implemented.
5.  Empty state is implemented.
6.  Error state is implemented.
7.  Form validation is implemented where applicable.
8.  Success/error feedback is present.
9.  Responsive behavior is verified.
10. Destructive actions require confirmation.
11. No API URL is hardcoded in a page component.
12. No token is manually duplicated across components.
13. Shared components are reused.
14. Browser console has no avoidable errors/warnings.
15. Core user flow is manually tested.
16. Backend validation errors are displayed safely.
17. Pull request has been reviewed.

# 20. Implementation Phases

## Phase 1 -- Application Foundation

App shell, routing, authentication, API client, protected routes,
permission gates, common components.

## Phase 2 -- Administration

Users, roles, profile and security/session screens.

## Phase 3 -- Work Management

Projects, project members, teams and epics.

## Phase 4 -- Task Management

Tasks, create/edit/detail, assignments, labels, checklists, comments and
attachments.

## Phase 5 -- Agile Experience

Backlog, sprints, task board and Kanban.

## Phase 6 -- Productivity

Calendar, time tracking, notifications and dashboard customization.

## Phase 7 -- Management & Analytics

Reports, activity log, audit log and exports.

# 21. Screen Count

This blueprint defines **50 distinct routes/screens**, within the
requested 40--50-screen enterprise UI scope.

Some screens deliberately share forms and components. A 50-screen
application should not result in 50 isolated implementations.

# 22. Final Frontend Rules

-   Pages orchestrate; reusable components render reusable UI.
-   Services own API calls.
-   Router owns navigation structure.
-   Authentication logic is centralized.
-   Permission logic is reusable.
-   Forms share validation patterns.
-   Lists share pagination/search patterns.
-   IDs come from routes/session/API data, not hardcoding.
-   Backend error messages/codes are handled consistently.
-   UI status names must match the agreed API contract.
-   API integration should follow Document 04.
-   Database structure must not leak directly into UI assumptions.
-   Every intern must integrate through agreed contracts rather than
    editing another intern's feature casually.

# 23. Conclusion

Document 05 converts the enterprise requirements into a practical React
application blueprint containing 50 screens. It establishes routes,
responsibilities, API touchpoints, permissions, reusable UI patterns,
service-layer conventions, application states, security expectations and
intern ownership.

The next project document can build on this blueprint to define the
backend modules, controller/service/repository ownership, middleware,
validation, shared utilities and independent development
responsibilities for all eight interns.
