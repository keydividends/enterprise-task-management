# TODO: Complete Project Task Summary (Trisha)

Task from `ProjectManagement_Trisha.md`: implement `GET /api/v1/projects/:projectId/tasks/summary` (Project task summary for dashboard/reporting).

## Steps
- [x] 1. Read task file, API spec, existing project module, task model/seed data.
- [x] 2. Enhance `project.repository.js` `getTaskSummary` to support optional `sprintId` filter.
- [x] 3. Update `project.service.js` `getProjectTaskSummary` to accept and pass `sprintId`.
- [x] 4. Update `project.controller.js` to pass `req.query` to the service.
- [x] 5. Add a test in `backend/tests/projects.test.js` for the task summary endpoint.
- [x] 6. Run backend tests to verify.

## Result
- Task summary endpoint `GET /api/v1/projects/:projectId/tasks/summary` now fully supports the documented optional `sprintId` query parameter (contract §7.14).
- Added tests: summary returns a status-count object (valid project) and returns `PROJECT_NOT_FOUND` for a missing project.
- Backend summary tests pass. (2 unrelated pre-existing test failures exist in `addProjectMember`/`removeProjectMember` due to `user_admin_1` no longer resolving to a user — outside this task's scope.)
