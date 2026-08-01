# Document 04 -- REST API Specification

**Project:** Enterprise Task Management System (ETMS)\
**Document Type:** REST API Contract\
**Version:** 1.0\
**Status:** Baseline API Specification\
**API Style:** REST / JSON\
**Base Path:** `/api/v1`\
**Authentication:** Bearer JWT\
**Primary Backend:** Node.js + Express + MongoDB/Mongoose

------------------------------------------------------------------------

# 1. Purpose

This document defines the REST API contract for ETMS. It is the
integration agreement between backend and frontend developers and is
intended to let eight interns develop modules independently without
guessing endpoint names, payloads, permissions, response shapes, or
error behavior.

The specification is aligned with the ETMS SRS, architecture, and
database design. It covers authentication, users, projects, teams,
tasks, sprints, dashboards, reports, notifications, and attachments,
plus supporting endpoints required for enterprise workflows.

------------------------------------------------------------------------

# 2. Global API Standards

## 2.1 Base URL

Local:

``` text
http://localhost:3000/api/v1
```

Production:

``` text
https://<api-domain>/api/v1
```

## 2.2 Content Type

``` http
Content-Type: application/json
Accept: application/json
```

File upload endpoints use:

``` http
Content-Type: multipart/form-data
```

## 2.3 Authorization Header

``` http
Authorization: Bearer <access-token>
```

## 2.4 Standard Success Response

``` json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

## 2.5 Standard List Response

``` json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 0,
    "totalPages": 0
  }
}
```

## 2.6 Standard Error Response

``` json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

## 2.7 Common HTTP Status Codes

  Code   Meaning
  ------ -------------------------------------------------------
  200    Successful read/update/action
  201    Resource created
  204    Successful operation with no response body where used
  400    Invalid request / validation
  401    Missing, invalid, or expired authentication
  403    Authenticated but not authorized
  404    Resource not found
  409    Conflict / duplicate / invalid state transition
  413    Uploaded file too large
  415    Unsupported media type
  422    Semantically invalid request where adopted
  429    Rate limit exceeded
  500    Unexpected server error

## 2.8 Common Query Parameters

``` text
page
pageSize
sortBy
sortOrder
search
status
fromDate
toDate
```

Default:

``` text
page=1
pageSize=20
sortOrder=desc
```

Maximum page size should be enforced server-side.

## 2.9 Workspace Scope

Workspace-scoped endpoints must derive or verify workspace access from
authenticated membership. A client-provided workspace identifier must
never be trusted without authorization checks.

## 2.10 Common Error Codes

``` text
AUTH_REQUIRED
AUTH_INVALID_CREDENTIALS
AUTH_TOKEN_EXPIRED
AUTH_INVALID_TOKEN
PERMISSION_DENIED
VALIDATION_ERROR
INVALID_IDENTIFIER
RESOURCE_NOT_FOUND
DUPLICATE_RESOURCE
INVALID_STATE_TRANSITION
WORKSPACE_ACCESS_DENIED
RATE_LIMIT_EXCEEDED
INTERNAL_SERVER_ERROR
```

------------------------------------------------------------------------

# 3. Permission Naming

Representative permissions:

``` text
USER_VIEW
USER_CREATE
USER_UPDATE
USER_DELETE
PROJECT_VIEW
PROJECT_CREATE
PROJECT_UPDATE
PROJECT_DELETE
PROJECT_MANAGE_MEMBERS
TEAM_VIEW
TEAM_CREATE
TEAM_UPDATE
TEAM_DELETE
TEAM_MANAGE_MEMBERS
TASK_VIEW
TASK_CREATE
TASK_UPDATE
TASK_ASSIGN
TASK_DELETE
SPRINT_VIEW
SPRINT_CREATE
SPRINT_UPDATE
SPRINT_MANAGE
DASHBOARD_VIEW
REPORT_VIEW
NOTIFICATION_VIEW
ATTACHMENT_UPLOAD
ATTACHMENT_DELETE
```

Backend authorization is authoritative even when the frontend hides
controls.

------------------------------------------------------------------------

# 4. Endpoint Summary

The baseline specification contains more than 100 endpoints across the
following modules:

-   Authentication & Sessions
-   Users
-   Projects & Project Members
-   Teams & Team Members
-   Tasks, Labels, Checklists & Time
-   Sprints & Epics
-   Dashboards
-   Reports
-   Notifications
-   Attachments

------------------------------------------------------------------------

# 5. Authentication & Session APIs

## 5.1. Login

**URL:** `/api/v1/auth/login`\
**Method:** `POST`\
**Authorization:** Public

### Request

``` json
{"email":"ravi@example.com","password":"Secret@123"}
```

### Validation

Email must be valid; password required; account must be active.

### Response

``` json
{"success":true,"message":"Login successful","data":{"accessToken":"<jwt>","refreshToken":"<token>","user":{"id":"USER_ID","firstName":"Ravi","email":"ravi@example.com","permissions":["TASK_VIEW"]}}}
```

### Error Codes

`VALIDATION_ERROR`, `AUTH_INVALID_CREDENTIALS`, `USER_LOCKED`,
`USER_INACTIVE`, `RATE_LIMIT_EXCEEDED`

## 5.2. Refresh Access Token

**URL:** `/api/v1/auth/refresh`\
**Method:** `POST`\
**Authorization:** Public with valid refresh token

### Request

``` json
{"refreshToken":"<refresh-token>"}
```

### Validation

Refresh token required, unexpired, unrevoked, and associated with an
active session.

### Response

``` json
{"success":true,"data":{"accessToken":"<new-jwt>","refreshToken":"<rotated-refresh-token>"}}
```

### Error Codes

`AUTH_INVALID_TOKEN`, `AUTH_TOKEN_EXPIRED`, `SESSION_REVOKED`

## 5.3. Logout Current Session

**URL:** `/api/v1/auth/logout`\
**Method:** `POST`\
**Authorization:** Authenticated

### Request

`No body required.`

### Validation

Current session must exist.

### Response

``` json
{"success":true,"message":"Logged out successfully"}
```

### Error Codes

`AUTH_REQUIRED`, `SESSION_NOT_FOUND`

## 5.4. Logout All Sessions

**URL:** `/api/v1/auth/logout-all`\
**Method:** `POST`\
**Authorization:** Authenticated

### Request

`No body required.`

### Validation

Authenticated user required.

### Response

``` json
{"success":true,"message":"All sessions revoked"}
```

### Error Codes

`AUTH_REQUIRED`

## 5.5. Get Current User

**URL:** `/api/v1/auth/me`\
**Method:** `GET`\
**Authorization:** Authenticated

### Request

`No body required.`

### Validation

Valid access token required.

### Response

``` json
{"success":true,"data":{"id":"USER_ID","firstName":"Ravi","lastName":"Kumar","email":"ravi@example.com","workspaceMemberships":[]}}
```

### Error Codes

`AUTH_REQUIRED`, `AUTH_TOKEN_EXPIRED`, `USER_NOT_FOUND`

## 5.6. Change Password

**URL:** `/api/v1/auth/change-password`\
**Method:** `PUT`\
**Authorization:** Authenticated

### Request

``` json
{"currentPassword":"Old@123","newPassword":"New@456","confirmPassword":"New@456"}
```

### Validation

Current password required; new password must satisfy password policy and
differ from current password.

### Response

``` json
{"success":true,"message":"Password changed successfully"}
```

### Error Codes

`INVALID_CURRENT_PASSWORD`, `PASSWORD_POLICY_FAILED`, `VALIDATION_ERROR`

## 5.7. Request Password Reset

**URL:** `/api/v1/auth/forgot-password`\
**Method:** `POST`\
**Authorization:** Public

### Request

``` json
{"email":"ravi@example.com"}
```

### Validation

Valid email format. Response should not disclose whether an account
exists.

### Response

``` json
{"success":true,"message":"If the account exists, reset instructions have been sent"}
```

### Error Codes

`VALIDATION_ERROR`, `RATE_LIMIT_EXCEEDED`

## 5.8. Validate Reset Token

**URL:** `/api/v1/auth/reset-password/validate`\
**Method:** `POST`\
**Authorization:** Public

### Request

``` json
{"token":"<reset-token>"}
```

### Validation

Reset token required and must not be expired or used.

### Response

``` json
{"success":true,"data":{"valid":true}}
```

### Error Codes

`RESET_TOKEN_INVALID`, `RESET_TOKEN_EXPIRED`, `RESET_TOKEN_USED`

## 5.9. Reset Password

**URL:** `/api/v1/auth/reset-password`\
**Method:** `POST`\
**Authorization:** Public

### Request

``` json
{"token":"<reset-token>","newPassword":"New@456","confirmPassword":"New@456"}
```

### Validation

Token valid; password meets policy; confirmation matches.

### Response

``` json
{"success":true,"message":"Password reset successfully"}
```

### Error Codes

`RESET_TOKEN_INVALID`, `RESET_TOKEN_EXPIRED`, `PASSWORD_POLICY_FAILED`

## 5.10. List My Sessions

**URL:** `/api/v1/auth/sessions`\
**Method:** `GET`\
**Authorization:** Authenticated

### Request

`Query: page, pageSize`

### Validation

Valid user.

### Response

``` json
{"success":true,"data":[{"id":"SESSION_ID","deviceName":"Chrome on Windows","status":"ACTIVE","lastUsedAt":"2026-08-01T10:00:00Z"}]}
```

### Error Codes

`AUTH_REQUIRED`

## 5.11. Revoke Session

**URL:** `/api/v1/auth/sessions/:sessionId`\
**Method:** `DELETE`\
**Authorization:** Authenticated; session must belong to current user or
caller has admin permission

### Request

`No body required.`

### Validation

Valid session ObjectId.

### Response

``` json
{"success":true,"message":"Session revoked"}
```

### Error Codes

`INVALID_IDENTIFIER`, `SESSION_NOT_FOUND`, `PERMISSION_DENIED`

## 5.12. Verify Access Token

**URL:** `/api/v1/auth/verify`\
**Method:** `GET`\
**Authorization:** Authenticated

### Request

`No body required.`

### Validation

Valid token.

### Response

``` json
{"success":true,"data":{"valid":true,"expiresAt":"2026-08-01T12:00:00Z"}}
```

### Error Codes

`AUTH_INVALID_TOKEN`, `AUTH_TOKEN_EXPIRED`

## 5.13. Get My Permissions

**URL:** `/api/v1/auth/permissions`\
**Method:** `GET`\
**Authorization:** Authenticated

### Request

`Optional query: workspaceId`

### Validation

Active workspace membership required.

### Response

``` json
{"success":true,"data":["PROJECT_VIEW","TASK_VIEW","TASK_CREATE"]}
```

### Error Codes

`WORKSPACE_ACCESS_DENIED`, `AUTH_REQUIRED`

## 5.14. Switch Active Workspace

**URL:** `/api/v1/auth/workspace`\
**Method:** `POST`\
**Authorization:** Authenticated

### Request

``` json
{"workspaceId":"WORKSPACE_ID"}
```

### Validation

workspaceId required; user must be an active member.

### Response

``` json
{"success":true,"data":{"workspaceId":"WORKSPACE_ID","permissions":["TASK_VIEW"]}}
```

### Error Codes

`WORKSPACE_NOT_FOUND`, `WORKSPACE_ACCESS_DENIED`, `VALIDATION_ERROR`

## 5.15. Accept User Invitation

**URL:** `/api/v1/auth/invitations/accept`\
**Method:** `POST`\
**Authorization:** Public with valid invitation token

### Request

``` json
{"token":"<invitation-token>","password":"Welcome@123"}
```

### Validation

Invitation token and initial password required.

### Response

``` json
{"success":true,"message":"Invitation accepted"}
```

### Error Codes

`INVITATION_INVALID`, `INVITATION_EXPIRED`, `PASSWORD_POLICY_FAILED`

# 6. User APIs

## 6.1. List Users

**URL:** `/api/v1/users`\
**Method:** `GET`\
**Authorization:** `USER_VIEW`

### Request

`Query: page, pageSize, search, status, roleId, sortBy, sortOrder`

### Validation

page/pageSize valid; optional search/status/role filters.

### Response

``` json
{"success":true,"data":[{"id":"USER_ID","firstName":"Ravi","email":"ravi@example.com","status":"ACTIVE"}],"pagination":{"page":1,"pageSize":20,"totalItems":1,"totalPages":1}}
```

### Error Codes

