# Dashboard And Reports - Konaiah

## Module Overview

Own dashboard metrics, charts, report summaries, and widget layout persistence. This module consumes data from projects, teams, tasks, comments, attachments, and users through stable APIs/repositories/contracts, then exposes summarized views for the frontend.

## Execution Prompt

Read all `docs/*.md` files and inspect existing backend/frontend code. Generate and complete tasks for dashboard and reports using the documented architecture. Use seed/mock data until other modules are complete, then integrate real data. Build dashboard/report APIs, frontend cards/charts/pages, tests, and Postman requests.

## Backend Responsibilities

- Implement `backend/src/modules/dashboard`.
- Add report API module/files if docs require separate reports.
- Provide summary counts, status charts, priority charts, workload, overdue tasks, project progress, and saved widget layout.
- Enforce auth, permissions, and data visibility.
- Use aggregation carefully and verify metrics against seed data.

## Frontend Responsibilities

- Implement `frontend/src/features/dashboard`.
- Build dashboard cards, charts, report filters, reports pages, and widget layout UI.
- Connect to dashboard/report services/hooks.
- Handle empty data, loading, errors, and permission-denied states.

## API Endpoints To Implement Or Consume

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/dashboard/summary` | Dashboard summary cards |
| `GET` | `/api/v1/dashboard/tasks-by-status` | Task status chart |
| `GET` | `/api/v1/dashboard/tasks-by-priority` | Task priority chart |
| `GET` | `/api/v1/dashboard/team-workload` | Team/user workload |
| `GET` | `/api/v1/dashboard/widgets` | Current user's dashboard widgets |
| `PUT` | `/api/v1/dashboard/widgets` | Save widget layout |
| `GET` | `/api/v1/reports/project-progress` | Project progress report |
| `GET` | `/api/v1/reports/overdue-tasks` | Overdue task report |
| `GET` | `/api/v1/reports/task-history` | Task history report if included |

## Database Collections And Models

- `dashboardwidgets`: widget layout/preferences.
- `tasks`: consumed for counts/status/priority/overdue.
- `projects`: consumed for project progress.
- `teams` and `teammembers`: consumed for workload.
- `users`: consumed for workload/user labels.
- `comments`, `attachments`, `taskhistory`: consumed for activity/report summaries if included.

## Folder/File Structure To Create Or Update

```text
backend/src/modules/dashboard/
  dashboard.routes.js
  dashboard.controller.js
  dashboard.service.js
  dashboard.repository.js
  dashboard.validation.js
  dashboard.mapper.js
  dashboardWidget.model.js
backend/src/modules/reports/
  report.routes.js
  report.controller.js
  report.service.js
  report.repository.js
  report.validation.js
frontend/src/features/dashboard/
  pages/DashboardPage.jsx
  pages/ReportsPage.jsx
  components/SummaryCard.jsx
  components/StatusChart.jsx
  components/PriorityChart.jsx
  components/WorkloadChart.jsx
  components/ReportFilters.jsx
  services/dashboardService.js
  services/reportService.js
  hooks/useDashboard.js
```

## Step-By-Step Task Checklist

- [ ] Read dashboard, report, DB, API, UI, and QA docs.
- [ ] Define dashboard/report contracts and permissions.
- [ ] Define seed data expectations with Himaja.
- [ ] Implement widget model and validation.
- [ ] Implement routes/controllers for summaries and reports.
- [ ] Implement repositories/aggregations for task/project/team metrics.
- [ ] Add guards so users only see authorized data.
- [ ] Verify results against known seed data.
- [ ] Build frontend services/hooks.
- [ ] Build cards, charts, report filters, and report pages.
- [ ] Add empty/loading/error states.
- [ ] Add API, UI/manual, and Postman tests.

## Validation Rules

- Date filters must be valid.
- Project/team filters must reference accessible entities.
- Widget layout payload must contain valid widget IDs and positions.
- Reports must enforce permissions.
- Aggregations must exclude deleted/archived records if the data model requires it.

## Test Cases

- Dashboard returns correct counts.
- Status grouping is correct.
- Priority grouping is correct.
- Project filter changes results.
- Date filter changes results.
- Empty data returns zero/empty series gracefully.
- Workspace isolation is respected if active.
- Permissions are enforced.
- Large seed data does not break response shape.
- Frontend charts/cards render loading, empty, and populated states.

## Integration Dependencies

- Depends on auth/RBAC for visibility and report access.
- Consumes project, team, task, comment, attachment, and user data.
- Coordinates seed data with Himaja.
- Must not mutate other modules' data.

## Definition Of Done

- Dashboard and report APIs return reliable aggregated data.
- Frontend dashboard and reports are connected and permission-aware.
- Metrics are verified against known seed data.
- Tests and Postman requests cover filters, empty data, permissions, and aggregation correctness.

## Sprint-Wise Responsibilities

| Sprint | Responsibility |
|---|---|
| Day 1 | Read docs, define metric/report contracts, create skeletons, identify mock data. |
| Day 2 | Build routes/controllers/validation/widget model and mock/seed metric output. |
| Day 3 | Build repositories/services/aggregations and API tests. |
| Day 4 | Build dashboard/report frontend pages, cards, charts, services, and hooks. |
| Day 5 | Integrate real auth and real module data; verify metric permissions. |
| Day 6 | Finish metric tests, Postman requests, report documentation, and demo readiness. |

