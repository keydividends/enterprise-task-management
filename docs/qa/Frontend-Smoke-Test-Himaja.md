# Frontend Smoke Test — Himaja

**Purpose:** Verify frontend routes load, navigation works, and key UI flows function correctly.

---

## Route Registration Check

All routes verified in `frontend/src/routes/AppRoutes.jsx`:

| Route | Component | Protected | Status |
|-------|-----------|-----------|--------|
| `/login` | LoginPage | No | ✅ Registered |
| `/register` | RegisterPage | No | ✅ Registered |
| `/forgot-password` | ForgotPasswordPage | No | ✅ Registered |
| `/reset-password` | ResetPasswordPage | No | ✅ Registered |
| `/dashboard` | DashboardPage | Yes | ✅ Registered |
| `/users` | UserListPage | Yes | ✅ Registered |
| `/users/create` | CreateUserPage | Yes | ✅ Registered |
| `/users/:userId` | UserDetailsPage | Yes | ✅ Registered |
| `/users/:userId/edit` | EditUserPage | Yes | ✅ Registered |
| `/profile` | ProfilePage | Yes | ✅ Registered |
| `/tasks` | TaskListPage | Yes | ✅ Registered |
| `/tasks/board` | TaskBoardPage | Yes | ✅ Registered |
| `/tasks/new` | CreateTaskPage | Yes | ✅ Registered |
| `/tasks/:taskId` | TaskDetailsPage | Yes | ✅ Registered |
| `/tasks/:taskId/edit` | EditTaskPage | Yes | ✅ Registered |
| `/projects` | ProjectListPage | Yes | ✅ Registered |
| `/projects/create` | CreateProjectPage | Yes | ✅ Registered |
| `/projects/new` | CreateProjectPage | Yes | ✅ Registered (duplicate path) |
| `/projects/:projectId` | ProjectDetailsPage | Yes | ✅ Registered |
| `/projects/:projectId/edit` | EditProjectPage | Yes | ✅ Registered |
| `/teams` | TeamListPage | Yes | ✅ Registered |
| `/teams/create` | CreateTeamPage | Yes | ✅ Registered |
| `/teams/new` | CreateTeamPage | Yes | ✅ Registered (duplicate path) |
| `/teams/:teamId` | TeamDetailsPage | Yes | ✅ Registered |
| `/teams/:teamId/edit` | EditTeamPage | Yes | ✅ Registered |
| `/teams/:teamId/members` | TeamMembersPage | Yes | ✅ Registered |
| `/roles` | RoleListPage | Yes | ✅ Registered |
| `/roles/create` | CreateRolePage | Yes | ✅ Registered |
| `/roles/:roleId` | RoleDetailsPage | Yes | ✅ Registered |
| `/roles/:roleId/edit` | EditRolePage | Yes | ✅ Registered |
| `/` | Redirect to `/dashboard` | Yes | ✅ Registered |
| `*` | NotFoundPage | No | ✅ Registered |

**Missing routes:**
- No `/reports` route — Dashboard/Reports module not implemented (BUG-006)
- No `/sprints` route — Sprint module not implemented

**Duplicate routes noted:** `/projects/create` and `/projects/new` both render CreateProjectPage. Same for teams. Not a bug but worth noting for cleanup.

---

## Feature Folder Coverage

| Feature | Pages | Components | Hooks | Services | Status |
|---------|-------|------------|-------|----------|--------|
| auth | ✅ 4 pages | ✅ ProtectedRoute | ✅ useAuth | ✅ authService | COMPLETE |
| users | ✅ 5 pages | ✅ UserForm, UserStatusBadge | ✅ useUsers | ✅ userService | COMPLETE |
| roles | ✅ 4 pages | ✅ PermissionGate, PermissionMatrix, RoleForm | ✅ useRoles | ✅ roleService | COMPLETE |
| projects | ✅ 4 pages | ✅ ProjectCard, ProjectForm, ProjectMemberManager | ✅ useProjects | ✅ projectService | COMPLETE |
| teams | ✅ 5 pages | ✅ TeamForm, TeamMemberManager, Toast | ✅ useTeams, useToasts | ✅ teamService | COMPLETE |
| tasks | ✅ 5 pages | ✅ TaskCard, TaskForm, TaskFilters, ChecklistPanel, TaskStatusBadge | ✅ useTasks | ✅ taskService | COMPLETE |
| comments | N/A (panels) | ✅ CommentsPanel, CommentItem, AttachmentList, AttachmentsPanel, AttachmentUploader | ✅ useComments, useAttachments | ✅ commentService, attachmentService | COMPLETE |
| dashboard | ❌ No feature folder | ❌ | ❌ | ❌ | NOT STARTED |

---