`PERMISSION_DENIED`, `VALIDATION_ERROR`

## 6.2. Get User by ID

**URL:** `/api/v1/users/:userId`\
**Method:** `GET`\
**Authorization:** `USER_VIEW` or self-access where allowed

### Request

`No body required.`

### Validation

Valid ObjectId; user must exist and not be deleted.

### Response

``` json
{"success":true,"data":{"id":"USER_ID","firstName":"Ravi","lastName":"Kumar","email":"ravi@example.com","status":"ACTIVE"}}
```

### Error Codes

`INVALID_IDENTIFIER`, `USER_NOT_FOUND`, `PERMISSION_DENIED`

## 6.3. Create User

**URL:** `/api/v1/users`\
**Method:** `POST`\
**Authorization:** `USER_CREATE`

### Request

``` json
{"firstName":"Priya","lastName":"Rao","email":"priya@example.com","mobile":"9999999999","status":"ACTIVE"}
```

### Validation

First/last name required; unique normalized email; valid status;
optional role/workspace assignment must exist.

### Response

``` json
{"success":true,"message":"User created successfully","data":{"id":"USER_ID","email":"priya@example.com"}}
```

### Error Codes

`VALIDATION_ERROR`, `USER_EMAIL_ALREADY_EXISTS`, `PERMISSION_DENIED`

## 6.4. Update User

**URL:** `/api/v1/users/:userId`\
**Method:** `PUT`\
**Authorization:** `USER_UPDATE` or limited self-update

### Request

``` json
{"firstName":"Priya","lastName":"Reddy","mobile":"9999999998"}
```

### Validation

Valid ID; immutable/security fields cannot be client-controlled.

### Response

``` json
{"success":true,"message":"User updated successfully","data":{"id":"USER_ID"}}
```

### Error Codes

`USER_NOT_FOUND`, `VALIDATION_ERROR`, `PERMISSION_DENIED`

## 6.5. Deactivate User

**URL:** `/api/v1/users/:userId/deactivate`\
**Method:** `PATCH`\
**Authorization:** `USER_UPDATE`

### Request

`No body required or optional reason.`

### Validation

Cannot deactivate protected system account; user exists.

### Response

``` json
{"success":true,"message":"User deactivated"}
```

### Error Codes

`USER_NOT_FOUND`, `PROTECTED_USER`, `PERMISSION_DENIED`

## 6.6. Activate User

**URL:** `/api/v1/users/:userId/activate`\
**Method:** `PATCH`\
**Authorization:** `USER_UPDATE`

### Request

`No body required.`

### Validation

User exists and is eligible for activation.

### Response

``` json
{"success":true,"message":"User activated"}
```

### Error Codes

`USER_NOT_FOUND`, `INVALID_STATE_TRANSITION`

## 6.7. Soft Delete User

**URL:** `/api/v1/users/:userId`\
**Method:** `DELETE`\
**Authorization:** `USER_DELETE`

### Request

`No body required.`

### Validation

User exists; caller cannot delete protected/self account if policy
forbids it.

### Response

``` json
{"success":true,"message":"User deleted"}
```

### Error Codes

`USER_NOT_FOUND`, `PROTECTED_USER`, `PERMISSION_DENIED`

## 6.8. Restore User

**URL:** `/api/v1/users/:userId/restore`\
**Method:** `PATCH`\
**Authorization:** `USER_DELETE` or admin restore permission

### Request

`No body required.`

### Validation

User must be soft deleted.

### Response

``` json
{"success":true,"message":"User restored"}
```

### Error Codes

`USER_NOT_FOUND`, `INVALID_STATE_TRANSITION`

## 6.9. Get User Profile

**URL:** `/api/v1/users/:userId/profile`\
**Method:** `GET`\
**Authorization:** `USER_VIEW` or self

### Request

`No body required.`

### Validation

Valid ID.

### Response

``` json
{"success":true,"data":{"id":"USER_ID","firstName":"Ravi","avatarUrl":"/uploads/avatar.jpg"}}
```

### Error Codes

`USER_NOT_FOUND`, `PERMISSION_DENIED`

## 6.10. Update My Profile

**URL:** `/api/v1/users/me/profile`\
**Method:** `PUT`\
**Authorization:** Authenticated

### Request

``` json
{"firstName":"Ravi","lastName":"Kumar","mobile":"9999999999"}
```

### Validation

Allowed profile fields only.

### Response

``` json
{"success":true,"message":"Profile updated"}
```

### Error Codes

`VALIDATION_ERROR`, `AUTH_REQUIRED`

## 6.11. Upload User Avatar

**URL:** `/api/v1/users/me/avatar`\
**Method:** `POST`\
**Authorization:** Authenticated

### Request

`multipart/form-data field: avatar`

### Validation

Supported image type and configured maximum size.

### Response

``` json
{"success":true,"data":{"avatarUrl":"/uploads/users/avatar.jpg"}}
```

### Error Codes

`FILE_TOO_LARGE`, `UNSUPPORTED_FILE_TYPE`, `UPLOAD_FAILED`

## 6.12. Remove User Avatar

**URL:** `/api/v1/users/me/avatar`\
**Method:** `DELETE`\
**Authorization:** Authenticated

### Request

`No body required.`

### Validation

Current avatar may exist.

### Response

``` json
{"success":true,"message":"Avatar removed"}
```

### Error Codes

`AUTH_REQUIRED`

## 6.13. Search Users for Assignment

**URL:** `/api/v1/users/search`\
**Method:** `GET`\
**Authorization:** Authenticated + workspace/project access

### Request

`Query: q, projectId, limit`

### Validation

Minimum search length may be enforced; optional projectId.

### Response

``` json
{"success":true,"data":[{"id":"USER_ID","name":"Ravi Kumar","email":"ravi@example.com"}]}
```

### Error Codes

`VALIDATION_ERROR`, `WORKSPACE_ACCESS_DENIED`

## 6.14. Get User Projects

**URL:** `/api/v1/users/:userId/projects`\
**Method:** `GET`\
**Authorization:** `USER_VIEW` or self

### Request

`Query: status, page, pageSize`

### Validation

Valid user ID.

### Response

``` json
{"success":true,"data":[{"id":"PROJECT_ID","name":"ETMS","key":"ETMS"}]}
```

### Error Codes

`USER_NOT_FOUND`, `PERMISSION_DENIED`

## 6.15. Get User Teams

**URL:** `/api/v1/users/:userId/teams`\
**Method:** `GET`\
**Authorization:** `USER_VIEW` or self

### Request

`Query: status`

### Validation

Valid user ID.

### Response

``` json
{"success":true,"data":[{"id":"TEAM_ID","name":"Frontend Team"}]}
```

### Error Codes

`USER_NOT_FOUND`

## 6.16. Get User Workload

**URL:** `/api/v1/users/:userId/workload`\
**Method:** `GET`\
**Authorization:** `USER_VIEW`/report permission or self as policy
allows

### Request

`Query: fromDate, toDate, projectId`

### Validation

Valid date range and user.

### Response

``` json
{"success":true,"data":{"assignedTasks":12,"completedTasks":7,"overdueTasks":1,"loggedMinutes":960}}
```

### Error Codes

`USER_NOT_FOUND`, `VALIDATION_ERROR`, `PERMISSION_DENIED`

## 6.17. Invite User

**URL:** `/api/v1/users/invitations`\
**Method:** `POST`\
**Authorization:** `USER_CREATE`

### Request

``` json
{"email":"newuser@example.com","roleId":"ROLE_ID","workspaceId":"WORKSPACE_ID"}
```

### Validation

Valid unique email; workspace/role valid.

### Response

``` json
{"success":true,"message":"Invitation sent"}
```

### Error Codes

`USER_EMAIL_ALREADY_EXISTS`, `ROLE_NOT_FOUND`, `WORKSPACE_NOT_FOUND`

# 7. Project APIs

## 7.1. List Projects

**URL:** `/api/v1/projects`\
**Method:** `GET`\
**Authorization:** `PROJECT_VIEW`

### Request

`Query: page, pageSize, search, status, priority, managerId, sortBy, sortOrder`

### Validation

Pagination and filter values valid.

### Response

``` json
{"success":true,"data":[{"id":"PROJECT_ID","name":"Enterprise Task Management","key":"ETMS","status":"ACTIVE"}],"pagination":{"page":1,"pageSize":20,"totalItems":1,"totalPages":1}}
```

### Error Codes

`VALIDATION_ERROR`, `PERMISSION_DENIED`

## 7.2. Get Project

**URL:** `/api/v1/projects/:projectId`\
**Method:** `GET`\
**Authorization:** `PROJECT_VIEW` + project access

### Request

`No body required.`

### Validation

Valid project ID.

### Response

``` json
{"success":true,"data":{"id":"PROJECT_ID","name":"ETMS","key":"ETMS","status":"ACTIVE","priority":"HIGH"}}
```

### Error Codes

`PROJECT_NOT_FOUND`, `INVALID_IDENTIFIER`, `PERMISSION_DENIED`

## 7.3. Create Project

**URL:** `/api/v1/projects`\
**Method:** `POST`\
**Authorization:** `PROJECT_CREATE`

### Request

``` json
{"name":"Enterprise Task Management","key":"ETMS","description":"Internship project","projectManagerId":"USER_ID","priority":"HIGH","startDate":"2026-08-01","targetEndDate":"2026-10-01"}
```

### Validation

Name/key required; key unique within workspace; manager must be
eligible.

### Response

``` json
{"success":true,"message":"Project created successfully","data":{"id":"PROJECT_ID","key":"ETMS"}}
```

### Error Codes

`VALIDATION_ERROR`, `PROJECT_KEY_EXISTS`, `USER_NOT_FOUND`

## 7.4. Update Project

**URL:** `/api/v1/projects/:projectId`\
**Method:** `PUT`\
**Authorization:** `PROJECT_UPDATE`

### Request

``` json
{"name":"ETMS Platform","priority":"CRITICAL","targetEndDate":"2026-10-15"}
```

### Validation

Project exists; key changes obey uniqueness; dates valid.

### Response

``` json
{"success":true,"message":"Project updated","data":{"id":"PROJECT_ID"}}
```

### Error Codes

`PROJECT_NOT_FOUND`, `PROJECT_KEY_EXISTS`, `VALIDATION_ERROR`

## 7.5. Change Project Status

**URL:** `/api/v1/projects/:projectId/status`\
**Method:** `PATCH`\
**Authorization:** `PROJECT_UPDATE`

### Request

``` json
{"status":"ON_HOLD","reason":"Client dependency"}
```

### Validation

Status must be allowed and transition valid.

### Response

``` json
{"success":true,"message":"Project status updated"}
```

### Error Codes

`PROJECT_NOT_FOUND`, `INVALID_STATE_TRANSITION`

## 7.6. Delete Project

**URL:** `/api/v1/projects/:projectId`\
**Method:** `DELETE`\
**Authorization:** `PROJECT_DELETE`

### Request

`No body required.`

### Validation

Soft-delete policy; protected dependencies handled.

### Response

``` json
{"success":true,"message":"Project deleted"}
```

### Error Codes

`PROJECT_NOT_FOUND`, `PERMISSION_DENIED`

## 7.7. Restore Project

**URL:** `/api/v1/projects/:projectId/restore`\
**Method:** `PATCH`\
**Authorization:** `PROJECT_DELETE`

### Request

`No body required.`

### Validation

Project must be soft deleted.

### Response

``` json
{"success":true,"message":"Project restored"}
```

### Error Codes

`PROJECT_NOT_FOUND`, `INVALID_STATE_TRANSITION`

## 7.8. List Project Members

**URL:** `/api/v1/projects/:projectId/members`\
**Method:** `GET`\
**Authorization:** `PROJECT_VIEW`

### Request

`Query: page, pageSize, role, status, search`

### Validation

Project exists; pagination valid.

### Response

``` json
{"success":true,"data":[{"userId":"USER_ID","name":"Ravi Kumar","projectRole":"DEVELOPER","status":"ACTIVE"}]}
```

### Error Codes

`PROJECT_NOT_FOUND`, `PERMISSION_DENIED`

## 7.9. Add Project Member

**URL:** `/api/v1/projects/:projectId/members`\
**Method:** `POST`\
**Authorization:** `PROJECT_MANAGE_MEMBERS`

### Request

``` json
{"userId":"USER_ID","projectRole":"DEVELOPER","allocationPercentage":100}
```

### Validation

