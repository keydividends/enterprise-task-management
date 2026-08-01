# Document 10 -- Weekly Sprint Plan

**Project:** Enterprise Task Management System (ETMS)\
**Document Type:** Implementation Sprint Plan\
**Version:** 1.0\
**Sprint Duration:** 8 Working Days\
**Team:** 8 Interns + Technical Lead / Reviewer\
**Repository:** Single repository with `frontend/` and `backend/`\
**Working Branch:** `develop` with ticket-based feature branches

------------------------------------------------------------------------

# 1. Purpose

This document converts the ETMS architecture and module ownership into
an 8-day implementation sprint.

Every day contains:

-   Learning Objectives
-   Features
-   Deliverables
-   Review Checklist
-   Integration Tasks

The sprint concludes with a formal **Demo Day**.

This is an implementation sprint, not a basic MERN training schedule.
Interns are expected to apply the architecture, API, UI, Git, and coding
standards already defined in Documents 01--09.

------------------------------------------------------------------------

# 2. Sprint Goal

By the end of Day 8, the team should have an integrated vertical slice
of the Enterprise Task Management System containing:

``` text
Authentication
Users
Roles & Permissions
Projects
Teams
Tasks
Sprints
Comments / Attachments
Dashboard
Notifications
Basic Reports
```

The target is not to finish every enterprise feature in one sprint. The
target is to establish production-quality module foundations and prove
that independently developed modules can integrate correctly.

------------------------------------------------------------------------

# 3. Team Ownership

  Intern     Primary Module
  ---------- ----------------------------------------------
  Intern 1   Authentication & Sessions
  Intern 2   Users & Profile
  Intern 3   Roles, Permissions & Authorization
  Intern 4   Projects, Project Members & Epics
  Intern 5   Teams, Sprints & Backlog
  Intern 6   Tasks, Assignments, Labels & Checklists
  Intern 7   Comments, Attachments & Time Tracking
  Intern 8   Dashboard, Notifications, Reports & Activity

Every intern owns both backend and frontend work for their assigned
feature unless the technical lead assigns a different split.

------------------------------------------------------------------------

# 4. Daily Working Rhythm

Recommended daily rhythm:

``` text
09:30 – 10:00   Daily stand-up
10:00 – 11:00   Learning / architecture explanation
11:00 – 13:00   Development block 1
13:00 – 14:00   Break
14:00 – 16:30   Development block 2
16:30 – 17:00   Integration / testing
17:00 – 17:30   Code review / status update
```

Daily stand-up questions:

``` text
1. What did I complete?
2. What will I complete today?
3. What is blocking me?
4. Did I change any shared contract?
5. Do I need another intern's API/module?
```

------------------------------------------------------------------------

# 5. Day 1 -- Sprint Kickoff & Project Foundation

## Learning Objectives

By the end of Day 1, interns should understand:

-   repository architecture;
-   frontend/backend separation;
-   Git branch workflow;
-   module ownership;
-   layered backend architecture;
-   React feature architecture;
-   environment configuration;
-   API versioning;
-   common response/error contracts;
-   integration responsibilities.

Core architecture:

``` text
Frontend:
Page → Component → Hook → Service → API Client

Backend:
Route → Middleware → Controller → Service → Repository → Model
```

## Features

Team foundation work:

``` text
Repository setup
Backend application bootstrap
Frontend application bootstrap
MongoDB connection
Environment configuration
Common API client
Global backend error handler
Authentication middleware skeleton
React router
Application layout
Protected route skeleton
Common loading/error components
```

## Intern Assignments

### Intern 1 -- Authentication

Create:

``` text
backend/src/modules/auth/
frontend/src/features/auth/
```

Prepare:

``` text
login request/response DTO
auth service skeleton
auth controller skeleton
login page skeleton
```

### Intern 2 -- Users

Create:

``` text
backend/src/modules/users/
frontend/src/features/users/
```

Prepare:

``` text
User model baseline
user repository
user service skeleton
UsersPage
UserForm
```

