# Document 03 -- Database Design

**Project:** Enterprise Task Management System (ETMS)\
**Document Type:** Logical and Physical Database Design\
**Version:** 1.0\
**Status:** Baseline Design\
**Database:** MongoDB\
**ODM:** Mongoose\
**Audience:** Backend Developers, Frontend Developers, Technical Leads,
QA, DevOps, Interns

------------------------------------------------------------------------

# 1. Purpose

This document defines the MongoDB database architecture for the
Enterprise Task Management System (ETMS). It is the baseline data
contract for all backend modules and must be reviewed before developers
create or change persistent models.

The design covers:

-   Entity/relationship model
-   Collection ownership
-   MongoDB document schemas
-   Collection relationships
-   reference versus embedding decisions
-   indexes
-   audit fields
-   soft deletion
-   lifecycle and retention rules
-   uniqueness rules
-   validation expectations
-   concurrency considerations
-   sample Mongoose schema patterns

The primary objective is to let multiple interns develop independent
modules while sharing one consistent data model.

------------------------------------------------------------------------

# 2. Database Design Principles

## 2.1 MongoDB Is Document-Oriented

MongoDB is not a relational database. ETMS therefore does not attempt to
reproduce a SQL schema mechanically.

Use references when:

-   the related entity has an independent lifecycle;
-   the related collection can grow substantially;
-   the same entity is referenced by many modules;
-   independent querying is required;
-   embedding would create unbounded arrays.

Use embedded documents when:

-   the child data is small and bounded;
-   it is always loaded with its parent;
-   it does not need an independent lifecycle;
-   atomic parent/child updates are useful.

## 2.2 ObjectId References

Primary identifiers use MongoDB `ObjectId`.

Example:

``` javascript
projectId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Project",
  required: true
}
```

API responses may expose `_id` as `id` through DTOs.

## 2.3 UTC Timestamps

All persisted timestamps must use UTC.

Examples:

``` text
createdAt
updatedAt
deletedAt
lastLoginAt
startedAt
endedAt
dueDate
```

Formatting for local time zones is a frontend concern.

## 2.4 No Business-Critical Data in Unbounded Embedded Arrays

Avoid designs such as:

``` javascript
task.comments = [ /* potentially millions */ ];
```

Comments belong in their own collection.

## 2.5 Business Data Must Be Auditable

Important entities contain standard audit metadata and important state
changes generate activity/audit history.

------------------------------------------------------------------------

# 3. Database Scope

The baseline design contains 30 primary collections:

1.  `users`
2.  `roles`
3.  `permissions`
4.  `rolepermissions`
5.  `workspaces`
6.  `workspacemembers`
7.  `projects`
8.  `projectmembers`
9.  `teams`
10. `teammembers`
11. `sprints`
12. `epics`
13. `tasks`
14. `taskassignments`
15. `labels`
16. `tasklabels`
17. `comments`
18. `attachments`
19. `checklists`
20. `checklistitems`
21. `notifications`
22. `activitylogs`
23. `auditlogs`
24. `taskhistory`
25. `timetracking`
26. `leaverequests`
27. `usersessions`
28. `passwordresettokens`
29. `savedfilters`
30. `dashboardwidgets`

Two configuration collections are additionally defined because they are
required by the requested enterprise scope:

31. `settings`
32. `emailtemplates`
33. `systemconfigurations`

These 33 collections form the complete baseline. Some may be introduced
in later implementation phases rather than Sprint 1.

------------------------------------------------------------------------

# 4. High-Level ER Diagram

MongoDB does not enforce relational foreign keys like a traditional
RDBMS, but ETMS has clear logical relationships.

``` mermaid
erDiagram
    WORKSPACE ||--o{ WORKSPACE_MEMBER : contains
    USER ||--o{ WORKSPACE_MEMBER : joins

    WORKSPACE ||--o{ PROJECT : owns
    WORKSPACE ||--o{ TEAM : owns
    WORKSPACE ||--o{ ROLE : defines

    ROLE ||--o{ ROLE_PERMISSION : grants
    PERMISSION ||--o{ ROLE_PERMISSION : included

    PROJECT ||--o{ PROJECT_MEMBER : contains
    USER ||--o{ PROJECT_MEMBER : joins

    TEAM ||--o{ TEAM_MEMBER : contains
    USER ||--o{ TEAM_MEMBER : joins

    PROJECT ||--o{ SPRINT : contains
    PROJECT ||--o{ EPIC : contains
    PROJECT ||--o{ TASK : contains

    SPRINT ||--o{ TASK : schedules
    EPIC ||--o{ TASK : groups

    TASK ||--o{ TASK_ASSIGNMENT : assigned
    USER ||--o{ TASK_ASSIGNMENT : receives

    TASK ||--o{ TASK_LABEL : tagged
    LABEL ||--o{ TASK_LABEL : classifies

    TASK ||--o{ COMMENT : discusses
    USER ||--o{ COMMENT : authors

    TASK ||--o{ ATTACHMENT : has
    USER ||--o{ ATTACHMENT : uploads

    TASK ||--o{ CHECKLIST : has
    CHECKLIST ||--o{ CHECKLIST_ITEM : contains

    USER ||--o{ NOTIFICATION : receives
    TASK ||--o{ TASK_HISTORY : changes
    USER ||--o{ TIME_TRACKING : logs
    TASK ||--o{ TIME_TRACKING : records

    USER ||--o{ LEAVE_REQUEST : requests
    USER ||--o{ USER_SESSION : authenticates
    USER ||--o{ PASSWORD_RESET_TOKEN : resets

    USER ||--o{ SAVED_FILTER : owns
    USER ||--o{ DASHBOARD_WIDGET : configures
```

------------------------------------------------------------------------

# 5. Relationship Summary

  Parent      Child / Related     Relationship   Storage
  ----------- ------------------- -------------- --------------------
  Workspace   Projects            1:N            Reference
  Workspace   Teams               1:N            Reference
  Workspace   Members             M:N            `workspacemembers`
  Workspace   Roles               1:N            Reference
  Role        Permission          M:N            `rolepermissions`
  Project     Members             M:N            `projectmembers`
  Team        Members             M:N            `teammembers`
  Project     Sprints             1:N            Reference
  Project     Epics               1:N            Reference
  Project     Tasks               1:N            Reference
  Sprint      Tasks               1:N            `sprintId` on task
  Epic        Tasks               1:N            `epicId` on task
  Task        Assignees           M:N capable    `taskassignments`
  Task        Labels              M:N            `tasklabels`
  Task        Comments            1:N            Reference
  Task        Attachments         1:N            Reference
  Task        Checklists          1:N            Reference
  Checklist   Items               1:N            Reference
  Task        History             1:N            Reference
  User        Notifications       1:N            Reference
  User        Sessions            1:N            Reference
  User        Saved Filters       1:N            Reference
  User        Dashboard Widgets   1:N            Reference

