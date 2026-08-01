# Integration And QA Coordination - Himaja

## Module Overview

Own cross-module integration quality. This role does not own a separate product feature; it protects consistency across all intern work: API contracts, seed data, Postman collections, smoke testing, regression testing, bug reporting, and final demo readiness.

## Execution Prompt

Read all `docs/*.md` files and inspect existing backend/frontend code. Generate and complete integration and QA tasks for the full ETMS app. Create checklists, validate API contracts, coordinate seed data, run smoke/regression tests, track blockers, and prepare final demo validation. Do not rewrite feature modules unless explicitly assigned by the module owner or reviewer.

## Backend Responsibilities

- Maintain API contract checklist for all modules.
- Coordinate seed data needed for integration tests.
- Verify route registration and response format consistency.
- Verify auth and permission middleware usage.
- Review Postman request coverage.
- Track cross-module bugs and blockers.

## Frontend Responsibilities

- Verify route registration and navigation.
- Smoke test key UI flows.
- Check loading, empty, error, validation, and permission states.
- Validate frontend service paths match API contracts.
- Prepare demo script and final checklist.

## API Endpoints To Verify

| Area | Endpoints |
|---|---|
| Auth | `/api/v1/auth/login`, `/api/v1/auth/me`, `/api/v1/auth/logout`, password reset endpoints |
| Users | `/api/v1/users`, `/api/v1/users/:userId`, user search/profile/status endpoints |
| Roles | `/api/v1/roles`, `/api/v1/permissions`, role permission assignment endpoints |
| Projects | `/api/v1/projects`, project member endpoints |
| Teams | `/api/v1/teams`, team member endpoints, sprint endpoints if included |
| Tasks | `/api/v1/tasks`, task status/assignee/filter endpoints |
| Comments | `/api/v1/tasks/:taskId/comments`, `/api/v1/comments/:commentId` |
| Attachments | `/api/v1/tasks/:taskId/attachments`, attachment download/delete endpoints |
| Dashboard | `/api/v1/dashboard/*`, `/api/v1/reports/*` |

## Database Collections And Models

Coordinate seed data across:

- `users`, `roles`, `permissions`, `rolepermissions`
- `projects`, `projectmembers`
- `teams`, `teammembers`
- `sprints`
- `tasks`, `taskassignments`, `labels`, `tasklabels`, `checklists`, `checklistitems`
- `comments`, `attachments`
- `dashboardwidgets`

## Folder/File Structure To Create Or Update

```text
docs/intern-tasks/
  00-Sprint-Plan-All-Interns.md
postman/
  ETMS collection updates or review notes
backend/tests/
  integration test plan or shared fixtures if tests are added
docs/
  QA notes only when needed
```

Do not modify feature implementation files unless coordinated with the module owner.

## Step-By-Step Task Checklist

- [ ] Read all docs and inspect current code structure.
- [ ] Create API contract checklist for each intern.
- [ ] Confirm Day 1 auth contract is published.
- [ ] Create seed data matrix for users, roles, projects, teams, tasks, comments, attachments, and dashboard.
- [ ] Verify each module follows backend and frontend flow.
- [ ] Verify route names and response formats match API spec.
- [ ] Verify permission names and middleware usage.
- [ ] Maintain Postman collection or review checklist.
- [ ] Run daily smoke test flow and record blockers.
- [ ] Run Day 5 cross-module regression.
- [ ] Prepare Day 6 demo script.
- [ ] Confirm every module meets Definition of Done.

## Validation Rules

- Every endpoint must document method, path, request, response, permissions, errors, and dependencies.
- Every protected endpoint must require auth.
- Permission-sensitive endpoints must use the RBAC contract.
- Frontend service paths must match backend route paths.
- Seed data must support the final demo flow.
- Bugs must include severity, steps to reproduce, expected result, and actual result.

## Test Cases

- Login as admin succeeds.
- Admin creates user and assigns role.
- Admin creates project and adds member.
- Team lead creates team and adds member if allowed.
- User creates task in accessible project.
- User changes task status.
- User adds comment to accessible task.
- User uploads attachment to accessible task.
- Unauthorized user cannot access another project/task.
- Dashboard/report numbers match seeded data.
- Frontend routes load without console errors.
- Manual smoke test passes from login to reports.

## Integration Dependencies

- Depends on every module owner's daily progress.
- Uses Yamini's auth contract as the baseline.
- Uses Venkat's permission matrix for authorization checks.
- Uses all module APIs for final regression flow.

## Definition Of Done

- API contracts for all modules are reviewed.
- Postman/API smoke coverage exists for all modules.
- Seed data supports the final demo.
- Cross-module regression is completed.
- Known issues are documented with severity.
- Final demo checklist is ready.

## Sprint-Wise Responsibilities

| Sprint | Responsibility |
|---|---|
| Day 1 | Read docs, build API contract checklist, confirm auth contract, prepare seed-data matrix. |
| Day 2 | Review backend model/route/controller consistency and seed data readiness. |
| Day 3 | Run API smoke tests, verify response formats, track middleware and contract issues. |
| Day 4 | Run UI smoke tests, verify frontend service paths and route registration. |
| Day 5 | Run cross-module regression with real auth/RBAC and record blockers. |
| Day 6 | Run final test pass, verify Definition of Done, finalize demo script and QA notes. |

