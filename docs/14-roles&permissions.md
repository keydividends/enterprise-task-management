# Document 14 – Roles & Permissions Matrix

## Enterprise Task Management System (ETMS)

Version: 1.0

---

# 1. Purpose

This document defines:

- System Roles
- Access Levels
- Functional Permissions
- Authorization Matrix
- Role Responsibilities

The ETMS platform uses Role-Based Access Control (RBAC).

Every authenticated user is assigned one or more roles.

Permissions are granted through roles rather than directly to users.

---

# 2. Role Hierarchy

```text
Super Admin
    │
    ├── Organization Admin
    │       │
    │       ├── Project Manager
    │       │       │
    │       │       ├── Team Lead
    │       │       │      │
    │       │       │      ├── Senior Developer
    │       │       │      ├── Developer
    │       │       │      ├── QA Engineer
    │       │       │      └── Intern
    │       │
    │       └── HR Manager
    │
    └── Auditor
```

---

# 3. System Roles

## 3.1 Super Admin

Highest level access.

Responsibilities:

- Platform configuration
- User management
- Role management
- System settings
- Audit review
- Security management

Can access:

- Everything

---

## 3.2 Organization Admin

Manages a specific organization.

Responsibilities:

- Manage users
- Create projects
- Assign project managers
- Manage departments

Can access:

- Organization data
- Teams
- Projects
- Reports

Cannot access:

- Global platform configuration

---

## 3.3 Project Manager

Responsible for project delivery.

Responsibilities:

- Create projects
- Create sprints
- Assign tasks
- Track progress

Can access:

- Assigned projects
- Team members
- Sprint planning

Cannot:

- Create system users
- Manage platform settings

---

## 3.4 Team Lead

Responsible for team execution.

Responsibilities:

- Manage backlog
- Assign tasks
- Review work
- Approve completed tasks

Can access:

- Team tasks
- Sprint board
- Team reports

---

## 3.5 Senior Developer

Responsibilities:

- Implement features
- Code reviews
- Technical guidance

Can:

- Update assigned tasks
- Review pull requests
- Log work hours

Cannot:

- Create projects
- Manage users

---

## 3.6 Developer

Responsibilities:

- Complete assigned work

Can:

- View assigned tasks
- Update task status
- Upload attachments
- Add comments

Cannot:

- Assign tasks
- Delete projects

---

## 3.7 QA Engineer

Responsibilities:

- Testing
- Defect validation

Can:

- Create bugs
- Update test status
- View projects

Cannot:

- Modify sprint planning

---

## 3.8 Intern

Lowest level role.

Can:

- View assigned tasks
- Update own task progress
- Add comments

Cannot:

- Create projects
- Create users
- Delete records

---

## 3.9 HR Manager

Responsibilities:

- Employee management
- Leave management

Can:

- View employees
- Manage leave requests
- View attendance

Cannot:

- Access project planning

---

## 3.10 Auditor

Read-only role.

Can:

- View all records
- View logs
- View reports

Cannot:

- Create
- Update
- Delete

---

# 4. Permission Categories

Permissions are grouped into modules.

---

## Authentication

| Permission | Description |
|------------|-------------|
| LOGIN | Login |
| LOGOUT | Logout |
| RESET_PASSWORD | Reset password |
| CHANGE_PASSWORD | Change password |

---

## User Management

| Permission | Description |
|------------|-------------|
| USER_CREATE | Create users |
| USER_VIEW | View users |
| USER_UPDATE | Update users |
| USER_DELETE | Delete users |
| USER_ACTIVATE | Activate user |
| USER_DEACTIVATE | Deactivate user |

---

## Role Management

| Permission | Description |
|------------|-------------|
| ROLE_CREATE | Create role |
| ROLE_VIEW | View role |
| ROLE_UPDATE | Update role |
| ROLE_DELETE | Delete role |

---

## Team Management

| Permission | Description |
|------------|-------------|
| TEAM_CREATE | Create team |
| TEAM_VIEW | View team |
| TEAM_UPDATE | Update team |
| TEAM_DELETE | Delete team |

---

## Project Management

| Permission | Description |
|------------|-------------|
| PROJECT_CREATE | Create project |
| PROJECT_VIEW | View project |
| PROJECT_UPDATE | Update project |
| PROJECT_DELETE | Delete project |

---

## Sprint Management

| Permission | Description |
|------------|-------------|
| SPRINT_CREATE | Create sprint |
| SPRINT_VIEW | View sprint |
| SPRINT_UPDATE | Update sprint |
| SPRINT_DELETE | Delete sprint |

---

## Task Management

| Permission | Description |
|------------|-------------|
| TASK_CREATE | Create task |
| TASK_VIEW | View task |
| TASK_UPDATE | Update task |
| TASK_DELETE | Delete task |
| TASK_ASSIGN | Assign task |
| TASK_REASSIGN | Reassign task |
| TASK_CLOSE | Close task |

---

## Comment Management

| Permission | Description |
|------------|-------------|
| COMMENT_CREATE | Create comment |
| COMMENT_UPDATE | Update comment |
| COMMENT_DELETE | Delete comment |

---

## Attachment Management

| Permission | Description |
|------------|-------------|
| ATTACHMENT_UPLOAD | Upload file |
| ATTACHMENT_VIEW | View file |
| ATTACHMENT_DELETE | Delete file |

---

## Reports

| Permission | Description |
|------------|-------------|
| REPORT_VIEW | View reports |
| REPORT_EXPORT | Export reports |

---

## Dashboard

| Permission | Description |
|------------|-------------|
| DASHBOARD_VIEW | View dashboard |
| DASHBOARD_CONFIGURE | Configure widgets |

---

## Audit Logs

| Permission | Description |
|------------|-------------|
| AUDIT_VIEW | View logs |
| AUDIT_EXPORT | Export logs |

---

# 5. Role Permission Matrix

Legend:

- ✓ = Allowed
- ✗ = Not Allowed

| Permission | SA | OA | PM | TL | SD | DEV | QA | INT |
|------------|----|----|----|----|-----|-----|----|----|
| User Create | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| User Update | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| User Delete | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Project Create | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Project Update | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Project Delete | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Sprint Create | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Task Create | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Task Assign | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Task Update | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Task Delete | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Comment Create | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Attachment Upload | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Reports View | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Audit View | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

---

# 6. Recommended Initial Roles for Intern Project

For Sprint 1, implement:

1. SUPER_ADMIN
2. PROJECT_MANAGER
3. TEAM_LEAD
4. DEVELOPER
5. INTERN

This keeps RBAC simple while allowing future expansion.

---

# 7. API Authorization Example

```http
GET /api/v1/users
```

Required Permission:

```text
USER_VIEW
```

---

```http
POST /api/v1/projects
```

Required Permission:

```text
PROJECT_CREATE
```

---

```http
DELETE /api/v1/tasks/{id}
```

Required Permission:

```text
TASK_DELETE
```

---

# 8. MongoDB Collections

```text
roles
permissions
role_permissions
users
user_roles
```

---

# 9. Future Enhancements

- Dynamic Permission Builder
- Custom Roles
- Department-Based Permissions
- Workspace-Based Permissions
- Project-Specific Roles
- Multi-Tenant RBAC
- Attribute-Based Access Control (ABAC)

---

End of Document