# User Management - Raheema

## Module Overview

Own user administration and profile management. The module handles user CRUD, profile data, status changes, search/list behavior, and user data consumed by assignment flows in projects, teams, and tasks.

## Execution Prompt

Read all `docs/*.md` files and inspect existing backend/frontend code. Generate and complete tasks for the user management module using the documented architecture. Use Yamini's auth contract and Venkat's permission contract. Build user APIs, UI pages, services, hooks, validation, tests, and Postman requests.

## Backend Responsibilities

- Implement `backend/src/modules/users`.
- Create user CRUD endpoints with pagination/search.
- Support profile read/update.
- Support deactivate/reactivate or status update.
- Enforce auth and permission checks.
- Prevent duplicate emails and unsafe field updates.
- Return user DTOs that never expose password hashes.

## Frontend Responsibilities

- Implement `frontend/src/features/users`.
- Build user list, create user, edit user, user details/profile pages.
- Add user search and pagination controls.
- Add status indicators and deactivate/reactivate actions.
- Show permission-aware actions.
- Provide user selectors for project/team/task owners if shared component is needed.

## API Endpoints To Implement Or Consume

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/users` | List/search users with pagination |
| `POST` | `/api/v1/users` | Create user |
| `GET` | `/api/v1/users/:userId` | Get user detail |
| `PATCH` | `/api/v1/users/:userId` | Update user |
| `PATCH` | `/api/v1/users/:userId/status` | Activate/deactivate user |
| `GET` | `/api/v1/users/search` | Search users for assignment |
| `GET` | `/api/v1/users/:userId/projects` | Get user projects if included |
| `GET` | `/api/v1/users/:userId/teams` | Get user teams if included |

## Database Collections And Models

- `users`: primary owner with auth coordination.
- `roles`: consumed for role assignment/display.
- `projectmembers`: consumed for user project membership.
- `teammembers`: consumed for user team membership.
- `auditlogs`: shared user changes if available.

## Folder/File Structure To Create Or Update

```text
backend/src/modules/users/
  user.routes.js
  user.controller.js
  user.service.js
  user.repository.js
  user.validation.js
  user.mapper.js
  user.model.js
frontend/src/features/users/
  pages/UserListPage.jsx
  pages/UserDetailsPage.jsx
  pages/CreateUserPage.jsx
  pages/EditUserPage.jsx
  pages/ProfilePage.jsx
  components/UserForm.jsx
  components/UserStatusBadge.jsx
  services/userService.js
  hooks/useUsers.js
```

## Step-By-Step Task Checklist

- [ ] Read user-related SRS, DB, API, UI, and QA sections.
- [ ] Confirm user schema fields with Yamini and Venkat.
- [ ] Define user API contracts and permissions.
- [ ] Implement user model or extend auth user model without conflict.
- [ ] Implement validation for create/update/status operations.
- [ ] Implement repository methods for CRUD/search/pagination.
- [ ] Implement service rules for duplicate email, status changes, and safe updates.
- [ ] Implement controllers and routes.
- [ ] Build frontend user services/hooks.
- [ ] Build user list/detail/form/profile pages.
- [ ] Add loading, empty, error, and permission-denied states.
- [ ] Add backend, frontend/manual, and Postman tests.

## Validation Rules

- Name and email are required for user creation.
- Email must be unique and valid.
- Password creation rules must align with auth.
- Role IDs must exist before assignment.
- Status must use documented enum values.
- Users cannot update protected fields unless they have permission.

## Test Cases

- Create user succeeds with valid data.
- Duplicate email is rejected.
- List users supports pagination and search.
- Get user returns safe DTO.
- Update user validates fields.
- Deactivate user prevents login.
- Unauthorized user management action is denied.
- Workspace isolation is respected if workspace scoping is active.
- Frontend form displays validation errors.
- User list handles empty and loading states.

## Integration Dependencies

- Depends on authentication for protected routes and current user.
- Depends on roles/permissions for admin actions and role display.
- Provides users to projects, teams, tasks, comments, and reports.

## Definition Of Done

- User CRUD and profile APIs work with protected access.
- User responses never expose passwords.
- Frontend user management pages are usable.
- Assignment search endpoint is available or documented.
- Tests and Postman requests cover success, validation, and permission failures.

## Sprint-Wise Responsibilities

| Sprint | Responsibility |
|---|---|
| Day 1 | Read docs, define user API contract, create skeletons, use mock auth. |
| Day 2 | Build model/routes/validation/controllers and seed users. |
| Day 3 | Build services/repositories, pagination/search/status logic, and API tests. |
| Day 4 | Build frontend pages, services, hooks, forms, and user states. |
| Day 5 | Integrate with real auth/RBAC and verify project/team/task consumption. |
| Day 6 | Finish tests, Postman requests, documentation, and bug fixes. |