------------------------------------------------------------------------

# 6. Common Schema Conventions

Most business entities should contain:

``` javascript
{
  workspaceId: ObjectId,
  createdBy: ObjectId,
  updatedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date,
  isDeleted: Boolean,
  deletedAt: Date | null,
  deletedBy: ObjectId | null
}
```

Not every security/token collection uses soft deletion.

## 6.1 Standard Mongoose Options

``` javascript
{
  timestamps: true,
  versionKey: true
}
```

Mongoose timestamps automatically maintain:

``` text
createdAt
updatedAt
```

The version key (`__v`) may be retained where optimistic concurrency is
useful.

------------------------------------------------------------------------

# 7. Users Collection

**Collection:** `users`

## Purpose

Stores authenticated user identity and profile information.

## Core Schema

``` javascript
{
  _id: ObjectId,

  firstName: String,
  lastName: String,
  email: String,
  mobile: String,

  passwordHash: String,

  avatarUrl: String,

  status: "ACTIVE" | "INACTIVE" | "LOCKED" | "INVITED",

  lastLoginAt: Date,
  passwordChangedAt: Date,

  failedLoginAttempts: Number,
  lockedUntil: Date,

  createdBy: ObjectId,
  updatedBy: ObjectId,

  isDeleted: Boolean,
  deletedAt: Date,
  deletedBy: ObjectId,

  createdAt: Date,
  updatedAt: Date
}
```

## Indexes

``` javascript
{ email: 1 } // unique
{ status: 1 }
{ isDeleted: 1 }
{ createdAt: -1 }
```

Recommended:

``` javascript
userSchema.index(
  { email: 1 },
  { unique: true }
);
```

Email should be normalized to lowercase before persistence.

## Security Rule

Never return:

``` text
passwordHash
failedLoginAttempts
security secrets
```

through standard user DTOs.

------------------------------------------------------------------------

# 8. Roles Collection

**Collection:** `roles`

## Purpose

Defines named roles within a workspace or system scope.

``` javascript
{
  _id: ObjectId,
  workspaceId: ObjectId,

  name: String,
  code: String,
  description: String,

  scope: "SYSTEM" | "WORKSPACE",
  isSystemRole: Boolean,
  isActive: Boolean,

  createdBy: ObjectId,
  updatedBy: ObjectId,

  isDeleted: Boolean,
  deletedAt: Date,
  deletedBy: ObjectId,

  createdAt: Date,
  updatedAt: Date
}
```

Examples:

``` text
SUPER_ADMIN
ADMIN
PROJECT_MANAGER
TEAM_LEAD
DEVELOPER
QA_TESTER
VIEWER
```

## Indexes

``` text
(workspaceId, code) unique where appropriate
workspaceId + isActive
```

------------------------------------------------------------------------

# 9. Permissions Collection

**Collection:** `permissions`

## Purpose

Stores atomic application capabilities.

``` javascript
{
  _id: ObjectId,

  code: String,
  name: String,
  module: String,
  description: String,

  isActive: Boolean,

  createdAt: Date,
  updatedAt: Date
}
```

Examples:

``` text
USER_CREATE
USER_UPDATE
USER_DELETE
PROJECT_CREATE
PROJECT_MANAGE_MEMBERS
TASK_CREATE
TASK_ASSIGN
TASK_DELETE
REPORT_VIEW
```

## Indexes

``` javascript
{ code: 1 } // unique
{ module: 1, isActive: 1 }
```

------------------------------------------------------------------------

# 10. Role Permissions Collection

**Collection:** `rolepermissions`

## Purpose

Many-to-many mapping between roles and permissions.

``` javascript
{
  _id: ObjectId,

  roleId: ObjectId,
  permissionId: ObjectId,

  grantedBy: ObjectId,

  createdAt: Date,
  updatedAt: Date
}
```

## Index

``` javascript
{ roleId: 1, permissionId: 1 } // unique compound
```

Duplicate permission assignments must be prevented.

------------------------------------------------------------------------

# 11. Workspaces Collection

**Collection:** `workspaces`

## Purpose

Top-level organizational boundary.

``` javascript
{
  _id: ObjectId,

  name: String,
  key: String,
  description: String,

  ownerId: ObjectId,

  status: "ACTIVE" | "SUSPENDED" | "ARCHIVED",

  timezone: String,
  locale: String,

  createdBy: ObjectId,
  updatedBy: ObjectId,

  isDeleted: Boolean,
  deletedAt: Date,
  deletedBy: ObjectId,

  createdAt: Date,
  updatedAt: Date
}
```

## Indexes

``` text
key unique
ownerId
status
isDeleted
```

A future multi-tenant version can treat `workspaceId` as the tenant
boundary.

------------------------------------------------------------------------

# 12. Workspace Members Collection

**Collection:** `workspacemembers`

``` javascript
{
  _id: ObjectId,

  workspaceId: ObjectId,
  userId: ObjectId,
  roleId: ObjectId,

  membershipStatus:
    "INVITED" | "ACTIVE" | "SUSPENDED" | "REMOVED",

  joinedAt: Date,
  invitedBy: ObjectId,

  createdAt: Date,
  updatedAt: Date
}
```

## Indexes

``` text
(workspaceId, userId) unique
workspaceId + membershipStatus
userId
roleId
```

This collection avoids embedding a potentially large member array inside
`workspaces`.

------------------------------------------------------------------------

# 13. Projects Collection

**Collection:** `projects`

``` javascript
{
  _id: ObjectId,

  workspaceId: ObjectId,

  name: String,
  key: String,
  description: String,

  projectManagerId: ObjectId,

  status:
    "PLANNING" |
    "ACTIVE" |
    "ON_HOLD" |
    "COMPLETED" |
    "ARCHIVED",

  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",

  startDate: Date,
  targetEndDate: Date,
  completedAt: Date,

  createdBy: ObjectId,
  updatedBy: ObjectId,

  isDeleted: Boolean,
  deletedAt: Date,
  deletedBy: ObjectId,

  createdAt: Date,
  updatedAt: Date
}
```

## Indexes

``` text
(workspaceId, key) unique
workspaceId + status
projectManagerId + status
targetEndDate
isDeleted
```

------------------------------------------------------------------------

# 14. Project Members Collection

**Collection:** `projectmembers`

``` javascript
{
  _id: ObjectId,

  projectId: ObjectId,
  userId: ObjectId,

  projectRole:
    "PROJECT_MANAGER" |
    "TEAM_LEAD" |
    "DEVELOPER" |
    "QA_TESTER" |
    "VIEWER",

  allocationPercentage: Number,

  joinedAt: Date,
  removedAt: Date,

  status: "ACTIVE" | "REMOVED",

  addedBy: ObjectId,

  createdAt: Date,
  updatedAt: Date
}
```

## Indexes

