# Dashboard And Reports - Konaiah

## Ownership

Own dashboard metrics, report summaries, charts, and per-user dashboard
layout persistence. This module reads task, project, team, user, activity,
audit, time-tracking, and task-history data. It must not mutate those source
modules.

## Current Status

As of 2026-08-11, the Day 1-6 dashboard/report implementation is complete for
the data sources currently present in the repository.

- Backend dashboard and reports modules are present and registered in
  `backend/src/app.js`.
- Dashboard summary, status, priority, project progress, team workload,
  deadlines, widgets, and the initial report routes now use API services and
  MongoDB aggregations.
- The dashboard page now consumes live API data and the frontend has report
  routes for `/reports`, `/reports/projects`, `/reports/tasks`, and
  `/reports/people`.
- Focused API tests and `backend/postman/ETMS-Dashboard-Reports.postman_collection.json`
  now exist.
- Recent activity is sourced from task history because a standalone Activity
  module/model is not present. Widget visibility, drag-and-drop ordering, and
  persistence are implemented.

Unchecked items below remain pending or dependency-blocked.

## Canonical API Scope

Use the exact paths and response envelope from `docs/04-REST-API-Specification.md`.
Do not use the older aliases `project-progress`, `overdue-tasks`, or
`task-history`.

### Dashboard APIs

| Status | Method | Path | Access | Query |
|---|---|---|---|---|
| [x] | GET | `/api/v1/dashboard/summary` | `DASHBOARD_VIEW` | `projectId`, `fromDate`, `toDate` |
| [x] | GET | `/api/v1/dashboard/my-work` | Authenticated | `projectId`, `sprintId` |
| [x] | GET | `/api/v1/dashboard/tasks-by-status` | `DASHBOARD_VIEW` | `projectId`, `sprintId`, `fromDate`, `toDate` |
| [x] | GET | `/api/v1/dashboard/tasks-by-priority` | `DASHBOARD_VIEW` | `projectId`, `sprintId` |
| [x] | GET | `/api/v1/dashboard/project-progress` | `DASHBOARD_VIEW` | `limit` |
| [x] | GET | `/api/v1/dashboard/team-workload` | `DASHBOARD_VIEW` or `REPORT_VIEW` | `teamId`, `projectId`, `fromDate`, `toDate` |
| [x] | GET | `/api/v1/dashboard/upcoming-deadlines` | Authenticated | `days`, `projectId` |
| [x] | GET | `/api/v1/dashboard/recent-activity` | Authenticated | `limit`, `projectId` |
| [x] | GET | `/api/v1/dashboard/widgets` | Authenticated | none |
| [x] | PUT | `/api/v1/dashboard/widgets` | Authenticated | JSON widget layout |

### Report APIs

Implement the report endpoints required for today's usable release first;
record deferred endpoints explicitly rather than silently changing the
contract.

| Status | Method | Path | Today's target |
|---|---|---|---|
| [x] | GET | `/api/v1/reports/projects/progress` | Yes |
| [x] | GET | `/api/v1/reports/tasks/status` | Yes |
| [x] | GET | `/api/v1/reports/tasks/overdue` | Yes |
| [x] | GET | `/api/v1/reports/teams/workload` | Yes |
| [x] | GET | `/api/v1/reports/users/performance` | Implemented from task completion/story points; logged minutes remain `0` until time tracking exists |
| [x] | GET | `/api/v1/reports/projects/allocation` | Implemented from project members |
| [x] | GET | `/api/v1/reports/tasks/cycle-time` | Implemented from task created/completed dates |
| [x] | GET | `/api/v1/reports/tasks/throughput` | Implemented from task completion dates |
| [x] | GET | `/api/v1/reports/sprints/:sprintId` | Implemented from sprint-scoped tasks; no Sprint module persistence exists |
| [x] | GET | `/api/v1/reports/time` | Implemented using time tracking entries and duration aggregation |
| [x] | GET | `/api/v1/reports/activity` | Implemented from task history |
| [x] | GET | `/api/v1/reports/audit` | Implemented using task history audit entries and admin-only access |
| [x] | GET | `/api/v1/reports/tasks/export` | Implemented JSON/CSV task export |
| [x] | GET | `/api/v1/reports/projects/:projectId/export` | Implemented JSON/CSV project export |

## Required Security Contract

Every route must use the established order:

```text
authenticate -> workspace scope -> authorization -> validation -> controller
```

Use `DASHBOARD_VIEW` for dashboard-wide metrics and `REPORT_VIEW` for report
routes. Authenticated-only routes must still restrict project/team data to the
current user's accessible workspace and memberships. Never trust a workspace
or user ID supplied by the client. Apply `isDeleted` and archived-record
rules consistently in every aggregation. Return standardized application
errors, not raw MongoDB errors.

## Metric Definitions

These definitions are required before writing expected-value tests.

- `totalTasks`: visible, non-deleted tasks in the accessible scope.
- `completedTasks`: tasks whose status is `DONE`.
- `pendingTasks`: visible tasks whose status is neither `DONE` nor
  `CANCELLED`.
