# Document 06 -- Backend Module Guide

**Project:** Enterprise Task Management System (ETMS)\
**Document Type:** Backend Implementation Guide\
**Version:** 1.0\
**Backend:** Node.js + Express + MongoDB/Mongoose\
**API Contract:** Document 04 -- REST API Specification\
**Database Contract:** Document 03 -- Database Design

------------------------------------------------------------------------

# 1. Purpose

This document defines how every ETMS backend feature should be
implemented using a consistent layered architecture:

``` text
Model
  ↓
Repository
  ↓
Service
  ↓
Controller
  ↓
Routes
```

Cross-cutting concerns are applied through:

``` text
Validation
Middleware
Exception Handling
```

The objective is to prevent interns from placing database queries,
authorization, validation and business rules randomly across route
files.

# 2. Standard Request Flow

``` text
HTTP Request
   ↓
Route
   ↓
Authentication Middleware
   ↓
Authorization / Scope Middleware
   ↓
Request Validation
   ↓
Controller
   ↓
Service
   ↓
Repository
   ↓
Mongoose Model
   ↓
MongoDB
   ↓
Repository Result
   ↓
Service Business Result
   ↓
Controller Response
   ↓
Global Exception Handler
```

# 3. Responsibility of Each Layer

## 3.1 Model

Mongoose models define persistence structure, indexes, defaults and
schema-level constraints.

A model should not contain HTTP logic.

``` js
const taskSchema = new mongoose.Schema({
  workspaceId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 250 },
  status: { type: String, required: true },
  isDeleted: { type: Boolean, default: false, index: true }
}, { timestamps: true });
```

## 3.2 Repository

Repositories own persistence queries.

``` js
export const findTaskById = (id) =>
  Task.findOne({ _id: id, isDeleted: false });

export const createTask = (data) =>
  Task.create(data);
```

Repositories should not know about `req`, `res`, HTTP status codes or
React.

## 3.3 Service

Services contain business rules and coordinate repositories.

``` js
export async function getTask(taskId, context) {
  const task = await taskRepository.findAccessibleTask(taskId, context.workspaceId);

  if (!task) {
    throw new NotFoundError("TASK_NOT_FOUND", "Task not found");
  }

  return task;
}
```

Business rules belong here: valid state transitions, membership checks,
assignment eligibility, sprint rules, duplicate prevention and
multi-document operations.

## 3.4 Controller

Controllers translate HTTP input into service calls and service results
into HTTP responses.

``` js
export async function getTask(req, res, next) {
  try {
    const task = await taskService.getTask(req.params.taskId, req.context);

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
}
```

Controllers should stay thin.

## 3.5 Routes

Routes define HTTP method/path and compose middleware.

``` js
router.get(
  "/:taskId",
  authenticate,
  authorize("TASK_VIEW"),
  validate(taskIdSchema, "params"),
  taskController.getTask
);
```

## 3.6 Validation

Validation rejects malformed requests before business logic.

Validate:

-   path parameters;
-   query parameters;
-   request body;
-   enum values;
-   string lengths;
-   dates;
-   pagination;
-   file metadata.

Cross-collection business validity belongs primarily in services rather
than schema-only validation.

## 3.7 Middleware

Middleware handles reusable request concerns:

``` text
authenticate
authorize
workspaceScope
projectAccess
taskAccess
requestId
requestLogger
rateLimiter
uploadMiddleware
notFoundHandler
errorHandler
```

## 3.8 Exception Handling

Do not build unrelated error formats inside each controller. Throw/call
standardized application errors and let one global handler map them to
the Document 04 response contract.

``` js
throw new NotFoundError("TASK_NOT_FOUND", "Task not found");
throw new ForbiddenError("PERMISSION_DENIED", "Permission denied");
throw new ConflictError("INVALID_STATE_TRANSITION", "Status transition is not allowed");
```

------------------------------------------------------------------------

# 4. Module-by-Module Backend Guide

## 1. Authentication & Sessions Module

**Feature folder:** `src/modules/auth/`

### Model

`User, UserSession, PasswordResetToken`

The model layer must follow Document 03 for collection structure, audit
fields, soft-delete behavior, relationships and indexes. Do not redesign
persistence independently inside controllers.

### Repository

`authRepository, sessionRepository, passwordResetRepository`

Responsibilities: - isolate Mongoose queries; - enforce standard
`isDeleted` filtering where applicable; - accept workspace/project scope
from trusted service context; - use projections/population
intentionally; - support pagination for growing collections; - never
send HTTP responses.

### Service

`authService, tokenService, passwordService`

Responsibilities: - implement authentication & sessions business
rules; - coordinate repository calls; - validate cross-collection
relationships; - enforce lifecycle/state rules; - create
activity/audit/notification side effects where required; - throw
standardized application exceptions; - use transactions when an
operation must update multiple documents atomically.

### Controller

`authController`

Responsibilities: - read already-validated `req.params`, `req.query`,
and `req.body`; - obtain authenticated context from middleware; - call
the service; - return the standard API response; - forward failures to
global exception handling.

### Routes

`/api/v1/auth`

Routes must match Document 04 exactly. Avoid alternate names such as
`/getAll`, `/saveData`, or `/updateById` when a REST contract already
exists.

### Validation

`loginValidator, refreshValidator, passwordValidator`

Validate request shape before controller execution. Business validation
requiring database state belongs in the service.

### Middleware

`authenticate, rateLimitAuth, auditSecurityEvent`

Middleware order should normally be:

``` text
authenticate
→ scope/access middleware
→ authorize
→ validate
→ controller
```

Adjust only where a route has a justified requirement.

### Exception Handling

Typical failures should use module-specific error codes from Document
04, plus common errors such as:

``` text
VALIDATION_ERROR
INVALID_IDENTIFIER
RESOURCE_NOT_FOUND
PERMISSION_DENIED
WORKSPACE_ACCESS_DENIED
INVALID_STATE_TRANSITION
DUPLICATE_RESOURCE
INTERNAL_SERVER_ERROR
```

The module must not expose raw Mongoose/MongoDB errors to clients.

------------------------------------------------------------------------

## 2. Users Module

**Feature folder:** `src/modules/users/`

### Model

`User, UserWorkspaceMembership`

The model layer must follow Document 03 for collection structure, audit
fields, soft-delete behavior, relationships and indexes. Do not redesign
persistence independently inside controllers.

### Repository

`userRepository`

Responsibilities: - isolate Mongoose queries; - enforce standard
`isDeleted` filtering where applicable; - accept workspace/project scope
from trusted service context; - use projections/population
intentionally; - support pagination for growing collections; - never
send HTTP responses.

### Service

`userService`

Responsibilities: - implement users business rules; - coordinate
repository calls; - validate cross-collection relationships; - enforce
lifecycle/state rules; - create activity/audit/notification side effects
where required; - throw standardized application exceptions; - use
transactions when an operation must update multiple documents
atomically.

### Controller