``` text
(projectId, userId) unique for active membership
projectId + status
userId + status
```

------------------------------------------------------------------------

# 15. Teams Collection

**Collection:** `teams`

``` javascript
{
  _id: ObjectId,

  workspaceId: ObjectId,

  name: String,
  code: String,
  description: String,

  teamLeadId: ObjectId,

  status: "ACTIVE" | "INACTIVE",

  createdBy: ObjectId,
  updatedBy: ObjectId,

  isDeleted: Boolean,
  deletedAt: Date,
  deletedBy: ObjectId,

  createdAt: Date,
  updatedAt: Date
}
```

## Indexes

``` text
(workspaceId, code) unique
workspaceId + status
teamLeadId
```

------------------------------------------------------------------------

# 16. Team Members Collection

**Collection:** `teammembers`

``` javascript
{
  _id: ObjectId,

  teamId: ObjectId,
  userId: ObjectId,

  role: String,

  status: "ACTIVE" | "REMOVED",

  joinedAt: Date,
  removedAt: Date,

  addedBy: ObjectId,

  createdAt: Date,
  updatedAt: Date
}
```

## Indexes

``` text
(teamId, userId)
teamId + status
userId + status
```

------------------------------------------------------------------------

# 17. Sprints Collection

**Collection:** `sprints`

``` javascript
{
  _id: ObjectId,

  workspaceId: ObjectId,
  projectId: ObjectId,

  name: String,
  goal: String,

  status:
    "PLANNED" |
    "ACTIVE" |
    "COMPLETED" |
    "CANCELLED",

  startDate: Date,
  endDate: Date,

  completedAt: Date,

  createdBy: ObjectId,
  updatedBy: ObjectId,

  isDeleted: Boolean,
  deletedAt: Date,
  deletedBy: ObjectId,

  createdAt: Date,
  updatedAt: Date
}
```

## Indexes

``` text
projectId + status
projectId + startDate
workspaceId + status
```

Business rule: a project may have at most one active sprint unless
future requirements explicitly support parallel sprint streams.

------------------------------------------------------------------------

# 18. Epics Collection

**Collection:** `epics`

``` javascript
{
  _id: ObjectId,

  workspaceId: ObjectId,
  projectId: ObjectId,

  title: String,
  description: String,

  status:
    "OPEN" |
    "IN_PROGRESS" |
    "DONE" |
    "CANCELLED",

  ownerId: ObjectId,

  startDate: Date,
  targetDate: Date,

  createdBy: ObjectId,
  updatedBy: ObjectId,

  isDeleted: Boolean,
  deletedAt: Date,
  deletedBy: ObjectId,

  createdAt: Date,
  updatedAt: Date
}
```

## Indexes

``` text
projectId + status
ownerId + status
workspaceId + projectId
```

------------------------------------------------------------------------

# 19. Tasks Collection

**Collection:** `tasks`

This is one of the highest-volume and most frequently queried
collections.

``` javascript
{
  _id: ObjectId,

  workspaceId: ObjectId,
  projectId: ObjectId,

  sprintId: ObjectId,
  epicId: ObjectId,

  taskNumber: Number,
  taskKey: String,

  title: String,
  description: String,

  type:
    "TASK" |
    "STORY" |
    "BUG" |
    "IMPROVEMENT",

  status:
    "BACKLOG" |
    "TODO" |
    "IN_PROGRESS" |
    "IN_REVIEW" |
    "QA" |
    "DONE" |
    "CANCELLED",

  priority:
    "LOW" |
    "MEDIUM" |
    "HIGH" |
    "CRITICAL",

  reporterId: ObjectId,
  primaryAssigneeId: ObjectId,

  storyPoints: Number,

  startDate: Date,
  dueDate: Date,
  completedAt: Date,

  parentTaskId: ObjectId,

  position: Number,

  createdBy: ObjectId,
  updatedBy: ObjectId,

  isDeleted: Boolean,
  deletedAt: Date,
  deletedBy: ObjectId,

  createdAt: Date,
  updatedAt: Date
}
```

## Critical Indexes

``` text
(workspaceId, projectId, taskNumber) unique
taskKey unique where globally unique
projectId + status
projectId + sprintId + status
primaryAssigneeId + status
reporterId
dueDate + status
epicId
parentTaskId
isDeleted
```

## Search

For simple search, a text index may be considered:

``` javascript
{ title: "text", description: "text" }
```

For sophisticated enterprise search, a dedicated search service or
MongoDB Atlas Search may later be adopted.

------------------------------------------------------------------------

# 20. Task Assignments Collection

**Collection:** `taskassignments`

Although `tasks.primaryAssigneeId` supports fast common queries, this
collection provides assignment history and future multi-assignee
capability.

``` javascript
{
  _id: ObjectId,

  taskId: ObjectId,
  userId: ObjectId,

  assignmentType: "PRIMARY" | "SECONDARY",

  assignedBy: ObjectId,
  assignedAt: Date,
  unassignedAt: Date,

  status: "ACTIVE" | "REMOVED",

  createdAt: Date,
  updatedAt: Date
}
```

## Indexes

``` text
taskId + status
userId + status
(taskId, userId, status)
```

------------------------------------------------------------------------

# 21. Labels Collection

**Collection:** `labels`

``` javascript
{
  _id: ObjectId,

  workspaceId: ObjectId,
  projectId: ObjectId,

  name: String,
  color: String,
  description: String,

  createdBy: ObjectId,

  isDeleted: Boolean,
  deletedAt: Date,

  createdAt: Date,
  updatedAt: Date
}
```

## Index

``` text
(projectId, name) unique for non-deleted labels
workspaceId + projectId
```

------------------------------------------------------------------------

# 22. Task Labels Collection

**Collection:** `tasklabels`

``` javascript
{
  _id: ObjectId,

  taskId: ObjectId,
  labelId: ObjectId,

  addedBy: ObjectId,

  createdAt: Date,
  updatedAt: Date
}
```

Index:

``` text
(taskId, labelId) unique
labelId
```

------------------------------------------------------------------------

# 23. Comments Collection

**Collection:** `comments`

``` javascript
{
  _id: ObjectId,

  workspaceId: ObjectId,
  taskId: ObjectId,

  parentCommentId: ObjectId,

  authorId: ObjectId,

  content: String,

  mentionedUserIds: [ObjectId],

  editedAt: Date,

  createdBy: ObjectId,
  updatedBy: ObjectId,

  isDeleted: Boolean,
  deletedAt: Date,
  deletedBy: ObjectId,

  createdAt: Date,
  updatedAt: Date
}
```

## Indexes

``` text
taskId + createdAt
parentCommentId + createdAt
authorId + createdAt
mentionedUserIds
```

Comments are separate from tasks because comment volume can grow without
bound.

------------------------------------------------------------------------

# 24. Attachments Collection

**Collection:** `attachments`