User must exist and belong to workspace; duplicate active membership
forbidden.

### Response

``` json
{"success":true,"message":"Project member added"}
```

### Error Codes

`PROJECT_NOT_FOUND`, `USER_NOT_FOUND`, `PROJECT_MEMBER_EXISTS`

## 7.10. Update Project Member

**URL:** `/api/v1/projects/:projectId/members/:userId`\
**Method:** `PUT`\
**Authorization:** `PROJECT_MANAGE_MEMBERS`

### Request

``` json
{"projectRole":"TEAM_LEAD","allocationPercentage":80}
```

### Validation

Membership exists; role/allocation valid.

### Response

``` json
{"success":true,"message":"Project member updated"}
```

### Error Codes

`PROJECT_MEMBER_NOT_FOUND`, `VALIDATION_ERROR`

## 7.11. Remove Project Member

**URL:** `/api/v1/projects/:projectId/members/:userId`\
**Method:** `DELETE`\
**Authorization:** `PROJECT_MANAGE_MEMBERS`

### Request

`No body required.`

### Validation

Membership exists; manager-removal rules enforced.

### Response

``` json
{"success":true,"message":"Project member removed"}
```

### Error Codes

`PROJECT_MEMBER_NOT_FOUND`, `PROTECTED_PROJECT_MANAGER`

## 7.12. Get Project Statistics

**URL:** `/api/v1/projects/:projectId/statistics`\
**Method:** `GET`\
**Authorization:** `PROJECT_VIEW`

### Request

`Optional query: sprintId, fromDate, toDate`

### Validation

Project exists.

### Response

``` json
{"success":true,"data":{"totalTasks":100,"completedTasks":60,"overdueTasks":5,"completionPercentage":60}}
```

### Error Codes

`PROJECT_NOT_FOUND`

## 7.13. Get Project Activity

**URL:** `/api/v1/projects/:projectId/activity`\
**Method:** `GET`\
**Authorization:** `PROJECT_VIEW`

### Request

`Query: page, pageSize, fromDate, toDate, action`

### Validation

Pagination/date range valid.

### Response

``` json
{"success":true,"data":[{"action":"TASK_CREATED","summary":"Ravi created ETMS-104","createdAt":"2026-08-01T10:00:00Z"}]}
```

### Error Codes

`PROJECT_NOT_FOUND`, `VALIDATION_ERROR`

## 7.14. Get Project Tasks Summary

**URL:** `/api/v1/projects/:projectId/tasks/summary`\
**Method:** `GET`\
**Authorization:** `PROJECT_VIEW`

### Request

`Query: sprintId`

### Validation

Project exists.

### Response

``` json
{"success":true,"data":{"BACKLOG":10,"TODO":15,"IN_PROGRESS":8,"DONE":40}}
```

### Error Codes

`PROJECT_NOT_FOUND`

## 7.15. Get Project Sprints

**URL:** `/api/v1/projects/:projectId/sprints`\
**Method:** `GET`\
**Authorization:** `SPRINT_VIEW`

### Request

`Query: status, page, pageSize`

### Validation

Project exists.

### Response

``` json
{"success":true,"data":[{"id":"SPRINT_ID","name":"Sprint 1","status":"ACTIVE"}]}
```

### Error Codes

`PROJECT_NOT_FOUND`

## 7.16. Get Project Epics

**URL:** `/api/v1/projects/:projectId/epics`\
**Method:** `GET`\
**Authorization:** `PROJECT_VIEW`

### Request

`Query: status, ownerId`

### Validation

Project exists.

### Response

``` json
{"success":true,"data":[{"id":"EPIC_ID","title":"Authentication","status":"IN_PROGRESS"}]}
```

### Error Codes

`PROJECT_NOT_FOUND`

## 7.17. Create Epic

**URL:** `/api/v1/projects/:projectId/epics`\
**Method:** `POST`\
**Authorization:** `PROJECT_UPDATE`

### Request

``` json
{"title":"Authentication","description":"Login and security","ownerId":"USER_ID","targetDate":"2026-08-20"}
```

### Validation

Title required; owner valid.

### Response

``` json
{"success":true,"data":{"id":"EPIC_ID","title":"Authentication"}}
```

### Error Codes

`PROJECT_NOT_FOUND`, `VALIDATION_ERROR`

## 7.18. Update Epic

**URL:** `/api/v1/projects/:projectId/epics/:epicId`\
**Method:** `PUT`\
**Authorization:** `PROJECT_UPDATE`

### Request

``` json
{"title":"Authentication & Sessions","status":"IN_PROGRESS"}
```

### Validation

Epic belongs to project; fields valid.

### Response

``` json
{"success":true,"message":"Epic updated"}
```

### Error Codes

`EPIC_NOT_FOUND`, `VALIDATION_ERROR`

## 7.19. Delete Epic

**URL:** `/api/v1/projects/:projectId/epics/:epicId`\
**Method:** `DELETE`\
**Authorization:** `PROJECT_UPDATE`

### Request

`No body required.`

### Validation

Epic belongs to project; task handling policy applied.

### Response

``` json
{"success":true,"message":"Epic deleted"}
```

### Error Codes

`EPIC_NOT_FOUND`, `EPIC_HAS_TASKS`

## 7.20. Archive Project

**URL:** `/api/v1/projects/:projectId/archive`\
**Method:** `PATCH`\
**Authorization:** `PROJECT_UPDATE`

### Request

`Optional body: {"reason":"Completed"}`

### Validation

Project must not already be archived.

### Response

``` json
{"success":true,"message":"Project archived"}
```

### Error Codes

`PROJECT_NOT_FOUND`, `INVALID_STATE_TRANSITION`

# 8. Team APIs

## 8.1. List Teams

**URL:** `/api/v1/teams`\
**Method:** `GET`\
**Authorization:** `TEAM_VIEW`

### Request

`Query: page, pageSize, search, status, leadId`

### Validation

Pagination/search/status valid.

### Response

``` json
{"success":true,"data":[{"id":"TEAM_ID","name":"Frontend Team","status":"ACTIVE"}]}
```

### Error Codes

`VALIDATION_ERROR`

## 8.2. Get Team

**URL:** `/api/v1/teams/:teamId`\
**Method:** `GET`\
**Authorization:** `TEAM_VIEW`

### Request

`No body required.`

### Validation

Valid team ID.

### Response

``` json
{"success":true,"data":{"id":"TEAM_ID","name":"Frontend Team","teamLeadId":"USER_ID"}}
```

### Error Codes

`TEAM_NOT_FOUND`, `INVALID_IDENTIFIER`

## 8.3. Create Team

**URL:** `/api/v1/teams`\
**Method:** `POST`\
**Authorization:** `TEAM_CREATE`

### Request

``` json
{"name":"Frontend Team","code":"FE","description":"React development","teamLeadId":"USER_ID"}
```

### Validation

Name/code required; code unique in workspace; lead valid.

### Response

``` json
{"success":true,"data":{"id":"TEAM_ID","code":"FE"}}
```

### Error Codes

`TEAM_CODE_EXISTS`, `USER_NOT_FOUND`, `VALIDATION_ERROR`

## 8.4. Update Team

**URL:** `/api/v1/teams/:teamId`\
**Method:** `PUT`\
**Authorization:** `TEAM_UPDATE`

### Request

``` json
{"name":"Web Frontend Team","teamLeadId":"USER_ID"}
```

### Validation

Team exists; values valid.

### Response

``` json
{"success":true,"message":"Team updated"}
```

### Error Codes

`TEAM_NOT_FOUND`, `VALIDATION_ERROR`

## 8.5. Delete Team

**URL:** `/api/v1/teams/:teamId`\
**Method:** `DELETE`\
**Authorization:** `TEAM_DELETE`

### Request

`No body required.`

### Validation

Soft delete; dependent assignments handled.

### Response

``` json
{"success":true,"message":"Team deleted"}
```

### Error Codes

`TEAM_NOT_FOUND`, `TEAM_HAS_ACTIVE_DEPENDENCIES`

## 8.6. Restore Team

**URL:** `/api/v1/teams/:teamId/restore`\
**Method:** `PATCH`\
**Authorization:** `TEAM_DELETE`

### Request

`No body required.`

### Validation

Team is deleted.

### Response

``` json
{"success":true,"message":"Team restored"}
```

### Error Codes

`TEAM_NOT_FOUND`, `INVALID_STATE_TRANSITION`

## 8.7. List Team Members

**URL:** `/api/v1/teams/:teamId/members`\
**Method:** `GET`\
**Authorization:** `TEAM_VIEW`

### Request

`Query: page, pageSize, status, search`

### Validation

Team exists.

### Response

``` json
{"success":true,"data":[{"userId":"USER_ID","name":"Priya Rao","status":"ACTIVE"}]}
```

### Error Codes

`TEAM_NOT_FOUND`

## 8.8. Add Team Member

**URL:** `/api/v1/teams/:teamId/members`\
**Method:** `POST`\
**Authorization:** `TEAM_MANAGE_MEMBERS`

### Request

``` json
{"userId":"USER_ID","role":"DEVELOPER"}
```

### Validation

User exists; workspace membership valid; duplicate forbidden.

### Response

``` json
{"success":true,"message":"Team member added"}
```

### Error Codes

`TEAM_NOT_FOUND`, `USER_NOT_FOUND`, `TEAM_MEMBER_EXISTS`

## 8.9. Update Team Member

**URL:** `/api/v1/teams/:teamId/members/:userId`\
**Method:** `PUT`\
**Authorization:** `TEAM_MANAGE_MEMBERS`

### Request

``` json
{"role":"SENIOR_DEVELOPER"}
```

### Validation

Membership exists.

### Response

``` json
{"success":true,"message":"Team member updated"}
```

### Error Codes

`TEAM_MEMBER_NOT_FOUND`

## 8.10. Remove Team Member

**URL:** `/api/v1/teams/:teamId/members/:userId`\
**Method:** `DELETE`\
**Authorization:** `TEAM_MANAGE_MEMBERS`

### Request

`No body required.`

### Validation

Membership exists; team lead policy enforced.

### Response

``` json
{"success":true,"message":"Team member removed"}
```

### Error Codes

`TEAM_MEMBER_NOT_FOUND`, `PROTECTED_TEAM_LEAD`

## 8.11. Assign Team Lead

**URL:** `/api/v1/teams/:teamId/lead`\
**Method:** `PATCH`\
**Authorization:** `TEAM_UPDATE`

### Request

``` json
{"userId":"USER_ID"}
```

### Validation

New lead must be eligible/member according to policy.

### Response

``` json
{"success":true,"message":"Team lead assigned"}
```

### Error Codes

`TEAM_NOT_FOUND`, `USER_NOT_FOUND`, `INVALID_TEAM_LEAD`

## 8.12. Get Team Workload

**URL:** `/api/v1/teams/:teamId/workload`\
**Method:** `GET`\
**Authorization:** `TEAM_VIEW`/`REPORT_VIEW`

### Request

`Query: fromDate, toDate, projectId`

### Validation

Valid date range.

### Response

``` json
{"success":true,"data":[{"userId":"USER_ID","assigned":8,"completed":5,"overdue":1}]}
```

### Error Codes

`TEAM_NOT_FOUND`, `VALIDATION_ERROR`

## 8.13. Get Team Projects

**URL:** `/api/v1/teams/:teamId/projects`\
**Method:** `GET`\
**Authorization:** `TEAM_VIEW`

### Request

`Query: status`

### Validation

Team exists.

### Response

``` json
{"success":true,"data":[{"id":"PROJECT_ID","name":"ETMS"}]}
```

### Error Codes

`TEAM_NOT_FOUND`

## 8.14. Get Team Activity

**URL:** `/api/v1/teams/:teamId/activity`\
**Method:** `GET`\
**Authorization:** `TEAM_VIEW`

### Request

`Query: page, pageSize, fromDate, toDate`

### Validation

Pagination valid.

### Response

``` json
{"success":true,"data":[]}
```

### Error Codes

`TEAM_NOT_FOUND`

## 8.15. Deactivate Team

**URL:** `/api/v1/teams/:teamId/deactivate`\
**Method:** `PATCH`\
**Authorization:** `TEAM_UPDATE`

### Request

`No body required.`

### Validation

Team active.

### Response

``` json
{"success":true,"message":"Team deactivated"}
```

### Error Codes

`TEAM_NOT_FOUND`, `INVALID_STATE_TRANSITION`

## 8.16. Activate Team