### Intern 3 -- Authorization

Create:

``` text
backend/src/modules/authorization/
frontend/src/features/roles/
```

Prepare:

``` text
Role model
Permission model
authorize middleware design
PermissionGate component
```

### Intern 4 -- Projects

Create:

``` text
backend/src/modules/projects/
frontend/src/features/projects/
```

Prepare:

``` text
Project model
ProjectMember model
project repository
ProjectsPage
```

### Intern 5 -- Teams & Sprints

Create:

``` text
backend/src/modules/teams/
backend/src/modules/sprints/
frontend/src/features/teams/
frontend/src/features/sprints/
```

Prepare initial models and page shells.

### Intern 6 -- Tasks

Create:

``` text
backend/src/modules/tasks/
frontend/src/features/tasks/
```

Prepare:

``` text
Task model
Task repository
TasksPage
TaskForm
```

### Intern 7 -- Collaboration

Create:

``` text
backend/src/modules/comments/
backend/src/modules/attachments/
frontend/src/features/comments/
frontend/src/features/attachments/
```

Prepare module skeletons.

### Intern 8 -- Dashboard & Notifications

Create:

``` text
backend/src/modules/dashboard/
backend/src/modules/notifications/
frontend/src/features/dashboard/
frontend/src/features/notifications/
```

Prepare page/service skeletons.

## Deliverables

By end of Day 1:

-   both applications start successfully;
-   MongoDB connects;
-   common folder structure exists;
-   module folders exist;
-   routing shell exists;
-   global error handler exists;
-   each intern has a feature branch;
-   `.env.example` exists;
-   no secrets are committed.

## Review Checklist

-   [ ] `frontend/` starts successfully
-   [ ] `backend/` starts successfully
-   [ ] MongoDB connection verified
-   [ ] Folder structure follows Documents 05/06/09
-   [ ] Branch names follow Document 08
-   [ ] No intern is working directly on `main`
-   [ ] No `.env` file committed
-   [ ] Shared API base URL configured through environment
-   [ ] Global error middleware registered
-   [ ] Common route prefix `/api/v1` agreed

## Integration Tasks

Technical lead integrates:

``` text
app.js
router.jsx
backend route index
shared API client
shared middleware
common components
```

End-of-day smoke test:

``` text
GET /health
Frontend loads
Backend responds
MongoDB connected
```

------------------------------------------------------------------------

# 6. Day 2 -- Authentication, Users & Authorization Foundation

## Learning Objectives

Understand:

-   JWT/session concepts;
-   password hashing;
-   authentication vs authorization;
-   protected APIs;
-   protected React routes;
-   role/permission model;
-   request validation;
-   DTO safety.

## Features

Primary features:

``` text
Login
Logout
Current User
User Creation
User Listing
Role Listing
Permission Checking
Protected Routes
Permission-Aware UI
```

## Intern Assignments

### Intern 1

Implement:

``` text
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

Backend:

``` text
password verification
token/session creation
authentication middleware
safe auth DTO
```

Frontend:

``` text
LoginPage
authService
auth context/state
ProtectedRoute
login redirect
```

### Intern 2

Implement:

``` text
POST /api/v1/users
GET  /api/v1/users
GET  /api/v1/users/:userId
```

Frontend:

``` text
UsersPage
CreateUserPage
UserDetailsPage
```

### Intern 3

Implement authorization foundation:

``` text
Role
Permission
RolePermission
UserRole
authorize(permission)
PermissionGate
```

Initial permissions:

``` text
USER_VIEW
USER_CREATE
USER_UPDATE
PROJECT_VIEW
PROJECT_CREATE
TASK_VIEW
TASK_CREATE
TASK_UPDATE
REPORT_VIEW
```

### Interns 4--8

Continue model/repository foundations and consume
authentication/authorization contracts.

All protected APIs should be prepared to use:

``` js
authenticate
authorize("PERMISSION_NAME")
```

## Deliverables

-   successful login from Postman;
-   successful login from React;
-   token/session used for protected request;
-   Users page retrieves protected data;
-   unauthorized request returns 401;
-   insufficient permission returns 403;
-   React redirects unauthenticated users to login.

## Review Checklist

-   [ ] Passwords are hashed
-   [ ] Password hash never returned
-   [ ] Token not logged
-   [ ] Login validation exists
-   [ ] Authentication middleware centralized
-   [ ] Authorization middleware reusable
-   [ ] Users API paginated
-   [ ] DTO excludes sensitive fields
-   [ ] Login loading/error states implemented
-   [ ] Protected React route verified

## Integration Tasks

Integrate:

``` text
Auth → Users
Auth → Authorization
Authorization → React navigation
```

Test flow:

``` text
Login
  ↓
