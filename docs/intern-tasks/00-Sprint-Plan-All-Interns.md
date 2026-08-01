# Sprint Plan - All Interns

## Purpose

This plan divides the Enterprise Task Management System work across 8 feature modules plus one integration and QA coordinator. Every intern works in parallel, but all implementation must integrate through REST APIs and follow the documented flow:

Backend: Route -> Middleware / Validation -> Controller -> Service -> Repository -> Mongoose Model -> MongoDB

Frontend: Pages -> Components -> Hooks -> Services -> axiosClient -> REST API

Authentication is the first shared dependency. Yamini must publish the auth contract on Day 1. Other interns should use a temporary mock authenticated user until the real JWT flow is merged.

## Shared Rules

- Read all files in `docs/` before coding.
- Own only your module folders unless a shared file change is reviewed.
- Use `/api/v1` routes and the standard success/error response format from the REST API specification.
- Document each endpoint contract before implementation: method, path, request, response, permissions, errors, and dependencies.
- Use protected routes and permission checks after authentication and RBAC are available.
- Add backend API tests, frontend/manual tests, and Postman test coverage.
- Keep branches module-focused and follow the Git workflow guide.

## Module Ownership

| Intern | Module | Backend Ownership | Frontend Ownership |
|---|---|---|---|
| Yamini | Authentication | `backend/src/modules/auth`, auth middleware, user session/reset-token support | `frontend/src/features/auth`, auth pages, protected routes, auth state |
| Raheema | User Management | `backend/src/modules/users` | `frontend/src/features/users` |
| Venkat | Role & Permission | `backend/src/modules/roles`, permission middleware support | `frontend/src/features/roles` |
| Trisha | Project Management | `backend/src/modules/projects` | `frontend/src/features/projects` |
| LakshmiPrasanna | Team Management | `backend/src/modules/teams`, sprint basics with coordination | `frontend/src/features/teams`, sprint basics if needed |
| Manasa | Task Management | `backend/src/modules/tasks` | `frontend/src/features/tasks` |
| Bhavinash | Comments & Attachments | `backend/src/modules/comments`, `backend/src/modules/attachments` | `frontend/src/features/comments`, attachment UI inside task/project views |
| Konaiah | Dashboard & Reports | `backend/src/modules/dashboard`, report APIs, notification/report consumption | `frontend/src/features/dashboard`, report pages and charts |
| Himaja | Integration + QA Coordinator | API contract checks, seed data, integration support | Smoke testing, UI flow checks, sprint validation |

## Sprint 1 - Day 1

Goal: Read docs, understand architecture, set up local development, define API contracts, and create module skeletons.

| Intern | Day 1 Responsibility |
|---|---|
| Yamini | Define auth contract first: login, logout, current user, password reset, JWT payload, `req.user` shape, protected route behavior, token storage approach, and mock auth data for other interns. Create auth backend/frontend skeletons. |
| Raheema | Read user sections in SRS, DB, API, UI, QA docs. Define user CRUD/profile/status API contract using Yamini's mock auth contract. Create user module skeletons. |
| Venkat | Define role, permission, role-permission, and role assignment contracts. Coordinate with Yamini on JWT claims and permission middleware contract. Create role module skeletons. |
| Trisha | Define project CRUD and project member contracts. Coordinate with users, roles, tasks, and dashboard owners. Create project module skeletons. |
| LakshmiPrasanna | Define team CRUD, team member, and sprint-basics contracts. Coordinate with users, projects, and tasks. Create team module skeletons. |
| Manasa | Review existing task stubs. Define task CRUD, assignment, status, labels, checklist, filters, and board contracts. Use mock users/projects until APIs are ready. |
| Bhavinash | Define task comment and attachment upload/list/download/delete contracts. Coordinate with task access rules and file upload limits. Create comments/attachments skeletons. |
| Konaiah | Define dashboard summary, chart, report, and widget contracts. Identify which metrics can use mock/seed data before other modules are complete. Create dashboard skeletons. |
| Himaja | Create API contract checklist, module dependency map, seed-data plan, and Day 1 review checklist. Confirm each intern has a branch and module folder plan. |

## Sprint 2 - Day 2

Goal: Implement backend models, routes, validations, controllers, and seed/mock data.

| Intern | Day 2 Responsibility |
|---|---|
| Yamini | Build User auth fields support, user sessions/password reset token models if needed, auth routes, validation schemas, controller methods, password hashing plan, and JWT helper. |
| Raheema | Build user model fields not covered by auth, user repository, validation, controller routes for list/create/read/update/deactivate, and seed users. |
| Venkat | Build roles, permissions, rolepermissions models/routes/controllers/validations and initial permission seed constants. |
| Trisha | Build projects and projectmembers models/routes/controllers/validations, including member role checks and seed projects. |
| LakshmiPrasanna | Build teams and teammembers models/routes/controllers/validations, plus basic sprint model/routes if assigned in this module. |
| Manasa | Complete task model, routes, validations, controller, mapper, assignment/label/checklist model planning, and seed tasks. |
| Bhavinash | Build comments and attachments models/routes/controllers/validations. Add upload route shape and storage metadata fields. |
| Konaiah | Build dashboard/report route contracts and controllers that can return seed/mock metric output until real aggregation is ready. |
| Himaja | Review route naming, response shapes, validation coverage, and seed data consistency across modules. Start Postman collection sections. |

