# Role And Permission - Venkat

## Module Overview

Own role-based access control. This module manages roles, permissions, role-permission mapping, user role assignment support, backend authorization middleware, and frontend permission-aware UI behavior.

## Execution Prompt

Read all `docs/*.md` files and inspect existing backend/frontend code. Generate and complete tasks for roles and permissions using the documented architecture. Coordinate with Yamini for JWT and `req.user`, and with every module owner for permission names. Build RBAC APIs, middleware, UI, tests, and Postman requests.

## Backend Responsibilities

- Implement `backend/src/modules/roles`.
- Create role, permission, and role-permission APIs.
- Provide middleware/helper for permission checks.
- Support system roles and protect them from unsafe edits/deletes.
- Support assigning roles to users if owned here or coordinate with user module.
- Seed default roles and permissions.

## Frontend Responsibilities

- Implement `frontend/src/features/roles`.
- Build role list, role form, permission assignment, and role details pages.
- Build or coordinate `PermissionGate` usage.
- Hide or disable UI actions based on permissions.
- Show permission errors clearly.

## API Endpoints To Implement Or Consume

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/roles` | List roles |
| `POST` | `/api/v1/roles` | Create role |
| `GET` | `/api/v1/roles/:roleId` | Get role |
| `PATCH` | `/api/v1/roles/:roleId` | Update role |
| `DELETE` | `/api/v1/roles/:roleId` | Delete non-system role |
| `GET` | `/api/v1/permissions` | List permissions |
| `PUT` | `/api/v1/roles/:roleId/permissions` | Replace role permissions |
| `POST` | `/api/v1/users/:userId/roles` | Assign role to user if API spec assigns ownership here |

## Database Collections And Models

- `roles`: role metadata and system-role flag.
- `permissions`: permission keys and descriptions.
- `rolepermissions`: mapping collection.
- `users`: consumed for role assignment.

## Folder/File Structure To Create Or Update

```text
backend/src/modules/roles/
  role.routes.js
  role.controller.js
  role.service.js
  role.repository.js
  role.validation.js
  role.mapper.js
  role.model.js
  permission.model.js
  rolePermission.model.js
backend/src/middleware/
  authorize.js
frontend/src/features/roles/
  pages/RoleListPage.jsx
  pages/RoleDetailsPage.jsx
  pages/CreateRolePage.jsx
  pages/EditRolePage.jsx
  components/RoleForm.jsx
  components/PermissionMatrix.jsx
  components/PermissionGate.jsx
  services/roleService.js
  hooks/useRoles.js
```

## Step-By-Step Task Checklist

- [ ] Read RBAC sections in docs.
- [ ] Create permission naming list for all modules.
- [ ] Coordinate JWT claims and `req.user.permissions` with Yamini.
- [ ] Define roles/permissions API contracts.
- [ ] Implement role, permission, and mapping models.
- [ ] Add seed data for default roles and permissions.
- [ ] Implement validation and system-role protection.
- [ ] Implement repositories, services, controllers, and routes.
- [ ] Implement `authorize(permissionKey)` middleware/helper.
- [ ] Build role/permission frontend pages.
- [ ] Add `PermissionGate` or equivalent shared UI component.
- [ ] Add backend, UI/manual, and Postman tests.

## Validation Rules

- Role name is required and unique within scope.
- Permission keys must use documented naming convention.
- System roles cannot be deleted and have restricted edits.
- Permission assignments must reference existing permission IDs.
- Protected APIs must deny users without required permissions.

## Test Cases

- Create role succeeds.
- Duplicate role name is rejected.
- Assign permissions to a role.
- Assign role to user if in scope.
- Protected action allowed with required permission.
- Protected action denied without permission.
- System role delete/edit rules work.
- Permission changes are reflected after refresh/login.
- Permission-based frontend actions hide or disable correctly.

## Integration Dependencies

- Depends on authentication for current user and JWT claims.
- User module consumes role assignment/display.
- All feature modules consume `authorize` middleware and permission keys.
- Dashboard/report module may filter by permissions.

## Definition Of Done

- RBAC APIs work with standard responses.
- Permission middleware can protect backend routes.
- Permission UI can manage role-permission mapping.
- Permission gates are available for frontend usage.
- Default roles/permissions are seeded and documented.
- Tests cover allowed and denied cases.

## Sprint-Wise Responsibilities

| Sprint | Responsibility |
|---|---|
| Day 1 | Read docs, define permission contract, create skeletons, coordinate with auth. |
| Day 2 | Build models/routes/validation/controllers and seed permission data. |
| Day 3 | Build services/repositories/authorization middleware and API tests. |
| Day 4 | Build role pages, permission matrix, services, hooks, and permission gate. |
| Day 5 | Integrate permissions across modules and verify protected route behavior. |
| Day 6 | Finish RBAC tests, Postman requests, permission matrix docs, and fixes. |