Receive session/token
  ↓
Navigate Dashboard
  ↓
Open Users
  ↓
GET /users with authentication
  ↓
Display users
```

------------------------------------------------------------------------

# 7. Day 3 -- Projects, Teams & Membership

## Learning Objectives

Understand:

-   entity relationships;
-   workspace scoping;
-   project membership;
-   team membership;
-   nested REST resources;
-   cross-module service validation;
-   reusable React forms.

## Features

``` text
Project CRUD foundation
Project Members
Team CRUD foundation
Team Members
Project/Team detail pages
Membership authorization
```

## Intern Assignments

### Intern 4 -- Projects

Implement:

``` text
POST /api/v1/projects
GET  /api/v1/projects
GET  /api/v1/projects/:projectId
PUT  /api/v1/projects/:projectId

GET  /api/v1/projects/:projectId/members
POST /api/v1/projects/:projectId/members
```

Frontend:

``` text
ProjectsPage
CreateProjectPage
ProjectDetailsPage
ProjectMembers
```

### Intern 5 -- Teams

Implement:

``` text
POST /api/v1/teams
GET  /api/v1/teams
GET  /api/v1/teams/:teamId
PUT  /api/v1/teams/:teamId

GET  /api/v1/teams/:teamId/members
POST /api/v1/teams/:teamId/members
```

Frontend:

``` text
TeamsPage
CreateTeamPage
TeamDetailsPage
TeamMembers
```

### Intern 2

Support user lookup/search required by member selectors.

### Intern 3

Add:

``` text
PROJECT_VIEW
PROJECT_CREATE
PROJECT_UPDATE
PROJECT_MANAGE_MEMBERS
TEAM_VIEW
TEAM_CREATE
TEAM_UPDATE
TEAM_MANAGE_MEMBERS
```

### Intern 6

Prepare Task module to reference valid projects/users.

### Intern 8

Prepare dashboard project/team summary contracts.

## Deliverables

-   project can be created;
-   team can be created;
-   users can be added as members;
-   project/team lists render in React;
-   detail pages load;
-   access is permission-aware.

## Review Checklist

-   [ ] Workspace scope enforced
-   [ ] Duplicate membership prevented
-   [ ] Invalid user membership rejected
-   [ ] Repository owns DB queries
-   [ ] Service owns relationship rules
-   [ ] Controller remains thin
-   [ ] Forms validate required fields
-   [ ] Empty/loading/error states implemented
-   [ ] Member removal/change requires correct permission

## Integration Tasks

Integration chain:

``` text
Users
  ↓
Project Members
  ↓
Teams
  ↓