**URL:** `/api/v1/teams/:teamId/activate`\
**Method:** `PATCH`\
**Authorization:** `TEAM_UPDATE`

### Request

`No body required.`

### Validation

Team inactive.

### Response

``` json
{"success":true,"message":"Team activated"}
```

### Error Codes

`TEAM_NOT_FOUND`, `INVALID_STATE_TRANSITION`

# 9. Task APIs

## 9.1. List Tasks

**URL:** `/api/v1/tasks`\
**Method:** `GET`\
**Authorization:** `TASK_VIEW`

### Request

`Query: page, pageSize, search, projectId, sprintId, epicId, status, priority, assigneeId, reporterId, labelId, dueFrom, dueTo, sortBy, sortOrder`

### Validation

Pagination/filter/sort values valid.

### Response

``` json
{"success":true,"data":[{"id":"TASK_ID","taskKey":"ETMS-104","title":"Implement JWT","status":"IN_PROGRESS","priority":"HIGH"}],"pagination":{"page":1,"pageSize":20,"totalItems":1,"totalPages":1}}
```

### Error Codes

`VALIDATION_ERROR`, `WORKSPACE_ACCESS_DENIED`

## 9.2. Get Task

**URL:** `/api/v1/tasks/:taskId`\
**Method:** `GET`\
**Authorization:** `TASK_VIEW` + project access

### Request

`No body required.`

### Validation

Valid task ID.

### Response

``` json
{"success":true,"data":{"id":"TASK_ID","taskKey":"ETMS-104","title":"Implement JWT","projectId":"PROJECT_ID","status":"IN_PROGRESS"}}
```

### Error Codes

`TASK_NOT_FOUND`, `INVALID_IDENTIFIER`, `PERMISSION_DENIED`

## 9.3. Create Task

**URL:** `/api/v1/tasks`\
**Method:** `POST`\
**Authorization:** `TASK_CREATE`

### Request

``` json
{"title":"Implement JWT protected routes","description":"Secure frontend/backend routes","projectId":"PROJECT_ID","sprintId":"SPRINT_ID","epicId":"EPIC_ID","primaryAssigneeId":"USER_ID","type":"STORY","priority":"HIGH","storyPoints":5,"dueDate":"2026-08-10"}
```

### Validation

Title/project required; project exists; sprint/epic belong to project;
assignee eligible; enums/dates valid.

### Response

``` json
{"success":true,"message":"Task created","data":{"id":"TASK_ID","taskKey":"ETMS-104"}}
```

### Error Codes

`VALIDATION_ERROR`, `PROJECT_NOT_FOUND`, `SPRINT_NOT_FOUND`,
`EPIC_NOT_FOUND`, `INVALID_ASSIGNEE`

## 9.4. Update Task

**URL:** `/api/v1/tasks/:taskId`\
**Method:** `PUT`\
**Authorization:** `TASK_UPDATE`

### Request

``` json
{"title":"Implement JWT protected routes and refresh","priority":"CRITICAL","storyPoints":8}
```

### Validation

Task exists; immutable identifiers protected; relationship values valid.

### Response

``` json
{"success":true,"message":"Task updated","data":{"id":"TASK_ID"}}
```

### Error Codes

`TASK_NOT_FOUND`, `VALIDATION_ERROR`, `CONCURRENT_UPDATE`

## 9.5. Change Task Status

**URL:** `/api/v1/tasks/:taskId/status`\
**Method:** `PATCH`\
**Authorization:** `TASK_UPDATE`

### Request

``` json
{"status":"IN_REVIEW"}
```

### Validation

Status valid; workflow transition permitted.

### Response

``` json
{"success":true,"message":"Task status changed","data":{"status":"IN_REVIEW"}}
```

### Error Codes

`TASK_NOT_FOUND`, `INVALID_STATE_TRANSITION`

## 9.6. Change Task Priority

**URL:** `/api/v1/tasks/:taskId/priority`\
**Method:** `PATCH`\
**Authorization:** `TASK_UPDATE`

### Request

``` json
{"priority":"CRITICAL"}
```

### Validation

Allowed priority.

### Response

``` json
{"success":true,"message":"Task priority changed"}
```

### Error Codes

`TASK_NOT_FOUND`, `VALIDATION_ERROR`

## 9.7. Assign Primary User

**URL:** `/api/v1/tasks/:taskId/assignee`\
**Method:** `PATCH`\
**Authorization:** `TASK_ASSIGN`

### Request

``` json
{"userId":"USER_ID"}
```

### Validation

Assignee exists and is eligible project member.

### Response

``` json
{"success":true,"message":"Task assigned"}
```

### Error Codes

`TASK_NOT_FOUND`, `USER_NOT_FOUND`, `INVALID_ASSIGNEE`

## 9.8. Unassign Primary User

**URL:** `/api/v1/tasks/:taskId/assignee`\
**Method:** `DELETE`\
**Authorization:** `TASK_ASSIGN`

### Request

`No body required.`

### Validation

Task exists.

### Response

``` json
{"success":true,"message":"Task unassigned"}
```

### Error Codes

`TASK_NOT_FOUND`

## 9.9. Add Secondary Assignment

**URL:** `/api/v1/tasks/:taskId/assignments`\
**Method:** `POST`\
**Authorization:** `TASK_ASSIGN`

### Request

``` json
{"userId":"USER_ID","assignmentType":"SECONDARY"}
```

### Validation

User eligible; duplicate active assignment forbidden.

### Response

``` json
{"success":true,"message":"Assignment created"}
```

### Error Codes

`TASK_NOT_FOUND`, `TASK_ASSIGNMENT_EXISTS`, `INVALID_ASSIGNEE`

## 9.10. List Task Assignments

**URL:** `/api/v1/tasks/:taskId/assignments`\
**Method:** `GET`\
**Authorization:** `TASK_VIEW`

### Request

`No body required.`

### Validation

Task exists.

### Response

``` json
{"success":true,"data":[{"userId":"USER_ID","assignmentType":"PRIMARY","status":"ACTIVE"}]}
```

### Error Codes

`TASK_NOT_FOUND`

## 9.11. Remove Task Assignment

**URL:** `/api/v1/tasks/:taskId/assignments/:assignmentId`\
**Method:** `DELETE`\
**Authorization:** `TASK_ASSIGN`

### Request

`No body required.`

### Validation

Assignment belongs to task.

### Response

``` json
{"success":true,"message":"Assignment removed"}
```

### Error Codes

`TASK_ASSIGNMENT_NOT_FOUND`

## 9.12. Delete Task

**URL:** `/api/v1/tasks/:taskId`\
**Method:** `DELETE`\
**Authorization:** `TASK_DELETE`

### Request

`No body required.`

### Validation

Soft-delete; caller authorized.

### Response

``` json
{"success":true,"message":"Task deleted"}
```

### Error Codes

`TASK_NOT_FOUND`, `PERMISSION_DENIED`

## 9.13. Restore Task

**URL:** `/api/v1/tasks/:taskId/restore`\
**Method:** `PATCH`\
**Authorization:** `TASK_DELETE`

### Request

`No body required.`

### Validation

Task soft deleted.

### Response

``` json
{"success":true,"message":"Task restored"}
```

### Error Codes

`TASK_NOT_FOUND`, `INVALID_STATE_TRANSITION`

## 9.14. Move Task to Sprint

**URL:** `/api/v1/tasks/:taskId/sprint`\
**Method:** `PATCH`\
**Authorization:** `TASK_UPDATE`/`SPRINT_MANAGE`

### Request

``` json
{"sprintId":"SPRINT_ID"}
```

### Validation

Sprint belongs to same project and is eligible.

### Response

``` json
{"success":true,"message":"Task moved to sprint"}
```

### Error Codes

`TASK_NOT_FOUND`, `SPRINT_NOT_FOUND`, `SPRINT_PROJECT_MISMATCH`

## 9.15. Move Task to Backlog

**URL:** `/api/v1/tasks/:taskId/sprint`\
**Method:** `DELETE`\
**Authorization:** `TASK_UPDATE`/`SPRINT_MANAGE`

### Request

`No body required.`

### Validation

Task exists.

### Response

``` json
{"success":true,"message":"Task moved to backlog"}
```

### Error Codes

`TASK_NOT_FOUND`

## 9.16. Assign Task to Epic

**URL:** `/api/v1/tasks/:taskId/epic`\
**Method:** `PATCH`\
**Authorization:** `TASK_UPDATE`

### Request

``` json
{"epicId":"EPIC_ID"}
```

### Validation

Epic belongs to same project.

### Response

``` json
{"success":true,"message":"Task assigned to epic"}
```

### Error Codes

`TASK_NOT_FOUND`, `EPIC_NOT_FOUND`, `EPIC_PROJECT_MISMATCH`

## 9.17. Remove Task from Epic

**URL:** `/api/v1/tasks/:taskId/epic`\
**Method:** `DELETE`\
**Authorization:** `TASK_UPDATE`

### Request

`No body required.`

### Validation

Task exists.

### Response

``` json
{"success":true,"message":"Task removed from epic"}
```

### Error Codes

`TASK_NOT_FOUND`

## 9.18. List Labels

**URL:** `/api/v1/projects/:projectId/labels`\
**Method:** `GET`\
**Authorization:** `TASK_VIEW`

### Request

`Query: search`

### Validation

Project exists.

### Response

``` json
{"success":true,"data":[{"id":"LABEL_ID","name":"backend","color":"#000000"}]}
```

### Error Codes

`PROJECT_NOT_FOUND`

## 9.19. Create Label

**URL:** `/api/v1/projects/:projectId/labels`\
**Method:** `POST`\
**Authorization:** `TASK_UPDATE`

### Request

``` json
{"name":"security","color":"#123456","description":"Security work"}
```

### Validation

Name required and unique in project.

### Response

``` json
{"success":true,"data":{"id":"LABEL_ID","name":"security"}}
```

### Error Codes

`LABEL_EXISTS`, `VALIDATION_ERROR`

## 9.20. Add Label to Task

**URL:** `/api/v1/tasks/:taskId/labels`\
**Method:** `POST`\
**Authorization:** `TASK_UPDATE`

### Request

``` json
{"labelId":"LABEL_ID"}
```

### Validation

Label belongs to task project; duplicate forbidden.

### Response

``` json
{"success":true,"message":"Label added"}
```

### Error Codes

`TASK_NOT_FOUND`, `LABEL_NOT_FOUND`, `TASK_LABEL_EXISTS`

## 9.21. Remove Label from Task

**URL:** `/api/v1/tasks/:taskId/labels/:labelId`\
**Method:** `DELETE`\
**Authorization:** `TASK_UPDATE`

### Request

`No body required.`

### Validation

Mapping exists.

### Response

``` json
{"success":true,"message":"Label removed"}
```

### Error Codes

`TASK_LABEL_NOT_FOUND`

## 9.22. Get Task History

**URL:** `/api/v1/tasks/:taskId/history`\
**Method:** `GET`\
**Authorization:** `TASK_VIEW`

### Request

`Query: page, pageSize, field, fromDate, toDate`

### Validation

Task exists; pagination valid.

### Response

``` json
{"success":true,"data":[{"field":"status","oldValue":"TODO","newValue":"IN_PROGRESS","changedAt":"2026-08-01T10:00:00Z"}]}
```

### Error Codes

`TASK_NOT_FOUND`

## 9.23. Create Checklist

**URL:** `/api/v1/tasks/:taskId/checklists`\
**Method:** `POST`\
**Authorization:** `TASK_UPDATE`

### Request

``` json
{"title":"Definition of Done"}
```

### Validation

Title required.

### Response

``` json
{"success":true,"data":{"id":"CHECKLIST_ID","title":"Definition of Done"}}
```

### Error Codes

`TASK_NOT_FOUND`, `VALIDATION_ERROR`

## 9.24. List Checklists

**URL:** `/api/v1/tasks/:taskId/checklists`\
**Method:** `GET`\
**Authorization:** `TASK_VIEW`

### Request

`No body required.`

### Validation

Task exists.

### Response

``` json
{"success":true,"data":[{"id":"CHECKLIST_ID","title":"Definition of Done","items":[]}]}
```

### Error Codes

`TASK_NOT_FOUND`

## 9.25. Add Checklist Item

**URL:** `/api/v1/checklists/:checklistId/items`\
**Method:** `POST`\
**Authorization:** `TASK_UPDATE`

### Request

