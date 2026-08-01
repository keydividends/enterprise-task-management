# Document 02 -- Enterprise Project Architecture

**Project:** Enterprise Task Management System (ETMS)\
**Document Type:** Solution / Application Architecture\
**Version:** 1.0\
**Status:** Baseline Architecture\
**Primary Stack:** React + Node.js + Express + MongoDB\
**Audience:** Interns, Developers, Technical Leads, Reviewers, QA,
DevOps

------------------------------------------------------------------------

## 1. Document Purpose

This document defines the enterprise application architecture for the
Enterprise Task Management System (ETMS). It establishes the repository
layout, backend and frontend architecture, module boundaries, MVC
responsibilities, service and DTO patterns, naming standards, dependency
rules, and request lifecycle.

The architecture is intentionally designed so that multiple developers
can work on independent business modules without turning the application
into a collection of tightly coupled files.

The main goals are:

-   Clear separation of responsibilities.
-   Predictable folder and naming conventions.
-   Independent module ownership for eight interns.
-   Reusable infrastructure and shared components.
-   Consistent REST API implementation.
-   Testable business logic.
-   Controlled dependencies between modules.
-   Easy onboarding for new developers.
-   A structure that can grow beyond the internship project.

------------------------------------------------------------------------

# 2. Architecture Principles

ETMS follows these architectural principles.

## 2.1 Separation of Concerns

Each layer should have a clear responsibility.

``` text
React UI
   ↓
Frontend API Service
   ↓
Express Route
   ↓
Middleware
   ↓
Controller
   ↓
Service
   ↓
Repository / Data Access
   ↓
Mongoose Model
   ↓
MongoDB
```

A React page should not know how MongoDB works. A controller should not
contain large database queries. A Mongoose model should not contain
UI-specific behavior.

## 2.2 API-First Development

Before frontend and backend developers integrate, the API contract
should be agreed upon.

The contract defines:

-   HTTP method
-   URL
-   authentication requirement
-   permission requirement
-   request parameters
-   request body
-   response structure
-   error structure
-   status codes

This allows frontend and backend work to proceed independently.

## 2.3 Modular Monolith

The first production architecture will be a **modular monolith**, not
microservices.

The backend runs as one deployable Node.js application, but business
functionality is divided into modules such as:

``` text
authentication
users
roles
projects
teams
tasks
comments
attachments
notifications
reports
```

This is easier for interns to understand and operate while still
teaching strong module boundaries.

## 2.4 Thin Controllers, Strong Services

Controllers handle HTTP concerns. Services contain business logic.

Bad:

``` javascript
const createTask = async (req, res) => {
  // validation
  // permission checks
  // large MongoDB queries
  // notification logic
  // activity logging
  // response formatting
};
```

Preferred:

``` javascript
const createTask = async (req, res, next) => {
  try {
    const result = await taskService.createTask(req.user, req.body);
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};
```

## 2.5 Explicit Dependencies

Modules should depend on public services or well-defined shared
utilities rather than reaching into another module's internal files.

------------------------------------------------------------------------

# 3. Repository Structure

ETMS uses a monorepository containing separate frontend and backend
applications.

``` text
enterprise-task-management/
│
├── backend/
├── frontend/
├── docs/
├── postman/
├── database/
├── scripts/
├── .gitignore
└── README.md
```

## 3.1 Why Separate Backend and Frontend Folders?

The React frontend and Node.js backend are different applications.

Each requires its own:

-   `package.json`
-   dependencies
-   environment variables
-   build process
-   tests
-   linting configuration
-   deployment process

Therefore:

``` text
backend/package.json
frontend/package.json
```

should remain independent.

## 3.2 Root Folder Responsibilities

### `backend/`

Contains the REST API, authentication, authorization, business logic,
MongoDB integration, background services, and server-side tests.

### `frontend/`

Contains the React application, pages, reusable components, routes, API
clients, hooks, forms, and frontend tests.

### `docs/`

Contains project documentation.

Recommended:

``` text
docs/
├── 01-Software-Requirements-Specification.md
├── 02-Enterprise-Project-Architecture.md
├── 03-Database-Design.md
├── 04-REST-API-Specification.md
├── 05-UI-Blueprint.md
├── 06-Backend-Modules.md
├── 07-Intern-Assignments.md
├── 08-Git-Workflow.md
├── 09-Coding-Standards.md
├── 10-Sprint-Plan.md
├── 11-Testing-Guide.md
└── 12-Deployment-Guide.md
```

