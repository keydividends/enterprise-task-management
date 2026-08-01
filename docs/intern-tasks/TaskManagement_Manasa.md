# Task Management - Manasa

## Module Overview

Own task CRUD and task workflow. This module manages task creation, listing, details, updates, assignment, status, priority, labels, checklist, board display, and data consumed by comments, attachments, dashboard, and reports.

## Execution Prompt

Read all `docs/*.md` files and inspect existing backend/frontend code. The backend task module already has stub files; complete them using the documented architecture. Use mock users/projects/sprints until the real modules are merged, then integrate through REST/service contracts. Build APIs, board UI, tests, and Postman requests.

## Backend Responsibilities

- Complete `backend/src/modules/tasks`.
- Implement task model, mapper, routes, validation, controller, service, and repository.
- Support task CRUD, filters, pagination, assignment, status, priority, labels, and checklist.
- Validate project/member/assignee through stable contracts.
- Enforce auth, permissions, and project/task access rules.
- Record task history/activity if shared logging exists.

## Frontend Responsibilities

- Implement `frontend/src/features/tasks`.
- Build task list, task board, task details, create/edit task forms.
- Add task filters, status/priority badges, assignment UI, labels, and checklist UI.
- Connect task UI to task services/hooks.
- Provide task detail slots for comments and attachments.

## API Endpoints To Implement Or Consume

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/tasks` | List/filter/paginate tasks |
| `POST` | `/api/v1/tasks` | Create task |
| `GET` | `/api/v1/tasks/:taskId` | Get task detail |
| `PATCH` | `/api/v1/tasks/:taskId` | Update task |
| `DELETE` | `/api/v1/tasks/:taskId` | Delete/archive task |
| `PATCH` | `/api/v1/tasks/:taskId/status` | Change task status |
| `PATCH` | `/api/v1/tasks/:taskId/assignee` | Assign/reassign task |
| `GET` | `/api/v1/projects/:projectId/tasks` | Project task list if included |
| `POST` | `/api/v1/tasks/:taskId/checklists` | Add checklist if included |
| `POST` | `/api/v1/tasks/:taskId/labels` | Add label if included |

## Database Collections And Models

- `tasks`: primary task records.
- `taskassignments`: assignment mapping if separate from task.
- `labels`: label definitions.
- `tasklabels`: task-label mapping.
- `checklists`: checklist groups.
- `checklistitems`: checklist items.
- `taskhistory`: task change history.
- `projects`, `projectmembers`, `sprints`, `users`: consumed through contracts.

## Folder/File Structure To Create Or Update

```text
backend/src/modules/tasks/
  task.routes.js
  task.controller.js
  task.service.js
  task.repository.js
  task.validation.js
  task.mapper.js
  task.model.js
  taskAssignment.model.js
  label.model.js
  taskLabel.model.js
  checklist.model.js
  checklistItem.model.js
frontend/src/features/tasks/
  pages/TaskListPage.jsx
  pages/TaskBoardPage.jsx
  pages/TaskDetailsPage.jsx
  pages/CreateTaskPage.jsx
  pages/EditTaskPage.jsx
  components/TaskForm.jsx
  components/TaskCard.jsx
  components/TaskFilters.jsx
  components/TaskStatusBadge.jsx
  components/ChecklistPanel.jsx
  services/taskService.js
  hooks/useTasks.js
```

## Step-By-Step Task Checklist

- [ ] Read task sections in SRS, DB, API, UI, backend guide, and QA docs.
- [ ] Review existing task stub files.
- [ ] Define task API contract and permission requirements.
- [ ] Implement task schema and related schemas.
- [ ] Implement create/update/status/assignment validation.
- [ ] Implement repositories for CRUD, filtering, pagination, and board grouping.
- [ ] Implement services with project access and assignee validation.
- [ ] Implement controllers/routes and register route.
- [ ] Add seed tasks for board/dashboard tests.
- [ ] Build frontend task services/hooks.
- [ ] Build task list, board, detail, form, filters, labels, checklist UI.
- [ ] Add API, UI/manual, and Postman tests.

## Validation Rules

- Title is required.
- Project ID is required and must be accessible.
- Assignee must be an active project/team member if assigned.
- Status and priority must use documented enum values.
- Due date must be valid.
- Story points must be numeric if included.
- Labels and checklist items must be valid and scoped.

## Test Cases

- Create task succeeds.
- Get/list tasks supports filters and pagination.
- Update task validates fields.
- Assign task succeeds for valid assignee.
- Invalid project is rejected.
- Invalid assignee is rejected.
- Status transition works.
- Labels and checklists work.
- Permission checks are enforced.
- Workspace/project isolation is respected.
- Soft delete/archive behavior works.
- Board UI groups tasks by status.

## Integration Dependencies

- Depends on auth/RBAC for protected task actions.
- Depends on projects/projectmembers for project access.
- Depends on users/teams for assignment.
- May consume sprints.
- Provides task data to comments, attachments, dashboard, reports, and notifications.

## Definition Of Done

- Task APIs support CRUD, filters, assignment, and status.
- Task board/list/detail/forms work on frontend.
- Task module integrates with projects/users/auth through contracts.
- Comments/attachments can attach to task detail.
- Tests and Postman requests cover success, validation, permission, and isolation cases.

## Sprint-Wise Responsibilities

| Sprint | Responsibility |
|---|---|
| Day 1 | Read docs, review stubs, define task contracts, create/confirm skeletons. |
| Day 2 | Build task/related models, routes, validation, controllers, and seed tasks. |
| Day 3 | Build services/repositories, assignment/status/filter logic, and API tests. |
| Day 4 | Build task list/board/detail/forms/services/hooks and UI states. |
| Day 5 | Integrate with real auth/users/projects/teams/comments/dashboard and test flows. |
| Day 6 | Finish tests, Postman requests, documentation, and fixes. |