- `overdueTasks`: non-deleted, incomplete tasks with `dueDate` before the
  current instant; exclude both `DONE` and `CANCELLED`. Date filters apply to
  `createdAt`, are inclusive at the start, and exclusive at the day after
  `toDate`.
- Status and priority charts: return every grouped value as
  `{ status, count }` or `{ priority, count }`; return an empty array when no
  records match.
- Project progress: `completedTasks / totalTasks * 100`, rounded to the nearest
  whole number; projects with no tasks return `0`.
- Workload: group visible tasks by `primaryAssigneeId`; include assigned and
  completed counts and return stable user labels.
- All filters must be validated and checked against accessible projects,
  teams, and users before aggregation.

## Pending Implementation Tasks For Today

### P0 - Backend vertical slice

- [x] Create dashboard and reports module folders using the documented
  route/controller/service/repository/validation layering.
- [x] Add `DashboardWidget` persistence matching the `dashboardwidgets`
  schema: `workspaceId`, `userId`, `widgetType`, title, position,
  configuration, visibility, and timestamps.
- [x] Implement query validation for ObjectIds, bounded `limit/days`, ISO
  dates, date ordering, supported widget types, and layout dimensions.
- [x] Implement repository aggregations for summary, status, priority,
  project progress, workload, upcoming deadlines, and recent activity.
- [x] Implement the four today-target report aggregations: project progress,
  task status, overdue tasks, and team workload.
- [x] Implement service-level access checks for project/team filters and
  current-user widget ownership.
- [x] Add dashboard/report route registration in `backend/src/app.js`.
- [x] Return the documented `{ success: true, data }` response shape and
  standardized validation, authentication, permission, and not-found errors.

### P0 - Frontend integration

- [x] Add dashboard API and report API services using the existing Axios client.
- [x] Add a dashboard hook with loading, refresh, empty, error, and forbidden
  states; remove hard-coded dashboard metrics.
- [x] Update the existing dashboard page to render live summary cards,
  status/priority charts, workload, deadlines, and activity.
- [x] Add `/reports`, `/reports/projects`, `/reports/tasks`, and
  `/reports/people` routes with `REPORT_VIEW`-aware UI behavior.
- [x] Add shared date/project/team filters and preserve filter state while
  navigating between report views.
- [x] Implement widget visibility, drag-and-drop ordering, layout loading, and
  save behavior with disabled duplicate submissions and mutation error feedback.

### P0 - Verification and integration

- [x] Create deterministic seed/test fixtures with Himaja: two workspaces,
  accessible and inaccessible users, projects, teams, and tasks in each
  status/priority plus overdue and completed examples. Use fixed test dates
  or a controlled clock so results do not change when the calendar advances.
- [x] Add API tests for counts, grouping, filters, empty data, invalid input,
  permission denial, widget ownership, and cross-workspace isolation.
- [x] Add focused frontend verification for widget visibility and drag-and-drop
  ordering; dashboard request states remain covered by the existing UI paths.
- [x] Add Postman requests for every implemented endpoint, including invalid
  filters and unauthorized access.
- [x] Run backend tests, frontend lint/build, and record expected seed results
  in the module handoff. Backend tests, frontend tests, lint, and build run on
  the active Node 20.19.0 runtime.

## Definition Of Done For Today's Release

- [x] Backend dashboard and report routes are registered and protected.
- [x] The four P0 report endpoints and implemented dashboard endpoints return
  real, scope-correct aggregations, not hard-coded values.
- [x] Dashboard and report pages consume services and display all required
  request states, including activity and widget editing.
- [x] No client can read another workspace's metrics or another user's widget
  layout.
- [x] Tests and Postman requests cover the documented happy paths and security
  failures.
- [x] Time and audit reports remain explicitly dependency-limited and are not
  presented as data-complete.

## Documentation References

- API paths and response examples: `docs/04-REST-API-Specification.md`
- Dashboard/report layering and middleware: `docs/06-Backend-Module-Guide.md`
- Widget, task, activity, history, and time schemas: `docs/03-Database-Design.md`
- Dashboard and report routes/states: `docs/05-React-UI-Blueprint.md`
- Test isolation and QA expectations: `docs/11-QA-Testing-Guide.md`
- Sprint coordination and seed ownership: `docs/10-Daily-Sprint-Plan.md` and
  `docs/intern-tasks/00-Sprint-Plan-All-Interns.md`

## Cross-Document Note

`docs/04-REST-API-Specification.md` is the source of truth for report paths.
The QA checklist in `docs/qa/API-Contract-Checklist-Himaja.md` and the
regression checklist in `docs/qa/Cross-Module-Regression-Himaja.md` were
updated to use the canonical paths. QA must not test the obsolete aliases
`/api/v1/reports/project-progress` or `/api/v1/reports/overdue-tasks`.

## Validation Note

Node `20.19.0` is the active runtime. The focused backend suite passes with 6
tests. Frontend widget tests pass with 2 tests, frontend lint has 0 errors and
6 existing warnings, and the production build succeeds.