``` json
{"text":"Add unit tests","assigneeId":"USER_ID","dueDate":"2026-08-10"}
```

### Validation

Text required; assignee/dueDate optional valid.

### Response

``` json
{"success":true,"data":{"id":"ITEM_ID","text":"Add unit tests","isCompleted":false}}
```

### Error Codes

`CHECKLIST_NOT_FOUND`, `VALIDATION_ERROR`

## 9.26. Update Checklist Item

**URL:** `/api/v1/checklists/:checklistId/items/:itemId`\
**Method:** `PUT`\
**Authorization:** `TASK_UPDATE`

### Request

``` json
{"text":"Add unit and integration tests","dueDate":"2026-08-11"}
```

### Validation

Item belongs to checklist.

### Response

``` json
{"success":true,"message":"Checklist item updated"}
```

### Error Codes

`CHECKLIST_ITEM_NOT_FOUND`

## 9.27. Complete Checklist Item

**URL:** `/api/v1/checklists/:checklistId/items/:itemId/complete`\
**Method:** `PATCH`\
**Authorization:** `TASK_UPDATE`

### Request

`No body required.`

### Validation

Item exists and is active.

### Response

``` json
{"success":true,"message":"Checklist item completed"}
```

### Error Codes

`CHECKLIST_ITEM_NOT_FOUND`

## 9.28. Delete Checklist Item

**URL:** `/api/v1/checklists/:checklistId/items/:itemId`\
**Method:** `DELETE`\
**Authorization:** `TASK_UPDATE`

### Request

`No body required.`

### Validation

Item exists.

### Response

``` json
{"success":true,"message":"Checklist item deleted"}
```

### Error Codes

`CHECKLIST_ITEM_NOT_FOUND`

## 9.29. Start Task Timer

**URL:** `/api/v1/tasks/:taskId/time/start`\
**Method:** `POST`\
**Authorization:** Authenticated + task access

### Request

``` json
{"description":"Working on API integration"}
```

### Validation

Task exists; active-timer policy satisfied.

### Response

``` json
{"success":true,"data":{"timeEntryId":"TIME_ID","startedAt":"2026-08-01T10:00:00Z"}}
```

### Error Codes

`TASK_NOT_FOUND`, `ACTIVE_TIMER_EXISTS`

## 9.30. Stop Task Timer

**URL:** `/api/v1/tasks/:taskId/time/stop`\
**Method:** `POST`\
**Authorization:** Authenticated + task access

### Request

`No body required.`

### Validation

Active timer exists for user/task.

### Response

``` json
{"success":true,"data":{"durationMinutes":42}}
```

### Error Codes

`ACTIVE_TIMER_NOT_FOUND`

## 9.31. Add Manual Time Entry

**URL:** `/api/v1/tasks/:taskId/time`\
**Method:** `POST`\
**Authorization:** Authenticated + task access

### Request

``` json
{"durationMinutes":90,"description":"Code review","startedAt":"2026-08-01T09:00:00Z"}
```

### Validation

Duration positive; date valid.

### Response

``` json
{"success":true,"data":{"id":"TIME_ID","durationMinutes":90}}
```

### Error Codes

`TASK_NOT_FOUND`, `VALIDATION_ERROR`

## 9.32. List Task Time Entries

**URL:** `/api/v1/tasks/:taskId/time`\
**Method:** `GET`\
**Authorization:** `TASK_VIEW`

### Request

`Query: page, pageSize, userId, fromDate, toDate`

### Validation

Task exists; date range valid.

### Response

``` json
{"success":true,"data":[{"id":"TIME_ID","userId":"USER_ID","durationMinutes":90}]}
```

### Error Codes

`TASK_NOT_FOUND`, `VALIDATION_ERROR`

# 10. Sprint APIs

## 10.1. List Sprints

**URL:** `/api/v1/sprints`\
**Method:** `GET`\
**Authorization:** `SPRINT_VIEW`

### Request

`Query: projectId, status, page, pageSize`

### Validation

projectId required unless broader permission; pagination/status valid.

### Response

``` json
{"success":true,"data":[{"id":"SPRINT_ID","name":"Sprint 1","status":"ACTIVE"}]}
```

### Error Codes

`VALIDATION_ERROR`, `PROJECT_NOT_FOUND`

## 10.2. Get Sprint

**URL:** `/api/v1/sprints/:sprintId`\
**Method:** `GET`\
**Authorization:** `SPRINT_VIEW`

### Request

`No body required.`

### Validation

Valid sprint ID.

### Response

``` json
{"success":true,"data":{"id":"SPRINT_ID","name":"Sprint 1","goal":"Complete auth","status":"ACTIVE"}}
```

### Error Codes

`SPRINT_NOT_FOUND`

## 10.3. Create Sprint

**URL:** `/api/v1/sprints`\
**Method:** `POST`\
**Authorization:** `SPRINT_CREATE`

### Request

``` json
{"projectId":"PROJECT_ID","name":"Sprint 2","goal":"Task module","startDate":"2026-08-15","endDate":"2026-08-29"}
```

### Validation

projectId/name/start/end required; end after start; project valid.

### Response

``` json
{"success":true,"data":{"id":"SPRINT_ID","status":"PLANNED"}}
```

### Error Codes

`PROJECT_NOT_FOUND`, `VALIDATION_ERROR`, `SPRINT_DATE_CONFLICT`

## 10.4. Update Sprint

**URL:** `/api/v1/sprints/:sprintId`\
**Method:** `PUT`\
**Authorization:** `SPRINT_UPDATE`

### Request

``` json
{"name":"Sprint 2 - Tasks","goal":"Complete task workflow"}
```

### Validation

Sprint exists; dates/status restrictions respected.

### Response

``` json
{"success":true,"message":"Sprint updated"}
```

### Error Codes

`SPRINT_NOT_FOUND`, `VALIDATION_ERROR`

## 10.5. Start Sprint

**URL:** `/api/v1/sprints/:sprintId/start`\
**Method:** `POST`\
**Authorization:** `SPRINT_MANAGE`

### Request

`No body required.`

### Validation

Sprint planned; project active; active-sprint policy satisfied.

### Response

``` json
{"success":true,"message":"Sprint started","data":{"status":"ACTIVE"}}
```

### Error Codes

`SPRINT_NOT_FOUND`, `INVALID_STATE_TRANSITION`, `ACTIVE_SPRINT_EXISTS`

## 10.6. Complete Sprint

**URL:** `/api/v1/sprints/:sprintId/complete`\
**Method:** `POST`\
**Authorization:** `SPRINT_MANAGE`

### Request

``` json
{"moveIncompleteToSprintId":"NEXT_SPRINT_ID"}
```

### Validation

Sprint active; incomplete-task disposition provided if required.

### Response

``` json
{"success":true,"message":"Sprint completed"}
```

### Error Codes

`SPRINT_NOT_FOUND`, `INVALID_STATE_TRANSITION`, `INVALID_TARGET_SPRINT`

## 10.7. Cancel Sprint

**URL:** `/api/v1/sprints/:sprintId/cancel`\
**Method:** `POST`\
**Authorization:** `SPRINT_MANAGE`

### Request

``` json
{"reason":"Project reprioritized"}
```

### Validation

Sprint can be cancelled under workflow policy.

### Response

``` json
{"success":true,"message":"Sprint cancelled"}
```

### Error Codes

`SPRINT_NOT_FOUND`, `INVALID_STATE_TRANSITION`

## 10.8. Delete Planned Sprint

**URL:** `/api/v1/sprints/:sprintId`\
**Method:** `DELETE`\
**Authorization:** `SPRINT_MANAGE`

### Request

`No body required.`

### Validation

Only deletable states; tasks handled.

### Response

``` json
{"success":true,"message":"Sprint deleted"}
```

### Error Codes

`SPRINT_NOT_FOUND`, `SPRINT_NOT_DELETABLE`

## 10.9. List Sprint Tasks

**URL:** `/api/v1/sprints/:sprintId/tasks`\
**Method:** `GET`\
**Authorization:** `SPRINT_VIEW`

### Request

`Query: status, priority, assigneeId, search`

### Validation

Sprint exists.

### Response

``` json
{"success":true,"data":[{"id":"TASK_ID","taskKey":"ETMS-104","status":"IN_PROGRESS"}]}
```

### Error Codes

`SPRINT_NOT_FOUND`

## 10.10. Add Tasks to Sprint

**URL:** `/api/v1/sprints/:sprintId/tasks`\
**Method:** `POST`\
**Authorization:** `SPRINT_MANAGE`

### Request

``` json
{"taskIds":["TASK_ID_1","TASK_ID_2"]}
```

### Validation

All tasks belong to sprint project and are eligible.

### Response

``` json
{"success":true,"message":"Tasks added to sprint"}
```

### Error Codes

`SPRINT_NOT_FOUND`, `TASK_NOT_FOUND`, `SPRINT_PROJECT_MISMATCH`

## 10.11. Remove Task from Sprint

**URL:** `/api/v1/sprints/:sprintId/tasks/:taskId`\
**Method:** `DELETE`\
**Authorization:** `SPRINT_MANAGE`

### Request

`No body required.`

### Validation

Task currently belongs to sprint.

### Response

``` json
{"success":true,"message":"Task removed from sprint"}
```

### Error Codes

`SPRINT_NOT_FOUND`, `TASK_NOT_FOUND`

## 10.12. Get Sprint Board

**URL:** `/api/v1/sprints/:sprintId/board`\
**Method:** `GET`\
**Authorization:** `SPRINT_VIEW`

### Request

`Query: assigneeId, priority, labelId`

### Validation

Sprint exists.

### Response

``` json
{"success":true,"data":{"BACKLOG":[],"TODO":[],"IN_PROGRESS":[],"IN_REVIEW":[],"QA":[],"DONE":[]}}
```

### Error Codes

`SPRINT_NOT_FOUND`

## 10.13. Get Sprint Burndown

**URL:** `/api/v1/sprints/:sprintId/burndown`\
**Method:** `GET`\
**Authorization:** `SPRINT_VIEW`/`REPORT_VIEW`

### Request

`No body required.`

### Validation

Sprint exists.

### Response

``` json
{"success":true,"data":[{"date":"2026-08-15","remainingStoryPoints":50},{"date":"2026-08-16","remainingStoryPoints":44}]}
```

### Error Codes

`SPRINT_NOT_FOUND`

## 10.14. Get Sprint Velocity

**URL:** `/api/v1/sprints/:sprintId/velocity`\
**Method:** `GET`\
**Authorization:** `SPRINT_VIEW`/`REPORT_VIEW`

### Request

`No body required.`

### Validation

Sprint exists.

### Response

``` json
{"success":true,"data":{"committedStoryPoints":50,"completedStoryPoints":42}}
```

### Error Codes

`SPRINT_NOT_FOUND`

## 10.15. Get Sprint Statistics

**URL:** `/api/v1/sprints/:sprintId/statistics`\
**Method:** `GET`\
**Authorization:** `SPRINT_VIEW`

### Request

`No body required.`

### Validation

Sprint exists.

### Response

``` json
{"success":true,"data":{"totalTasks":30,"completedTasks":20,"completionPercentage":66.67}}
```

### Error Codes

`SPRINT_NOT_FOUND`

## 10.16. Reorder Sprint Tasks

**URL:** `/api/v1/sprints/:sprintId/tasks/reorder`\
**Method:** `PATCH`\
**Authorization:** `SPRINT_MANAGE`

### Request

``` json
{"items":[{"taskId":"TASK_ID","position":1000}]}
```

### Validation

Task IDs belong to sprint; position values valid.

### Response

``` json
{"success":true,"message":"Sprint tasks reordered"}
```

### Error Codes

`SPRINT_NOT_FOUND`, `TASK_NOT_FOUND`, `VALIDATION_ERROR`

# 11. Dashboard APIs

## 11.1. Get Dashboard Summary

**URL:** `/api/v1/dashboard/summary`\
**Method:** `GET`\
**Authorization:** `DASHBOARD_VIEW`

### Request

`Query: projectId, fromDate, toDate`

### Validation

Optional project/date filters valid.

### Response

``` json
{"success":true,"data":{"totalProjects":8,"totalTasks":240,"pendingTasks":80,"completedTasks":150,"overdueTasks":10}}
```

### Error Codes

`VALIDATION_ERROR`

## 11.2. Get My Work Summary

**URL:** `/api/v1/dashboard/my-work`\
**Method:** `GET`\
**Authorization:** Authenticated

### Request