Metadata is stored in MongoDB. File bytes should normally be stored in
filesystem/object storage rather than inside the task document.

``` javascript
{
  _id: ObjectId,

  workspaceId: ObjectId,

  entityType:
    "TASK" |
    "COMMENT" |
    "PROJECT" |
    "USER",

  entityId: ObjectId,

  originalFileName: String,
  storedFileName: String,

  storageProvider: String,
  storageKey: String,

  mimeType: String,
  fileSize: Number,

  uploadedBy: ObjectId,

  isDeleted: Boolean,
  deletedAt: Date,
  deletedBy: ObjectId,

  createdAt: Date,
  updatedAt: Date
}
```

## Indexes

``` text
entityType + entityId + createdAt
uploadedBy + createdAt
storageKey unique
```

Never trust the client-supplied MIME type alone for security decisions.

------------------------------------------------------------------------

# 25. Checklists Collection

**Collection:** `checklists`

``` javascript
{
  _id: ObjectId,

  taskId: ObjectId,

  title: String,
  position: Number,

  createdBy: ObjectId,
  updatedBy: ObjectId,

  isDeleted: Boolean,
  deletedAt: Date,

  createdAt: Date,
  updatedAt: Date
}
```

Index:

``` text
taskId + position
```

------------------------------------------------------------------------

# 26. Checklist Items Collection

**Collection:** `checklistitems`

``` javascript
{
  _id: ObjectId,

  checklistId: ObjectId,

  text: String,

  isCompleted: Boolean,
  completedBy: ObjectId,
  completedAt: Date,

  assigneeId: ObjectId,
  dueDate: Date,

  position: Number,

  createdBy: ObjectId,
  updatedBy: ObjectId,

  isDeleted: Boolean,
  deletedAt: Date,

  createdAt: Date,
  updatedAt: Date
}
```

Indexes:

``` text
checklistId + position
checklistId + isCompleted
assigneeId + isCompleted
```

------------------------------------------------------------------------

# 27. Notifications Collection

**Collection:** `notifications`

``` javascript
{
  _id: ObjectId,

  workspaceId: ObjectId,
  userId: ObjectId,

  type:
    "TASK_ASSIGNED" |
    "TASK_UPDATED" |
    "COMMENT_ADDED" |
    "MENTION" |
    "DUE_DATE_REMINDER" |
    "PROJECT_INVITATION" |
    "SYSTEM",

  title: String,
  message: String,

  entityType: String,
  entityId: ObjectId,

  isRead: Boolean,
  readAt: Date,

  deliveryChannels: [String],

  createdAt: Date,
  updatedAt: Date
}
```

## Indexes

``` text
userId + isRead + createdAt
userId + createdAt
entityType + entityId
```

Notifications may have a retention policy depending on production
requirements.

------------------------------------------------------------------------

# 28. Activity Logs Collection

**Collection:** `activitylogs`

## Purpose

Human-readable business activity feed.

``` javascript
{
  _id: ObjectId,

  workspaceId: ObjectId,

  actorId: ObjectId,

  action: String,

  entityType: String,
  entityId: ObjectId,

  projectId: ObjectId,
  taskId: ObjectId,

  summary: String,

  metadata: Object,

  createdAt: Date
}
```

Examples:

``` text
TASK_CREATED
TASK_ASSIGNED
TASK_STATUS_CHANGED
COMMENT_ADDED
PROJECT_ARCHIVED
```

## Indexes

``` text
workspaceId + createdAt
entityType + entityId + createdAt
projectId + createdAt
taskId + createdAt
actorId + createdAt
```

Activity logs are generally append-only.

------------------------------------------------------------------------

# 29. Audit Logs Collection

**Collection:** `auditlogs`

Audit logs are security/compliance-oriented and are different from
user-facing activity feeds.

``` javascript
{
  _id: ObjectId,

  workspaceId: ObjectId,

  actorId: ObjectId,

  action: String,

  entityType: String,
  entityId: ObjectId,

  before: Object,
  after: Object,

  ipAddress: String,
  userAgent: String,
  requestId: String,

  createdAt: Date
}
```

Examples:

``` text
USER_ROLE_CHANGED
USER_DISABLED
PERMISSION_CHANGED
SECURITY_SETTING_CHANGED
PROJECT_DELETED
```

Audit logs should be immutable through normal application APIs.

## Indexes

``` text
workspaceId + createdAt
actorId + createdAt
entityType + entityId + createdAt
requestId
```

------------------------------------------------------------------------

# 30. Task History Collection

**Collection:** `taskhistory`

Tracks structured changes to task fields.

``` javascript
{
  _id: ObjectId,

  taskId: ObjectId,

  changedBy: ObjectId,

  field: String,

  oldValue: mongoose.Schema.Types.Mixed,
  newValue: mongoose.Schema.Types.Mixed,

  changedAt: Date
}
```

Examples:

``` text
status: TODO → IN_PROGRESS
priority: MEDIUM → HIGH
assignee: Ravi → Priya
dueDate: Aug 10 → Aug 15
```

Indexes:

``` text
taskId + changedAt
changedBy + changedAt
```

------------------------------------------------------------------------

# 31. Time Tracking Collection

**Collection:** `timetracking`

``` javascript
{
  _id: ObjectId,

  workspaceId: ObjectId,
  projectId: ObjectId,
  taskId: ObjectId,
  userId: ObjectId,

  description: String,

  startedAt: Date,
  endedAt: Date,

  durationMinutes: Number,

  entryType: "TIMER" | "MANUAL",

  status: "ACTIVE" | "COMPLETED",

  createdBy: ObjectId,
  updatedBy: ObjectId,

  createdAt: Date,
  updatedAt: Date
}
```

## Indexes

``` text
userId + startedAt
taskId + startedAt
projectId + startedAt
workspaceId + startedAt
userId + status
```

Business rule: an active timer should be controlled so the same user
does not accidentally run multiple conflicting timers unless explicitly
supported.

------------------------------------------------------------------------

# 32. Leave Requests Collection

**Collection:** `leaverequests`

This supports workload planning and availability.

``` javascript
{
  _id: ObjectId,

  workspaceId: ObjectId,

  userId: ObjectId,

  leaveType:
    "CASUAL" |
    "SICK" |
    "VACATION" |
    "OTHER",

  startDate: Date,
  endDate: Date,

  reason: String,

  status:
    "PENDING" |
    "APPROVED" |
    "REJECTED" |
    "CANCELLED",

  reviewedBy: ObjectId,
  reviewedAt: Date,
  reviewComment: String,

  createdAt: Date,
  updatedAt: Date
}
```

Indexes:

``` text
workspaceId + status
userId + startDate
status + startDate
```

------------------------------------------------------------------------

# 33. User Sessions Collection

**Collection:** `usersessions`

Useful for refresh-token/session management and device logout.

