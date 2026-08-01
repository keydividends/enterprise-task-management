# Document 09 -- Coding Standards

**Project:** Enterprise Task Management System (ETMS)\
**Document Type:** Coding Standards & Engineering Conventions\
**Version:** 1.0\
**Backend:** Node.js + Express + MongoDB/Mongoose\
**Frontend:** React + Vite\
**Team:** 8 Interns + Technical Lead / Reviewer

------------------------------------------------------------------------

# 1. Purpose

This document defines the coding standards that every ETMS developer
must follow.

The goal is not merely to make code compile. The codebase must remain:

-   readable;
-   predictable;
-   secure;
-   testable;
-   maintainable;
-   reviewable;
-   consistent across all eight interns.

A developer opening an unfamiliar module should be able to understand
its structure because all modules follow the same conventions.

------------------------------------------------------------------------

# 2. General Engineering Rules

1.  Use clear names instead of abbreviations.
2.  Keep functions focused on one responsibility.
3.  Avoid duplicated business logic.
4.  Prefer reusable modules over copy/paste.
5.  Never commit secrets.
6.  Do not hardcode environment-specific URLs or credentials.
7.  Remove dead code and unused imports.
8.  Do not leave unexplained commented-out blocks.
9.  Handle errors intentionally.
10. Validate all untrusted input.
11. Keep HTTP, business, and persistence responsibilities separated.
12. Follow Documents 03, 04, 05, 06 and 08 for shared contracts and
    workflow.
13. Run lint/tests/build before requesting review.
14. Do not silently change API/database contracts owned by other
    modules.

------------------------------------------------------------------------

# PART I -- BACKEND CODING STANDARDS

# 3. Backend Architecture

The standard backend dependency flow is:

``` text
Route
  ↓
Middleware / Validation
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Model
  ↓
MongoDB
```

A layer must not casually bypass the layer below it.

Avoid:

``` text
Route → Mongoose Model
Controller → Mongoose Model
Frontend → Database
Repository → HTTP Response
```

------------------------------------------------------------------------

# 4. Backend Folder Structure

Recommended structure:

``` text
backend/
└── src/
    ├── app.js
    ├── server.js
    ├── config/
    ├── errors/
    ├── middleware/
    ├── modules/
    │   ├── auth/
    │   ├── users/
    │   ├── authorization/
    │   ├── projects/
    │   ├── teams/
    │   ├── tasks/
    │   ├── sprints/
    │   ├── comments/
    │   ├── attachments/
    │   ├── notifications/
    │   ├── dashboard/
    │   └── reports/
    ├── shared/
    │   ├── constants/
    │   ├── dto/
    │   ├── mappers/
    │   ├── utils/
    │   └── validators/
    └── routes/
```

Feature-specific code should stay inside its module.

------------------------------------------------------------------------

# 5. Backend Naming Standards

## Files

Use lowercase feature names with descriptive suffixes:

``` text
task.model.js
task.repository.js
task.service.js
task.controller.js
task.routes.js
task.validation.js
task.mapper.js
task.constants.js
```

Avoid:

``` text
TaskControllerNEW.js
taskFunctions.js
helper2.js
commonFinal.js
testFile.js
```

## Variables and Functions

Use `camelCase`:

``` js
const projectId = req.params.projectId;
const activeUsers = [];
const totalTasks = 10;

function calculateTaskProgress() {}
async function getProjectMembers() {}
```

## Classes / Error Types

Use `PascalCase`:

``` js
class AppError extends Error {}
class NotFoundError extends AppError {}
class ForbiddenError extends AppError {}
```

## Constants

Use `UPPER_SNAKE_CASE` for true constants:

``` js
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const ACCESS_TOKEN_TTL = "15m";
```

Enums/constants can be grouped:

``` js
export const TASK_STATUS = Object.freeze({
  BACKLOG: "BACKLOG",
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  IN_REVIEW: "IN_REVIEW",
  QA: "QA",
  DONE: "DONE"
});
```

## Boolean Names

Use names that read as true/false:

``` js
isActive
isDeleted
hasPermission
canEditTask
shouldNotify
```

Avoid:

``` js
activeFlag
check
value1
statusBoolean
```

------------------------------------------------------------------------

# 6. REST Naming

Use resource-oriented URLs:

``` text
GET    /api/v1/tasks
GET    /api/v1/tasks/:taskId
POST   /api/v1/tasks
PUT    /api/v1/tasks/:taskId
DELETE /api/v1/tasks/:taskId
```

Avoid action-heavy routes:

``` text
/getAllTasks
/createNewTask
/updateTaskById
/deleteTaskData
```

Use Document 04 as the authoritative API contract.

------------------------------------------------------------------------