## UI Smoke Tests

### Auth Flow

| # | Test | Status | Notes |
|---|------|--------|-------|
| F1.1 | `/login` renders login form | NOT TESTED | |
| F1.2 | Login with valid credentials → redirect to `/dashboard` | NOT TESTED | |
| F1.3 | Login with invalid credentials → error message shown | NOT TESTED | |
| F1.4 | `/forgot-password` renders form | NOT TESTED | |
| F1.5 | `/register` renders registration form | NOT TESTED | |
| F1.6 | Unauthenticated access to `/dashboard` → redirect to `/login` | NOT TESTED | |
| F1.7 | Logout clears session and redirects to `/login` | NOT TESTED | |

### Dashboard

| # | Test | Status | Notes |
|---|------|--------|-------|
| F2.1 | `/dashboard` loads without console errors | NOT TESTED | |
| F2.2 | Stats cards render | NOT TESTED | Static data — BUG-006 |
| F2.3 | No API calls made (static data) | NOT TESTED | Confirmed by code inspection |

### Users

| # | Test | Status | Notes |
|---|------|--------|-------|
| F3.1 | `/users` loads user list | NOT TESTED | |
| F3.2 | `/users/create` renders form | NOT TESTED | |
| F3.3 | Create user form submits and shows success | NOT TESTED | |
| F3.4 | `/users/:userId` shows user details | NOT TESTED | |
| F3.5 | `/users/:userId/edit` renders edit form | NOT TESTED | |
| F3.6 | `/profile` renders current user profile | NOT TESTED | |

### Roles

| # | Test | Status | Notes |
|---|------|--------|-------|
| F4.1 | `/roles` loads role list | NOT TESTED | |
| F4.2 | `/roles/create` renders form | NOT TESTED | |
| F4.3 | `/roles/:roleId` shows role details and permissions | NOT TESTED | |
| F4.4 | Permission matrix renders correctly | NOT TESTED | |
| F4.5 | PermissionGate hides elements for unauthorized users | NOT TESTED | |

### Projects

| # | Test | Status | Notes |
|---|------|--------|-------|
| F5.1 | `/projects` loads project list | NOT TESTED | |
| F5.2 | `/projects/create` renders form | NOT TESTED | |
| F5.3 | `/projects/:projectId` shows project details | NOT TESTED | |
| F5.4 | Project member manager renders | NOT TESTED | |
| F5.5 | Fallback data shown when API fails | NOT TESTED | BUG-003: masks errors |

### Teams

| # | Test | Status | Notes |
|---|------|--------|-------|
| F6.1 | `/teams` loads team list | NOT TESTED | |
| F6.2 | `/teams/create` renders form | NOT TESTED | |
| F6.3 | `/teams/:teamId` shows team details | NOT TESTED | |
| F6.4 | `/teams/:teamId/members` shows member list | NOT TESTED | |
| F6.5 | Team member manager renders | NOT TESTED | |

### Tasks

| # | Test | Status | Notes |
|---|------|--------|-------|
| F7.1 | `/tasks` loads task list | NOT TESTED | |
| F7.2 | `/tasks/board` loads kanban board | NOT TESTED | |
| F7.3 | `/tasks/new` renders create form | NOT TESTED | |
| F7.4 | `/tasks/:taskId` shows task details | NOT TESTED | |
| F7.5 | Task status badge renders correct color | NOT TESTED | |
| F7.6 | Checklist panel renders and allows item completion | NOT TESTED | |
| F7.7 | Task filters work (status, priority, assignee) | NOT TESTED | |

### Comments & Attachments

| # | Test | Status | Notes |
|---|------|--------|-------|
| F8.1 | CommentsPanel renders on task detail page | NOT TESTED | |
| F8.2 | Post comment → comment appears in list | NOT TESTED | |
| F8.3 | Edit comment → updated text shown | NOT TESTED | |
| F8.4 | Delete comment → removed from list | NOT TESTED | |
| F8.5 | AttachmentsPanel renders on task detail page | NOT TESTED | |
| F8.6 | Upload file → appears in attachment list | NOT TESTED | |
| F8.7 | Download attachment link works | NOT TESTED | |
| F8.8 | Delete attachment → removed from list | NOT TESTED | |

---

## Frontend Service Path Verification

All frontend services verified against backend routes:

| Service | All Paths Match Backend | Issues |
|---------|------------------------|--------|
| authService.js | ✅ | None |
| userService.js | ✅ | None |
| roleService.js | ✅ | None |
| projectService.js | ✅ | BUG-003 (fallback masks errors) |
| teamService.js | ✅ | None |
| taskService.js | ✅ | None |
| commentService.js | ✅ | None |
| attachmentService.js | ✅ | None |