``` javascript
{
  _id: ObjectId,

  userId: ObjectId,

  refreshTokenHash: String,

  deviceId: String,
  deviceName: String,

  ipAddress: String,
  userAgent: String,

  issuedAt: Date,
  expiresAt: Date,

  lastUsedAt: Date,

  revokedAt: Date,
  revokeReason: String,

  status: "ACTIVE" | "REVOKED" | "EXPIRED",

  createdAt: Date,
  updatedAt: Date
}
```

## Indexes

``` text
userId + status
refreshTokenHash unique
expiresAt TTL/cleanup strategy
deviceId
```

Never store a reusable raw refresh token if a secure hashed-token design
is used.

------------------------------------------------------------------------

# 34. Password Reset Tokens Collection

**Collection:** `passwordresettokens`

``` javascript
{
  _id: ObjectId,

  userId: ObjectId,

  tokenHash: String,

  expiresAt: Date,

  usedAt: Date,

  createdAt: Date
}
```

## Indexes

``` text
tokenHash unique
userId + createdAt
expiresAt TTL
```

The raw reset token should be sent to the user but only its
cryptographic hash should be persisted.

This collection should use expiration rather than soft deletion.

------------------------------------------------------------------------

# 35. Saved Filters Collection

**Collection:** `savedfilters`

``` javascript
{
  _id: ObjectId,

  workspaceId: ObjectId,
  userId: ObjectId,

  module: "TASKS" | "PROJECTS" | "USERS",

  name: String,

  filterDefinition: {
    status: [String],
    priority: [String],
    assigneeIds: [ObjectId],
    projectIds: [ObjectId],
    labelIds: [ObjectId],
    search: String
  },

  isDefault: Boolean,
  isShared: Boolean,

  createdAt: Date,
  updatedAt: Date
}
```

Indexes:

``` text
userId + module
workspaceId + isShared
```

------------------------------------------------------------------------

# 36. Dashboard Widgets Collection

**Collection:** `dashboardwidgets`

Stores user dashboard layout/preferences rather than analytical source
data.

``` javascript
{
  _id: ObjectId,

  workspaceId: ObjectId,
  userId: ObjectId,

  widgetType: String,

  title: String,

  position: {
    x: Number,
    y: Number,
    width: Number,
    height: Number
  },

  configuration: Object,

  isVisible: Boolean,

  createdAt: Date,
  updatedAt: Date
}
```

Indexes:

``` text
userId + isVisible
workspaceId + userId
```

------------------------------------------------------------------------

# 37. Settings Collection

**Collection:** `settings`

Stores workspace-level configurable preferences.

``` javascript
{
  _id: ObjectId,

  workspaceId: ObjectId,

  category: String,
  key: String,

  value: mongoose.Schema.Types.Mixed,

  valueType:
    "STRING" |
    "NUMBER" |
    "BOOLEAN" |
    "JSON",

  description: String,

  isEditable: Boolean,

  updatedBy: ObjectId,

  createdAt: Date,
  updatedAt: Date
}
```

Index:

``` text
(workspaceId, category, key) unique
```

Examples:

``` text
TASK.DEFAULT_PRIORITY
PROJECT.DEFAULT_VIEW
NOTIFICATION.EMAIL_ENABLED
```

Secrets should not be stored as ordinary settings.

------------------------------------------------------------------------

# 38. Email Templates Collection

**Collection:** `emailtemplates`

``` javascript
{
  _id: ObjectId,

  workspaceId: ObjectId,

  code: String,

  name: String,
  subject: String,

  htmlBody: String,
  textBody: String,

  variables: [String],

  isActive: Boolean,

  version: Number,

  createdBy: ObjectId,
  updatedBy: ObjectId,

  createdAt: Date,
  updatedAt: Date
}
```

Indexes:

``` text
(workspaceId, code, version)
code + isActive
```

Examples:

``` text
USER_INVITATION
PASSWORD_RESET
TASK_ASSIGNED
DUE_DATE_REMINDER
```

------------------------------------------------------------------------

# 39. System Configurations Collection

**Collection:** `systemconfigurations`

Reserved for application-level operational configuration that is
intentionally database-managed.

``` javascript
{
  _id: ObjectId,

  key: String,
  value: mongoose.Schema.Types.Mixed,

  category: String,

  description: String,

  isSensitive: Boolean,

  updatedBy: ObjectId,

  createdAt: Date,
  updatedAt: Date
}
```

Index:

``` text
key unique
category
```

Important:

Credentials, JWT secrets, database credentials, and encryption keys
should remain in secure environment/secret-management systems rather
than this collection.

------------------------------------------------------------------------

# 40. Collection Ownership Matrix

  Collection             Primary Module Owner
  ---------------------- ----------------------------
  users                  User Management
  roles                  Roles & Permissions
  permissions            Roles & Permissions
  rolepermissions        Roles & Permissions
  workspaces             Workspace / Administration
  workspacemembers       Workspace / Administration
  projects               Project Management
  projectmembers         Project Management
  teams                  Team Management
  teammembers            Team Management
  sprints                Sprint Management
  epics                  Project/Sprint Management
  tasks                  Task Management
  taskassignments        Task Management
  labels                 Task Management
  tasklabels             Task Management
  comments               Collaboration
  attachments            Collaboration
  checklists             Task Management
  checklistitems         Task Management
  notifications          Notification Module
  activitylogs           Shared / Activity
  auditlogs              Shared / Security
  taskhistory            Task Management
  timetracking           Time Tracking
  leaverequests          Team/Availability
  usersessions           Authentication
  passwordresettokens    Authentication
  savedfilters           Frontend/User Preferences
  dashboardwidgets       Dashboard
  settings               Administration
  emailtemplates         Notification/Admin
  systemconfigurations   Platform Administration

A module owner may consume another module's data but should not casually
change its schema without review.

------------------------------------------------------------------------

# 41. Index Strategy

Indexes must be created from actual query patterns, not by indexing
every field.

## 41.1 Primary Goals

Indexes should support:

-   login lookup
-   workspace isolation
-   project/task listing
-   assignee work queues
-   sprint boards
-   due-date queries
-   unread notifications
-   activity feeds
-   reporting time ranges
-   active memberships
-   security token lookup

## 41.2 Compound Index Ordering

For common query:

``` javascript
{
  projectId,
  status,
  isDeleted: false
}
```

an index may be:

``` javascript
{ projectId: 1, status: 1, isDeleted: 1 }
```

For sorted task queries:

``` javascript
{
  projectId,
  status,
  createdAt
}
```

consider:

``` javascript
{ projectId: 1, status: 1, createdAt: -1 }
```

Index design must be verified using real query plans as the application
matures.

## 41.3 Avoid Over-Indexing

Every index:

-   consumes disk space;
-   consumes memory;
-   increases write cost.

Do not add an index merely because a field exists.

## 41.4 Unique Indexes

Critical unique constraints include:

``` text
users.email
permissions.code
workspaces.key
workspace + project.key
role + permission
project + member
task + label
password reset token hash
refresh token hash
```

## 41.5 TTL Indexes

Suitable for ephemeral records:

``` text
password reset tokens
expired sessions where automatic deletion is desired
temporary verification tokens
```

Example:

``` javascript
schema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);
```

TTL cleanup is asynchronous; application logic must still check
expiration explicitly.

------------------------------------------------------------------------

# 42. Soft Delete Strategy

Business entities should generally not be physically deleted
immediately.

Standard fields:

``` javascript
{
  isDeleted: {
    type: Boolean,
    default: false
  },

  deletedAt: {
    type: Date,
    default: null
  },

  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  }
}
```

## 42.1 Delete Operation

Instead of:

``` javascript
await Task.findByIdAndDelete(id);
```

use:

``` javascript
await Task.findByIdAndUpdate(id, {
  isDeleted: true,
  deletedAt: new Date(),
  deletedBy: currentUserId
});
```

## 42.2 Normal Queries

Normal application queries must exclude deleted records:

``` javascript
Task.find({
  projectId,
  isDeleted: false
});
```

## 42.3 Restore

Authorized administrators may restore recoverable entities:

``` javascript
{
  isDeleted: false,
  deletedAt: null,
  deletedBy: null
}
```

## 42.4 Collections That Should Not Rely on Soft Delete

Examples:

``` text
password reset tokens
temporary sessions
append-only audit logs
some notification retention data
```

Their lifecycle is better handled through expiration/retention rules.

------------------------------------------------------------------------

# 43. Audit Fields Strategy

Standard business audit fields:

``` text
createdBy
updatedBy
createdAt
updatedAt
deletedBy
deletedAt
```

## 43.1 Responsibility

`createdAt` and `updatedAt`:

``` text
Mongoose timestamps
```

`createdBy`, `updatedBy`, `deletedBy`:

``` text
Authenticated backend user identity
```

The frontend must not be trusted to choose these values.

## 43.2 Example

``` javascript
const task = await Task.create({
  ...payload,
  createdBy: req.user.userId,
  updatedBy: req.user.userId
});
```

------------------------------------------------------------------------

# 44. Activity Log vs Audit Log vs Task History

These collections have different purposes.

## Activity Log

Human-readable product activity.

Example:

``` text
Ravi assigned TASK-104 to Priya.
```

## Audit Log

Security/compliance record.

Example:

``` text
ADMIN changed Ravi's role from DEVELOPER to PROJECT_MANAGER.
```

May include before/after snapshots.

## Task History

Structured task field changes.

Example:

``` text
status: IN_PROGRESS → IN_REVIEW
```

Do not combine all three into one uncontrolled generic collection.

------------------------------------------------------------------------

# 45. Data Integrity Rules

MongoDB references are not automatically protected by foreign keys.
Application services must enforce integrity.

Examples:

Before creating a task:

``` text
workspace exists
project exists
project belongs to workspace
sprint belongs to project
epic belongs to project
assignee is eligible/project member
reporter exists
```

Before adding a project member:

``` text
user exists
workspace membership exists
project exists
duplicate active membership does not exist
```

Before deleting a project:

``` text
authorization is valid
dependent-resource policy is applied
audit record is generated
```

------------------------------------------------------------------------

# 46. Transactions

MongoDB transactions should be used when multiple writes must succeed or
fail together.

Potential cases:

``` text
Create workspace + owner membership
Create role + permission mappings
Create project + initial manager membership
Move task + history record when strict atomicity is required
Revoke security sessions in bulk
```

Do not wrap every simple write in a transaction.

------------------------------------------------------------------------

# 47. Concurrency

Two users may update the same task.

Potential strategy:

-   retain Mongoose version key `__v`;
-   use optimistic concurrency for sensitive updates;
-   reject stale updates where appropriate;
-   return a conflict response so the UI can refresh.

For Kanban ordering, define a consistent position/rank strategy to
reduce conflicting updates.

------------------------------------------------------------------------

# 48. Pagination

Never return unbounded large collections.

Recommended query contract:

``` text
?page=1
&pageSize=20
&sortBy=createdAt
&sortOrder=desc
```

Maximum page size should be enforced server-side.

Collections requiring pagination include:

``` text
users
projects
tasks
comments
notifications
activity logs
audit logs
time entries
```

For very large datasets, cursor-based pagination may later replace
offset pagination for selected feeds.

------------------------------------------------------------------------

# 49. Data Retention

Retention should be explicitly defined before production.

Suggested categories:

## Long-Lived Business Data

``` text
projects
tasks
comments
task history
time tracking
```

## Security/Compliance Data

``` text
audit logs
sessions
authentication events
```

Retention depends on organizational requirements.

## Ephemeral Data

``` text
password reset tokens
temporary verification tokens
expired sessions
```

Use TTL/cleanup jobs.

------------------------------------------------------------------------

# 50. Mongoose Base Audit Pattern

A reusable schema fragment may be used carefully.

``` javascript
const auditFields = {
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },

  deletedAt: {
    type: Date,
    default: null
  },

  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  }
};
```

Avoid hiding important model behavior behind overly complex generic
abstractions.

------------------------------------------------------------------------

# 51. Example Complete Task Mongoose Schema

``` javascript
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true
    },

    sprintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sprint",
      default: null
    },

    epicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Epic",
      default: null
    },

    taskNumber: {
      type: Number,
      required: true
    },

    taskKey: {
      type: String,
      required: true,
      trim: true
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250
    },

    description: {
      type: String,
      default: ""
    },

    type: {
      type: String,
      enum: ["TASK", "STORY", "BUG", "IMPROVEMENT"],
      default: "TASK"
    },

    status: {
      type: String,
      enum: [
        "BACKLOG",
        "TODO",
        "IN_PROGRESS",
        "IN_REVIEW",
        "QA",
        "DONE",
        "CANCELLED"
      ],
      default: "TODO"
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM"
    },

    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    primaryAssigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    storyPoints: {
      type: Number,
      min: 0,
      default: null
    },

    startDate: Date,
    dueDate: Date,
    completedAt: Date,

    parentTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null
    },

    position: {
      type: Number,
      default: 0
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    isDeleted: {
      type: Boolean,
      default: false
    },

    deletedAt: {
      type: Date,
      default: null
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  {
    timestamps: true
  }
);

taskSchema.index(
  { workspaceId: 1, projectId: 1, taskNumber: 1 },
  { unique: true }
);

taskSchema.index({
  projectId: 1,
  status: 1,
  isDeleted: 1,
  createdAt: -1
});

taskSchema.index({
  primaryAssigneeId: 1,
  status: 1,
  isDeleted: 1
});

taskSchema.index({
  projectId: 1,
  sprintId: 1,
  status: 1,
  isDeleted: 1
});

taskSchema.index({
  dueDate: 1,
  status: 1,
  isDeleted: 1
});

module.exports = mongoose.model("Task", taskSchema);
```