# 7. Controller Standards

Controllers are HTTP adapters.

They may:

-   read validated params/query/body;
-   read authenticated request context;
-   call a service;
-   choose the correct HTTP status;
-   format the API response;
-   forward exceptions.

They should not:

-   contain Mongoose queries;
-   implement complex business rules;
-   calculate authorization manually when middleware/service policy
    exists;
-   contain large mapping logic;
-   swallow errors.

Good:

``` js
export async function createTask(req, res, next) {
  try {
    const task = await taskService.createTask(
      req.body,
      req.context
    );

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task
    });
  } catch (error) {
    next(error);
  }
}
```

Bad:

``` js
export async function createTask(req, res) {
  const project = await Project.findById(req.body.projectId);

  if (!project) {
    return res.status(404).send("No project");
  }

  // 80 more lines of validation, authorization,
  // database writes and notification logic...
}
```

Target: controllers should normally remain small and easy to scan.

------------------------------------------------------------------------

# 8. Controller Function Naming

Prefer:

``` text
createTask
getTask
listTasks
updateTask
deleteTask
assignTask
changeTaskStatus
```

Avoid:

``` text
doTask
taskMethod
handleData
taskAPI
getEverything
```

Names should describe the operation.

------------------------------------------------------------------------

# 9. Service Standards

The service layer owns business behavior.

Examples:

-   user may only be assigned to a project they can access;
-   sprint cannot start if another sprint violates agreed lifecycle
    rules;
-   invalid task transition is rejected;
-   role cannot be deleted when protected;
-   task creation produces required activity/notification side effects.

Good:

``` js
export async function changeTaskStatus(taskId, newStatus, context) {
  const task = await taskRepository.findByIdInWorkspace(
    taskId,
    context.workspaceId
  );

  if (!task) {
    throw new NotFoundError("TASK_NOT_FOUND", "Task not found");
  }

  if (!canTransition(task.status, newStatus)) {
    throw new ConflictError(
      "INVALID_STATE_TRANSITION",
      "Task status transition is not allowed"
    );
  }

  return taskRepository.updateStatus(
    taskId,
    context.workspaceId,
    newStatus,
    context.userId
  );
}
```

------------------------------------------------------------------------

# 10. Service Rules

Services should:

``` text
validate business conditions
coordinate repositories
coordinate transactions
trigger required domain side effects
throw application errors
return business results/DTO-ready data
```

Services should not:

``` text
use res.status()
use res.json()
depend on React
read req.body directly
hardcode environment secrets
```

Prefer:

``` js
createTask(input, context)
```

over:

``` js
createTask(req, res)
```

------------------------------------------------------------------------

# 11. Repository Standards

Repositories isolate database access.

Good:

``` js
export function findByIdInWorkspace(taskId, workspaceId) {
  return Task.findOne({
    _id: taskId,
    workspaceId,
    isDeleted: false
  }).lean();
}
```

Repository methods should communicate intent:

``` text
findByIdInWorkspace
findActiveUsersByTeam
countTasksByStatus
findProjectMembers
softDeleteById
```

Avoid vague names:

``` text
getData
queryDB
findStuff
run
```

Repositories must not return HTTP responses.

------------------------------------------------------------------------

# 12. Model Standards

Models must follow Document 03.

Common conventions:

``` js
const schema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  {
    timestamps: true
  }
);
```

Indexes must be intentional and aligned with actual query patterns.

Do not create multiple conflicting versions of the same entity model.

------------------------------------------------------------------------

# 13. DTO Standards

DTOs define data crossing application boundaries.

They help prevent:

-   leaking database internals;
-   exposing sensitive fields;
-   returning inconsistent shapes;
-   coupling frontend directly to MongoDB documents.

Example response DTO:

``` js
export function toUserResponse(user) {
  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    status: user.status,
    createdAt: user.createdAt
  };
}
```

Never expose:

``` text
passwordHash
refreshTokenHash
passwordResetToken
session token hashes
internal security metadata
```

------------------------------------------------------------------------

# 14. Request DTO / Input Objects

After validation, pass a clean input object to the service.

Example:

``` js
const input = {
  title: req.body.title,
  description: req.body.description,
  projectId: req.body.projectId,
  priority: req.body.priority,
  dueDate: req.body.dueDate
};

const task = await taskService.createTask(input, req.context);
```

Do not pass arbitrary client fields directly into database writes:

``` js
// Avoid
await Task.create(req.body);
```

This can enable mass-assignment vulnerabilities.

------------------------------------------------------------------------

# 15. Validation Standards

All external input is untrusted.

Validate:

``` text
req.params
req.query
req.body
headers when applicable
uploaded file metadata
```

Validation should cover:

-   required fields;
-   types;
-   enum values;
-   string length;
-   email format;
-   object IDs;
-   date formats;
-   pagination limits;
-   allowed sort fields;
-   file size/type.

Example conceptual schema:

``` js
export const createTaskSchema = {
  title: {
    required: true,
    type: "string",
    minLength: 1,
    maxLength: 250
  },
  priority: {
    allowed: ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
  }
};
```

Use one agreed validation library across the backend rather than each
intern selecting a different library.

------------------------------------------------------------------------

# 16. Validation vs Business Rules

Request validation:

``` text
Is title present?
Is email syntactically valid?
Is priority one of allowed values?
Is taskId a valid ObjectId?
```

Service business validation:

``` text
Does project exist?
Does user belong to workspace?
Can this user be assigned to this project?
Can sprint be started?
Is task transition permitted?
```

Do not force database-dependent business rules into simple
request-schema validation.

------------------------------------------------------------------------

# 17. Error Handling Standards

Use centralized application errors.

Example hierarchy:

``` text
AppError
├── BadRequestError
├── UnauthorizedError
├── ForbiddenError
├── NotFoundError
└── ConflictError
```

Example:

``` js
throw new NotFoundError(
  "TASK_NOT_FOUND",
  "Task not found"
);
```

Do not repeatedly construct arbitrary error JSON inside every
service/controller.

------------------------------------------------------------------------

# 18. Standard Error Response

Example:

``` json
{
  "success": false,
  "code": "TASK_NOT_FOUND",
  "message": "Task not found",
  "requestId": "req_123"
}
```

Validation example:

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
  ],
  "requestId": "req_123"
}
```

Follow Document 04 for the final API contract.

------------------------------------------------------------------------

# 19. Error Handling Rules

Never send:

``` js
res.status(500).json({
  error: err.stack
});
```

Never expose raw:

``` text
MongoDB connection strings
stack traces
filesystem paths
JWT secrets
database driver internals
```

Unknown production errors should return a generic response while
detailed diagnostics are recorded securely in server logs.

------------------------------------------------------------------------

# 20. Logging Standards

Use structured, useful logging.

Recommended fields:

``` text
timestamp
level
requestId
method
path
statusCode
durationMs
userId where appropriate
workspaceId where appropriate
errorCode
```

Example conceptual log:

``` json
{
  "level": "info",
  "requestId": "req_123",
  "method": "POST",
  "path": "/api/v1/tasks",
  "statusCode": 201,
  "durationMs": 84
}
```

------------------------------------------------------------------------

# 21. Logging Levels

Use levels consistently:

``` text
error – failures requiring attention
warn  – suspicious/recoverable situations
info  – important normal operational events
debug – development diagnostics
```

Do not use `console.log()` everywhere in production code as the logging
strategy.

A proper logger should be configured centrally.

------------------------------------------------------------------------

# 22. Sensitive Logging Rules

Never log:

``` text
password
passwordHash
access token
refresh token
reset token
OTP
authorization header
database password
private keys
complete sensitive user payloads
```

Good:

``` js
logger.info("Task created", {
  taskId: task.id,
  userId: context.userId,
  requestId: context.requestId
});
```

Bad:

``` js
logger.info("Login request", req.body);
```

because `req.body` may contain a password.

------------------------------------------------------------------------

# 23. Async/Await Standards

Prefer readable `async/await`.

Good:

``` js
const project = await projectRepository.findById(projectId);
const members = await projectMemberRepository.findByProjectId(projectId);
```

For independent operations:

``` js
const [tasks, total] = await Promise.all([
  taskRepository.findAll(filter, options),
  taskRepository.count(filter)
]);
```

Do not serialize independent operations unnecessarily.

------------------------------------------------------------------------

# 24. Database Query Standards

For growing collections:

-   paginate;
-   filter by workspace/project scope;
-   use required indexes;
-   use projections when large documents contain unnecessary fields;
-   use `.lean()` for read-only Mongoose results when appropriate;
-   avoid uncontrolled `populate()` chains;
-   prevent N+1 query patterns.

Avoid:

``` js
Task.find({});
```

for enterprise list endpoints without scope or pagination.

------------------------------------------------------------------------

# 25. Soft Delete Standards

If the entity uses soft delete:

``` js
{
  isDeleted: true,
  deletedAt: new Date(),
  deletedBy: context.userId
}
```

Normal reads should exclude deleted records.

Avoid inconsistent behavior where one repository includes deleted
records by accident.

------------------------------------------------------------------------

# 26. Audit Standards

Security/business-sensitive changes should record audit/activity
information as defined by the architecture.

Examples:

``` text
role changed
user deactivated
project archived
task status changed
sprint started/completed
permission modified
session revoked
```

Audit identity must come from trusted authenticated context, not
client-provided `createdBy`.

------------------------------------------------------------------------

# 27. Backend Comments

Write comments to explain **why**, not obvious syntax.

Good:

``` js
// Keep unfinished tasks when completing the sprint so the caller
// can explicitly choose their destination sprint/backlog.
```

Unnecessary:

``` js
// Find task
const task = await findTask(id);
```

------------------------------------------------------------------------

# 28. Backend Import Standards

Group imports logically:

``` js
import express from "express";
import mongoose from "mongoose";

