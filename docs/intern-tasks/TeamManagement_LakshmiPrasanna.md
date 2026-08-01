# Team Management - LakshmiPrasanna

## Module Overview

Own teams, team members, and sprint basics when needed for the Day 6 demo. This module manages team CRUD, membership, team-user relationships, and the team context consumed by tasks, dashboards, and reports.

## Execution Prompt

Read all `docs/*.md` files and inspect existing backend/frontend code. Generate and complete tasks for team management using the documented architecture. Use mock users/auth until those modules are merged. Coordinate sprint boundaries with task and project owners. Build APIs, UI, tests, and Postman requests.

## Backend Responsibilities

- Implement `backend/src/modules/teams`.
- Create team CRUD endpoints.
- Manage team members.
- Implement sprint basics if assigned: create/list/update sprint lifecycle.
- Enforce auth, permission, and membership rules.
- Provide team summary data needed by dashboard/reporting.

## Frontend Responsibilities

- Implement `frontend/src/features/teams`.
- Build team list, detail, create/edit pages.
- Build team member management UI.
- Add sprint basic UI only if required for integration/demo.
- Connect team UI to team services/hooks.

## API Endpoints To Implement Or Consume

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/teams` | List/search teams |
| `POST` | `/api/v1/teams` | Create team |
| `GET` | `/api/v1/teams/:teamId` | Get team detail |
| `PATCH` | `/api/v1/teams/:teamId` | Update team |
| `DELETE` | `/api/v1/teams/:teamId` | Delete/archive team |
| `GET` | `/api/v1/teams/:teamId/members` | List team members |
| `POST` | `/api/v1/teams/:teamId/members` | Add team member |
| `DELETE` | `/api/v1/teams/:teamId/members/:userId` | Remove team member |
| `GET` | `/api/v1/teams/:teamId/projects` | Team projects if included |
| `GET` | `/api/v1/sprints` | List sprints if sprint basics are assigned |
| `POST` | `/api/v1/sprints` | Create sprint if sprint basics are assigned |

## Database Collections And Models

- `teams`: primary team records.
- `teammembers`: user-team membership.
- `users`: consumed for member lookup.
- `projects`: consumed for team/project association if included.
- `sprints`: owned here only for sprint basics if agreed.

## Folder/File Structure To Create Or Update

```text
backend/src/modules/teams/
  team.routes.js
  team.controller.js
  team.service.js
  team.repository.js
  team.validation.js
  team.mapper.js
  team.model.js
  teamMember.model.js
backend/src/modules/sprints/
  sprint.* files only if sprint basics are assigned
frontend/src/features/teams/
  pages/TeamListPage.jsx
  pages/TeamDetailsPage.jsx
  pages/CreateTeamPage.jsx
  pages/EditTeamPage.jsx
  components/TeamForm.jsx
  components/TeamMemberManager.jsx
  services/teamService.js
  hooks/useTeams.js
frontend/src/features/sprints/
  sprint basic UI only if in scope
```

## Step-By-Step Task Checklist

- [ ] Read team and sprint sections in docs.
- [ ] Define team API contract and permissions.
- [ ] Confirm sprint ownership with Manasa and Trisha.
- [ ] Create team and team member models.
- [ ] Implement validations for teams and members.
- [ ] Implement repositories and services with membership rules.
- [ ] Implement controllers/routes and register route.
- [ ] Add seed teams/team members.
- [ ] Build team frontend services/hooks.
- [ ] Build team list/detail/form/member UI.
- [ ] Add sprint basic implementation only if needed for task planning.
- [ ] Add API, manual UI, and Postman tests.

## Validation Rules

- Team name is required.
- Member user IDs must exist.
- Duplicate team members are not allowed.
- Team lead must be a valid active user if included.
- Sprint dates must be valid and start before end if sprint basics are included.
- Only authorized users can manage teams/members.

## Test Cases

- Create team succeeds.
- Add member succeeds.
- Duplicate member is rejected.
- Remove member succeeds.
- Invalid user is rejected.
- Permission checks are enforced.
- Workspace isolation is respected if active.
- Team pages load list/detail/member states.
- Sprint basic lifecycle works if included.

## Integration Dependencies

- Depends on auth/RBAC for protected access.
- Depends on users for team membership.
- May depend on projects for team-project links.
- Provides team context to task assignment and dashboard workload.

## Definition Of Done

- Team and team member APIs work.
- Team frontend pages are connected and permission-aware.
- Sprint basics are either implemented or explicitly handed off.
- Tests and Postman requests cover CRUD, members, permissions, and invalid user cases.

## Sprint-Wise Responsibilities

| Sprint | Responsibility |
|---|---|
| Day 1 | Read docs, define team/member contracts, confirm sprint scope, create skeletons. |
| Day 2 | Build models/routes/validation/controllers and seed team data. |
| Day 3 | Build services/repositories/member rules and API tests. |
| Day 4 | Build team frontend pages, services, hooks, forms, and member manager. |
| Day 5 | Integrate with real auth/users/tasks/dashboard and verify membership rules. |
| Day 6 | Finish tests, Postman requests, documentation, and fixes. |