------------------------------------------------------------------------

# 52. Example Project Mongoose Schema

``` javascript
const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    key: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    projectManagerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    status: {
      type: String,
      enum: [
        "PLANNING",
        "ACTIVE",
        "ON_HOLD",
        "COMPLETED",
        "ARCHIVED"
      ],
      default: "PLANNING"
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM"
    },

    startDate: Date,
    targetEndDate: Date,
    completedAt: Date,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    isDeleted: {
      type: Boolean,
      default: false
    },

    deletedAt: Date,

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

projectSchema.index(
  { workspaceId: 1, key: 1 },
  { unique: true }
);

projectSchema.index({
  workspaceId: 1,
  status: 1,
  isDeleted: 1
});

module.exports = mongoose.model("Project", projectSchema);
```

------------------------------------------------------------------------

# 53. Example User Mongoose Schema

``` javascript
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },

    lastName: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    mobile: {
      type: String,
      trim: true
    },

    passwordHash: {
      type: String,
      required: true,
      select: false
    },

    avatarUrl: String,

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "LOCKED", "INVITED"],
      default: "ACTIVE"
    },

    lastLoginAt: Date,
    passwordChangedAt: Date,

    failedLoginAttempts: {
      type: Number,
      default: 0
    },

    lockedUntil: Date,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    isDeleted: {
      type: Boolean,
      default: false
    },

    deletedAt: Date,

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

userSchema.index(
  { email: 1 },
  { unique: true }
);

userSchema.index({
  status: 1,
  isDeleted: 1
});

module.exports = mongoose.model("User", userSchema);
```

------------------------------------------------------------------------

# 54. Example Data Flow Across Collections

When an administrator creates a project:

``` text
users
  ↓ actor

workspaces
  ↓ parent

projects
  ↓ created

projectmembers
  ↓ project manager membership

activitylogs
  ↓ human-readable event

auditlogs
  ↓ administrative trace
```

When a developer creates a task:

``` text
projects
  ↓ validates project

sprints / epics
  ↓ optional relationships

tasks
  ↓ core record

taskassignments
  ↓ assignment

tasklabels
  ↓ classification

notifications
  ↓ assignee notification

activitylogs
  ↓ project feed

taskhistory
  ↓ later field changes
```

------------------------------------------------------------------------

# 55. Referential Deletion Rules

MongoDB will not cascade automatically.

ETMS services must explicitly define deletion behavior.

## Workspace

Deleting/archiving a workspace should not immediately hard-delete all
children.

Recommended:

``` text
Workspace → archived/soft-deleted
Projects → inaccessible or archived according to policy
Teams → inaccessible
Memberships → retained for audit
```

## Project

Soft deleting a project:

``` text
Project → soft deleted
Tasks → retained
Comments → retained
Attachments → retained
History → retained
```

The API should prevent ordinary users from accessing these resources
through the deleted parent.

## User

Do not erase historical authorship merely because a user leaves.

Prefer:

``` text
User status → INACTIVE
Workspace membership → REMOVED
Project memberships → REMOVED
Historical createdBy/author references → retained
```

------------------------------------------------------------------------

# 56. Reporting Considerations

Operational collections are the source of truth.

Initial reporting can use MongoDB aggregation pipelines.

Examples:

``` text
Tasks by status
Tasks by priority
Tasks completed by user
Sprint completion rate
Overdue tasks
Logged time by project
```

Do not create duplicate summary collections prematurely.

If reporting becomes expensive, future options include:

-   materialized summary collections;
-   scheduled aggregation jobs;
-   analytics database;
-   data warehouse.

------------------------------------------------------------------------

# 57. Multi-Tenancy Readiness

Even if the first release serves a controlled environment, `workspaceId`
should be included in workspace-scoped business entities.

Examples:

``` text
projects
teams
tasks
notifications
activity logs
time tracking
settings
```

Queries should include workspace scope whenever appropriate.

Bad:

``` javascript
Task.find({ _id: taskId });
```

Preferred conceptual approach:

``` javascript
Task.findOne({
  _id: taskId,
  workspaceId: currentWorkspaceId,
  isDeleted: false
});
```

This reduces cross-workspace data exposure risks.

------------------------------------------------------------------------

# 58. Sensitive Data Classification

## Highly Sensitive

``` text
password hashes
refresh token hashes
password reset token hashes
security configuration
```

## Personal Data

``` text
name
email
mobile
IP address
user agent
```

## Business Data

``` text
projects
tasks
comments
time entries
```

Access controls and logging should reflect data sensitivity.

------------------------------------------------------------------------

# 59. Database Error Handling

Application services should translate database failures into domain/API
errors.

Examples:

Duplicate email:

``` text
MongoDB duplicate key
   ↓
USER_EMAIL_ALREADY_EXISTS
   ↓
HTTP 409
```

Invalid ObjectId:

``` text
Validation
   ↓
INVALID_IDENTIFIER
   ↓
HTTP 400
```

Do not expose raw database stack traces to clients.

------------------------------------------------------------------------

# 60. Seed Data

Development environments should provide repeatable seed data.

Recommended:

``` text
1 workspace
7 standard roles
permission catalog
8–15 users
3 projects
2 teams
2 sprints
sample epics
30–50 tasks
comments
labels
notifications
```

Seed scripts belong under:

``` text
backend/scripts/
or
database/seeds/
```

Production seed operations must be controlled and idempotent where
possible.

------------------------------------------------------------------------

# 61. Database Migration Strategy

MongoDB is schema-flexible, but production schema evolution still
requires discipline.

Every structural change should document:

``` text
old shape
new shape
backfill requirement
index changes
rollback considerations
deployment order
```

Examples:

``` text
Add workspaceId to legacy tasks
Rename assignedTo → primaryAssigneeId
Create taskKey
Backfill normalized email
```

Migration scripts must be version-controlled.

------------------------------------------------------------------------

# 62. Index Review Checklist

Before adding an index:

1.  Which query requires it?
2.  What filter fields are used?
3.  What sort fields are used?
4.  What is the expected collection size?
5.  Is the query workspace-scoped?
6.  Is uniqueness required?
7.  Will the index significantly increase write cost?
8.  Does a similar index already exist?
9.  Has `explain()` been checked for important production queries?
10. Is the index compatible with soft-delete behavior?

------------------------------------------------------------------------

# 63. Schema Review Checklist

Every new collection must define:

-   collection purpose;
-   owner module;
-   required fields;
-   optional fields;
-   enums;
-   references;
-   uniqueness;
-   indexes;
-   audit fields;
-   soft-delete policy;
-   retention policy;
-   authorization scope;
-   sample document;
-   expected growth;
-   pagination strategy.

------------------------------------------------------------------------

# 64. Intern Database Ownership Rules