import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

import * as taskService from "./task.service.js";
```

Remove unused imports before PR review.

------------------------------------------------------------------------

# 29. Backend Function Size

Avoid very large functions.

If a service becomes:

``` text
validate input
load 5 entities
calculate permissions
update records
send notification
write audit
format response
```

split responsibilities into named helpers/services while preserving a
clear transaction/business flow.

Do not split code into tiny functions merely to satisfy a line count.
Optimize for clarity.

------------------------------------------------------------------------

# 30. Backend Security Coding Rules

-   Authenticate protected endpoints.
-   Authorize privileged actions.
-   Enforce workspace/project scope.
-   Never trust IDs merely because they came from a valid
    JWT-authenticated user.
-   Prevent mass assignment.
-   Validate uploads.
-   Apply rate limits to sensitive endpoints.
-   Hash passwords securely.
-   Store secrets outside source control.
-   Never expose password/token hashes.
-   Do not build MongoDB queries directly from unvalidated arbitrary
    client objects.

------------------------------------------------------------------------

# PART II -- FRONTEND CODING STANDARDS

# 31. Frontend Architecture

Recommended dependency direction:

``` text
Page
 ↓
Feature Components
 ↓
Hooks
 ↓
Services
 ↓
API Client
 ↓
Backend
```

Reusable presentation components may be shared across features.

Avoid putting every API call, form, modal, table and business rule
directly inside `App.jsx`.

------------------------------------------------------------------------

# 32. Frontend Folder Structure

``` text
frontend/
└── src/
    ├── app/
    │   ├── App.jsx
    │   ├── router.jsx
    │   └── providers/
    ├── assets/
    ├── components/
    │   ├── common/
    │   ├── feedback/
    │   ├── forms/
    │   ├── layout/
    │   └── tables/
    ├── features/
    │   ├── auth/
    │   ├── users/
    │   ├── roles/
    │   ├── projects/
    │   ├── teams/
    │   ├── tasks/
    │   ├── sprints/
    │   ├── notifications/
    │   └── reports/
    ├── hooks/
    ├── services/
    ├── constants/
    ├── utils/
    └── styles/
```

Feature folders can contain:

``` text
features/tasks/
├── components/
├── hooks/
├── pages/
├── utils/
└── task.constants.js
```

------------------------------------------------------------------------

# 33. React Component Naming

React component files/components use `PascalCase`:

``` text
TaskCard.jsx
TaskForm.jsx
TaskList.jsx
UserAvatar.jsx
ProjectDetailsPage.jsx
```

Component:

``` jsx
function TaskCard() {
  return <div>...</div>;
}

export default TaskCard;
```

Avoid:

``` text
taskcard.jsx
task_component.jsx
newTaskFinal.jsx
Component1.jsx
```

------------------------------------------------------------------------

# 34. Non-Component Naming

Hooks:

``` text
useAuth.js
useTasks.js
useDebounce.js
usePermissions.js
```

Services:

``` text
authService.js
taskService.js
userService.js
projectService.js
```

Utilities:

``` text
dateUtils.js
formatters.js
validationUtils.js
```

Constants:

``` text
task.constants.js
routes.constants.js
permissions.constants.js
```

------------------------------------------------------------------------

# 35. Component Responsibilities

A component should have a clear purpose.

Good decomposition:

``` text
TasksPage
├── TaskFilters
├── TaskTable
│   └── TaskRow
├── Pagination
└── CreateTaskButton
```

Avoid a 1,000-line `TasksPage.jsx` containing:

``` text
API calls
all filters
all forms
all modal markup
table markup
validation
pagination
permissions
formatting helpers
```

------------------------------------------------------------------------

# 36. Page Components

Pages coordinate feature behavior.

Example:

``` jsx
function UsersPage() {
  const {
    users,
    loading,
    error,
    pagination,
    setPage
  } = useUsers();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <UsersTable
      users={users}
      pagination={pagination}
      onPageChange={setPage}
    />
  );
}
```

A page may coordinate hooks/components but should avoid becoming an
unstructured application inside one file.

------------------------------------------------------------------------

# 37. Props Standards

Use descriptive props:

``` jsx
<TaskCard
  task={task}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