Team Members
```

Verify an intern does not create duplicate User models inside
project/team modules.

------------------------------------------------------------------------

# 8. Day 4 -- Task Management Core

## Learning Objectives

Understand:

-   enterprise task lifecycle;
-   task relationships;
-   assignees;
-   status and priority;
-   filtering/pagination;
-   service-level business rules;
-   reusable task forms;
-   React list/detail patterns.

## Features

``` text
Create Task
List Tasks
Task Details
Update Task
Task Status
Task Assignment
Labels
Basic Checklist
```

## Intern 6 -- Primary Owner

Implement:

``` text
POST  /api/v1/tasks
GET   /api/v1/tasks
GET   /api/v1/tasks/:taskId
PUT   /api/v1/tasks/:taskId
PATCH /api/v1/tasks/:taskId/status
```

Task fields include agreed Document 03/04 fields such as:

``` text
project
title
description
type
status
priority
assignee
due date
story points
labels
```

Frontend:

``` text
TasksPage
CreateTaskPage
TaskDetailsPage
EditTaskPage
TaskForm
TaskFilters
TaskTable
StatusBadge
PriorityBadge
```

## Supporting Intern Tasks

Intern 2:

``` text
user search for assignee selection
```

Intern 4:

``` text
project selector / membership API support
```

Intern 3:

``` text
TASK_VIEW
TASK_CREATE
TASK_UPDATE
TASK_ASSIGN
```

Intern 7:

Prepare comments/attachments for Task Details.

Intern 8:

Prepare task-status dashboard aggregation.

## Deliverables

Demonstrable flow:

``` text
Login
→ Open project
→ Create task
→ Assign user
→ View task
→ Change status
→ Filter task list
```

## Review Checklist

-   [ ] Task cannot reference inaccessible project
-   [ ] Assignee validation exists
-   [ ] Status uses documented values
-   [ ] Invalid state transition handled
-   [ ] List is paginated
-   [ ] Filters are server-compatible
-   [ ] Stable React keys used
-   [ ] Task form does not hardcode IDs
-   [ ] Backend uses Model → Repository → Service → Controller
-   [ ] Error response follows standard contract

## Integration Tasks

Connect:

``` text
Authentication
   ↓
Projects
   ↓
Project Members
   ↓
Tasks
   ↓
Users/Assignees
```

Run Postman collection for all task endpoints.

------------------------------------------------------------------------

# 9. Day 5 -- Sprints, Backlog, Comments & Attachments

## Learning Objectives

Understand:

-   sprint lifecycle;
-   backlog planning;
-   task-to-sprint relationship;
-   nested resources;
-   file upload architecture;
-   multipart requests;
-   comments/activity;
-   ownership/permission rules.

## Features

``` text
Sprint Creation
Sprint Listing
Sprint Details
Backlog
Assign Task to Sprint
Start/Complete Sprint foundation
Comments
Attachments
```

## Intern 5 -- Sprints

Implement:

``` text
POST /api/v1/sprints
GET  project sprints
GET  /api/v1/sprints/:sprintId
```

Add agreed lifecycle operations from Document 04.

Frontend:

``` text
SprintsPage
CreateSprintPage
SprintDetailsPage
BacklogPage
```

## Intern 7 -- Comments & Attachments

Implement comments:

``` text
GET  task comments
POST task comment
PUT  comment
DELETE comment
```

Implement attachment foundation:

``` text
upload attachment
list attachments
download/access metadata
delete attachment
```

Frontend:

``` text
CommentList
CommentForm
AttachmentList
AttachmentUploader
```

## Intern 6

Integrate task sprint assignment and checklist behavior.

## Intern 8

Prepare sprint dashboard/report aggregations.

## Deliverables

Demonstration:

``` text
Create Sprint
→ Move task from backlog into sprint
→ Open task
→ Add comment
→ Upload attachment
→ Reload task
→ Data remains available
```

## Review Checklist

-   [ ] Sprint dates validated
-   [ ] Project relationship validated
-   [ ] Sprint lifecycle rules in service
-   [ ] Task sprint assignment scoped correctly
-   [ ] Comment author comes from authentication
-   [ ] Attachment file type/size validated
-   [ ] Original unsafe file names not trusted blindly
-   [ ] File metadata stored correctly
-   [ ] Unauthorized users cannot delete others' resources improperly
-   [ ] Upload failures handled cleanly

## Integration Tasks

Integrate:

``` text
Project
  ↓
Sprint
  ↓
Backlog
  ↓