Eight interns can work independently only when schema ownership is
respected.

## Intern 1 -- Authentication

Primary:

``` text
usersessions
passwordresettokens
```

Consumes:

``` text
users
roles
permissions
```

## Intern 2 -- Users

Primary:

``` text
users
workspacemembers
```

## Intern 3 -- Roles & Permissions

Primary:

``` text
roles
permissions
rolepermissions
```

## Intern 4 -- Projects

Primary:

``` text
projects
projectmembers
epics
```

## Intern 5 -- Teams & Sprints

Primary:

``` text
teams
teammembers
sprints
leaverequests
```

## Intern 6 -- Tasks

Primary:

``` text
tasks
taskassignments
labels
tasklabels
checklists
checklistitems
taskhistory
timetracking
```

## Intern 7 -- Collaboration

Primary:

``` text
comments
attachments
```

## Intern 8 -- Dashboard / Notifications / Reports

Primary:

``` text
notifications
savedfilters
dashboardwidgets
activitylogs
```

Shared/lead-owned:

``` text
workspaces
auditlogs
settings
emailtemplates
systemconfigurations
```

A schema change to another intern's collection requires review.

------------------------------------------------------------------------

# 65. Example Task Document

``` json
{
  "_id": "66ab10000000000000000001",
  "workspaceId": "66ab00000000000000000001",
  "projectId": "66ab01000000000000000001",
  "sprintId": "66ab02000000000000000001",
  "epicId": "66ab03000000000000000001",
  "taskNumber": 104,
  "taskKey": "ETMS-104",
  "title": "Implement JWT protected routes",
  "description": "Protect frontend and backend routes.",
  "type": "STORY",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "reporterId": "66ab04000000000000000001",
  "primaryAssigneeId": "66ab04000000000000000002",
  "storyPoints": 5,
  "dueDate": "2026-08-10T00:00:00.000Z",
  "position": 3000,
  "isDeleted": false,
  "createdAt": "2026-08-01T08:00:00.000Z",
  "updatedAt": "2026-08-01T10:00:00.000Z"
}
```

------------------------------------------------------------------------

# 66. Example Project Document

``` json
{
  "_id": "66ab01000000000000000001",
  "workspaceId": "66ab00000000000000000001",
  "name": "Enterprise Task Management",
  "key": "ETMS",
  "description": "Enterprise internship project",
  "projectManagerId": "66ab04000000000000000001",
  "status": "ACTIVE",
  "priority": "HIGH",
  "startDate": "2026-08-01T00:00:00.000Z",
  "targetEndDate": "2026-10-01T00:00:00.000Z",
  "isDeleted": false
}
```

------------------------------------------------------------------------

# 67. Example Notification Document

``` json
{
  "_id": "66ab20000000000000000001",
  "workspaceId": "66ab00000000000000000001",
  "userId": "66ab04000000000000000002",
  "type": "TASK_ASSIGNED",
  "title": "New task assigned",
  "message": "You were assigned ETMS-104",
  "entityType": "TASK",
  "entityId": "66ab10000000000000000001",
  "isRead": false,
  "deliveryChannels": ["IN_APP"],
  "createdAt": "2026-08-01T10:00:00.000Z"
}
```

------------------------------------------------------------------------

# 68. Database Definition of Done

A database feature is complete only when:

-   schema is documented;
-   Mongoose model is implemented;
-   validation rules exist;
-   required indexes exist;
-   unique constraints are defined;
-   workspace scope is enforced where relevant;
-   audit fields are populated by backend;
-   soft-delete behavior is implemented where required;
-   API does not expose sensitive fields;
-   Postman tests cover create/read/update/delete behavior;
-   duplicate and invalid-reference cases are tested;
-   schema changes are reviewed;
-   migration/backfill requirements are documented;
-   query pagination is implemented for list endpoints.

------------------------------------------------------------------------

# 69. Database Design Decisions Summary

  Concern            Decision
  ------------------ --------------------------------------------------
  Database           MongoDB
  ODM                Mongoose
  IDs                ObjectId
  Timestamps         UTC
  Relationships      References + mapping collections
  Tenant boundary    Workspace
  Deletion           Soft delete for business entities
  Audit metadata     created/updated/deleted fields
  History            Dedicated activity/audit/history collections
  Tokens             Hash at rest where applicable
  Expiration         TTL for ephemeral security records
  Files              Metadata in MongoDB; bytes outside DB by default
  Pagination         Required for growing collections
  Search             Indexed basic search; advanced search later
  Schema evolution   Version-controlled migrations
  Transactions       Selective multi-document workflows

------------------------------------------------------------------------

# 70. Final Relationship Map

``` text
WORKSPACE
│
├── MEMBERS ───────── USER ───── SESSIONS
│                       │          └── PASSWORD RESET TOKENS
│                       │
│                       ├── SAVED FILTERS
│                       ├── DASHBOARD WIDGETS
│                       └── LEAVE REQUESTS
│
├── ROLES ── ROLE PERMISSIONS ── PERMISSIONS
│
├── PROJECTS
│   │
│   ├── PROJECT MEMBERS ─────── USER
│   ├── EPICS
│   ├── SPRINTS
│   │
│   └── TASKS
│       │
│       ├── TASK ASSIGNMENTS ── USER
│       ├── TASK LABELS ─────── LABELS
│       ├── COMMENTS ────────── USER
│       ├── ATTACHMENTS
│       ├── CHECKLISTS
│       │    └── CHECKLIST ITEMS
│       ├── TASK HISTORY
│       └── TIME TRACKING ───── USER
│
├── TEAMS
│   └── TEAM MEMBERS ────────── USER
│
├── NOTIFICATIONS
├── ACTIVITY LOGS
├── AUDIT LOGS
├── SETTINGS
└── EMAIL TEMPLATES

SYSTEM
└── SYSTEM CONFIGURATIONS
```

------------------------------------------------------------------------

# 71. Conclusion

The ETMS database is designed as a workspace-scoped, modular MongoDB
data model that supports the current internship implementation while
preserving room for enterprise growth.

The most important rules for the development team are:

1.  Do not embed unbounded business data.
2.  Use explicit references and mapping collections for many-to-many
    relationships.
3.  Scope business data by workspace.
4.  Apply indexes based on query patterns.
5.  Use soft deletion for recoverable business entities.
6.  Maintain audit metadata on important records.
7.  Keep activity, audit, and structured history concepts separate.
8.  Hash security tokens where applicable.
9.  Use TTL indexes for ephemeral records.
10. Never trust client-supplied ownership or audit fields.
11. Enforce cross-collection integrity in services.
12. Document schema changes before integration.
13. Paginate large result sets.
14. Keep secrets out of ordinary configuration collections.
15. Respect collection ownership when eight interns work in parallel.

This document is the database baseline for the subsequent **REST API
Specification**, backend module design, frontend integration, testing
strategy, and sprint assignments.