### `postman/`

Stores shared API collections and environments.

``` text
postman/
├── ETMS.postman_collection.json
├── ETMS-Local.postman_environment.json
└── ETMS-UAT.postman_environment.json
```

### `database/`

Stores schema documentation, seed definitions, index documentation, and
diagrams.

### `scripts/`

Contains operational scripts such as development setup, seeding,
maintenance, or deployment helpers.

------------------------------------------------------------------------

# 4. Backend Architecture

## 4.1 Backend High-Level Structure

``` text
backend/
│
├── src/
│   ├── app.js
│   ├── server.js
│   │
│   ├── config/
│   ├── middleware/
│   ├── modules/
│   ├── shared/
│   └── jobs/
│
├── tests/
├── uploads/
├── .env.example
├── package.json
└── README.md
```

## 4.2 `server.js`

`server.js` is responsible for starting the application.

Typical responsibilities:

-   load environment configuration
-   connect to MongoDB
-   start HTTP server
-   initialize Socket.IO when required
-   handle startup failures
-   handle graceful shutdown

Example:

``` javascript
const app = require("./app");
const connectDatabase = require("./config/database");

const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`ETMS API running on port ${PORT}`);
  });
}

startServer();
```

## 4.3 `app.js`

`app.js` configures Express.

Responsibilities:

-   create Express application
-   configure CORS
-   parse JSON
-   register routes
-   register request logging
-   register 404 handler
-   register global error middleware

It should not establish the database connection or call `listen()`.

This separation makes the application easier to test.

------------------------------------------------------------------------

# 5. Backend Module Structure

Each major business capability should have its own module.

``` text
backend/src/modules/
│
├── auth/
├── users/
├── roles/
├── workspaces/
├── projects/
├── teams/
├── sprints/
├── tasks/
├── comments/
├── attachments/
├── notifications/
├── dashboards/
└── reports/
```

A typical module:

``` text
tasks/
├── task.model.js
├── task.repository.js
├── task.service.js
├── task.controller.js
├── task.routes.js
├── task.validation.js
├── task.dto.js
├── task.constants.js
└── task.mapper.js
```

Not every small module must contain every file. Files should exist when
the responsibility is needed.

------------------------------------------------------------------------

# 6. MVC Pattern

Traditional MVC means:

``` text
Model
View
Controller
```

In ETMS, React is the View and the Express backend exposes REST APIs.

The practical interpretation becomes:

``` text
React View
    ↓
REST Controller
    ↓
Service
    ↓
Repository
    ↓
Mongoose Model
```

## 6.1 Model

A model defines how application data is represented and persisted.

Example:

``` javascript
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"],
      default: "TODO"
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM"
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },

    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Task", taskSchema);
```

## 6.2 View

React is responsible for presentation and interaction.

Examples:

``` text
TaskListPage
TaskDetailsPage
CreateTaskPage
EditTaskPage
KanbanBoardPage
```

The View should not contain backend business rules.

## 6.3 Controller

A controller translates HTTP requests into service calls.

Example:

``` javascript
const taskService = require("./task.service");

exports.createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask({
      currentUser: req.user,
      payload: req.body
    });

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};
```

Controller responsibilities:

-   read request data
-   call appropriate service
-   choose HTTP status
-   return response
-   forward exceptions

Controllers should not contain large business workflows.

------------------------------------------------------------------------

# 7. Service Layer

The service layer is the heart of backend business logic.

Examples:

``` text
Can this user create a task?
Does the project exist?
Is the assignee a project member?
Should a notification be generated?
Should an activity log be created?
```

These are service responsibilities.

## 7.1 Example Task Service

``` javascript
const taskRepository = require("./task.repository");
const projectService = require("../projects/project.service");
const notificationService = require("../notifications/notification.service");

exports.createTask = async ({ currentUser, payload }) => {
  const project = await projectService.getProjectById(payload.projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  const task = await taskRepository.create({
    ...payload,
    reporterId: currentUser.userId
  });

  if (task.assigneeId) {
    await notificationService.createTaskAssignedNotification(task);
  }

  return task;
};
```

## 7.2 Benefits

The service layer:

-   centralizes business rules
-   prevents controller duplication
-   improves unit testing
-   supports reuse
-   makes authorization decisions easier to maintain
-   provides stable module interfaces

------------------------------------------------------------------------

# 8. Repository / Data Access Layer

For larger modules, database operations should be isolated.

