# Role & Permission Module - ETMS

**Module Owner:** Venkat  
**Status:** Complete for Day 6  
**Last Updated:** 2026-08-03

## Overview

The Role & Permission module implements a comprehensive Role-Based Access Control (RBAC) system for the Enterprise Task Management System. This module manages:

- **Roles**: Define access levels and user groups (Admin, Developer, Manager, User)
- **Permissions**: Granular actions that can be performed (TASK_CREATE, PROJECT_UPDATE, etc.)
- **Role-Permission Mapping**: Assign permissions to roles
- **Authorization Middleware**: Protect backend routes based on permissions

## Architecture

### Backend Structure

```
backend/src/modules/roles/
├── role.model.js              # Mongoose schemas for Role, Permission, RolePermission
├── role.repository.js          # Data access layer
├── role.service.js             # Business logic
├── role.controller.js          # Request handlers
├── role.routes.js              # API routes
├── role.validation.js          # Input validation schemas
├── role.mapper.js              # Data transformation
└── role.seed.js                # Initial data seeding
```

### Frontend Structure

```
frontend/src/features/roles/
├── services/
│   └── roleService.js          # API communication
├── hooks/
│   └── useRoles.js             # Custom React hooks
├── components/
│   ├── PermissionGate.jsx      # Conditional rendering component
│   ├── RoleForm.jsx            # Form for creating/editing roles
│   └── PermissionMatrix.jsx    # Visual permission selector
├── pages/
│   ├── RoleListPage.jsx        # List all roles
│   ├── RoleDetailsPage.jsx     # View role details
│   ├── CreateRolePage.jsx      # Create new role
│   └── EditRolePage.jsx        # Edit existing role
└── styles/
    └── *.css                   # Component styles
```

## API Endpoints

### Role Endpoints

| Method | Path | Purpose | Permission | Status |
|--------|------|---------|-----------|--------|
| `GET` | `/api/v1/roles` | List roles | `ROLE_VIEW` | ✅ |
| `POST` | `/api/v1/roles` | Create role | `ROLE_CREATE` | ✅ |
| `GET` | `/api/v1/roles/:roleId` | Get role details | `ROLE_VIEW` | ✅ |
| `PATCH` | `/api/v1/roles/:roleId` | Update role | `ROLE_UPDATE` | ✅ |
| `DELETE` | `/api/v1/roles/:roleId` | Delete role | `ROLE_DELETE` | ✅ |

### Permission Endpoints

| Method | Path | Purpose | Permission | Status |
|--------|------|---------|-----------|--------|
| `GET` | `/api/v1/permissions` | List permissions | Any Authenticated | ✅ |
| `GET` | `/api/v1/roles/:roleId/permissions` | Get role permissions | `ROLE_VIEW` | ✅ |
| `PUT` | `/api/v1/roles/:roleId/permissions` | Update role permissions | `ROLE_MANAGE` | ✅ |

## Seeded Roles & Permissions

### System Roles (Cannot be deleted or modified)

1. **ADMIN** - Full system access with all permissions
2. **USER** - Basic read-only access (view tasks, projects, teams, dashboard, notifications)

### Custom Roles (Can be created/modified)

3. **DEVELOPER** - Task management, project viewing, commenting
4. **MANAGER** - Full team/project management, user management, reporting

### Permission Categories

Permissions are organized by module and category:

- **USER**: CRUD operations on user accounts
- **ROLE**: RBAC management (view, create, update, delete, manage permissions)
- **PROJECT**: Project management and member assignments
- **TEAM**: Team management and member assignments
- **TASK**: Task operations (view, create, update, assign, delete)
- **SPRINT**: Sprint management
- **DASHBOARD**: Dashboard/analytics viewing
- **REPORT**: Report generation and viewing
- **NOTIFICATION**: Notification viewing
- **ATTACHMENT**: File upload and management
- **COMMENT**: Comment management

## Usage

### Backend - Protecting Routes

```javascript
const express = require("express");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const taskController = require("./task.controller");

const router = express.Router();

// Public route (no authentication)
router.get("/public", taskController.getPublic);

// Authenticated route (any logged-in user)
router.get("/", authenticate, taskController.list);

// Route with permission check
router.post("/", 
  authenticate, 
  authorize("TASK_CREATE"), 
  taskController.create
);

// Multiple permissions (user must have ALL)
router.patch("/:taskId",
  authenticate,
  authorize("TASK_UPDATE"),
  taskController.update
);

module.exports = router;
```

### Frontend - Conditional Rendering

```jsx
import PermissionGate from "../../features/roles/components/PermissionGate";

function TaskForm() {
  return (
    <form>
      <input type="text" placeholder="Task title" />
      
      {/* Only show delete button for users with permission */}
      <PermissionGate permission="TASK_DELETE">
        <button type="button" className="btn-danger">
          Delete Task
        </button>
      </PermissionGate>
      
      {/* Show fallback if no permission */}
      <PermissionGate 
        permission="TASK_ASSIGN"
        fallback={<span>You cannot assign tasks</span>}
      >
        <select>
          <option>Assign to...</option>
        </select>
      </PermissionGate>
    </form>
  );
}
```

### Frontend - Using Role/Permission Hooks

```jsx
import { useRoles, usePermissions, useRolePermissions } from "../hooks/useRoles";

function RoleManager() {
  const { roles, loading, fetchRoles, createRole } = useRoles();
  const { permissions, fetchPermissions } = usePermissions();
  const { permissions: rolePerms, updatePermissions } = useRolePermissions(roleId);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const handleCreateRole = async (roleData) => {
    try {
      const response = await createRole(roleData);
      console.log("Role created:", response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      {loading ? <p>Loading...</p> : (
        <>
          <h2>Roles: {roles.length}</h2>
          <button onClick={() => handleCreateRole({name: "QA_ENGINEER"})}>
            Create Role
          </button>
        </>
      )}
    </div>
  );
}
```