`Query: projectId, sprintId`

### Validation

Valid current user.

### Response

``` json
{"success":true,"data":{"assigned":12,"inProgress":4,"dueSoon":2,"overdue":1}}
```

### Error Codes

`AUTH_REQUIRED`

## 11.3. Get Tasks by Status Chart

**URL:** `/api/v1/dashboard/tasks-by-status`\
**Method:** `GET`\
**Authorization:** `DASHBOARD_VIEW`

### Request

`Query: projectId, sprintId, fromDate, toDate`

### Validation

Filters valid.

### Response

``` json
{"success":true,"data":[{"status":"TODO","count":20},{"status":"DONE","count":60}]}
```

### Error Codes

`VALIDATION_ERROR`

## 11.4. Get Tasks by Priority

**URL:** `/api/v1/dashboard/tasks-by-priority`\
**Method:** `GET`\
**Authorization:** `DASHBOARD_VIEW`

### Request

`Query: projectId, sprintId`

### Validation

Filters valid.

### Response

``` json
{"success":true,"data":[{"priority":"HIGH","count":25}]}
```

### Error Codes

`VALIDATION_ERROR`

## 11.5. Get Project Progress

**URL:** `/api/v1/dashboard/project-progress`\
**Method:** `GET`\
**Authorization:** `DASHBOARD_VIEW`

### Request

`Query: limit`

### Validation

Workspace/project access.

### Response

``` json
{"success":true,"data":[{"projectId":"PROJECT_ID","name":"ETMS","completionPercentage":65}]}
```

### Error Codes

`PERMISSION_DENIED`

## 11.6. Get Team Workload Dashboard

**URL:** `/api/v1/dashboard/team-workload`\
**Method:** `GET`\
**Authorization:** `DASHBOARD_VIEW`/`REPORT_VIEW`

### Request

`Query: teamId, projectId, fromDate, toDate`

### Validation

teamId/projectId filters valid.

### Response

``` json
{"success":true,"data":[{"userId":"USER_ID","assigned":10,"completed":7}]}
```

### Error Codes

`VALIDATION_ERROR`

## 11.7. Get Upcoming Deadlines

**URL:** `/api/v1/dashboard/upcoming-deadlines`\
**Method:** `GET`\
**Authorization:** Authenticated

### Request

`Query: days=7, projectId`

### Validation

days range bounded.

### Response

``` json
{"success":true,"data":[{"taskKey":"ETMS-104","dueDate":"2026-08-10"}]}
```

### Error Codes

`VALIDATION_ERROR`

## 11.8. Get Recent Activity

**URL:** `/api/v1/dashboard/recent-activity`\
**Method:** `GET`\
**Authorization:** Authenticated

### Request

`Query: limit, projectId`

### Validation

limit bounded.

### Response

``` json
{"success":true,"data":[{"action":"TASK_STATUS_CHANGED","summary":"ETMS-104 moved to review"}]}
```

### Error Codes

`VALIDATION_ERROR`

## 11.9. Get My Dashboard Widgets

**URL:** `/api/v1/dashboard/widgets`\
**Method:** `GET`\
**Authorization:** Authenticated

### Request

`No body required.`

### Validation

Current user.

### Response

``` json
{"success":true,"data":[{"id":"WIDGET_ID","widgetType":"TASK_STATUS","isVisible":true}]}
```

### Error Codes

`AUTH_REQUIRED`

## 11.10. Save Dashboard Widget Layout

**URL:** `/api/v1/dashboard/widgets`\
**Method:** `PUT`\
**Authorization:** Authenticated

### Request

``` json
{"widgets":[{"widgetType":"TASK_STATUS","position":{"x":0,"y":0,"width":6,"height":4},"isVisible":true}]}
```

### Validation

Supported widget types; valid layout dimensions.

### Response

``` json
{"success":true,"message":"Dashboard layout saved"}
```

### Error Codes

`VALIDATION_ERROR`

# 12. Report APIs

## 12.1. Project Progress Report

**URL:** `/api/v1/reports/projects/progress`\
**Method:** `GET`\
**Authorization:** `REPORT_VIEW`

### Request

`Query: projectId, fromDate, toDate, page, pageSize`

### Validation

Date/project filters valid.

### Response

``` json
{"success":true,"data":[{"projectId":"PROJECT_ID","completionPercentage":65,"overdueTasks":4}]}
```

### Error Codes

`VALIDATION_ERROR`, `PERMISSION_DENIED`

## 12.2. Employee Performance Report

**URL:** `/api/v1/reports/users/performance`\
**Method:** `GET`\
**Authorization:** `REPORT_VIEW`

### Request

`Query: userId, teamId, projectId, fromDate, toDate`

### Validation

Date range and user/team filters valid.

### Response

``` json
{"success":true,"data":[{"userId":"USER_ID","completedTasks":22,"storyPoints":48,"loggedMinutes":3200}]}
```

### Error Codes

`VALIDATION_ERROR`

## 12.3. Task Status Report

**URL:** `/api/v1/reports/tasks/status`\
**Method:** `GET`\
**Authorization:** `REPORT_VIEW`

### Request

`Query: projectId, sprintId, fromDate, toDate`

### Validation

Filters valid.

### Response

``` json
{"success":true,"data":[{"status":"DONE","count":100}]}
```

### Error Codes

`VALIDATION_ERROR`

## 12.4. Overdue Tasks Report

**URL:** `/api/v1/reports/tasks/overdue`\
**Method:** `GET`\
**Authorization:** `REPORT_VIEW`

### Request

`Query: projectId, assigneeId, page, pageSize`

### Validation

Pagination/filter values valid.

### Response

``` json
{"success":true,"data":[{"taskKey":"ETMS-88","dueDate":"2026-07-30","assigneeId":"USER_ID"}]}
```

### Error Codes

`VALIDATION_ERROR`

## 12.5. Sprint Report

**URL:** `/api/v1/reports/sprints/:sprintId`\
**Method:** `GET`\
**Authorization:** `REPORT_VIEW`

### Request

`No body required.`

### Validation

Sprint exists.

### Response

``` json
{"success":true,"data":{"committed":50,"completed":42,"spillover":8,"completionPercentage":84}}
```

### Error Codes

`SPRINT_NOT_FOUND`

## 12.6. Time Tracking Report

**URL:** `/api/v1/reports/time`\
**Method:** `GET`\
**Authorization:** `REPORT_VIEW`

### Request

`Query: projectId, userId, taskId, fromDate, toDate`

### Validation

Date range required/bounded.

### Response

``` json
{"success":true,"data":{"totalMinutes":8200,"entries":[]}}
```

### Error Codes

`VALIDATION_ERROR`

## 12.7. Team Workload Report

**URL:** `/api/v1/reports/teams/workload`\
**Method:** `GET`\
**Authorization:** `REPORT_VIEW`

### Request

`Query: teamId, projectId, fromDate, toDate`

### Validation

teamId/date filters valid.

### Response

``` json
{"success":true,"data":[{"userId":"USER_ID","assigned":14,"completed":9,"overdue":2}]}
```

### Error Codes

`TEAM_NOT_FOUND`, `VALIDATION_ERROR`

## 12.8. Project Member Allocation Report

**URL:** `/api/v1/reports/projects/allocation`\
**Method:** `GET`\
**Authorization:** `REPORT_VIEW`

### Request

`Query: projectId, userId`

### Validation

Filters valid.

### Response

``` json
{"success":true,"data":[{"userId":"USER_ID","projectId":"PROJECT_ID","allocationPercentage":80}]}
```

### Error Codes

`VALIDATION_ERROR`

## 12.9. Task Cycle Time Report

**URL:** `/api/v1/reports/tasks/cycle-time`\
**Method:** `GET`\
**Authorization:** `REPORT_VIEW`

### Request

`Query: projectId, fromDate, toDate`

### Validation

Date/project filters valid.

### Response

``` json
{"success":true,"data":{"averageCycleTimeHours":18.5}}
```

### Error Codes

`VALIDATION_ERROR`

## 12.10. Task Throughput Report

**URL:** `/api/v1/reports/tasks/throughput`\
**Method:** `GET`\
**Authorization:** `REPORT_VIEW`

### Request

`Query: projectId, interval=day|week|month, fromDate, toDate`

### Validation

Date range valid.

### Response

``` json
{"success":true,"data":[{"period":"2026-W31","completed":35}]}
```

### Error Codes

`VALIDATION_ERROR`

## 12.11. Activity Report

**URL:** `/api/v1/reports/activity`\
**Method:** `GET`\
**Authorization:** `REPORT_VIEW`

### Request

`Query: actorId, entityType, action, fromDate, toDate, page, pageSize`

### Validation

Pagination/date/action filters valid.

### Response

``` json
{"success":true,"data":[]}
```

### Error Codes

`VALIDATION_ERROR`

## 12.12. Audit Report

**URL:** `/api/v1/reports/audit`\
**Method:** `GET`\
**Authorization:** Admin/security report permission

### Request

`Query: actorId, entityType, action, fromDate, toDate, page, pageSize`

### Validation

Restricted access; date range/pagination valid.

### Response

``` json
{"success":true,"data":[{"action":"USER_ROLE_CHANGED","actorId":"ADMIN_ID","createdAt":"2026-08-01T10:00:00Z"}]}
```

### Error Codes

`PERMISSION_DENIED`, `VALIDATION_ERROR`

## 12.13. Export Task Report CSV

**URL:** `/api/v1/reports/tasks/export`\
**Method:** `GET`\
**Authorization:** `REPORT_VIEW`

### Request

`Query: projectId, sprintId, status, fromDate, toDate, format=csv`

### Validation

Filters valid; export size limits enforced.

### Response

`Response: downloadable CSV stream/file.`

### Error Codes

`VALIDATION_ERROR`, `EXPORT_TOO_LARGE`, `PERMISSION_DENIED`

## 12.14. Export Project Report

**URL:** `/api/v1/reports/projects/:projectId/export`\
**Method:** `GET`\
**Authorization:** `REPORT_VIEW`

### Request

`Query: format=csv|json`

### Validation

Project exists; supported format.

### Response

`Response: generated report stream/file or JSON export.`

### Error Codes

`PROJECT_NOT_FOUND`, `UNSUPPORTED_EXPORT_FORMAT`

# 13. Notification APIs

## 13.1. List My Notifications

**URL:** `/api/v1/notifications`\
**Method:** `GET`\
**Authorization:** Authenticated

### Request

`Query: page, pageSize, isRead, type`

### Validation

Pagination/type/read filters valid.

### Response

``` json
{"success":true,"data":[{"id":"NOTIFICATION_ID","type":"TASK_ASSIGNED","title":"New task assigned","isRead":false}]}
```

### Error Codes

`AUTH_REQUIRED`, `VALIDATION_ERROR`

## 13.2. Get Notification

**URL:** `/api/v1/notifications/:notificationId`\
**Method:** `GET`\
**Authorization:** Owner or notification admin permission

### Request

`No body required.`

### Validation

Notification belongs to user unless privileged.

### Response

``` json
{"success":true,"data":{"id":"NOTIFICATION_ID","message":"You were assigned ETMS-104","isRead":false}}
```

### Error Codes

`NOTIFICATION_NOT_FOUND`, `PERMISSION_DENIED`

## 13.3. Mark Notification Read

**URL:** `/api/v1/notifications/:notificationId/read`\
**Method:** `PATCH`\
**Authorization:** Owner

### Request

`No body required.`

### Validation

Notification belongs to user.

### Response

``` json
{"success":true,"message":"Notification marked as read"}
```

### Error Codes

`NOTIFICATION_NOT_FOUND`

## 13.4. Mark Notification Unread

**URL:** `/api/v1/notifications/:notificationId/unread`\
**Method:** `PATCH`\
**Authorization:** Owner

### Request

`No body required.`

### Validation

Notification belongs to user.

### Response

``` json
{"success":true,"message":"Notification marked as unread"}
```

### Error Codes

`NOTIFICATION_NOT_FOUND`

## 13.5. Mark All Notifications Read

**URL:** `/api/v1/notifications/read-all`\
**Method:** `PATCH`\
**Authorization:** Authenticated

### Request

`No body required.`

### Validation

Current user.

### Response

``` json
{"success":true,"message":"All notifications marked as read"}
```

### Error Codes

`AUTH_REQUIRED`

## 13.6. Get Unread Count

**URL:** `/api/v1/notifications/unread-count`\
**Method:** `GET`\
**Authorization:** Authenticated