Task
  ↓
Comments / Attachments
```

Test both API and React flow.

------------------------------------------------------------------------

# 10. Day 6 -- Kanban, Notifications, Dashboard & Time Tracking

## Learning Objectives

Understand:

-   aggregated APIs;
-   dashboard read models;
-   Kanban state changes;
-   optimistic UI considerations;
-   notification generation;
-   time-entry lifecycle;
-   integration side effects.

## Features

``` text
Kanban Board
Dashboard Summary
Task Status Analytics
Project Progress
Notifications
Time Tracking foundation
```

## Intern 6 -- Kanban Backend Support

Ensure task status API supports board transitions.

## Intern 5/6 -- Kanban UI

Implement:

``` text
KanbanPage
KanbanColumn
TaskCard
status update interaction
```

Flow:

``` text
Drag Task
  ↓
PATCH task status
  ↓
Success → retain state
Failure → rollback/show error
```

## Intern 8 -- Dashboard

Implement:

``` text
GET /api/v1/dashboard/summary
GET task-status aggregation
GET project-progress aggregation
GET recent activity
```

Frontend:

``` text
DashboardPage
SummaryCards
TaskStatusWidget
ProjectProgressWidget
RecentActivityWidget
```

## Intern 8 -- Notifications

Implement:

``` text
GET notifications
mark notification read
mark all read
notification preferences foundation
```

Frontend:

``` text
NotificationBell
NotificationDropdown
NotificationsPage
```

## Intern 7 -- Time Tracking

Implement foundation:

``` text
start timer
stop timer
manual time entry
task time entries
```

## Deliverables

-   Kanban status update persists;
-   dashboard displays real database values;
-   notification list works;
-   unread count works;
-   time entry can be recorded;
-   dashboard does not depend on static arrays.

## Review Checklist

-   [ ] Dashboard queries are scoped
-   [ ] Aggregations do not expose other workspaces
-   [ ] Kanban rollback handles failed request
-   [ ] Notification ownership enforced
-   [ ] Mark-read endpoint works
-   [ ] Time entry validates user/task
-   [ ] Loading states exist per major UI area
-   [ ] Dashboard does not fail entirely because one widget fails where
    independent loading is implemented
-   [ ] No fake production data remains in integrated screens

## Integration Tasks

Trigger notification/activity examples from real actions:

``` text
Task assigned
Task status changed
Comment added
Sprint lifecycle change
```

Verify:

``` text
Action
→ Database change
→ Activity/notification side effect
→ Dashboard/notification UI
```

------------------------------------------------------------------------

# 11. Day 7 -- Reports, Testing, Security & Full Integration

## Learning Objectives

Understand:

-   integration testing;
-   API regression;
-   security verification;
-   report aggregations;
-   negative testing;
-   role-based testing;
-   cross-module defects;
-   release readiness.

## Features

``` text
Basic Reports
Activity Log
Cross-Module Integration
API Regression
Role Testing
Validation Testing
Bug Fixing
UI Polish
```

## Intern 8 -- Reports

Implement initial reports:

``` text
Task status report
Overdue tasks report
Project progress report
Team workload foundation
Activity report
```

Frontend:

``` text
ReportsPage
TaskReportsPage
ProjectReportsPage
ActivityLogPage
```

## Intern 3 -- Security Verification

Test:

``` text
401 unauthenticated
403 unauthorized
role permission combinations
workspace isolation
project access
restricted admin actions
```

## All Interns -- Negative Testing

Every intern tests their module for:

``` text
missing required fields
invalid IDs
nonexistent records
duplicate records
unauthorized requests
forbidden requests
invalid state transitions
empty results
server errors where safely reproducible
```

## Cross-Module Test Scenario

Execute:

``` text
1. Login as administrator
2. Create user
3. Assign role
4. Create project
5. Add project member
6. Create team
7. Add team member
8. Create sprint
9. Create task
10. Assign task
11. Add checklist
12. Add comment
13. Upload attachment
14. Change task status
15. Record time
16. View notification
17. View dashboard
18. View report
```

## Deliverables

-   critical APIs pass Postman regression;
-   major frontend workflows pass;
-   permissions tested;
-   integration defects documented/fixed;
-   no P0/P1 known defect remains for demo;
-   demo seed/test data prepared.

## Review Checklist

-   [ ] No secrets in Git
-   [ ] No direct DB logic in routes/controllers
-   [ ] No unprotected privileged endpoint
-   [ ] Validation applied
-   [ ] Error format consistent
-   [ ] React API calls use services
-   [ ] No hardcoded test user IDs in production paths
-   [ ] No major console errors
-   [ ] Build succeeds
-   [ ] Tests pass
-   [ ] PRs reviewed
-   [ ] `develop` integration stable

## Integration Tasks

Create a release candidate branch if the team is ready:

``` text
develop
   ↓