``` javascript
const Task = require("./task.model");

exports.create = (data) => Task.create(data);

exports.findById = (id) =>
  Task.findById(id)
    .populate("assigneeId", "firstName lastName email");

exports.findByProject = (projectId, query) =>
  Task.find({
    projectId,
    isDeleted: false,
    ...query
  });
```

The repository should focus on persistence, not business decisions.

Bad repository logic:

``` text
"If user is MANAGER then allow task update."
```

That belongs in authorization/service logic.

------------------------------------------------------------------------

# 9. DTO Pattern

DTO means **Data Transfer Object**.

DTOs define what data crosses boundaries.

Do not automatically expose complete MongoDB documents.

For example, a User document may contain:

``` text
password
passwordResetToken
loginAttempts
internal flags
audit metadata
```

The frontend should not receive these values.

## 9.1 User Response DTO

``` javascript
const toUserResponse = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  status: user.status
});

module.exports = {
  toUserResponse
};
```

## 9.2 Task Create DTO

Incoming request:

``` json
{
  "title": "Create login page",
  "description": "Implement React login screen",
  "projectId": "PROJECT_ID",
  "assigneeId": "USER_ID",
  "priority": "HIGH"
}
```

The backend should not trust fields such as:

``` json
{
  "reporterId": "SOME_OTHER_USER",
  "createdBy": "ADMIN",
  "isDeleted": false
}
```

Server-controlled values should be generated from trusted backend
context.

## 9.3 DTO Categories

ETMS may use:

``` text
Create DTO
Update DTO
Query DTO
Response DTO
Summary DTO
```

Example:

``` text
CreateTaskDTO
UpdateTaskDTO
TaskResponseDTO
TaskSummaryDTO
```

------------------------------------------------------------------------

# 10. Validation Layer

Request validation should occur before business logic.

Example rules for creating a task:

``` text
title       → required
projectId   → required ObjectId
priority    → allowed enum
status      → allowed enum
dueDate     → valid date
storyPoints → non-negative number
```

The validation layer protects services from malformed requests.

------------------------------------------------------------------------

# 11. Middleware Architecture

Global middleware:

``` text
CORS
JSON parser
Request logging
Security headers
Rate limiting
Error handling
```

Route-level middleware:

``` text
Authentication
Authorization
Validation
File upload
```

Example:

``` javascript
router.post(
  "/",
  authenticate,
  authorize("TASK_CREATE"),
  validate(createTaskSchema),
  taskController.createTask
);
```

The order is important:

``` text
Request
 ↓
Authenticate
 ↓
Authorize
 ↓
Validate
 ↓
Controller
```

------------------------------------------------------------------------

# 12. Authentication Architecture

JWT authentication flow:

``` text
React Login
    ↓
POST /api/v1/auth/login
    ↓
Validate Credentials
    ↓
Generate JWT
    ↓
Return Token + User
    ↓
Frontend Auth State
    ↓
Authorization Header
    ↓
Protected API
```

Backend middleware extracts the authenticated user identity and makes it
available to later layers.

Example:

``` javascript
req.user = {
  userId: decoded.userId,
  role: decoded.role
};
```

------------------------------------------------------------------------

# 13. Authorization Architecture

Authentication answers:

> Who is the user?

Authorization answers:

> What may the user do?

ETMS should use permissions for important actions.

Examples:

``` text
USER_CREATE
USER_UPDATE
PROJECT_CREATE
PROJECT_UPDATE
TASK_CREATE
TASK_ASSIGN
TASK_DELETE
REPORT_VIEW
```

Backend authorization remains the source of truth.

Frontend permission checks are used for user experience only.

------------------------------------------------------------------------

# 14. Frontend Architecture

Recommended structure:

``` text
frontend/
│
├── src/
│   ├── app/
│   ├── assets/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── constants/
│   ├── context/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
│
├── public/
├── .env.example
├── package.json
└── README.md
```

------------------------------------------------------------------------

# 15. Feature-Based Frontend Organization

For a growing application, organize business code by feature.

``` text
src/features/
│
├── auth/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── validation/
│
├── users/
├── projects/
├── teams/
├── tasks/
├── comments/
├── notifications/
└── reports/
```

Example task feature:

``` text
tasks/
├── components/
│   ├── TaskCard.jsx
│   ├── TaskForm.jsx
│   ├── TaskFilters.jsx
│   └── TaskStatusBadge.jsx
│
├── pages/
│   ├── TaskListPage.jsx
│   ├── TaskDetailsPage.jsx
│   ├── CreateTaskPage.jsx
│   └── EditTaskPage.jsx
│
├── services/
│   └── taskService.js
│
├── hooks/
│   └── useTasks.js
│
└── utils/
    └── taskUtils.js
```