## Sprint 3 - Day 3

Goal: Implement services, repositories, middleware integration, and basic API testing.

| Intern | Day 3 Responsibility |
|---|---|
| Yamini | Finish login/token/current-user/logout/password-reset services. Add authenticate middleware and document `req.user`. Test auth success/failure flows. |
| Raheema | Finish user services/repositories, pagination/search/status logic, permission hooks, and auth integration. Test CRUD and permission failures. |
| Venkat | Finish RBAC services, permission middleware, system-role protections, and role assignment rules. Test allowed/denied actions. |
| Trisha | Finish project services/repositories, project member rules, workspace/project isolation checks, and API tests. |
| LakshmiPrasanna | Finish team services/repositories, team member rules, sprint basic lifecycle if included, and API tests. |
| Manasa | Finish task services/repositories, project/member validation through API/service contracts, filters, pagination, assignment/status flows, and API tests. |
| Bhavinash | Finish comment/attachment services/repositories, task access validation, upload validation, download/delete rules, and API tests. |
| Konaiah | Implement aggregation services for counts, status/priority charts, workload, overdue reports, and widget layout persistence. Test with known seed data. |
| Himaja | Run module API smoke checks, track blockers, verify auth/RBAC contract adoption, and record integration risks. |

## Sprint 4 - Day 4

Goal: Build frontend pages, components, hooks, and services. Connect to APIs or mock APIs.

| Intern | Day 4 Responsibility |
|---|---|
| Yamini | Build login, forgot password, reset password, auth service, auth hook/context, route guard, logout flow, and token attachment in `axiosClient`. |
| Raheema | Build user list, create/edit form, profile page, user service, hooks, loading/error/empty states, and permission-aware actions. |
| Venkat | Build role list/detail/form, permission assignment UI, user role assignment UI, permission gate component usage, and role services/hooks. |
| Trisha | Build project list, project detail, project form, project member UI, project services/hooks, and project navigation. |
| LakshmiPrasanna | Build team list/detail/form, team member UI, team services/hooks, and sprint basic UI if in scope. |
| Manasa | Build task list, board columns, task form, task details, filters, status/priority badges, checklist/label UI, and task services/hooks. |
| Bhavinash | Build comments panel, comment form/edit/delete UI, attachment upload/list/download/delete UI, and frontend validation. |
| Konaiah | Build dashboard cards, status/priority charts, workload view, report filters/pages, widget layout UI, and dashboard/report services. |
| Himaja | Perform UI smoke testing for each page, verify route registration, inspect browser console errors, and maintain demo checklist. |

## Sprint 5 - Day 5

Goal: Integrate real authentication, roles, protected routes, and cross-module behavior.

| Intern | Day 5 Responsibility |
|---|---|
| Yamini | Replace mocks with real auth state, verify JWT injection, protected routes, `req.user`, logout/session cleanup, and password reset security. |
| Raheema | Integrate user CRUD with real auth/RBAC. Verify admin-only actions, duplicate email handling, and profile ownership rules. |
| Venkat | Integrate permission middleware and frontend permission gates across user/project/team/task/dashboard screens. |
| Trisha | Integrate projects with users, roles, tasks, and dashboard metrics. Verify project member permissions and isolation. |
| LakshmiPrasanna | Integrate teams with users, projects, tasks, and sprint/task dependencies. Verify team membership rules. |
| Manasa | Integrate tasks with projects, users, teams/sprints, comments, attachments, dashboard, and RBAC. Verify task assignment rules. |
| Bhavinash | Integrate comments/attachments with real task/project access rules and authenticated users. Verify ownership and upload authorization. |
| Konaiah | Integrate dashboard/reports with real project/task/team/comment/attachment data and permission filters. |
| Himaja | Run cross-module regression: login -> role assignment -> project -> team -> task -> comment -> attachment -> dashboard/report. |

## Sprint 6 - Day 6

Goal: Fix bugs, complete tests, finalize documentation, and prepare the demo.

| Intern | Day 6 Responsibility |
|---|---|
| Yamini | Complete auth test cases, security checklist, Postman auth collection, and auth README notes. |
| Raheema | Complete user tests, UI/manual tests, Postman user collection, and user module notes. |
| Venkat | Complete RBAC tests, permission matrix validation, Postman role collection, and permission documentation. |
| Trisha | Complete project tests, member tests, Postman project collection, and project module notes. |
| LakshmiPrasanna | Complete team/sprint tests, Postman team collection, and team module notes. |
| Manasa | Complete task tests, board/manual tests, Postman task collection, and task module notes. |
| Bhavinash | Complete comments/attachments tests, file upload security tests, Postman collection, and module notes. |
| Konaiah | Complete dashboard/report tests, verify metrics against seed data, Postman collection, and report notes. |
| Himaja | Run final smoke/regression suite, verify Definition of Done for every module, collect known issues, and prepare demo script. |

## Final Integration Demo Flow

1. Login as admin.
2. Create or update a user.
3. Create a role and assign permissions.
4. Assign the role to a user.
5. Create a project and add members.
6. Create a team and add members.
7. Create a sprint if available.
8. Create a task, assign it, and move status.
9. Add a comment.
10. Upload an attachment.
11. View dashboard metrics.
12. View reports.