release/0.1.0
```

Only stabilization fixes should enter the release candidate after this
point.

------------------------------------------------------------------------

# 12. Day 8 -- Demo Day, Review & Sprint Closure

## Learning Objectives

Interns should learn how to:

-   present completed software;
-   explain architecture;
-   demonstrate their own module;
-   explain API/frontend integration;
-   discuss challenges and decisions;
-   receive review feedback;
-   identify technical debt;
-   close a sprint professionally.

------------------------------------------------------------------------

# 13. Demo Day Preparation

Before the demo:

``` text
Pull latest approved code
Install dependencies
Verify environment
Start MongoDB
Start backend
Start frontend
Run smoke tests
Prepare demo accounts
Prepare demo data
Verify all demo routes
Close debug tools/unnecessary windows
```

Do not discover basic environment problems while presenting.

------------------------------------------------------------------------

# 14. Demo Day Scenario

Use one connected business scenario rather than eight disconnected
mini-demos.

## Step 1 -- Authentication

Intern 1 demonstrates:

``` text
Login
Protected route
Current user
Logout/session behavior
```

## Step 2 -- Users

Intern 2 demonstrates:

``` text
Create user
List users
View user
Profile
```

## Step 3 -- Authorization

Intern 3 demonstrates:

``` text
Role
Permission
Restricted action
403 example
Permission-aware UI
```

## Step 4 -- Projects

Intern 4 demonstrates:

``` text
Create project
Add member
View project
```

## Step 5 -- Teams & Sprints

Intern 5 demonstrates:

``` text
Create team
Add team member
Create sprint
View backlog
```

## Step 6 -- Tasks

Intern 6 demonstrates:

``` text
Create task
Assign user
Update task
Change status
Kanban
Checklist
```

## Step 7 -- Collaboration

Intern 7 demonstrates:

``` text
Comment
Attachment
Time entry
```

## Step 8 -- Management View

Intern 8 demonstrates:

``` text
Dashboard
Notifications
Reports
Activity
```

------------------------------------------------------------------------

# 15. Individual Demo Format

Each intern should explain:

``` text
1. What module did I own?
2. What problem does it solve?
3. What backend layers did I implement?
4. Which APIs did I implement?
5. Which React pages/components did I implement?
6. What validation/security exists?
7. How does my module integrate with other modules?
8. What was the hardest issue?
9. How did I test it?
10. What remains for the next sprint?
```

Recommended time:

``` text
5–8 minutes per intern
```

------------------------------------------------------------------------

# 16. Demo Review Checklist

## Functional

-   [ ] Login works
-   [ ] Protected APIs work
-   [ ] Users work
-   [ ] Roles/permissions work
-   [ ] Projects work
-   [ ] Teams work
-   [ ] Tasks work
-   [ ] Sprints/backlog work
-   [ ] Comments work
-   [ ] Attachments work
-   [ ] Kanban works
-   [ ] Notifications work
-   [ ] Dashboard uses real data
-   [ ] Reports show real data

## Architecture

-   [ ] Backend layers respected
-   [ ] React feature structure respected
-   [ ] API services centralized
-   [ ] Common components reused
-   [ ] No duplicated entity models
-   [ ] Shared contracts followed

## Security

-   [ ] Authentication enforced
-   [ ] Authorization enforced
-   [ ] Passwords protected
-   [ ] Sensitive fields not returned
-   [ ] No secrets committed
-   [ ] Workspace/project isolation verified

## Quality

-   [ ] Build succeeds
-   [ ] Tests pass
-   [ ] No critical console errors
-   [ ] Loading/error states work
-   [ ] Forms validate
-   [ ] Error responses are consistent
-   [ ] Git history/PRs are reviewable

------------------------------------------------------------------------

# 17. Sprint Review

After demos, classify work:

``` text
DONE
PARTIALLY DONE
BLOCKED
MOVED TO NEXT SPRINT
```

Do not mark work complete merely because code exists locally.

A feature is DONE only if:

``` text
Code committed
PR reviewed
Merged
Integrated
Tested
Demonstrated
Documentation updated where required
```

------------------------------------------------------------------------

# 18. Sprint Retrospective

Each intern answers:

``` text
What went well?
What was difficult?
What caused delays?
Where did integration fail?
Which shared contract was unclear?
What should we change next sprint?
What technical debt did we create?
```

The lead records actionable improvements.

Example:

``` text
Problem:
Task and Sprint modules used different status naming.