This gives each intern a clearly defined working area.

------------------------------------------------------------------------

# 16. Frontend Component Categories

## 16.1 Pages

Pages correspond to routes.

Examples:

``` text
LoginPage
DashboardPage
ProjectListPage
TaskDetailsPage
UserListPage
```

## 16.2 Feature Components

Business-specific reusable components.

Examples:

``` text
TaskCard
ProjectCard
UserPicker
SprintProgress
```

## 16.3 Shared Components

Generic reusable UI.

Examples:

``` text
Button
Modal
Pagination
Loader
EmptyState
ConfirmDialog
FormError
```

Shared components must not contain module-specific business logic.

------------------------------------------------------------------------

# 17. Frontend Service Layer

React components should not repeatedly define raw API URLs.

Bad:

``` javascript
axios.get("http://localhost:3000/api/v1/tasks");
```

Preferred:

``` javascript
taskService.getTasks(filters);
```

Example:

``` javascript
import apiClient from "../../../services/apiClient";

export const getTasks = (params) =>
  apiClient.get("/tasks", { params });

export const createTask = (payload) =>
  apiClient.post("/tasks", payload);

export const updateTask = (id, payload) =>
  apiClient.put(`/tasks/${id}`, payload);

export const deleteTask = (id) =>
  apiClient.delete(`/tasks/${id}`);
```

------------------------------------------------------------------------

# 18. Axios API Client

A shared API client handles cross-cutting HTTP concerns.

``` javascript
import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;
```

A response interceptor may centralize handling of expired sessions and
standardized API errors.

------------------------------------------------------------------------

# 19. Frontend Routing Architecture

Recommended route groups:

``` text
Public Routes
Protected Routes
Role/Permission Restricted Routes
Not Found Route
```

Example:

``` text
/login                         Public
/forgot-password               Public

/dashboard                     Protected
/projects                      Protected
/projects/:projectId/tasks     Protected

/admin/users                   Protected + Permission
/admin/roles                   Protected + Permission
```

`ProtectedRoute` verifies authentication.

`PermissionRoute` can check required permissions for UX, while the
backend still enforces actual security.

------------------------------------------------------------------------

# 20. Frontend State Boundaries

State should be placed at the lowest sensible level.

### Local Component State

Use for:

``` text
form fields
modal visibility
selected tab
local filter
```

### Shared Authentication State

Use for:

``` text
logged-in user
authentication status
permissions
logout
```

### Server Data

Task lists, users, projects, and reports originate from backend APIs and
should be treated as server state.

Avoid storing every piece of application data in a global context.

------------------------------------------------------------------------

# 21. Backend Folder Structure -- Detailed

``` text
backend/src/
│
├── config/
│   ├── database.js
│   ├── environment.js
│   └── logger.js
│
├── middleware/
│   ├── authenticate.js
│   ├── authorize.js
│   ├── validate.js
│   ├── notFound.js
│   └── errorHandler.js
│
├── modules/
│   ├── auth/
│   ├── users/
│   ├── roles/
│   ├── workspaces/
│   ├── projects/
│   ├── teams/
│   ├── sprints/
│   ├── tasks/
│   ├── comments/
│   ├── attachments/
│   ├── notifications/
│   ├── dashboards/
│   └── reports/
│
├── shared/
│   ├── constants/
│   ├── errors/
│   ├── utils/
│   └── validators/
│
├── jobs/
├── app.js
└── server.js
```

------------------------------------------------------------------------

# 22. Frontend Folder Structure -- Detailed

``` text
frontend/src/
│
├── assets/
│
├── components/
│   ├── common/
│   └── forms/
│
├── features/
│   ├── auth/
│   ├── users/
│   ├── roles/
│   ├── projects/
│   ├── teams/
│   ├── sprints/
│   ├── tasks/
│   ├── comments/
│   ├── notifications/
│   └── reports/
│
├── layouts/
│   ├── AuthLayout.jsx
│   └── MainLayout.jsx
│
├── routes/
│   ├── AppRoutes.jsx
│   ├── ProtectedRoute.jsx
│   └── PermissionRoute.jsx
│
├── services/
│   └── apiClient.js
│
├── hooks/
├── context/
├── constants/
├── utils/
├── styles/
├── App.jsx
└── main.jsx
```