### Request

`No body required.`

### Validation

Current user.

### Response

``` json
{"success":true,"data":{"count":5}}
```

### Error Codes

`AUTH_REQUIRED`

## 13.7. Delete Notification

**URL:** `/api/v1/notifications/:notificationId`\
**Method:** `DELETE`\
**Authorization:** Owner

### Request

`No body required.`

### Validation

Notification belongs to user.

### Response

``` json
{"success":true,"message":"Notification deleted"}
```

### Error Codes

`NOTIFICATION_NOT_FOUND`

## 13.8. Delete All Read Notifications

**URL:** `/api/v1/notifications/read`\
**Method:** `DELETE`\
**Authorization:** Authenticated

### Request

`No body required.`

### Validation

Current user.

### Response

``` json
{"success":true,"message":"Read notifications deleted"}
```

### Error Codes

`AUTH_REQUIRED`

## 13.9. Get Notification Preferences

**URL:** `/api/v1/notifications/preferences`\
**Method:** `GET`\
**Authorization:** Authenticated

### Request

`No body required.`

### Validation

Current user/workspace.

### Response

``` json
{"success":true,"data":{"emailEnabled":true,"taskAssigned":true,"mentions":true,"dueDateReminders":true}}
```

### Error Codes

`AUTH_REQUIRED`

## 13.10. Update Notification Preferences

**URL:** `/api/v1/notifications/preferences`\
**Method:** `PUT`\
**Authorization:** Authenticated

### Request

``` json
{"emailEnabled":true,"taskAssigned":true,"mentions":true,"dueDateReminders":false}
```

### Validation

Boolean/supported channel values.

### Response

``` json
{"success":true,"message":"Notification preferences updated"}
```

### Error Codes

`VALIDATION_ERROR`

## 13.11. Send Test Notification

**URL:** `/api/v1/notifications/test`\
**Method:** `POST`\
**Authorization:** Admin or development-only permission

### Request

``` json
{"userId":"USER_ID","channel":"IN_APP","message":"Test notification"}
```

### Validation

Supported type/channel.

### Response

``` json
{"success":true,"message":"Test notification queued"}
```

### Error Codes

`PERMISSION_DENIED`, `USER_NOT_FOUND`, `VALIDATION_ERROR`

## 13.12. List Notification Types

**URL:** `/api/v1/notifications/types`\
**Method:** `GET`\
**Authorization:** Authenticated

### Request

`No body required.`

### Validation

None.

### Response

``` json
{"success":true,"data":["TASK_ASSIGNED","TASK_UPDATED","COMMENT_ADDED","MENTION","DUE_DATE_REMINDER","SYSTEM"]}
```

### Error Codes

`AUTH_REQUIRED`

## 13.13. Bulk Delete Notifications

**URL:** `/api/v1/notifications/bulk-delete`\
**Method:** `POST`\
**Authorization:** Authenticated

### Request

``` json
{"notificationIds":["ID_1","ID_2"]}
```

### Validation

IDs belong to current user; list size bounded.

### Response

``` json
{"success":true,"message":"Notifications deleted"}
```

### Error Codes

`VALIDATION_ERROR`, `NOTIFICATION_NOT_FOUND`

# 14. Attachment APIs

## 14.1. Upload Task Attachment

**URL:** `/api/v1/tasks/:taskId/attachments`\
**Method:** `POST`\
**Authorization:** `ATTACHMENT_UPLOAD` + task access

### Request

`multipart/form-data field: file`

### Validation

Task exists; allowed extension/MIME; max file size; filename sanitized.

### Response

``` json
{"success":true,"message":"File uploaded","data":{"id":"ATTACHMENT_ID","originalFileName":"design.pdf","fileSize":245000}}
```

### Error Codes

`TASK_NOT_FOUND`, `FILE_TOO_LARGE`, `UNSUPPORTED_FILE_TYPE`,
`UPLOAD_FAILED`

## 14.2. List Task Attachments

**URL:** `/api/v1/tasks/:taskId/attachments`\
**Method:** `GET`\
**Authorization:** `TASK_VIEW`

### Request

`Query: page, pageSize`

### Validation

Task exists.

### Response

``` json
{"success":true,"data":[{"id":"ATTACHMENT_ID","originalFileName":"design.pdf","uploadedBy":"USER_ID"}]}
```

### Error Codes

`TASK_NOT_FOUND`

## 14.3. Get Attachment Metadata

**URL:** `/api/v1/attachments/:attachmentId`\
**Method:** `GET`\
**Authorization:** Entity access required

### Request

`No body required.`

### Validation

Attachment exists and caller can access parent entity.

### Response

``` json
{"success":true,"data":{"id":"ATTACHMENT_ID","mimeType":"application/pdf","fileSize":245000}}
```

### Error Codes

`ATTACHMENT_NOT_FOUND`, `PERMISSION_DENIED`

## 14.4. Download Attachment

**URL:** `/api/v1/attachments/:attachmentId/download`\
**Method:** `GET`\
**Authorization:** Entity access required

### Request

`No body required.`

### Validation

Attachment exists; storage object available.

### Response

`Response: file stream with safe Content-Disposition.`

### Error Codes

`ATTACHMENT_NOT_FOUND`, `FILE_NOT_FOUND`, `PERMISSION_DENIED`

## 14.5. Preview Attachment

**URL:** `/api/v1/attachments/:attachmentId/preview`\
**Method:** `GET`\
**Authorization:** Entity access required

### Request

`No body required.`

### Validation

Previewable MIME type.

### Response

`Response: inline file stream or preview metadata.`

### Error Codes

`ATTACHMENT_NOT_FOUND`, `PREVIEW_NOT_SUPPORTED`

## 14.6. Delete Attachment

**URL:** `/api/v1/attachments/:attachmentId`\
**Method:** `DELETE`\
**Authorization:** `ATTACHMENT_DELETE` or uploader according to policy

### Request

`No body required.`

### Validation

Attachment exists; parent access.

### Response

``` json
{"success":true,"message":"Attachment deleted"}
```

### Error Codes

`ATTACHMENT_NOT_FOUND`, `PERMISSION_DENIED`

## 14.7. Upload Comment Attachment

**URL:** `/api/v1/comments/:commentId/attachments`\
**Method:** `POST`\
**Authorization:** `ATTACHMENT_UPLOAD` + comment/task access

### Request

`multipart/form-data field: file`

### Validation

Comment exists; file rules valid.

### Response

``` json
{"success":true,"data":{"id":"ATTACHMENT_ID"}}
```

### Error Codes

`COMMENT_NOT_FOUND`, `FILE_TOO_LARGE`, `UNSUPPORTED_FILE_TYPE`

## 14.8. List Comment Attachments

**URL:** `/api/v1/comments/:commentId/attachments`\
**Method:** `GET`\
**Authorization:** Task/comment access

### Request

`No body required.`

### Validation

Comment exists.

### Response

``` json
{"success":true,"data":[]}
```

### Error Codes

`COMMENT_NOT_FOUND`

## 14.9. Upload Project Attachment

**URL:** `/api/v1/projects/:projectId/attachments`\
**Method:** `POST`\
**Authorization:** `ATTACHMENT_UPLOAD` + project access

### Request

`multipart/form-data field: file`

### Validation

Project exists; file rules valid.

### Response

``` json
{"success":true,"data":{"id":"ATTACHMENT_ID"}}
```

### Error Codes

`PROJECT_NOT_FOUND`, `FILE_TOO_LARGE`, `UNSUPPORTED_FILE_TYPE`

## 14.10. List Project Attachments

**URL:** `/api/v1/projects/:projectId/attachments`\
**Method:** `GET`\
**Authorization:** `PROJECT_VIEW`

### Request

`Query: page, pageSize`

### Validation

Project exists.

### Response

``` json
{"success":true,"data":[]}
```

### Error Codes

`PROJECT_NOT_FOUND`

## 14.11. Bulk Upload Task Attachments

**URL:** `/api/v1/tasks/:taskId/attachments/bulk`\
**Method:** `POST`\
**Authorization:** `ATTACHMENT_UPLOAD`

### Request

`multipart/form-data field: files[]`

### Validation

Task exists; file count/aggregate size limits enforced.

### Response

``` json
{"success":true,"data":[{"id":"ATTACHMENT_ID_1"},{"id":"ATTACHMENT_ID_2"}]}
```

### Error Codes

`TASK_NOT_FOUND`, `TOO_MANY_FILES`, `FILE_TOO_LARGE`

## 14.12. Replace Attachment File

**URL:** `/api/v1/attachments/:attachmentId/file`\
**Method:** `PUT`\
**Authorization:** Uploader or `ATTACHMENT_DELETE`/manage permission

### Request

`multipart/form-data field: file`

### Validation

Attachment exists; new file valid.

### Response

``` json
{"success":true,"message":"Attachment replaced"}
```

### Error Codes

`ATTACHMENT_NOT_FOUND`, `UNSUPPORTED_FILE_TYPE`, `PERMISSION_DENIED`

## 14.13. Get Attachment Upload Limits

**URL:** `/api/v1/attachments/config`\
**Method:** `GET`\
**Authorization:** Authenticated

### Request

`No body required.`

### Validation

None.

### Response

``` json
{"success":true,"data":{"maxFileSizeBytes":10485760,"maxFilesPerRequest":5,"allowedTypes":["application/pdf","image/png","image/jpeg"]}}
```

### Error Codes

`AUTH_REQUIRED`

# 15. Supporting Comment APIs

## 15.1. List Task Comments

**URL:** `/api/v1/tasks/:taskId/comments`\
**Method:** `GET`\
**Authorization:** `TASK_VIEW`

### Request

`Query: page, pageSize, sortOrder`

### Validation

Task exists; pagination valid.

### Response

``` json
{"success":true,"data":[{"id":"COMMENT_ID","content":"Please add tests","authorId":"USER_ID"}]}
```

### Error Codes

`TASK_NOT_FOUND`

## 15.2. Create Task Comment

**URL:** `/api/v1/tasks/:taskId/comments`\
**Method:** `POST`\
**Authorization:** Authenticated + task access

### Request

``` json
{"content":"Please add integration tests","mentionedUserIds":["USER_ID"]}
```

### Validation

Non-empty content; mention IDs valid.

### Response

``` json
{"success":true,"data":{"id":"COMMENT_ID","content":"Please add integration tests"}}
```

### Error Codes

`TASK_NOT_FOUND`, `VALIDATION_ERROR`

## 15.3. Reply to Comment

**URL:** `/api/v1/tasks/:taskId/comments/:commentId/replies`\
**Method:** `POST`\
**Authorization:** Authenticated + task access

### Request

``` json
{"content":"Will do today"}
```

### Validation

Parent comment belongs to task; content required.

### Response

``` json
{"success":true,"data":{"id":"COMMENT_ID_2","parentCommentId":"COMMENT_ID"}}
```

### Error Codes

`COMMENT_NOT_FOUND`, `VALIDATION_ERROR`

## 15.4. Update Comment

**URL:** `/api/v1/comments/:commentId`\
**Method:** `PUT`\
**Authorization:** Author or comment-manage permission

### Request

``` json
{"content":"Updated comment text"}
```

### Validation

Content required; edit policy satisfied.

### Response

``` json
{"success":true,"message":"Comment updated"}
```

### Error Codes

`COMMENT_NOT_FOUND`, `PERMISSION_DENIED`

## 15.5. Delete Comment

**URL:** `/api/v1/comments/:commentId`\
**Method:** `DELETE`\
**Authorization:** Author or comment-manage permission

### Request

`No body required.`

### Validation

Comment exists.

### Response

``` json
{"success":true,"message":"Comment deleted"}
```

### Error Codes

`COMMENT_NOT_FOUND`, `PERMISSION_DENIED`

## 15.6. Get Comment Thread

**URL:** `/api/v1/comments/:commentId/thread`\
**Method:** `GET`\
**Authorization:** Task access

### Request

`No body required.`

### Validation

Root/parent comment exists.

### Response

``` json
{"success":true,"data":{"comment":{},"replies":[]}}
```

### Error Codes

`COMMENT_NOT_FOUND`

## 15.7. List My Mentions

**URL:** `/api/v1/comments/mentions/me`\
**Method:** `GET`\
**Authorization:** Authenticated

### Request

`Query: page, pageSize, isRead`

### Validation

Pagination valid.

### Response

``` json
{"success":true,"data":[]}
```