Avoid:

``` jsx
<TaskCard
  data={task}
  fn={handleEdit}
  x={handleDelete}
/>
```

For boolean props:

``` jsx
isLoading
isEditable
isSelected
showActions
```

------------------------------------------------------------------------

# 38. Hooks Standards

Custom hooks should:

-   begin with `use`;
-   encapsulate reusable stateful behavior;
-   follow React Hooks rules;
-   expose a clear interface.

Example:

``` js
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

------------------------------------------------------------------------

# 39. Do Not Create Hooks Without Need

Not every function should become a hook.

Use a normal utility for stateless transformation:

``` js
export function formatTaskKey(projectKey, sequence) {
  return `${projectKey}-${sequence}`;
}
```

Use a hook when React state/lifecycle/context behavior is involved.

------------------------------------------------------------------------

# 40. Effect Standards

Use `useEffect` primarily to synchronize with external systems or
subscriptions.

Do not use an effect simply to derive values that can be calculated
during render.

Avoid:

``` jsx
const [fullName, setFullName] = useState("");

useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);
```

Prefer:

``` jsx
const fullName = `${firstName} ${lastName}`;
```

Effects that perform requests should handle cleanup/race concerns where
relevant.

------------------------------------------------------------------------

# 41. Frontend Service Standards

API calls belong in service modules.

Good:

``` js
// taskService.js
import { apiClient } from "./apiClient";

export const getTasks = (params) =>
  apiClient.get("/tasks", { params });

export const getTaskById = (taskId) =>
  apiClient.get(`/tasks/${taskId}`);

export const createTask = (payload) =>
  apiClient.post("/tasks", payload);
```

Avoid repeating Axios calls across page components.

------------------------------------------------------------------------

# 42. Central API Client

Use one configured client:

``` js
import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});
```

Authentication/interceptor behavior should be centralized.

Avoid:

``` js
axios.get("http://localhost:5000/api/v1/tasks")
```

inside individual components.

------------------------------------------------------------------------

# 43. Frontend Error Handling

Services/hooks/pages should cooperate so the UI can show meaningful
states.

Example:

``` jsx
if (loading) {
  return <LoadingSpinner />;
}

if (error) {
  return (
    <ErrorState
      message={error}
      onRetry={loadTasks}
    />
  );
}
```

Do not leave API errors only in the browser console.

------------------------------------------------------------------------

# 44. State Management Categories

State should be categorized before choosing where to store it.

## Local Component State

Examples:

``` text
modal open/closed
form input
selected tab
temporary dropdown state
```

Use:

``` js
useState
```

## Shared Application State

Examples:

``` text
authenticated user
permissions
active workspace
global UI preferences
```

Use an agreed shared-state mechanism such as Context or the
project-selected store.

## Server State

Examples:

``` text
users
tasks
projects
reports
notifications
```

Keep server-fetching/caching logic organized through hooks/services and
the team's chosen server-state approach.

Do not put every API response into one giant global state object.

------------------------------------------------------------------------

# 45. State Ownership Rule

State should live as close as practical to the components that need it.

Bad:

``` text
Global store:
- login form password
- create-task modal visibility
- every table filter
- every page's temporary input
```

Good:

``` text
Global:
authenticated user
permissions
active workspace

Feature/page:
task filters
pagination

Component:
modal open state
form field state
```

------------------------------------------------------------------------

# 46. Avoid Duplicate State

Bad:

``` jsx
const [tasks, setTasks] = useState([]);
const [taskCount, setTaskCount] = useState(0);

useEffect(() => {
  setTaskCount(tasks.length);
}, [tasks]);
```

Prefer:

``` jsx
const [tasks, setTasks] = useState([]);
const taskCount = tasks.length;
```

Store the source of truth, derive what can be derived.

------------------------------------------------------------------------

# 47. Immutable State Updates

Do not mutate React state directly.

Bad:

``` js
tasks.push(newTask);
setTasks(tasks);
```

Good:

``` js
setTasks((currentTasks) => [
  ...currentTasks,
  newTask
]);
```

Object:

``` js
setForm((current) => ({
  ...current,
  title: value
}));
```

------------------------------------------------------------------------

# 48. Form Standards

Controlled example:

``` jsx
const [form, setForm] = useState({
  title: "",
  priority: "MEDIUM"
});