------------------------------------------------------------------------

# 23. Naming Conventions

Consistency is mandatory when eight interns contribute to one codebase.

## 23.1 Backend Files

Use lowercase feature names with descriptive suffixes.

``` text
task.model.js
task.repository.js
task.service.js
task.controller.js
task.routes.js
task.validation.js
task.dto.js
```

## 23.2 React Components

Use PascalCase:

``` text
TaskCard.jsx
TaskForm.jsx
UserTable.jsx
ProjectDashboard.jsx
```

## 23.3 JavaScript Variables and Functions

Use camelCase:

``` javascript
const currentUser = {};
const taskList = [];

function getTaskById() {}
function createProject() {}
```

## 23.4 Constants

Use uppercase snake case:

``` javascript
const DEFAULT_PAGE_SIZE = 20;
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
```

## 23.5 Boolean Variables

Prefer names that read like conditions:

``` text
isLoading
isAuthenticated
hasPermission
canDeleteTask
isArchived
```

Avoid:

``` text
flag
check
value1
temp
data2
```

## 23.6 API Paths

Use plural nouns and consistent REST conventions.

Preferred:

``` text
GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/:projectId
PUT    /api/v1/projects/:projectId
DELETE /api/v1/projects/:projectId
```

Avoid:

``` text
/getAllProjects
/createProject
/deleteProjectById
```

------------------------------------------------------------------------

# 24. Database Naming Conventions

MongoDB collection names should be plural and predictable.

Examples:

``` text
users
roles
permissions
projects
projectmembers
teams
tasks
comments
attachments
notifications
activitylogs
```

Field names use camelCase.

``` json
{
  "firstName": "Ravi",
  "lastName": "Kumar",
  "createdAt": "...",
  "updatedAt": "..."
}
```

Reference fields should clearly identify their target.

``` text
projectId
workspaceId
assigneeId
reporterId
createdBy
```

------------------------------------------------------------------------

# 25. Standard API Response Design

Success response:

``` json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "..."
  }
}
```

List response:

``` json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 125,
    "totalPages": 7
  }
}
```

Error response:

``` json
{
  "success": false,
  "code": "TASK_NOT_FOUND",
  "message": "Task not found",
  "errors": []
}
```

Consistent responses make frontend integration significantly easier.

------------------------------------------------------------------------

# 26. Dependency Flow

The allowed backend dependency direction is:

``` text
Routes
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Model
```

Shared infrastructure can be consumed where appropriate.

## 26.1 Forbidden Dependency Examples

A model should not import a controller.

``` text
Model → Controller   ❌
```

A repository should not call an Express response object.

``` text
Repository → res.json()   ❌
```

A service should not depend on React.

``` text
Backend Service → React   ❌
```

## 26.2 Cross-Module Dependencies

If task creation needs project information:

Preferred:

``` text
Task Service
   ↓
Project Service / defined project query interface
```

Avoid reaching directly into another module's controller.

``` text
Task Service → Project Controller   ❌
```

------------------------------------------------------------------------

# 27. Request Lifecycle -- Login

``` text
1. User submits Login form
2. React LoginPage validates basic input
3. authService calls POST /api/v1/auth/login
4. Express receives request
5. Validation middleware validates body
6. Auth controller receives validated request
7. Auth service finds user
8. bcrypt compares password
9. JWT is generated
10. User response DTO is created
11. Controller returns response
12. Frontend stores authentication state
13. React redirects to Dashboard
```

------------------------------------------------------------------------

# 28. Request Lifecycle -- Get Tasks

``` text
React TaskListPage
        ↓
taskService.getTasks()
        ↓
Axios apiClient
        ↓
Authorization: Bearer <token>
        ↓
Express Router
        ↓
authenticate middleware
        ↓
authorize middleware
        ↓
query validation
        ↓
taskController.getTasks()
        ↓
taskService.getTasks()
        ↓
taskRepository.find()
        ↓
MongoDB
        ↓
Task DTO / Mapper
        ↓
Controller Response
        ↓
Axios
        ↓
React State
        ↓
Task List UI
```

------------------------------------------------------------------------

# 29. Request Lifecycle -- Create Task

Example request:

``` http
POST /api/v1/tasks
Authorization: Bearer <JWT>
Content-Type: application/json
```

Payload:

``` json
{
  "title": "Implement project dashboard",
  "projectId": "PROJECT_ID",
  "assigneeId": "USER_ID",
  "priority": "HIGH",
  "dueDate": "2026-08-10"
}
```