`userController`

Responsibilities: - read already-validated `req.params`, `req.query`,
and `req.body`; - obtain authenticated context from middleware; - call
the service; - return the standard API response; - forward failures to
global exception handling.

### Routes

`/api/v1/users`

Routes must match Document 04 exactly. Avoid alternate names such as
`/getAll`, `/saveData`, or `/updateById` when a REST contract already
exists.

### Validation

`createUserValidator, updateUserValidator, userIdValidator`

Validate request shape before controller execution. Business validation
requiring database state belongs in the service.

### Middleware

`authenticate, authorize(USER_*), workspaceScope`

Middleware order should normally be:

``` text
authenticate
→ scope/access middleware
→ authorize
→ validate
→ controller
```

Adjust only where a route has a justified requirement.

### Exception Handling

Typical failures should use module-specific error codes from Document
04, plus common errors such as:

``` text
VALIDATION_ERROR
INVALID_IDENTIFIER
RESOURCE_NOT_FOUND
PERMISSION_DENIED
WORKSPACE_ACCESS_DENIED
INVALID_STATE_TRANSITION
DUPLICATE_RESOURCE
INTERNAL_SERVER_ERROR
```

The module must not expose raw Mongoose/MongoDB errors to clients.

------------------------------------------------------------------------

## 3. Roles & Permissions Module

**Feature folder:** `src/modules/authorization/`

### Model

`Role, Permission, RolePermission, UserRole`

The model layer must follow Document 03 for collection structure, audit
fields, soft-delete behavior, relationships and indexes. Do not redesign
persistence independently inside controllers.

### Repository

`roleRepository, permissionRepository`

Responsibilities: - isolate Mongoose queries; - enforce standard
`isDeleted` filtering where applicable; - accept workspace/project scope
from trusted service context; - use projections/population
intentionally; - support pagination for growing collections; - never
send HTTP responses.

### Service

`authorizationService, roleService`

Responsibilities: - implement roles & permissions business rules; -
coordinate repository calls; - validate cross-collection
relationships; - enforce lifecycle/state rules; - create
activity/audit/notification side effects where required; - throw
standardized application exceptions; - use transactions when an
operation must update multiple documents atomically.

### Controller

`roleController, permissionController`

Responsibilities: - read already-validated `req.params`, `req.query`,
and `req.body`; - obtain authenticated context from middleware; - call
the service; - return the standard API response; - forward failures to
global exception handling.

### Routes

`/api/v1/roles, /api/v1/permissions`

Routes must match Document 04 exactly. Avoid alternate names such as
`/getAll`, `/saveData`, or `/updateById` when a REST contract already
exists.

### Validation

`roleValidator, permissionValidator`

Validate request shape before controller execution. Business validation
requiring database state belongs in the service.

### Middleware

`authenticate, authorize(ADMIN/RBAC), auditSecurityEvent`

Middleware order should normally be:

``` text
authenticate
→ scope/access middleware
→ authorize
→ validate
→ controller
```

Adjust only where a route has a justified requirement.

### Exception Handling

Typical failures should use module-specific error codes from Document
04, plus common errors such as:

``` text
VALIDATION_ERROR
INVALID_IDENTIFIER
RESOURCE_NOT_FOUND
PERMISSION_DENIED
WORKSPACE_ACCESS_DENIED
INVALID_STATE_TRANSITION
DUPLICATE_RESOURCE
INTERNAL_SERVER_ERROR
```

The module must not expose raw Mongoose/MongoDB errors to clients.

------------------------------------------------------------------------

## 4. Projects & Members Module

**Feature folder:** `src/modules/projects/`

### Model

`Project, ProjectMember`

The model layer must follow Document 03 for collection structure, audit
fields, soft-delete behavior, relationships and indexes. Do not redesign
persistence independently inside controllers.

### Repository

`projectRepository, projectMemberRepository`

Responsibilities: - isolate Mongoose queries; - enforce standard
`isDeleted` filtering where applicable; - accept workspace/project scope
from trusted service context; - use projections/population
intentionally; - support pagination for growing collections; - never
send HTTP responses.

### Service

`projectService, projectMemberService`

Responsibilities: - implement projects & members business rules; -
coordinate repository calls; - validate cross-collection
relationships; - enforce lifecycle/state rules; - create
activity/audit/notification side effects where required; - throw
standardized application exceptions; - use transactions when an
operation must update multiple documents atomically.

### Controller

`projectController, projectMemberController`

Responsibilities: - read already-validated `req.params`, `req.query`,
and `req.body`; - obtain authenticated context from middleware; - call
the service; - return the standard API response; - forward failures to
global exception handling.

### Routes

`/api/v1/projects`

Routes must match Document 04 exactly. Avoid alternate names such as
`/getAll`, `/saveData`, or `/updateById` when a REST contract already
exists.

### Validation

`projectValidator, projectMemberValidator`

Validate request shape before controller execution. Business validation
requiring database state belongs in the service.

### Middleware

`authenticate, workspaceScope, projectAccess, authorize(PROJECT_*)`

Middleware order should normally be:

``` text
authenticate
→ scope/access middleware
→ authorize
→ validate
→ controller
```

Adjust only where a route has a justified requirement.

### Exception Handling

Typical failures should use module-specific error codes from Document
04, plus common errors such as:

``` text
VALIDATION_ERROR
INVALID_IDENTIFIER
RESOURCE_NOT_FOUND
PERMISSION_DENIED
WORKSPACE_ACCESS_DENIED
INVALID_STATE_TRANSITION
DUPLICATE_RESOURCE
INTERNAL_SERVER_ERROR
```

The module must not expose raw Mongoose/MongoDB errors to clients.

------------------------------------------------------------------------

## 5. Teams & Members Module

**Feature folder:** `src/modules/teams/`

### Model

`Team, TeamMember`

The model layer must follow Document 03 for collection structure, audit
fields, soft-delete behavior, relationships and indexes. Do not redesign
persistence independently inside controllers.

### Repository

`teamRepository, teamMemberRepository`

Responsibilities: - isolate Mongoose queries; - enforce standard
`isDeleted` filtering where applicable; - accept workspace/project scope
from trusted service context; - use projections/population
intentionally; - support pagination for growing collections; - never
send HTTP responses.

### Service

`teamService, teamMemberService`

Responsibilities: - implement teams & members business rules; -
coordinate repository calls; - validate cross-collection
relationships; - enforce lifecycle/state rules; - create
activity/audit/notification side effects where required; - throw
standardized application exceptions; - use transactions when an
operation must update multiple documents atomically.

### Controller

`teamController, teamMemberController`

Responsibilities: - read already-validated `req.params`, `req.query`,
and `req.body`; - obtain authenticated context from middleware; - call
the service; - return the standard API response; - forward failures to
global exception handling.

### Routes

`/api/v1/teams`

Routes must match Document 04 exactly. Avoid alternate names such as
`/getAll`, `/saveData`, or `/updateById` when a REST contract already
exists.