function handleChange(event) {
  const { name, value } = event.target;

  setForm((current) => ({
    ...current,
    [name]: value
  }));
}
```

Form requirements:

-   labels;
-   required indicators where appropriate;
-   client validation;
-   backend validation display;
-   loading/disabled submit state;
-   no duplicate submission;
-   success/error feedback.

------------------------------------------------------------------------

# 49. Event Handler Naming

Use:

``` text
handleSubmit
handleDelete
handleTaskSelect
handleStatusChange
handleModalClose
```

Props passed to children can use:

``` text
onSubmit
onDelete
onSelect
onStatusChange
onClose
```

Example:

``` jsx
<TaskForm onSubmit={handleCreateTask} />
```

------------------------------------------------------------------------

# 50. Conditional Rendering

Prefer readable conditions.

Good:

``` jsx
if (loading) {
  return <LoadingSpinner />;
}

if (error) {
  return <ErrorState message={error} />;
}

if (tasks.length === 0) {
  return <EmptyState />;
}
```

Avoid deeply nested ternaries:

``` jsx
{loading ? (...) : error ? (...) : tasks.length ? (...) : (...)}
```

when they reduce readability.

------------------------------------------------------------------------

# 51. List Rendering

Always use stable keys.

Good:

``` jsx
{tasks.map((task) => (
  <TaskRow
    key={task.id}
    task={task}
  />
))}
```

Avoid array index as key when records can be reordered/inserted/deleted:

``` jsx
key={index}
```

Use the entity identifier.

------------------------------------------------------------------------

# 52. Permission-Aware UI

Example:

``` jsx
{hasPermission("TASK_CREATE") && (
  <button onClick={handleCreate}>
    Create Task
  </button>
)}
```

However:

``` text
Frontend permission check ≠ security boundary
```

The backend must independently enforce authorization.

------------------------------------------------------------------------

# 53. Loading Standards

Every asynchronous data screen must handle loading.

Good:

``` jsx
if (loading) {
  return <LoadingSpinner />;
}
```

Buttons:

``` jsx
<button type="submit" disabled={saving}>
  {saving ? "Saving..." : "Save"}
</button>
```

Do not allow users to submit the same mutation repeatedly while it is
already processing.

------------------------------------------------------------------------

# 54. Empty States

An empty result is not necessarily an error.

Examples:

``` text
No tasks found.
No notifications yet.
No users match these filters.
No sprint has been created.
```

Provide a relevant next action when permissions allow:

``` text
Create Task
Clear Filters
Create Sprint
```

------------------------------------------------------------------------

# 55. Frontend Logging

Avoid leaving:

``` js
console.log(response);
console.log(token);
console.log(user);
```

throughout production code.

Never log authentication tokens/passwords.

Development diagnostics should be removed or routed through an agreed
logging/monitoring strategy.

------------------------------------------------------------------------

# 56. Environment Configuration

Use Vite environment variables:

``` env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Access:

``` js
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
```

Do not hardcode production domains throughout the application.

Do not put private backend secrets in `VITE_*` variables; frontend
environment values are delivered to the client.

------------------------------------------------------------------------

# 57. Reusable Component Standards

Shared components may include:

``` text
Button
Modal
ConfirmModal
LoadingSpinner
ErrorState
EmptyState
Pagination
SearchInput
StatusBadge
UserAvatar
DataTable
FormField
PageHeader
PermissionGate
```

Before creating a new shared component, check whether one already
exists.

Do not create:

``` text
TaskButton
ProjectButton
UserButton
TeamButton
```

when they are identical except text.

------------------------------------------------------------------------

# 58. CSS / Styling Standards

Use the project's agreed styling approach consistently.

For ETMS Bootstrap-oriented development:

-   prefer reusable classes/components;
-   avoid excessive inline styles;
-   do not duplicate large CSS blocks;
-   use semantic class names;
-   keep feature-specific styles near their feature when appropriate.

Avoid:

``` jsx
<div style={{
  marginTop: "17px",
  marginLeft: "11px",
  color: "#123456",
  ...
}}>
```

for large repeated styling patterns.

------------------------------------------------------------------------

# 59. Import Standards

Group imports:

``` jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getTasks } from "../../services/taskService";
import LoadingSpinner from "../../components/feedback/LoadingSpinner";

import "./TasksPage.css";
```

Remove unused imports.

------------------------------------------------------------------------

# 60. Frontend Comments

Comments should explain non-obvious decisions.

Good:

``` js
// Preserve filters when returning from task details so users
// do not lose their working view.
```

Avoid:

``` js
// Button
<button>Save</button>
```

------------------------------------------------------------------------

# 61. Accessibility Standards

-   Every form field needs a label.
-   Buttons must have understandable names.
-   Images need appropriate `alt` text.
-   Interactive behavior must support keyboard use.
-   Error messages should be perceivable.
-   Do not rely only on color for status.
-   Modals must manage focus correctly.
-   Prefer semantic HTML.

Example:

``` jsx
<label htmlFor="task-title">
  Task title
</label>

<input
  id="task-title"
  name="title"
  value={form.title}
  onChange={handleChange}
/>
```

------------------------------------------------------------------------

# 62. Frontend Security Standards

Never:

``` text
store passwords
embed backend secrets
trust hidden buttons as authorization
render unsanitized raw HTML
log access/refresh tokens
construct dangerous HTML from comments
```

Be cautious with:

``` jsx
dangerouslySetInnerHTML
```

It should not be used for arbitrary user-generated content without a
reviewed sanitization strategy.

------------------------------------------------------------------------

# 63. Routing Standards

Keep route definitions centralized.

Example:

``` jsx
<Route path="/tasks" element={<TasksPage />} />
<Route path="/tasks/new" element={<CreateTaskPage />} />
<Route path="/tasks/:taskId" element={<TaskDetailsPage />} />
```

Avoid route declarations scattered unpredictably across feature
components.

Use protected/permission-aware route wrappers where required.

------------------------------------------------------------------------

# 64. Hooks and Service Separation

A useful separation:

``` text
taskService.js
    ↓
raw API operations

useTasks.js
    ↓
loading/error/query lifecycle

TasksPage.jsx
    ↓
page composition

TaskTable.jsx
    ↓
presentation
```

Example:

``` js
export function useTasks(filters) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Request lifecycle implementation...

  return {
    tasks,
    loading,
    error
  };
}
```

------------------------------------------------------------------------

# 65. API Response Handling

Do not make every component guess a different response structure.

If Document 04 returns:

``` json
{
  "success": true,
  "data": [],
  "pagination": {}
}
```

the frontend service/hook layer should consistently interpret that
contract.

Do not write one page expecting:

``` js
response.data.tasks
```

and another expecting:

``` js
response.tasks
```

for the same standardized contract.

------------------------------------------------------------------------

# 66. Pagination Standards

Keep pagination state explicit:

``` js
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(20);
```

When filters materially change:

``` js
setPage(1);
```

Do not fetch thousands of enterprise records merely to paginate them in
the browser.

------------------------------------------------------------------------

# 67. Search Standards

Debounce server-side search where appropriate.

Concept:

``` text
User types
   ↓
Short debounce
   ↓
Update request
   ↓
Server-side filtered results
```

Avoid sending a request for every keystroke when unnecessary.

------------------------------------------------------------------------

# 68. Date Handling

Keep API date formats consistent.

Recommended transport:

``` text
ISO-8601
```

Example:

``` text
2026-08-01T10:30:00.000Z
```

Formatting for display belongs in a utility/component:

``` js
formatDate(task.dueDate)
```

Do not manually implement different date formatting in every page.

------------------------------------------------------------------------

# 69. Shared Constants

Avoid repeated string literals:

``` js
if (task.status === "IN_PROGRESS") {}
```

across dozens of files.

Prefer shared feature constants where useful:

``` js
export const TASK_STATUS = {
  BACKLOG: "BACKLOG",
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  IN_REVIEW: "IN_REVIEW",
  QA: "QA",
  DONE: "DONE"
};
```

Keep frontend values synchronized with the documented API contract.

------------------------------------------------------------------------

# 70. Testing Standards

Backend should test:

``` text
repositories where query behavior matters
services/business rules
controllers/API integration
validation
middleware
authorization
error paths
```

Frontend should test important:

``` text
component behavior
forms
hooks
permission behavior
loading/error states
critical user flows
```

Tests should describe behavior.

Good:

``` text
should reject task creation when project is inaccessible
should display validation error when title is empty
```

Avoid:

``` text
test1
works
component test
```

------------------------------------------------------------------------

# 71. Linting and Formatting

The repository should define one lint/format configuration.

Developers should not use conflicting personal formatting styles.

Before PR:

``` bash
npm run lint
npm test
npm run build
```

Use the commands actually defined in each application's `package.json`.

Formatting-only changes should not be mixed into an unrelated large
feature PR when they make review difficult.

------------------------------------------------------------------------

# 72. Code Review Standards

Reviewers should ask:

``` text
Is this code in the correct layer?
Is naming understandable?
Is logic duplicated?
Is input validated?
Is authorization enforced?
Are errors standardized?
Are sensitive values protected?
Is state stored at the correct level?
Can a shared component/hook/service be reused?
Does this follow the API/database contract?
Can another intern maintain it?
```

------------------------------------------------------------------------

# 73. Anti-Patterns -- Backend

Avoid:

``` js
router.post("/createTask", async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.send(task);
  } catch (e) {
    res.send(e);
  }
});
```

Problems:

``` text
route naming inconsistent
no validation
mass assignment
database access in route
no service
no repository
no authorization
raw errors exposed
response contract inconsistent
```