Lifecycle:

``` text
1. Authenticate JWT
2. Check TASK_CREATE permission
3. Validate request DTO
4. Controller calls task service
5. Service verifies project
6. Service verifies assignee eligibility
7. Repository creates task
8. Activity log is generated
9. Notification may be generated
10. Response DTO is returned
11. Frontend updates task UI
```

------------------------------------------------------------------------

# 30. Request Lifecycle -- Error

Example:

``` text
GET /api/v1/tasks/invalid-id
```

Expected flow:

``` text
Route
 ↓
Validation
 ↓
Error Created
 ↓
Global Error Handler
 ↓
Standard Error Response
```

The application should avoid different error formats from different
controllers.

------------------------------------------------------------------------

# 31. Global Error Architecture

Recommended application error structure:

``` javascript
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}
```

Examples:

``` text
AUTH_INVALID_CREDENTIALS
AUTH_TOKEN_EXPIRED
USER_NOT_FOUND
PROJECT_NOT_FOUND
TASK_NOT_FOUND
PERMISSION_DENIED
VALIDATION_ERROR
```

Global error middleware converts internal errors into consistent HTTP
responses.

------------------------------------------------------------------------

# 32. Logging Architecture

Production systems require structured logs.

Log important events such as:

``` text
application startup
database connection
authentication failures
unexpected exceptions
background job failures
external service failures
```

Do not log:

``` text
passwords
JWT secrets
complete authorization tokens
password reset secrets
sensitive personal data unnecessarily
```

Business activity history is different from technical logging.

Example business activities:

``` text
Task created
Task assigned
Task moved to DONE
Project archived
Member removed
```

These may be stored in an `activityLogs` collection.

------------------------------------------------------------------------

# 33. Configuration Architecture

Environment-specific values must not be hardcoded.

Backend `.env` example:

``` text
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/etms
JWT_SECRET=replace_me
JWT_EXPIRES_IN=1h
FRONTEND_URL=http://localhost:5173
```

Frontend:

``` text
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

Commit `.env.example`, not real secrets.

------------------------------------------------------------------------

# 34. Shared Code Rules

Use `shared/` only for genuinely reusable code.

Good:

``` text
date utility
pagination utility
common error class
ObjectId validator
shared constants
```

Bad:

``` text
task business logic
project-specific validation
user-specific mapper
```

If code belongs to one feature, keep it inside that feature.

------------------------------------------------------------------------

# 35. Module Ownership for Eight Interns

The architecture supports parallel development.

  ------------------------------------------------------------------------
  Intern                  Primary Module          Typical Owned Paths
  ----------------------- ----------------------- ------------------------
  1                       Authentication          `modules/auth`,
                                                  `features/auth`

  2                       Users                   `modules/users`,
                                                  `features/users`

  3                       Roles & Permissions     `modules/roles`, role UI

  4                       Projects                `modules/projects`,
                                                  project UI

  5                       Teams & Sprints         team/sprint backend and
                                                  UI

  6                       Tasks                   `modules/tasks`, task UI

  7                       Comments & Attachments  collaboration modules

  8                       Dashboard,              reporting/notification
                          Notifications & Reports modules
  ------------------------------------------------------------------------

Shared files require coordination and code review.

Examples:

``` text
app.js
AppRoutes.jsx
apiClient.js
authenticate.js
common constants
```

Interns should avoid casually modifying shared infrastructure for a
feature-specific requirement.

------------------------------------------------------------------------

# 36. Integration Contract Between Interns

Before implementation, each module owner should document:

``` text
Endpoint
Method
Request
Response
Permissions
Error codes
Dependencies
```

Example contract:

``` text
GET /api/v1/projects/:projectId/members
```

Task module can use this contract without knowing the internal
implementation of the project module.

This reduces blocking between interns.

------------------------------------------------------------------------

# 37. Recommended Module Development Sequence

For each module:

``` text
1. Requirement
2. Data Model
3. API Contract
4. Validation
5. Repository
6. Service
7. Controller
8. Routes
9. Postman Testing
10. Frontend Service
11. React Page
12. Components
13. Integration Testing
14. Pull Request
15. Code Review
```

This sequence should be followed consistently.

------------------------------------------------------------------------

# 38. Code Review Architecture Checklist

Reviewers should verify:

### Backend

-   Controller is thin.
-   Business logic is in service.
-   Database operations are isolated appropriately.
-   Validation exists.
-   Authentication/authorization is enforced.
-   Sensitive fields are not exposed.
-   Error responses follow standards.
-   Pagination is used for potentially large lists.
-   No hardcoded secrets.

### Frontend

-   API calls are in services.
-   Components are reasonably reusable.
-   Protected routes are enforced.
-   Loading/error/empty states exist.
-   Forms validate input.
-   Permission-based UI is consistent.
-   No duplicated API base URLs.
-   Components are not unnecessarily large.

------------------------------------------------------------------------

# 39. Architectural Anti-Patterns to Avoid

## 39.1 Giant `app.js`

Do not place every API inside:

``` text
app.js
```

Routes belong in modules.

## 39.2 Giant `App.jsx`

Do not render the entire application from one component.

Use routing, layouts, pages, and feature components.

## 39.3 Direct MongoDB Logic in Routes

Avoid:

``` javascript
router.get("/tasks", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});
```

Use route → controller → service/repository.

## 39.4 Copy/Paste Authorization

Do not repeat role checks in every controller.

Centralize authorization middleware and business authorization rules.

## 39.5 Returning Password Fields

Never expose password hashes.

## 39.6 Hardcoded API URLs

Avoid URLs scattered throughout React components.

## 39.7 Feature Branches Editing Everything

Each intern should own a bounded module. Shared architectural changes
should be reviewed before implementation.

------------------------------------------------------------------------

# 40. Scalability Considerations

The initial modular monolith can later evolve.

Potential future extraction:

``` text
Notification Service
File Service
Reporting Service
Authentication Service
```

Do not prematurely create microservices.

First ensure:

-   clear module boundaries
-   stable API contracts
-   independent services
-   good logging
-   configuration separation
-   stateless authentication

A well-designed modular monolith makes later extraction easier.

------------------------------------------------------------------------

# 41. Security Architecture Summary

Security must exist across layers.

``` text
Frontend
  ↓