### Error Codes

`AUTH_REQUIRED`

## 15.8. Get Comment by ID

**URL:** `/api/v1/comments/:commentId`\
**Method:** `GET`\
**Authorization:** Task access

### Request

`No body required.`

### Validation

Comment exists.

### Response

``` json
{"success":true,"data":{"id":"COMMENT_ID","content":"Please add tests"}}
```

### Error Codes

`COMMENT_NOT_FOUND`, `PERMISSION_DENIED`

## 15.9. Restore Comment

**URL:** `/api/v1/comments/:commentId/restore`\
**Method:** `PATCH`\
**Authorization:** Comment-manage permission

### Request

`No body required.`

### Validation

Comment soft deleted.

### Response

``` json
{"success":true,"message":"Comment restored"}
```

### Error Codes

`COMMENT_NOT_FOUND`, `INVALID_STATE_TRANSITION`

## 15.10. Get Comment Count for Task

**URL:** `/api/v1/tasks/:taskId/comments/count`\
**Method:** `GET`\
**Authorization:** `TASK_VIEW`

### Request

`No body required.`

### Validation

Task exists.

### Response

``` json
{"success":true,"data":{"count":18}}
```

### Error Codes

`TASK_NOT_FOUND`

# 16. Validation Standards

## 16.1 Identifiers

All MongoDB IDs supplied in paths or request bodies must be
syntactically valid ObjectIds before repository execution.

Example:

``` text
INVALID_IDENTIFIER
```

## 16.2 Strings

Recommended baseline limits:

``` text
Project name: 1–150 characters
Task title: 1–250 characters
Team name: 1–150 characters
Comment: 1–10,000 characters
```

Exact limits should be centralized in backend validation constants.

## 16.3 Dates

-   Must be parseable ISO-8601 values.
-   End date must not precede start date where applicable.
-   Business rules determine whether past due dates are allowed.
-   Persist dates in UTC.

## 16.4 Enums

Never silently accept arbitrary enum values.

Example task priority:

``` text
LOW
MEDIUM
HIGH
CRITICAL
```

## 16.5 Pagination

Reject or normalize:

``` text
page < 1
pageSize < 1
pageSize > configured maximum
```

## 16.6 Sort Fields

Only explicitly allowlisted sort fields may be accepted to prevent
unsafe/unpredictable query behavior.

------------------------------------------------------------------------

# 17. Authorization Matrix

  -----------------------------------------------------------------------------------------------
  Module          Read             Create              Update            Delete / Manage
  --------------- ---------------- ------------------- ----------------- ------------------------
  Users           USER_VIEW        USER_CREATE         USER_UPDATE       USER_DELETE

  Projects        PROJECT_VIEW     PROJECT_CREATE      PROJECT_UPDATE    PROJECT_DELETE /
                                                                         PROJECT_MANAGE_MEMBERS

  Teams           TEAM_VIEW        TEAM_CREATE         TEAM_UPDATE       TEAM_DELETE /
                                                                         TEAM_MANAGE_MEMBERS

  Tasks           TASK_VIEW        TASK_CREATE         TASK_UPDATE /     TASK_DELETE
                                                       TASK_ASSIGN       

  Sprints         SPRINT_VIEW      SPRINT_CREATE       SPRINT_UPDATE     SPRINT_MANAGE

  Dashboard       DASHBOARD_VIEW   ---                 user preferences  ---

  Reports         REPORT_VIEW      ---                 ---               restricted exports where
                                                                         applicable

  Attachments     entity read      ATTACHMENT_UPLOAD   uploader/manage   ATTACHMENT_DELETE
                  permission                           policy            

  Notifications   owner            system-generated    owner preferences owner
  -----------------------------------------------------------------------------------------------

Permissions are examples of the baseline contract. Document 06/07 may
refine role-to-permission assignments.

------------------------------------------------------------------------

# 18. Error Code Catalog

## Authentication

``` text
AUTH_REQUIRED
AUTH_INVALID_CREDENTIALS
AUTH_INVALID_TOKEN
AUTH_TOKEN_EXPIRED
SESSION_NOT_FOUND
SESSION_REVOKED
USER_LOCKED
USER_INACTIVE
PASSWORD_POLICY_FAILED
RESET_TOKEN_INVALID
RESET_TOKEN_EXPIRED
RESET_TOKEN_USED
INVITATION_INVALID
INVITATION_EXPIRED
```

## Users

``` text
USER_NOT_FOUND
USER_EMAIL_ALREADY_EXISTS
PROTECTED_USER
```

## Projects

``` text
PROJECT_NOT_FOUND
PROJECT_KEY_EXISTS
PROJECT_MEMBER_EXISTS
PROJECT_MEMBER_NOT_FOUND
PROTECTED_PROJECT_MANAGER
```

## Teams

``` text
TEAM_NOT_FOUND
TEAM_CODE_EXISTS
TEAM_MEMBER_EXISTS
TEAM_MEMBER_NOT_FOUND
PROTECTED_TEAM_LEAD
INVALID_TEAM_LEAD
```

## Tasks

``` text
TASK_NOT_FOUND
INVALID_ASSIGNEE
TASK_ASSIGNMENT_EXISTS
TASK_ASSIGNMENT_NOT_FOUND
TASK_LABEL_EXISTS
TASK_LABEL_NOT_FOUND
ACTIVE_TIMER_EXISTS
ACTIVE_TIMER_NOT_FOUND
CONCURRENT_UPDATE
```

## Sprints / Epics

``` text
SPRINT_NOT_FOUND
SPRINT_DATE_CONFLICT
ACTIVE_SPRINT_EXISTS
SPRINT_NOT_DELETABLE
SPRINT_PROJECT_MISMATCH
EPIC_NOT_FOUND
EPIC_PROJECT_MISMATCH
EPIC_HAS_TASKS
```

## Attachments

``` text
ATTACHMENT_NOT_FOUND
FILE_NOT_FOUND
FILE_TOO_LARGE
TOO_MANY_FILES
UNSUPPORTED_FILE_TYPE
PREVIEW_NOT_SUPPORTED
UPLOAD_FAILED
```

## Common

``` text
VALIDATION_ERROR
INVALID_IDENTIFIER
PERMISSION_DENIED
WORKSPACE_ACCESS_DENIED
INVALID_STATE_TRANSITION
DUPLICATE_RESOURCE
RATE_LIMIT_EXCEEDED
INTERNAL_SERVER_ERROR
```

------------------------------------------------------------------------

# 19. Postman Testing Standard

Every intern must create Postman requests for every endpoint they own.

Each endpoint should have tests for:

1.  successful request;
2.  missing token;
3.  insufficient permission;
4.  invalid identifier;
5.  validation failure;
6.  resource not found;
7.  duplicate/conflict where applicable;
8.  soft-deleted resource behavior;
9.  workspace isolation;
10. pagination/filter behavior for list APIs.

Example environment variables:

``` text
baseUrl
accessToken
refreshToken
workspaceId
userId
projectId
teamId
sprintId
taskId
commentId
attachmentId
```

------------------------------------------------------------------------

# 20. API Versioning

All endpoints are prefixed with:

``` text
/api/v1
```

Breaking contract changes should not silently alter existing production
clients.

Future breaking version:

``` text
/api/v2
```

Non-breaking additions such as optional response fields generally do not
require a new major API version.

------------------------------------------------------------------------

# 21. Idempotency and Duplicate Requests

GET, PUT, DELETE, and selected PATCH operations should be designed with
predictable repeated behavior.

For sensitive create operations that may be retried by clients, a future
`Idempotency-Key` mechanism may be introduced.

Examples:

``` text
payment-like external operations
large asynchronous exports
bulk imports
invitation delivery
```

The initial ETMS task/project CRUD APIs do not require a universal
idempotency implementation.

------------------------------------------------------------------------

# 22. Rate Limiting

Stricter rate limits should apply to:

``` text
login
forgot password
reset password validation
invitation acceptance
file upload
report export
```

Rate limit responses:

``` http
HTTP/1.1 429 Too Many Requests
```

``` json
{
  "success": false,
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again later."
}
```

------------------------------------------------------------------------

# 23. Security Requirements

-   HTTPS in non-local environments.
-   JWT verification on protected APIs.
-   Backend permission checks.
-   Password hashes never returned.
-   Refresh/reset tokens protected at rest.
-   File type and size validation.
-   No raw database errors returned.
-   No client-controlled `createdBy`, `updatedBy`, or `workspaceId`
    without verification.
-   Input validation before business logic.
-   Workspace isolation on all relevant queries.
-   Audit high-risk administrative changes.

------------------------------------------------------------------------

# 24. API Request Lifecycle

``` text
React Page
   ↓
Frontend Service
   ↓
Axios API Client
   ↓
Express Route
   ↓
Authentication
   ↓
Authorization
   ↓
Validation
   ↓
Controller
   ↓
Service
   ↓
Repository
   ↓
MongoDB
   ↓
DTO / Mapper
   ↓
Standard Response
   ↓
React
```

------------------------------------------------------------------------

# 25. API Ownership for Eight Interns

  Intern   API Ownership
  -------- -------------------------------------------------------------
  1        Authentication, sessions, password flows
  2        Users and profiles
  3        Authorization contracts / roles and permissions integration
  4        Projects, project members, epics
  5        Teams and sprints
  6        Tasks, labels, checklists, time tracking
  7        Comments and attachments
  8        Dashboard, notifications, reports

Shared authentication/authorization middleware and standard
response/error utilities require lead review.

------------------------------------------------------------------------

# 26. Endpoint Count

This document defines **176 endpoint contracts** across core and
supporting ETMS modules.

The endpoint count is intentionally larger than the initial 100+ target
because the enterprise workflows require supporting operations for
memberships, sessions, assignments, labels, checklists, time tracking,
comments, exports, notification preferences, and attachment management.

Not every endpoint must be implemented in the first sprint. The sprint
plan will identify implementation order.

------------------------------------------------------------------------

# 27. Definition of Done for an API

An endpoint is complete only when:

-   URL and HTTP method match this contract;
-   authentication is implemented;
-   authorization is implemented;
-   request validation is implemented;
-   workspace isolation is enforced;
-   service-layer business rules are implemented;
-   repository query is bounded/index-aware;
-   response DTO is safe;
-   standard response/error format is used;
-   audit/activity behavior is implemented where required;
-   Postman happy-path test passes;
-   negative tests pass;
-   API is documented in the shared collection;
-   frontend developer can integrate without reading controller
    internals;
-   pull request is reviewed.

------------------------------------------------------------------------

# 28. Implementation Priority

## Priority 1 -- Foundation

``` text
Authentication
Users
Projects
Teams
Tasks
```

## Priority 2 -- Agile Workflow

``` text
Sprints
Epics
Assignments
Labels
Checklists
Comments
Attachments
```

## Priority 3 -- Productivity

``` text
Notifications
Time Tracking
Dashboard
```

## Priority 4 -- Management

``` text
Reports
Exports
Audit views
Advanced analytics
```

------------------------------------------------------------------------

# 29. Final API Rules for Interns

1.  Never invent endpoint naming independently after this contract is
    agreed.
2.  Use REST nouns rather than `/getAllTasks` style actions.
3.  Keep controllers thin.
4.  Validate every request.
5.  Authorize on the backend.
6.  Verify workspace/project ownership relationships.
7.  Do not expose password/security fields.
8.  Use standard error codes.
9.  Use pagination for growing collections.
10. Do not return raw Mongoose documents blindly.
11. Test every endpoint in Postman before frontend integration.
12. Record breaking contract changes in documentation before
    implementation.
13. Do not hardcode localhost URLs in React components.
14. File upload APIs must validate type and size.
15. Report endpoints must enforce bounded filters and permissions.
16. Deletion follows the database soft-delete policy unless explicitly
    stated otherwise.
17. Audit important administrative/security changes.
18. Use consistent plural resource paths.
19. Do not trust IDs supplied by clients without access checks.
20. Treat this document as the frontend/backend integration contract.

------------------------------------------------------------------------

# 30. Conclusion

The ETMS REST API is designed as a versioned, permission-aware,
workspace-scoped JSON API with predictable validation, response, and
error behavior.

Together with the SRS, architecture, and database design, this document
gives the eight-intern team a stable contract for parallel backend and
React development.

The next documentation layer should map these endpoints to the React
pages and user flows in the **UI Module / Screen Blueprint**, followed
by detailed backend module ownership and sprint implementation
sequencing.
