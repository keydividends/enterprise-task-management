# Task Management Module - Implementation TODO (Manasa)

## Backend (`backend/src/modules/tasks`)
- [x] Review stubs (model, repository, mapper, validation) + docs
- [x] Create `task.constants.js` (status transitions, sort/filter allowlists)
- [x] Create `task.mockData.js` (mock workspace/users/projects/sprints/epics/members)
- [x] Create `task.contracts.js` (swappable mock -> real module contracts)
- [x] Extend `task.validation.js` (label, checklist, item, query/filter/sort, board)
- [x] Extend `task.repository.js` (label task lookup, checklist position helpers)
- [x] Implement `task.service.js` (CRUD, filters, pagination, board, assignment, status, priority, labels, checklists, history)
- [x] Implement `task.controller.js` (thin handlers)
- [x] Implement `task.routes.js` (task + project-labels + checklist-item routers)
- [x] Register routes in `app.js`
- [x] Create `backend/scripts/seedTasks.js`
- [x] Create `backend/tests/task.test.js`
- [x] Create `backend/postman/ETMS-Tasks.postman_collection.json`

## Frontend (`frontend/src/features/tasks`)
- [x] `constants/taskConstants.js`
- [x] `services/taskService.js`
- [x] `hooks/useTasks.js`
- [x] `components/TaskStatusBadge.jsx`
- [x] `components/TaskCard.jsx`
- [x] `components/TaskFilters.jsx`
- [x] `components/TaskForm.jsx`
- [x] `components/ChecklistPanel.jsx`
- [x] `pages/TaskListPage.jsx`
- [x] `pages/TaskBoardPage.jsx`
- [x] `pages/TaskDetailsPage.jsx`
- [x] `pages/CreateTaskPage.jsx`
- [x] `pages/EditTaskPage.jsx`
- [x] Register routes in `AppRoutes.jsx`
- [x] Add board link in `MainLayout.jsx`
- [x] Append task styles to `App.css`

## Verification
- [x] Backend task unit tests pass (`node --test tests/task.test.js`) — 17/17 pass
- [x] Frontend build passes (`npm run build`) — built in 2.11s (467.92 kB JS, 25.58 kB CSS)
- [ ] Seed script works against Mongo (requires running MongoDB)
- [ ] Smoke: backend start + frontend start