Action:
All enum/API contract changes require shared review before implementation.
```

------------------------------------------------------------------------

# 19. Integration Responsibility Matrix

  Dependency                        Provider   Consumer
  --------------------------------- ---------- ------------------------------------
  Authentication context            Intern 1   All
  User lookup                       Intern 2   Projects, Teams, Tasks
  Permissions                       Intern 3   All protected modules
  Project membership                Intern 4   Tasks, Sprints, Reports
  Sprint data                       Intern 5   Tasks, Dashboard
  Task data                         Intern 6   Comments, Time, Dashboard, Reports
  Comments/Attachments/Time         Intern 7   Task Details, Reports
  Dashboard/Reports/Notifications   Intern 8   Management users

Providers must communicate contract changes before merging them.

------------------------------------------------------------------------

# 20. Daily Integration Rule

Do not wait until Day 7 to integrate.

Every day:

``` text
Feature branch
   ↓
PR
   ↓
Review
   ↓
develop
   ↓
Smoke test
```

At least one integration window should occur daily.

------------------------------------------------------------------------

# 21. Daily Deliverable Format

Every intern posts:

``` text
Intern:
Module:
Ticket:
Branch:

Completed:
- ...

APIs:
- ...

Frontend:
- ...

Tests:
- ...

PR:
- ...

Blockers:
- ...

Tomorrow:
- ...
```

This makes progress measurable.

------------------------------------------------------------------------

# 22. Lead Daily Checklist

The technical lead should verify:

``` text
Who is blocked?
Which PRs need review?
Are shared files conflicting?
Did anyone change an API contract?
Did anyone change a schema?
Are CI checks passing?
Is develop stable?
Are modules integrating?
Is scope growing unexpectedly?
```

------------------------------------------------------------------------

# 23. Severity Levels for Sprint Bugs

## P0 -- Critical

``` text
Application cannot run
Authentication bypass
Data corruption
Critical security failure
```

Must be resolved immediately.

## P1 -- High

``` text
Core module unusable
Task creation broken
Project membership broken
Major authorization defect
```

Must be resolved before demo/release candidate.

## P2 -- Medium

``` text
Non-critical workflow defect
Incorrect empty state
Minor report issue
```

Fix during sprint when possible.

## P3 -- Low

``` text
Cosmetic issue
Minor text/alignment issue
Non-blocking improvement
```

Can move to backlog.

------------------------------------------------------------------------

# 24. End-of-Day Quality Gate

Before finishing each day:

``` text
git status
npm run lint
npm test
npm run build
```

Use the actual commands configured by the project.

Also verify:

``` text
No .env staged
No token/password logged
No hardcoded production URL
No unexplained debug code
No unresolved merge conflict
```

------------------------------------------------------------------------

# 25. Postman Testing Requirement

Each backend-owning intern maintains requests for their module.

Suggested collection:

``` text
ETMS
├── Auth
├── Users
├── Roles
├── Projects
├── Teams
├── Tasks
├── Sprints
├── Comments
├── Attachments
├── Notifications
├── Dashboard
└── Reports
```

For each important endpoint test:

``` text
Success
Validation failure
Unauthenticated
Unauthorized
Not found
Business-rule failure
```

where applicable.

------------------------------------------------------------------------

# 26. Frontend Testing Requirement

For each primary screen verify:

``` text
Initial load
Loading state
Success state
Empty state
Error state
Form validation
Successful mutation
Failed mutation
Permission visibility
Navigation
Refresh/reload behavior
```

------------------------------------------------------------------------

# 27. Sprint Branch Flow

Normal daily work:

``` text
develop
   ↓