### Validation

`teamValidator, teamMemberValidator`

Validate request shape before controller execution. Business validation
requiring database state belongs in the service.

### Middleware

`authenticate, workspaceScope, authorize(TEAM_*)`

Middleware order should normally be:

``` text
authenticate
→ scope/access middleware
→ authorize
→ validate
→ controller
```

Adjust only where a route has a justified requirement.

### Exception Handling

Typical failures should use module-specific error codes from Document
04, plus common errors such as:

``` text
VALIDATION_ERROR
INVALID_IDENTIFIER
RESOURCE_NOT_FOUND
PERMISSION_DENIED
WORKSPACE_ACCESS_DENIED
INVALID_STATE_TRANSITION
DUPLICATE_RESOURCE
INTERNAL_SERVER_ERROR
```

The module must not expose raw Mongoose/MongoDB errors to clients.

------------------------------------------------------------------------

## 6. Tasks & Assignments Module

**Feature folder:** `src/modules/tasks/`

### Model

`Task, TaskAssignment, TaskHistory`

The model layer must follow Document 03 for collection structure, audit
fields, soft-delete behavior, relationships and indexes. Do not redesign
persistence independently inside controllers.

### Repository

`taskRepository, taskAssignmentRepository, taskHistoryRepository`

Responsibilities: - isolate Mongoose queries; - enforce standard
`isDeleted` filtering where applicable; - accept workspace/project scope
from trusted service context; - use projections/population
intentionally; - support pagination for growing collections; - never
send HTTP responses.

### Service

`taskService, assignmentService, taskHistoryService`

Responsibilities: - implement tasks & assignments business rules; -
coordinate repository calls; - validate cross-collection
relationships; - enforce lifecycle/state rules; - create
activity/audit/notification side effects where required; - throw
standardized application exceptions; - use transactions when an
operation must update multiple documents atomically.

### Controller

`taskController, taskAssignmentController`

Responsibilities: - read already-validated `req.params`, `req.query`,
and `req.body`; - obtain authenticated context from middleware; - call
the service; - return the standard API response; - forward failures to
global exception handling.

### Routes

`/api/v1/tasks`

Routes must match Document 04 exactly. Avoid alternate names such as
`/getAll`, `/saveData`, or `/updateById` when a REST contract already
exists.

### Validation

`taskValidator, assignmentValidator, taskStatusValidator`

Validate request shape before controller execution. Business validation
requiring database state belongs in the service.

### Middleware

`authenticate, workspaceScope, projectAccess, authorize(TASK_*)`

Middleware order should normally be:

``` text
authenticate
→ scope/access middleware
→ authorize
→ validate
→ controller
```

Adjust only where a route has a justified requirement.

### Exception Handling

Typical failures should use module-specific error codes from Document
04, plus common errors such as:

``` text
VALIDATION_ERROR
INVALID_IDENTIFIER
RESOURCE_NOT_FOUND
PERMISSION_DENIED
WORKSPACE_ACCESS_DENIED
INVALID_STATE_TRANSITION
DUPLICATE_RESOURCE
INTERNAL_SERVER_ERROR
```

The module must not expose raw Mongoose/MongoDB errors to clients.

------------------------------------------------------------------------

## 7. Labels Module

**Feature folder:** `src/modules/labels/`

### Model

`Label, TaskLabel`

The model layer must follow Document 03 for collection structure, audit
fields, soft-delete behavior, relationships and indexes. Do not redesign
persistence independently inside controllers.

### Repository

`labelRepository, taskLabelRepository`

Responsibilities: - isolate Mongoose queries; - enforce standard
`isDeleted` filtering where applicable; - accept workspace/project scope
from trusted service context; - use projections/population
intentionally; - support pagination for growing collections; - never
send HTTP responses.

### Service

`labelService`

Responsibilities: - implement labels business rules; - coordinate
repository calls; - validate cross-collection relationships; - enforce
lifecycle/state rules; - create activity/audit/notification side effects
where required; - throw standardized application exceptions; - use
transactions when an operation must update multiple documents
atomically.

### Controller

`labelController`

Responsibilities: - read already-validated `req.params`, `req.query`,
and `req.body`; - obtain authenticated context from middleware; - call
the service; - return the standard API response; - forward failures to
global exception handling.

### Routes

`/api/v1/projects/:projectId/labels, /api/v1/tasks/:taskId/labels`

Routes must match Document 04 exactly. Avoid alternate names such as
`/getAll`, `/saveData`, or `/updateById` when a REST contract already
exists.

### Validation

`labelValidator`

Validate request shape before controller execution. Business validation
requiring database state belongs in the service.

### Middleware

`authenticate, projectAccess, authorize(TASK_UPDATE)`

Middleware order should normally be:

``` text
authenticate
→ scope/access middleware
→ authorize
→ validate
→ controller
```

Adjust only where a route has a justified requirement.

### Exception Handling

Typical failures should use module-specific error codes from Document
04, plus common errors such as:

``` text
VALIDATION_ERROR
INVALID_IDENTIFIER
RESOURCE_NOT_FOUND
PERMISSION_DENIED
WORKSPACE_ACCESS_DENIED
INVALID_STATE_TRANSITION
DUPLICATE_RESOURCE
INTERNAL_SERVER_ERROR
```

The module must not expose raw Mongoose/MongoDB errors to clients.

------------------------------------------------------------------------

## 8. Checklists Module

**Feature folder:** `src/modules/checklists/`

### Model

`Checklist, ChecklistItem`

The model layer must follow Document 03 for collection structure, audit
fields, soft-delete behavior, relationships and indexes. Do not redesign
persistence independently inside controllers.

### Repository

`checklistRepository, checklistItemRepository`

Responsibilities: - isolate Mongoose queries; - enforce standard
`isDeleted` filtering where applicable; - accept workspace/project scope
from trusted service context; - use projections/population
intentionally; - support pagination for growing collections; - never
send HTTP responses.

### Service

`checklistService`

Responsibilities: - implement checklists business rules; - coordinate
repository calls; - validate cross-collection relationships; - enforce
lifecycle/state rules; - create activity/audit/notification side effects
where required; - throw standardized application exceptions; - use
transactions when an operation must update multiple documents
atomically.

### Controller

`checklistController`

Responsibilities: - read already-validated `req.params`, `req.query`,
and `req.body`; - obtain authenticated context from middleware; - call
the service; - return the standard API response; - forward failures to
global exception handling.

### Routes

`/api/v1/tasks/:taskId/checklists, /api/v1/checklists`

Routes must match Document 04 exactly. Avoid alternate names such as
`/getAll`, `/saveData`, or `/updateById` when a REST contract already
exists.

### Validation

`checklistValidator, checklistItemValidator`

Validate request shape before controller execution. Business validation
requiring database state belongs in the service.

### Middleware

`authenticate, taskAccess, authorize(TASK_*)`

Middleware order should normally be:

