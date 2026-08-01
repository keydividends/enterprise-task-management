# Project Management - Trisha

## Module Overview

Own projects and project membership. This module manages project CRUD, project members, project-level access, and project data consumed by tasks, sprints, dashboards, and reports.

## Execution Prompt

Read all `docs/*.md` files and inspect existing backend/frontend code. Generate and complete tasks for project management using the documented architecture. Use mock auth/users until Yamini and Raheema finish their modules, then integrate real auth and user lookup. Build APIs, UI pages, tests, and Postman requests.

## Backend Responsibilities

- Implement `backend/src/modules/projects`.
- Create project CRUD endpoints.
- Manage project members and project roles.
- Enforce project access and ownership/membership rules.
- Provide summary data needed by tasks and dashboard.
- Support pagination, search, filters, and status.

## Frontend Responsibilities

- Implement `frontend/src/features/projects`.
- Build project list, details, create/edit pages.
- Build project member management UI.
- Show project status and progress fields.
- Connect project UI to project service/hooks.
- Provide project selector support for task creation if needed.

## API Endpoints To Implement Or Consume

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/projects` | List/search projects |
| `POST` | `/api/v1/projects` | Create project |
| `GET` | `/api/v1/projects/:projectId` | Get project detail |
| `PATCH` | `/api/v1/projects/:projectId` | Update project |
| `DELETE` | `/api/v1/projects/:projectId` | Delete/archive project |
| `GET` | `/api/v1/projects/:projectId/members` | List project members |
| `POST` | `/api/v1/projects/:projectId/members` | Add project member |
| `DELETE` | `/api/v1/projects/:projectId/members/:userId` | Remove project member |
| `GET` | `/api/v1/projects/:projectId/tasks/summary` | Project task summary for dashboard/reporting |

## Database Collections And Models

- `projects`: primary project records.
- `projectmembers`: user-project membership and project role.
- `users`: consumed for member lookup.
- `tasks`: consumed for summary only through task/dashboard contracts.
- `sprints`: consumed if showing project sprint context.

## Folder/File Structure To Create Or Update

```text
backend/src/modules/projects/
  project.routes.js
  project.controller.js
  project.service.js
  project.repository.js
  project.validation.js
  project.mapper.js
  project.model.js
  projectMember.model.js
frontend/src/features/projects/
  pages/ProjectListPage.jsx
  pages/ProjectDetailsPage.jsx
  pages/CreateProjectPage.jsx
  pages/EditProjectPage.jsx
  components/ProjectForm.jsx
  components/ProjectCard.jsx
  components/ProjectMemberManager.jsx
  services/projectService.js
  hooks/useProjects.js
```

## Step-By-Step Task Checklist

- [ ] Read project sections in SRS, DB, API, UI, and QA docs.
- [ ] Define project API contract and permissions.
- [ ] Create project and project member models.
- [ ] Implement validation for project fields and member operations.
- [ ] Implement repository methods for CRUD, search, members, and summary.
- [ ] Implement services with membership and isolation rules.
- [ ] Implement controllers/routes and register route.
- [ ] Add seed projects and project members.
- [ ] Build project services/hooks on frontend.
- [ ] Build project list/detail/form/member UI.
- [ ] Add route protection and permission-aware actions.
- [ ] Add API, manual UI, and Postman tests.

## Validation Rules

- Project name is required.
- Project status must use documented enum values.
- Dates must be valid if start/end dates are used.
- Member user IDs must exist.
- Duplicate project members are not allowed.
- Only authorized users can create/update/delete projects or manage members.

## Test Cases

- Create project succeeds.
- List projects supports search/pagination.
- Update project validates fields.
- Add member succeeds.
- Duplicate member is rejected.
- Remove member succeeds with permission.
- Unauthorized access is denied.
- Project isolation is respected.
- Project detail page loads members and summary.
- Project form handles validation errors.

## Integration Dependencies

- Depends on auth and RBAC for protected project actions.
- Depends on users for member lookup.
- Provides project data to tasks, teams/sprints, dashboard, and reports.
- Must expose a stable member API for task assignment validation.

## Definition Of Done

- Project and member APIs work with standard responses.
- Project frontend pages are connected and permission-aware.
- Project data can be consumed by tasks/dashboard.
- Tests and Postman requests cover CRUD, membership, and unauthorized cases.

## Sprint-Wise Responsibilities

| Sprint | Responsibility |
|---|---|
| Day 1 | Read docs, define project/member API contracts, create skeletons. |
| Day 2 | Build models/routes/validation/controllers and seed project data. |
| Day 3 | Build services/repositories/access rules and API tests. |
| Day 4 | Build frontend pages, services, hooks, forms, and member manager. |
| Day 5 | Integrate with real auth/users/tasks/dashboard and test cross-module flows. |
| Day 6 | Finish tests, Postman requests, documentation, and fixes. |