feature/ETMS-xxx-description
   ↓
Pull Request
   ↓
Review
   ↓
develop
```

Sprint stabilization:

``` text
develop
   ↓
release/0.1.0
   ↓
Demo / QA
```

Follow Document 08 for complete Git rules.

------------------------------------------------------------------------

# 28. Day-by-Day Summary

  -----------------------------------------------------------------------
  Day                     Main Focus              Major Outcome
  ----------------------- ----------------------- -----------------------
  1                       Foundation              Applications and module
                                                  skeletons

  2                       Auth/Users/RBAC         Secure login and
                                                  protected user flow

  3                       Projects/Teams          Organizational work
                                                  structure

  4                       Tasks                   Core task management

  5                       Sprints/Collaboration   Agile planning and task
                                                  collaboration

  6                       Kanban/Dashboard        Interactive workflow
                                                  and management
                                                  visibility

  7                       Reports/Testing         Integrated release
                                                  candidate

  8                       Demo/Review             Demonstrated sprint
                                                  increment
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 29. Minimum Sprint Acceptance Criteria

The sprint is successful when the team can demonstrate:

``` text
User logs in
   ↓
Admin creates/manages user
   ↓
Role controls permissions
   ↓
Project is created
   ↓
Members are added
   ↓
Team is created
   ↓
Sprint is created
   ↓
Task is created
   ↓
Task is assigned
   ↓
Task moves through workflow
   ↓
Comment/attachment is added
   ↓
Notification/activity appears
   ↓
Dashboard/report reflects data
```

This is the first enterprise vertical slice.

------------------------------------------------------------------------

# 30. What Moves to the Next Sprint

Features that can continue after this sprint include:

``` text
advanced refresh/session security
advanced RBAC administration
epic lifecycle
advanced checklist behavior
saved filters
advanced search
calendar
advanced time reports
email notifications
real-time notifications
WebSocket updates
advanced analytics
CSV/PDF exports
dashboard customization
leave management
workspace administration
audit administration
performance optimization
automated E2E testing
deployment pipeline
```

These should be prioritized from the SRS rather than added randomly.

------------------------------------------------------------------------

# 31. Sprint Completion Definition

At the end of Day 8, the team should have more than eight isolated
intern projects.

The expected result is:

``` text
ONE repository
ONE frontend
ONE backend
ONE database design
ONE API contract
ONE coding standard
ONE Git workflow
EIGHT independently owned modules
ONE integrated ETMS application
```

The sprint succeeds when independently developed modules operate
together through documented contracts.

------------------------------------------------------------------------

# 32. Final Sprint Rule

Every intern should remember:

``` text
Learn
  ↓
Design
  ↓
Develop
  ↓
Test
  ↓
Review
  ↓
Integrate
  ↓
Demonstrate
```

A feature that has only reached **Develop** is not finished.

A professional sprint ends with reviewed, integrated, tested and
demonstrable software.