``` text
authenticate
→ scope/access middleware
→ authorize
→ validate
→ controller
```

Adjust only where a route has a justified requirement.

### Exception Handling

Typical failures should use module-specific error codes from Document
04, plus common errors such as:

``` text
VALIDATION_ERROR
INVALID_IDENTIFIER
RESOURCE_NOT_FOUND
PERMISSION_DENIED
WORKSPACE_ACCESS_DENIED
INVALID_STATE_TRANSITION
DUPLICATE_RESOURCE
INTERNAL_SERVER_ERROR
```

The module must not expose raw Mongoose/MongoDB errors to clients.

------------------------------------------------------------------------

## 9. Comments Module

**Feature folder:** `src/modules/comments/`

### Model

`Comment`

The model layer must follow Document 03 for collection structure, audit
fields, soft-delete behavior, relationships and indexes. Do not redesign
persistence independently inside controllers.

### Repository

`commentRepository`

Responsibilities: - isolate Mongoose queries; - enforce standard
`isDeleted` filtering where applicable; - accept workspace/project scope
from trusted service context; - use projections/population
intentionally; - support pagination for growing collections; - never
send HTTP responses.

### Service

`commentService, mentionService`

Responsibilities: - implement comments business rules; - coordinate
repository calls; - validate cross-collection relationships; - enforce
lifecycle/state rules; - create activity/audit/notification side effects
where required; - throw standardized application exceptions; - use
transactions when an operation must update multiple documents
atomically.

### Controller

`commentController`

Responsibilities: - read already-validated `req.params`, `req.query`,
and `req.body`; - obtain authenticated context from middleware; - call
the service; - return the standard API response; - forward failures to
global exception handling.

### Routes

`/api/v1/tasks/:taskId/comments, /api/v1/comments`

Routes must match Document 04 exactly. Avoid alternate names such as
`/getAll`, `/saveData`, or `/updateById` when a REST contract already
exists.

### Validation

`commentValidator`

Validate request shape before controller execution. Business validation
requiring database state belongs in the service.

### Middleware

`authenticate, taskAccess, commentOwnership`

Middleware order should normally be:

``` text
authenticate
→ scope/access middleware
→ authorize
→ validate
→ controller
```

Adjust only where a route has a justified requirement.

### Exception Handling

Typical failures should use module-specific error codes from Document
04, plus common errors such as:

``` text
VALIDATION_ERROR
INVALID_IDENTIFIER
RESOURCE_NOT_FOUND
PERMISSION_DENIED
WORKSPACE_ACCESS_DENIED
INVALID_STATE_TRANSITION
DUPLICATE_RESOURCE
INTERNAL_SERVER_ERROR
```

The module must not expose raw Mongoose/MongoDB errors to clients.

------------------------------------------------------------------------

## 10. Attachments Module

**Feature folder:** `src/modules/attachments/`

### Model

`Attachment`

The model layer must follow Document 03 for collection structure, audit
fields, soft-delete behavior, relationships and indexes. Do not redesign
persistence independently inside controllers.

### Repository

`attachmentRepository`

Responsibilities: - isolate Mongoose queries; - enforce standard
`isDeleted` filtering where applicable; - accept workspace/project scope
from trusted service context; - use projections/population
intentionally; - support pagination for growing collections; - never
send HTTP responses.

### Service

`attachmentService, storageService`

Responsibilities: - implement attachments business rules; - coordinate
repository calls; - validate cross-collection relationships; - enforce
lifecycle/state rules; - create activity/audit/notification side effects
where required; - throw standardized application exceptions; - use
transactions when an operation must update multiple documents
atomically.

### Controller

`attachmentController`

Responsibilities: - read already-validated `req.params`, `req.query`,
and `req.body`; - obtain authenticated context from middleware; - call
the service; - return the standard API response; - forward failures to
global exception handling.

### Routes

`/api/v1/attachments and parent-resource attachment routes`

Routes must match Document 04 exactly. Avoid alternate names such as
`/getAll`, `/saveData`, or `/updateById` when a REST contract already
exists.

### Validation

`attachmentValidator`

Validate request shape before controller execution. Business validation
requiring database state belongs in the service.

### Middleware

`authenticate, entityAccess, uploadMiddleware, authorize(ATTACHMENT_*)`

Middleware order should normally be:

``` text
authenticate
→ scope/access middleware
→ authorize
→ validate
→ controller
```

Adjust only where a route has a justified requirement.

### Exception Handling

Typical failures should use module-specific error codes from Document
04, plus common errors such as:

``` text
VALIDATION_ERROR
INVALID_IDENTIFIER
RESOURCE_NOT_FOUND
PERMISSION_DENIED
WORKSPACE_ACCESS_DENIED
INVALID_STATE_TRANSITION
DUPLICATE_RESOURCE
INTERNAL_SERVER_ERROR
```

The module must not expose raw Mongoose/MongoDB errors to clients.

------------------------------------------------------------------------

## 11. Sprints Module

**Feature folder:** `src/modules/sprints/`

### Model

`Sprint`

The model layer must follow Document 03 for collection structure, audit
fields, soft-delete behavior, relationships and indexes. Do not redesign
persistence independently inside controllers.

### Repository

`sprintRepository`

Responsibilities: - isolate Mongoose queries; - enforce standard
`isDeleted` filtering where applicable; - accept workspace/project scope
from trusted service context; - use projections/population
intentionally; - support pagination for growing collections; - never
send HTTP responses.

### Service

`sprintService`

Responsibilities: - implement sprints business rules; - coordinate
repository calls; - validate cross-collection relationships; - enforce
lifecycle/state rules; - create activity/audit/notification side effects
where required; - throw standardized application exceptions; - use
transactions when an operation must update multiple documents
atomically.

### Controller

`sprintController`

Responsibilities: - read already-validated `req.params`, `req.query`,
and `req.body`; - obtain authenticated context from middleware; - call
the service; - return the standard API response; - forward failures to
global exception handling.

### Routes

`/api/v1/sprints`

Routes must match Document 04 exactly. Avoid alternate names such as
`/getAll`, `/saveData`, or `/updateById` when a REST contract already
exists.

### Validation

`sprintValidator, sprintLifecycleValidator`

Validate request shape before controller execution. Business validation
requiring database state belongs in the service.

### Middleware

`authenticate, projectAccess, authorize(SPRINT_*)`

Middleware order should normally be:

``` text
authenticate
→ scope/access middleware
→ authorize
→ validate
→ controller
```

Adjust only where a route has a justified requirement.

### Exception Handling

Typical failures should use module-specific error codes from Document
04, plus common errors such as:

``` text
VALIDATION_ERROR
INVALID_IDENTIFIER
RESOURCE_NOT_FOUND
PERMISSION_DENIED
WORKSPACE_ACCESS_DENIED
INVALID_STATE_TRANSITION
DUPLICATE_RESOURCE
INTERNAL_SERVER_ERROR
```