------------------------------------------------------------------------

# 74. Anti-Patterns -- Frontend

Avoid:

``` jsx
function App() {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);

  // Authentication
  // All API calls
  // All forms
  // All routes
  // All tables
  // All modals
  // Thousands of lines...
}
```

`App.jsx` should not become the entire application.

Use routes, pages, features, components, hooks and services.

------------------------------------------------------------------------

# 75. Example Backend Module Standard

``` text
tasks/
├── task.model.js
├── task.repository.js
├── task.service.js
├── task.controller.js
├── task.routes.js
├── task.validation.js
├── task.mapper.js
└── __tests__/
```

Dependency:

``` text
task.routes
    ↓
task.controller
    ↓
task.service
    ↓
task.repository
    ↓
task.model
```

------------------------------------------------------------------------

# 76. Example Frontend Feature Standard

``` text
features/tasks/
├── pages/
│   ├── TasksPage.jsx
│   ├── TaskDetailsPage.jsx
│   └── CreateTaskPage.jsx
├── components/
│   ├── TaskTable.jsx
│   ├── TaskCard.jsx
│   ├── TaskForm.jsx
│   └── TaskFilters.jsx
├── hooks/
│   ├── useTasks.js
│   └── useTask.js
└── task.constants.js

services/
└── taskService.js
```

------------------------------------------------------------------------

# 77. Eight-Intern Consistency Rules

All interns must use the same:

``` text
folder conventions
API response conventions
error format
validation approach
authentication middleware
authorization approach
logging library/configuration
React routing approach
API client
state-management decisions
lint/format configuration
Git workflow
```

An intern must not introduce a new architectural pattern only inside
their own module without review.

Examples to avoid:

``` text
Intern 1 uses Joi
Intern 2 uses Zod
Intern 3 manually validates
Intern 4 validates in controllers
```

Choose once and standardize.

------------------------------------------------------------------------

# 78. Backend Definition of Done

Backend code is ready when:

-   naming follows standards;
-   route follows Document 04;
-   validation exists;
-   authentication is correct;
-   authorization/scope is correct;
-   controller is thin;
-   business logic is in service;
-   DB logic is in repository;
-   DTO/mapper protects sensitive fields;
-   errors use centralized handling;
-   logs contain no secrets;
-   tests pass;
-   lint passes;
-   no debug code remains;
-   PR review is complete.

------------------------------------------------------------------------

# 79. Frontend Definition of Done

Frontend code is ready when:

-   component/page naming follows standards;
-   folder placement is correct;
-   API calls use services;
-   hooks are used appropriately;
-   state has clear ownership;
-   loading state exists;
-   error state exists;
-   empty state exists where relevant;
-   form validation works;
-   permission UI behavior is correct;
-   no hardcoded API base URL exists;
-   no secrets/tokens are logged;
-   accessibility basics are present;
-   responsive behavior is checked;
-   tests/build/lint pass;
-   PR review is complete.

------------------------------------------------------------------------

# 80. Quick Naming Reference

  Item                   Convention               Example
  ---------------------- ------------------------ --------------------------------
  JS variable            camelCase                `taskCount`
  JS function            camelCase                `createTask`
  React component        PascalCase               `TaskCard`
  Error class            PascalCase               `NotFoundError`
  Constant               UPPER_SNAKE_CASE         `MAX_PAGE_SIZE`
  Hook                   `use` + Pascal concept   `useTasks`
  Backend file           lower feature + suffix   `task.service.js`
  React component file   PascalCase               `TaskForm.jsx`
  Service file           camelCase                `taskService.js`
  Branch                 lowercase kebab-case     `feature/ETMS-205-task-create`
  REST resource          plural lowercase         `/api/v1/tasks`

------------------------------------------------------------------------

# 81. Final Engineering Principle

The ETMS codebase should feel as though it was developed by **one
engineering team**, not eight unrelated developers.

Backend:

``` text
Route
→ Validation/Middleware
→ Controller
→ Service
→ Repository
→ Model
```

Frontend:

``` text
Route/Page
→ Components
→ Hooks
→ Services
→ API Client
```

Cross-cutting rules:

``` text
Clear naming
Consistent validation
Central error handling
Safe logging
Explicit state ownership
Reusable code
Secure defaults
Automated testing
Code review
```

------------------------------------------------------------------------

# 82. Conclusion

These standards establish the minimum engineering conventions for ETMS.

Consistency is part of correctness. A feature is not complete merely
because it works locally. It must also fit the shared architecture, use
agreed naming and contracts, handle validation and failures safely,
protect sensitive data, remain testable, and be understandable to
another developer.

Every intern should use this document during development and again as a
checklist before opening a pull request.