## Integration Points

### Coordination with Other Modules

1. **Authentication Module (Yamini)**
   - Uses `req.user.permissions` from JWT claims
   - Coordinates permission payload structure
   - Uses authenticate middleware

2. **User Management Module (Raheema)**
   - Assigns roles to users
   - Endpoint: `POST /api/v1/users/:userId/roles`
   - Uses role IDs from this module

3. **All Feature Modules**
   - Use `authorize(permission)` middleware for route protection
   - Use `PermissionGate` component for UI conditional rendering
   - Consume permission keys from this module

## System Role Protection

System roles (ADMIN, USER) are protected from:
- **Deletion**: Cannot be deleted via API
- **Modification**: Cannot update name or permissions
- **Admin role**: Has ALL permissions assigned

Attempting to modify system roles returns:
```json
{
  "success": false,
  "code": "SYSTEM_ROLE_PROTECTED",
  "message": "System roles cannot be modified",
  "statusCode": 403
}
```

## Testing

### Backend Tests
Run tests using Jest:
```bash
npm test -- tests/roles.test.js
```

Test Coverage:
- ✅ Role CRUD operations
- ✅ Permission listing and assignment
- ✅ Duplicate role name detection
- ✅ System role protection
- ✅ Permission validation
- ✅ Authorization checks
- ✅ Pagination and filtering

### Postman Collection
Import `backend/postman/ETMS-RolePermission.postman_collection.json` in Postman

Variables to configure:
- `baseUrl`: `http://localhost:3000`
- `accessToken`: Valid JWT token
- `roleId`: Target role ID
- `permissionId_*`: Permission IDs

### Manual Testing Checklist
- [ ] Create custom role with permissions
- [ ] Update role description
- [ ] Assign/remove permissions
- [ ] Try to modify system role (should fail)
- [ ] Try to delete system role (should fail)
- [ ] List all roles with pagination
- [ ] List permissions by module
- [ ] Verify permission gates hide/show UI correctly
- [ ] Test authorization middleware on protected routes

## Database Collections

### roles
```javascript
{
  _id: ObjectId,
  name: String (unique),        // "DEVELOPER", "MANAGER"
  description: String,           // Role description
  isSystem: Boolean,             // true for ADMIN/USER
  isActive: Boolean,             // Active status
  createdAt: Date,
  updatedAt: Date
}
```

### permissions
```javascript
{
  _id: ObjectId,
  key: String (unique),          // "TASK_CREATE", "PROJECT_VIEW"
  description: String,           // Permission description
  module: String,                // "TASK", "PROJECT", "USER", etc.
  category: String,              // "VIEW", "CREATE", "UPDATE", "DELETE", "MANAGE"
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### rolepermissions
```javascript
{
  _id: ObjectId,
  roleId: ObjectId (ref: Role),
  permissionId: ObjectId (ref: Permission),
  createdAt: Date,
  updatedAt: Date
}
// Unique constraint on (roleId, permissionId)
```

## Error Handling

Common error codes returned by the API:

| Code | HTTP | Description |
|------|------|------------|
| `ROLE_NOT_FOUND` | 404 | Role does not exist |
| `PERMISSION_NOT_FOUND` | 404 | Permission does not exist |
| `ROLE_NAME_ALREADY_EXISTS` | 409 | Role name is already taken |
| `PERMISSION_KEY_ALREADY_EXISTS` | 409 | Permission key is already taken |
| `SYSTEM_ROLE_PROTECTED` | 403 | Cannot modify/delete system role |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `PERMISSION_DENIED` | 403 | User lacks required permission |
| `AUTH_REQUIRED` | 401 | Authentication token missing/invalid |

## Performance Considerations

- Role and permission data are indexed for fast lookups
- Permissions are cached in JWT claims to avoid database queries for authorization checks
- RolePermission mapping uses unique index for fast lookups
- Pagination is implemented for large result sets

## Security Notes

1. **Permission Check Happens Server-Side**
   - Frontend permission gates are for UX only
   - All backend routes enforce authorization
   - Never trust client-side permission checks

2. **System Roles**
   - Hardcoded ADMIN and USER roles
   - Cannot be deleted or have permissions modified
   - Prevent accidental removal of critical access

3. **JWT Claims**
   - User permissions are encoded in JWT at login
   - Permission changes require re-login to take effect
   - Coordinate with auth module for claim structure

## Known Limitations & Future Work

1. **Permission Inheritance**: Currently no role hierarchy
2. **Dynamic Permissions**: Permission keys are hardcoded; dynamic registration not implemented
3. **Audit Trail**: No logging of permission/role changes
4. **Bulk Operations**: No bulk role creation or permission assignment
5. **Time-based Access**: No time-limited permission assignments

## Definition of Done Checklist

- [✅] Models created (Role, Permission, RolePermission)
- [✅] Repository with full CRUD operations
- [✅] Service layer with business logic
- [✅] Controllers and routes
- [✅] Input validation
- [✅] Authorization middleware integration
- [✅] Seed data for default roles/permissions
- [✅] Frontend pages for role management
- [✅] Permission matrix UI component
- [✅] PermissionGate component for UI gating
- [✅] Custom React hooks (useRoles, usePermissions, useRolePermissions)
- [✅] Role API service
- [✅] Backend tests with Jest
- [✅] Postman collection
- [✅] System role protection
- [✅] Error handling with proper codes
- [✅] Documentation (this file)

## Contact & Support

**Module Owner:** Venkat  
**Questions?** Contact other module owners for integration help.

---

**Last Updated:** 2026-08-03  
**Status:** Complete ✅