The module must not expose raw Mongoose/MongoDB errors to clients.

------------------------------------------------------------------------

## 12. Epics Module

**Feature folder:** `src/modules/epics/`

### Model

`Epic`

The model layer must follow Document 03 for collection structure, audit
fields, soft-delete behavior, relationships and indexes. Do not redesign
persistence independently inside controllers.

### Repository

`epicRepository`

Responsibilities: - isolate Mongoose queries; - enforce standard
`isDeleted` filtering where applicable; - accept workspace/project scope
from trusted service context; - use projections/population
intentionally; - support pagination for growing collections; - never
send HTTP responses.

### Service

`epicService`

Responsibilities: - implement epics business rules; - coordinate
repository calls; - validate cross-collection relationships; - enforce
lifecycle/state rules; - create activity/audit/notification side effects
where required; - throw standardized application exceptions; - use
transactions when an operation must update multiple documents
atomically.

### Controller

`epicController`

Responsibilities: - read already-validated `req.params`, `req.query`,
and `req.body`; - obtain authenticated context from middleware; - call
the service; - return the standard API response; - forward failures to
global exception handling.

### Routes

`/api/v1/projects/:projectId/epics`

Routes must match Document 04 exactly. Avoid alternate names such as
`/getAll`, `/saveData`, or `/updateById` when a REST contract already
exists.

### Validation

`epicValidator`

Validate request shape before controller execution. Business validation
requiring database state belongs in the service.

### Middleware

`authenticate, projectAccess, authorize(PROJECT_*)`

Middleware order should normally be:

``` text
authenticate
→ scope/access middleware
→ authorize
→ validate
→ controller
```

Adjust only where a route has a justified requirement.

### Exception Handling

Typical failures should use module-specific error codes from Document
04, plus common errors such as:

``` text
VALIDATION_ERROR
INVALID_IDENTIFIER
RESOURCE_NOT_FOUND
PERMISSION_DENIED
WORKSPACE_ACCESS_DENIED
INVALID_STATE_TRANSITION
DUPLICATE_RESOURCE
INTERNAL_SERVER_ERROR
```

The module must not expose raw Mongoose/MongoDB errors to clients.

------------------------------------------------------------------------

## 13. Time Tracking Module

**Feature folder:** `src/modules/timeTracking/`

### Model

`TimeEntry`

The model layer must follow Document 03 for collection structure, audit
fields, soft-delete behavior, relationships and indexes. Do not redesign
persistence independently inside controllers.

### Repository

`timeEntryRepository`

Responsibilities: - isolate Mongoose queries; - enforce standard
`isDeleted` filtering where applicable; - accept workspace/project scope
from trusted service context; - use projections/population
intentionally; - support pagination for growing collections; - never
send HTTP responses.

### Service

`timeTrackingService`

Responsibilities: - implement time tracking business rules; - coordinate
repository calls; - validate cross-collection relationships; - enforce
lifecycle/state rules; - create activity/audit/notification side effects
where required; - throw standardized application exceptions; - use
transactions when an operation must update multiple documents
atomically.

### Controller

`timeTrackingController`

Responsibilities: - read already-validated `req.params`, `req.query`,
and `req.body`; - obtain authenticated context from middleware; - call
the service; - return the standard API response; - forward failures to
global exception handling.

### Routes

`/api/v1/tasks/:taskId/time`

Routes must match Document 04 exactly. Avoid alternate names such as
`/getAll`, `/saveData`, or `/updateById` when a REST contract already
exists.

### Validation

`timeEntryValidator`

Validate request shape before controller execution. Business validation
requiring database state belongs in the service.

### Middleware

`authenticate, taskAccess`

Middleware order should normally be:

``` text
authenticate
→ scope/access middleware
→ authorize
→ validate
→ controller
```

Adjust only where a route has a justified requirement.

### Exception Handling

Typical failures should use module-specific error codes from Document
04, plus common errors such as:

``` text
VALIDATION_ERROR
INVALID_IDENTIFIER
RESOURCE_NOT_FOUND
PERMISSION_DENIED
WORKSPACE_ACCESS_DENIED
INVALID_STATE_TRANSITION
DUPLICATE_RESOURCE
INTERNAL_SERVER_ERROR
```

The module must not expose raw Mongoose/MongoDB errors to clients.

------------------------------------------------------------------------

## 14. Dashboard Module

**Feature folder:** `src/modules/dashboard/`

### Model

`DashboardWidget (plus read models/aggregations)`

The model layer must follow Document 03 for collection structure, audit
fields, soft-delete behavior, relationships and indexes. Do not redesign
persistence independently inside controllers.

### Repository

`dashboardRepository`

Responsibilities: - isolate Mongoose queries; - enforce standard
`isDeleted` filtering where applicable; - accept workspace/project scope
from trusted service context; - use projections/population
intentionally; - support pagination for growing collections; - never
send HTTP responses.

### Service

`dashboardService`

Responsibilities: - implement dashboard business rules; - coordinate
repository calls; - validate cross-collection relationships; - enforce
lifecycle/state rules; - create activity/audit/notification side effects
where required; - throw standardized application exceptions; - use
transactions when an operation must update multiple documents
atomically.

### Controller

`dashboardController`

Responsibilities: - read already-validated `req.params`, `req.query`,
and `req.body`; - obtain authenticated context from middleware; - call
the service; - return the standard API response; - forward failures to
global exception handling.

### Routes

`/api/v1/dashboard`

Routes must match Document 04 exactly. Avoid alternate names such as
`/getAll`, `/saveData`, or `/updateById` when a REST contract already
exists.

### Validation

`dashboardQueryValidator, widgetValidator`

Validate request shape before controller execution. Business validation
requiring database state belongs in the service.

### Middleware

`authenticate, workspaceScope, authorize(DASHBOARD_VIEW)`

Middleware order should normally be:

``` text
authenticate
→ scope/access middleware
→ authorize
→ validate
→ controller
```

Adjust only where a route has a justified requirement.

### Exception Handling

Typical failures should use module-specific error codes from Document
04, plus common errors such as:

``` text
VALIDATION_ERROR
INVALID_IDENTIFIER
RESOURCE_NOT_FOUND
PERMISSION_DENIED
WORKSPACE_ACCESS_DENIED
INVALID_STATE_TRANSITION
DUPLICATE_RESOURCE
INTERNAL_SERVER_ERROR
```

The module must not expose raw Mongoose/MongoDB errors to clients.

------------------------------------------------------------------------

## 15. Reports Module

**Feature folder:** `src/modules/reports/`

### Model

`Read models over Task, Project, Sprint, TimeEntry, ActivityLog, AuditLog`

The model layer must follow Document 03 for collection structure, audit
fields, soft-delete behavior, relationships and indexes. Do not redesign
persistence independently inside controllers.

### Repository

`reportRepository`