Route Protection (UX)
  ↓
HTTPS
  ↓
Authentication Middleware
  ↓
Authorization Middleware
  ↓
Validation
  ↓
Business Rules
  ↓
Database
```

Important rule:

> Frontend authorization is never a substitute for backend
> authorization.

------------------------------------------------------------------------

# 42. Testing Architecture

Tests should follow architectural boundaries.

## Backend

``` text
Unit Tests
  → Services
  → Utilities

Integration Tests
  → Routes
  → Middleware
  → Database interaction
```

## Frontend

``` text
Component Tests
Page Tests
Service Tests
Critical User Flow Tests
```

High-risk flows:

``` text
Login
Create Project
Create Task
Assign Task
Change Task Status
Authorization
File Upload
Logout
```

------------------------------------------------------------------------

# 43. Development Environment

Recommended local setup:

``` text
Frontend: http://localhost:5173
Backend:  http://localhost:3000
API:      http://localhost:3000/api/v1
MongoDB:  localhost:27017
```

Example repository commands:

``` text
enterprise-task-management/
  backend/
    npm install
    npm run dev

  frontend/
    npm install
    npm run dev
```

The frontend and backend run independently.

------------------------------------------------------------------------

# 44. Architecture Decision Summary

  Area               Decision
  ------------------ -----------------------------------
  Repository         Monorepository
  Frontend           React
  Backend            Node.js + Express
  Database           MongoDB + Mongoose
  Architecture       Modular Monolith
  Backend Pattern    Controller + Service + Repository
  Frontend Pattern   Feature-based
  API Style          REST
  Authentication     JWT
  Authorization      Role/Permission Based
  Validation         Centralized request validation
  Errors             Global standardized handling
  Configuration      Environment variables
  Integration        API-first contracts

------------------------------------------------------------------------

# 45. Definition of Architectural Compliance

A feature is architecture-compliant when:

-   It exists inside the correct module.
-   Its API contract is documented.
-   Routes contain no substantial business logic.
-   Controllers remain thin.
-   Services own business decisions.
-   Database access is controlled.
-   DTOs prevent accidental data exposure.
-   Validation occurs before service execution.
-   Authentication and authorization are enforced.
-   Frontend API calls use services.
-   React routes use appropriate protection.
-   Naming conventions are followed.
-   Errors follow the standard response model.
-   Tests cover important business behavior.
-   No secrets are committed.
-   Module ownership boundaries are respected.

------------------------------------------------------------------------

# 46. Example End-to-End Feature

Consider **Create Task**.

## Frontend

``` text
CreateTaskPage.jsx
    ↓