Responsibilities: - isolate Mongoose queries; - enforce standard
`isDeleted` filtering where applicable; - accept workspace/project scope
from trusted service context; - use projections/population
intentionally; - support pagination for growing collections; - never
send HTTP responses.

### Service

`reportService, exportService`

Responsibilities: - implement reports business rules; - coordinate
repository calls; - validate cross-collection relationships; - enforce
lifecycle/state rules; - create activity/audit/notification side effects
where required; - throw standardized application exceptions; - use
transactions when an operation must update multiple documents
atomically.

### Controller

`reportController`

Responsibilities: - read already-validated `req.params`, `req.query`,
and `req.body`; - obtain authenticated context from middleware; - call
the service; - return the standard API response; - forward failures to
global exception handling.

### Routes

`/api/v1/reports`

Routes must match Document 04 exactly. Avoid alternate names such as
`/getAll`, `/saveData`, or `/updateById` when a REST contract already
exists.

### Validation

`reportFilterValidator, exportValidator`

Validate request shape before controller execution. Business validation
requiring database state belongs in the service.

### Middleware

`authenticate, workspaceScope, authorize(REPORT_VIEW), exportRateLimit`

Middleware order should normally be:

``` text
authenticate
→ scope/access middleware
→ authorize
→ validate
→ controller
```

Adjust only where a route has a justified requirement.

### Exception Handling

Typical failures should use module-specific error codes from Document
04, plus common errors such as:

``` text
VALIDATION_ERROR
INVALID_IDENTIFIER
RESOURCE_NOT_FOUND
PERMISSION_DENIED
WORKSPACE_ACCESS_DENIED
INVALID_STATE_TRANSITION
DUPLICATE_RESOURCE
INTERNAL_SERVER_ERROR
```

The module must not expose raw Mongoose/MongoDB errors to clients.

------------------------------------------------------------------------

## 16. Notifications Module

**Feature folder:** `src/modules/notifications/`

### Model

`Notification, NotificationPreference`

The model layer must follow Document 03 for collection structure, audit
fields, soft-delete behavior, relationships and indexes. Do not redesign
persistence independently inside controllers.

### Repository

`notificationRepository, preferenceRepository`

Responsibilities: - isolate Mongoose queries; - enforce standard
`isDeleted` filtering where applicable; - accept workspace/project scope
from trusted service context; - use projections/population
intentionally; - support pagination for growing collections; - never
send HTTP responses.

### Service

`notificationService, preferenceService`

Responsibilities: - implement notifications business rules; - coordinate
repository calls; - validate cross-collection relationships; - enforce
lifecycle/state rules; - create activity/audit/notification side effects
where required; - throw standardized application exceptions; - use
transactions when an operation must update multiple documents
atomically.

### Controller

`notificationController`

Responsibilities: - read already-validated `req.params`, `req.query`,
and `req.body`; - obtain authenticated context from middleware; - call
the service; - return the standard API response; - forward failures to
global exception handling.

### Routes

`/api/v1/notifications`

Routes must match Document 04 exactly. Avoid alternate names such as
`/getAll`, `/saveData`, or `/updateById` when a REST contract already
exists.

### Validation

`notificationValidator, preferenceValidator`

Validate request shape before controller execution. Business validation
requiring database state belongs in the service.

### Middleware

`authenticate, notificationOwnership`

Middleware order should normally be:

``` text
authenticate
→ scope/access middleware
→ authorize
→ validate
→ controller
```

Adjust only where a route has a justified requirement.

### Exception Handling

Typical failures should use module-specific error codes from Document
04, plus common errors such as:

``` text
VALIDATION_ERROR
INVALID_IDENTIFIER
RESOURCE_NOT_FOUND
PERMISSION_DENIED
WORKSPACE_ACCESS_DENIED
INVALID_STATE_TRANSITION
DUPLICATE_RESOURCE
INTERNAL_SERVER_ERROR
```

The module must not expose raw Mongoose/MongoDB errors to clients.

------------------------------------------------------------------------

## 17. Activity & Audit Module

**Feature folder:** `src/modules/activity/`

### Model

`ActivityLog, AuditLog`

The model layer must follow Document 03 for collection structure, audit
fields, soft-delete behavior, relationships and indexes. Do not redesign
persistence independently inside controllers.

### Repository

`activityRepository, auditRepository`

Responsibilities: - isolate Mongoose queries; - enforce standard
`isDeleted` filtering where applicable; - accept workspace/project scope
from trusted service context; - use projections/population
intentionally; - support pagination for growing collections; - never
send HTTP responses.

### Service

`activityService, auditService`

Responsibilities: - implement activity & audit business rules; -
coordinate repository calls; - validate cross-collection
relationships; - enforce lifecycle/state rules; - create
activity/audit/notification side effects where required; - throw
standardized application exceptions; - use transactions when an
operation must update multiple documents atomically.

### Controller

`activityController, auditController`

Responsibilities: - read already-validated `req.params`, `req.query`,
and `req.body`; - obtain authenticated context from middleware; - call
the service; - return the standard API response; - forward failures to
global exception handling.

### Routes

`/api/v1/reports/activity, /api/v1/reports/audit`

Routes must match Document 04 exactly. Avoid alternate names such as
`/getAll`, `/saveData`, or `/updateById` when a REST contract already
exists.

### Validation

`activityQueryValidator`

Validate request shape before controller execution. Business validation
requiring database state belongs in the service.

### Middleware

`authenticate, workspaceScope, authorize appropriate read/audit permission`

Middleware order should normally be:

``` text
authenticate
→ scope/access middleware
→ authorize
→ validate
→ controller
```

Adjust only where a route has a justified requirement.

### Exception Handling

Typical failures should use module-specific error codes from Document
04, plus common errors such as:

``` text
VALIDATION_ERROR
INVALID_IDENTIFIER
RESOURCE_NOT_FOUND
PERMISSION_DENIED
WORKSPACE_ACCESS_DENIED
INVALID_STATE_TRANSITION
DUPLICATE_RESOURCE
INTERNAL_SERVER_ERROR
```

The module must not expose raw Mongoose/MongoDB errors to clients.

------------------------------------------------------------------------

## 18. Settings & Configuration Module

**Feature folder:** `src/modules/settings/`

### Model

`WorkspaceSettings, SystemConfiguration`

The model layer must follow Document 03 for collection structure, audit
fields, soft-delete behavior, relationships and indexes. Do not redesign
persistence independently inside controllers.

### Repository

`settingsRepository, systemConfigRepository`

Responsibilities: - isolate Mongoose queries; - enforce standard
`isDeleted` filtering where applicable; - accept workspace/project scope
from trusted service context; - use projections/population
intentionally; - support pagination for growing collections; - never
send HTTP responses.

### Service

`settingsService`

Responsibilities: - implement settings & configuration business rules; -
coordinate repository calls; - validate cross-collection
relationships; - enforce lifecycle/state rules; - create
activity/audit/notification side effects where required; - throw
standardized application exceptions; - use transactions when an
operation must update multiple documents atomically.

### Controller

`settingsController`

Responsibilities: - read already-validated `req.params`, `req.query`,
and `req.body`; - obtain authenticated context from middleware; - call
the service; - return the standard API response; - forward failures to
global exception handling.

### Routes

`/api/v1/settings`

Routes must match Document 04 exactly. Avoid alternate names such as
`/getAll`, `/saveData`, or `/updateById` when a REST contract already
exists.

### Validation

`settingsValidator`

Validate request shape before controller execution. Business validation
requiring database state belongs in the service.

### Middleware

`authenticate, workspaceScope, authorize settings/admin permission, auditSecurityEvent`

Middleware order should normally be:

``` text
authenticate
→ scope/access middleware
→ authorize
→ validate
→ controller
```

Adjust only where a route has a justified requirement.

### Exception Handling

Typical failures should use module-specific error codes from Document
04, plus common errors such as:

``` text
VALIDATION_ERROR
INVALID_IDENTIFIER
RESOURCE_NOT_FOUND
PERMISSION_DENIED
WORKSPACE_ACCESS_DENIED
INVALID_STATE_TRANSITION
DUPLICATE_RESOURCE
INTERNAL_SERVER_ERROR
```

The module must not expose raw Mongoose/MongoDB errors to clients.

------------------------------------------------------------------------

# 5. Recommended Backend Folder Structure

``` text
backend/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── database.js
│   │   ├── env.js
│   │   └── logger.js
│   ├── middleware/
│   │   ├── authenticate.js
│   │   ├── authorize.js
│   │   ├── workspaceScope.js
│   │   ├── requestId.js
│   │   ├── requestLogger.js
│   │   ├── rateLimiter.js
│   │   ├── validate.js
│   │   ├── notFoundHandler.js
│   │   └── errorHandler.js
│   ├── errors/
│   │   ├── AppError.js
│   │   ├── BadRequestError.js
│   │   ├── UnauthorizedError.js
│   │   ├── ForbiddenError.js
│   │   ├── NotFoundError.js
│   │   └── ConflictError.js
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── authorization/
│   │   ├── projects/
│   │   ├── teams/
│   │   ├── tasks/
│   │   ├── labels/
│   │   ├── checklists/
│   │   ├── comments/
│   │   ├── attachments/
│   │   ├── sprints/
│   │   ├── epics/
│   │   ├── timeTracking/
│   │   ├── dashboard/
│   │   ├── reports/
│   │   ├── notifications/
│   │   ├── activity/
│   │   └── settings/
│   ├── shared/
│   │   ├── constants/
│   │   ├── dto/
│   │   ├── mappers/
│   │   ├── utils/
│   │   └── validators/
│   └── routes/
│       └── index.js
├── tests/
├── uploads/
├── .env.example
├── package.json
└── README.md
```

# 6. Standard Module Folder Template

Each major module should follow a predictable shape:

``` text
tasks/
├── task.model.js
├── task.repository.js
├── task.service.js
├── task.controller.js
├── task.routes.js
├── task.validation.js
├── task.mapper.js
├── task.constants.js
└── __tests__/
```

A larger module can contain subfeatures:

``` text
tasks/
├── models/
├── repositories/
├── services/
├── controllers/
├── routes/
├── validators/
└── mappers/
```

Choose one convention and keep it consistent across the repository.

# 7. Complete Task Module Example

## 7.1 Model

``` js
// task.model.js
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "QA", "DONE"],
    default: "BACKLOG",
    index: true
  },
  priority: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
    default: "MEDIUM"
  },
  primaryAssigneeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  dueDate: Date,
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

taskSchema.index({ workspaceId: 1, projectId: 1, status: 1, isDeleted: 1 });

export const Task = mongoose.model("Task", taskSchema);
```

## 7.2 Repository

``` js
// task.repository.js
import { Task } from "./task.model.js";

export function create(data, options = {}) {
  return Task.create([data], options).then(([task]) => task);
}

export function findByIdInWorkspace(taskId, workspaceId) {
  return Task.findOne({
    _id: taskId,
    workspaceId,
    isDeleted: false
  });
}

export function findAll(filter, { skip, limit, sort }) {
  return Task.find({
    ...filter,
    isDeleted: false
  })
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();
}

export function count(filter) {
  return Task.countDocuments({
    ...filter,
    isDeleted: false
  });
}

export function updateById(taskId, workspaceId, update) {
  return Task.findOneAndUpdate(
    { _id: taskId, workspaceId, isDeleted: false },
    update,
    { new: true, runValidators: true }
  );
}
```

## 7.3 Service

``` js
// task.service.js
import * as taskRepository from "./task.repository.js";
import { NotFoundError } from "../../errors/NotFoundError.js";

export async function getTask(taskId, context) {
  const task = await taskRepository.findByIdInWorkspace(
    taskId,
    context.workspaceId
  );

  if (!task) {
    throw new NotFoundError("TASK_NOT_FOUND", "Task not found");
  }

  return task;
}

export async function createTask(input, context) {
  // Validate project membership and related IDs here using repositories/services.

  return taskRepository.create({
    ...input,
    workspaceId: context.workspaceId,
    createdBy: context.userId,
    updatedBy: context.userId
  });
}
```

## 7.4 Controller

``` js
// task.controller.js
import * as taskService from "./task.service.js";

export async function getTask(req, res, next) {
  try {
    const task = await taskService.getTask(
      req.params.taskId,
      req.context
    );

    return res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
}

export async function createTask(req, res, next) {
  try {
    const task = await taskService.createTask(
      req.body,
      req.context
    );

    return res.status(201).json({
      success: true,
      message: "Task created",
      data: task
    });
  } catch (error) {
    next(error);
  }
}
```

## 7.5 Validation

Example using a schema-validation library:

``` js
export const createTaskSchema = {
  body: {
    title: {
      required: true,
      type: "string",
      minLength: 1,
      maxLength: 250
    },
    projectId: {
      required: true,
      type: "objectId"
    },
    priority: {
      allowed: ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    }
  }
};
```

The concrete validation library can be Joi, Zod, express-validator or
another team-approved library. Do not mix multiple validation libraries
across intern modules.

## 7.6 Routes

``` js
// task.routes.js
import { Router } from "express";
import * as taskController from "./task.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import { createTaskSchema } from "./task.validation.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("TASK_CREATE"),
  validate(createTaskSchema),
  taskController.createTask
);

router.get(
  "/:taskId",
  authenticate,
  authorize("TASK_VIEW"),
  taskController.getTask
);

export default router;
```

# 8. Authentication Middleware

``` js
export async function authenticate(req, res, next) {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      throw new UnauthorizedError(
        "AUTH_REQUIRED",
        "Authentication is required"
      );
    }

    const payload = verifyAccessToken(token);

    req.context = {
      userId: payload.sub,
      workspaceId: payload.workspaceId,
      permissions: payload.permissions || []
    };

    next();
  } catch (error) {
    next(error);
  }
}
```