TaskForm.jsx
    ↓
taskService.createTask()
    ↓
apiClient.post()
```

## Backend

``` text
POST /api/v1/tasks
    ↓
authenticate
    ↓
authorize(TASK_CREATE)
    ↓
validate(CreateTaskDTO)
    ↓
taskController.createTask
    ↓
taskService.createTask
    ↓
taskRepository.create
    ↓
Task Model
    ↓
MongoDB
```

## Secondary Actions

After creation:

``` text
Activity Log
Notification
Response DTO
Frontend Success Message
Navigation / UI Refresh
```

This illustrates the complete architectural approach expected across the
project.

------------------------------------------------------------------------

# 47. Architecture Governance for Intern Team

Because eight interns are developing simultaneously, architecture must
be actively governed.

The technical lead should review:

-   new cross-module dependencies
-   changes to shared middleware
-   new common utilities
-   changes to standard API responses
-   changes to authentication
-   database relationship changes
-   new dependencies/packages
-   modifications to root routing
-   modifications to environment configuration

Feature-specific implementation can remain with the module owner.

------------------------------------------------------------------------

# 48. Pull Request Expectations

Every feature pull request should include:

``` text
Requirement reference
Module name
API changes
Database changes
Screens/pages changed
Postman evidence
Testing performed
Screenshots when UI changed
Known limitations
```

Large architectural changes should not be mixed with unrelated feature
work.

------------------------------------------------------------------------

# 49. Architecture Roadmap

## Initial Stage

``` text
React
  ↓
Express Modular Monolith
  ↓
MongoDB
```

## Growth Stage

Potential additions:

``` text
Redis
Background Job Queue
Object Storage
WebSocket Gateway
Centralized Logging
Monitoring
CI/CD
```

## Advanced Stage

Only when justified by scale:

``` text
API Gateway
Independent Services
Event Bus
Distributed Cache
Container Orchestration
```

Architecture should evolve based on measurable requirements rather than
complexity for its own sake.

------------------------------------------------------------------------

# 50. Final Architecture Rules for Interns

Every intern should remember these rules:

1.  Do not put everything in `App.jsx`.
2.  Do not put every backend endpoint in `app.js`.
3.  Routes define endpoints.
4.  Middleware handles cross-cutting request checks.
5.  Controllers handle HTTP.
6.  Services handle business logic.
7.  Repositories handle persistence.
8.  Models define database entities.
9.  DTOs control transferred data.
10. React pages represent routes.
11. React components should remain focused.
12. API calls belong in frontend services.
13. Backend security is mandatory even when UI elements are hidden.
14. Use environment variables for environment-specific configuration.
15. Follow module boundaries.
16. Follow naming conventions.
17. Test your module before requesting integration.
18. Document API contracts before another intern depends on them.
19. Shared infrastructure changes require review.
20. Keep the architecture understandable.

------------------------------------------------------------------------

# 51. Conclusion

The ETMS architecture is designed to give the internship team a
realistic enterprise development experience without introducing
unnecessary distributed-system complexity.

The combination of:

``` text
Monorepository
+
Separate Frontend/Backend Applications
+
Modular Monolith
+
Service Layer
+
Repository Layer
+
DTO Pattern
+
Feature-Based React Structure
+
API-First Integration
```

provides a strong foundation for parallel development, code review,
testing, deployment, and future growth.

This architecture is the baseline for subsequent ETMS documentation,
including database design, API specifications, module ownership, UI
design, testing, and deployment.

------------------------------------------------------------------------

## Appendix A -- Quick Backend Template

``` text
module/
├── module.model.js
├── module.repository.js
├── module.service.js
├── module.controller.js
├── module.routes.js
├── module.validation.js
├── module.dto.js
└── module.mapper.js
```

## Appendix B -- Quick Frontend Feature Template

``` text
feature/
├── components/
├── pages/
├── services/
├── hooks/
├── validation/
└── utils/
```

## Appendix C -- Standard Request Path

``` text
React Page
 ↓
Feature Component
 ↓
Frontend Service
 ↓
Axios Client
 ↓
Route
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
Model
 ↓
MongoDB
```

## Appendix D -- Standard Response Path

``` text
MongoDB
 ↓
Model
 ↓
Repository
 ↓
Service
 ↓
DTO / Mapper
 ↓
Controller
 ↓
Standard API Response
 ↓
Axios
 ↓
React
 ↓
UI
```