Do not trust authorization-sensitive claims without following the
token/session strategy agreed by the authentication design.

# 9. Authorization Middleware

``` js
export function authorize(requiredPermission) {
  return (req, res, next) => {
    const permissions = req.context?.permissions || [];

    if (!permissions.includes(requiredPermission)) {
      return next(
        new ForbiddenError(
          "PERMISSION_DENIED",
          "You do not have permission to perform this action"
        )
      );
    }

    next();
  };
}
```

Permission checks may also require project/workspace context. Global
permission possession alone is not always sufficient.

# 10. Validation Middleware

``` js
export function validate(schema) {
  return (req, res, next) => {
    try {
      const validated = validateRequest(schema, {
        params: req.params,
        query: req.query,
        body: req.body
      });

      req.validated = validated;
      next();
    } catch (error) {
      next(
        new BadRequestError(
          "VALIDATION_ERROR",
          "Request validation failed",
          error.details
        )
      );
    }
  };
}
```

Controllers should prefer validated values when the chosen library
returns sanitized/coerced data.

# 11. Global Exception Architecture

## AppError

``` js
export class AppError extends Error {
  constructor(statusCode, code, message, errors = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.isOperational = true;
  }
}
```

## Specialized Errors

``` js
export class NotFoundError extends AppError {
  constructor(code, message) {
    super(404, code, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(code, message) {
    super(403, code, message);
  }
}

export class ConflictError extends AppError {
  constructor(code, message) {
    super(409, code, message);
  }
}
```

## Error Handler

``` js
export function errorHandler(err, req, res, next) {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
      requestId: req.id
    });
  }

  console.error(err);

  return res.status(500).json({
    success: false,
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
    requestId: req.id
  });
}
```

Never send stack traces or raw database error objects to production
clients.

# 12. MongoDB Error Translation

Translate known persistence errors into application errors.

Examples:

``` text
Mongo duplicate key
    ↓
409 DUPLICATE_RESOURCE

Mongoose CastError
    ↓
400 INVALID_IDENTIFIER

Mongoose validation failure
    ↓
400 VALIDATION_ERROR
```

Do not rely solely on database errors for request validation.

# 13. Soft Delete Rule

For collections using soft deletion:

``` js
{
  isDeleted: true,
  deletedAt: new Date(),
  deletedBy: context.userId
}
```

Normal repository reads must exclude deleted records unless explicitly
implementing restore/admin history functionality.

# 14. Audit Fields

Creation:

``` js
{
  createdBy: context.userId,
  updatedBy: context.userId
}
```

Update:

``` js
{
  updatedBy: context.userId
}
```

Clients must not be allowed to impersonate audit users by supplying
these fields.

# 15. Transactions

Use MongoDB transactions where multiple writes must succeed or fail as
one logical operation.

Examples:

``` text
Create project + initial project membership
Complete sprint + move incomplete tasks
Delete/restore operations with mandatory dependent state
Security role changes + mandatory audit entry
```

Do not add transactions around simple single-document operations without
need.

# 16. DTO / Mapper Rule

Do not blindly return full Mongoose documents.

Example:

``` js
export function toTaskResponse(task) {
  return {
    id: task._id.toString(),
    taskKey: task.taskKey,
    title: task.title,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate
  };
}
```

Never expose:

``` text
passwordHash
refresh token hashes
reset token hashes
internal security metadata
fields not authorized for the caller
```

# 17. Pagination Repository Pattern

``` js
const skip = (page - 1) * pageSize;

const [items, totalItems] = await Promise.all([
  repository.findAll(filter, {
    skip,
    limit: pageSize,
    sort
  }),
  repository.count(filter)
]);

return {
  items,
  pagination: {
    page,
    pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize)
  }
};
```

# 18. Logging

Log useful operational information:

``` text
request ID
method
path
status
duration
authenticated user ID where appropriate
error code
```

Do not log:

``` text
passwords
access tokens
refresh tokens
reset tokens
sensitive file contents
```

# 19. Testing by Layer

## Repository Tests

Verify filters, soft deletion, pagination and scoped queries.

## Service Tests

Test business rules, state transitions, duplicate prevention and
authorization-dependent domain rules.

## Controller/API Tests

Test HTTP method/path, status codes, validation and response contract.

## Middleware Tests

Test missing/invalid token, permissions, scope and validation failures.

Every module must include both happy-path and negative-path tests.

# 20. Eight-Intern Backend Ownership

  Intern   Primary Backend Ownership
  -------- -------------------------------------------------------
  1        Authentication, sessions, password reset
  2        Users and profile
  3        Roles, permissions, authorization middleware
  4        Projects, project members, epics
  5        Teams and sprints
  6        Tasks, assignments, labels, checklists, time tracking
  7        Comments, attachments/storage
  8        Dashboard, reports, notifications, activity/audit

Shared middleware, base errors, database configuration and route
registration are integration-sensitive and should be reviewed by the
lead.

# 21. Module Definition of Done

A backend module is complete only when:

1.  Model matches Document 03.
2.  Repository contains persistence logic.
3.  Service contains business logic.
4.  Controller remains thin.
5.  Routes match Document 04.
6.  Validation exists for body/query/params as applicable.
7.  Authentication is applied.
8.  Authorization is applied.
9.  Workspace/project scope is enforced.
10. Soft-delete behavior is correct.
11. Standard exceptions/error codes are used.
12. No raw database errors reach clients.
13. DTOs do not expose sensitive fields.
14. Audit/activity side effects exist where required.
15. Postman happy-path tests pass.
16. Negative API tests pass.
17. Unit/integration tests cover important business rules.
18. Code is reviewed before merging.

# 22. Rules for Interns

-   Never call Mongoose directly from route files.
-   Avoid database logic in controllers.
-   Avoid HTTP logic in repositories.
-   Put business decisions in services.
-   Never trust client-provided workspace or audit ownership blindly.
-   Never bypass authorization because the React UI hides a button.
-   Do not create alternative endpoint names outside Document 04.
-   Reuse common middleware and error classes.
-   Do not duplicate models across modules.
-   Avoid circular module imports; expose deliberate service/repository
    interfaces.
-   Do not catch an exception only to hide it.
-   Never return `err.message` blindly for unknown errors.
-   Keep secrets in environment variables.
-   Validate file uploads.
-   Use indexes described in Document 03.
-   Paginate growing resources.
-   Use transactions only when atomic multi-document consistency is
    required.
-   Add audit records for security-sensitive administrative changes.

# 23. Conclusion

This guide establishes one backend implementation style for the ETMS
application. Every module follows the same core architecture:

``` text
Model
→ Repository
→ Service
→ Controller
→ Routes
```

with:

``` text
Validation
Middleware
Exception Handling
```

applied consistently across the system.

This separation allows eight interns to develop independent modules
while preserving predictable API behavior, security, testability and
maintainability across the shared Node.js/Express/MongoDB backend.
