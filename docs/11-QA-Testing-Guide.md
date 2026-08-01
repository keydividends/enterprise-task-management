# Document 11 -- QA & Testing Guide

**Project:** Enterprise Task Management System (ETMS)\
**Document Type:** Quality Assurance & Testing Strategy\
**Version:** 1.0\
**Technology:** React + Node.js + Express + MongoDB\
**Team:** 8 Interns + Technical Lead / Reviewer\
**Testing Scope:** Backend, REST APIs, Database Integration, React UI,
Security, Regression

------------------------------------------------------------------------

# 1. Purpose

This document defines the QA and testing standards for the Enterprise
Task Management System.

Testing is not a final activity performed only after development. Every
module must be designed, implemented, tested, reviewed, integrated, and
regression-tested throughout the sprint.

The ETMS testing strategy includes:

-   Unit Testing
-   API Testing
-   Integration Testing
-   UI Testing
-   Regression Testing
-   Security Testing

The goal is to verify both successful behavior and failure behavior
before features are considered complete.

------------------------------------------------------------------------

# 2. Quality Objectives

ETMS testing should ensure that:

1.  Business rules work correctly.
2.  REST APIs follow Document 04.
3.  Database operations preserve data integrity.
4.  React screens behave correctly.
5.  Authentication and authorization cannot be bypassed.
6.  Validation rejects invalid input.
7.  Modules integrate correctly.
8.  Existing features continue working after new changes.
9.  Sensitive information is protected.
10. Critical user journeys are reliable.

------------------------------------------------------------------------

# 3. Testing Pyramid

Recommended testing distribution:

``` text
                UI / E2E Tests
              ─────────────────
             Integration Tests
           ───────────────────────
          API / Service Tests
        ───────────────────────────
              Unit Tests
      ───────────────────────────────
```

Most tests should be fast unit/service tests, supported by API and
integration tests, with a smaller number of high-value end-to-end UI
tests.

------------------------------------------------------------------------

# 4. Test Environments

Recommended environments:

``` text
Local Development
        ↓
Automated Test Environment
        ↓
Integration / QA
        ↓
UAT
        ↓
Production
```

Tests must not depend on production data.

Use dedicated test databases and test users.

Example:

``` env
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/etms_test
```

Never run destructive automated tests against production.

------------------------------------------------------------------------

# 5. Test Data Strategy

Create predictable test data.

Examples:

``` text
Admin User
Project Manager
Team Lead
Developer
Viewer

Workspace A
Workspace B

Project Alpha
Project Beta

Sprint 1
Sprint 2

Tasks in multiple statuses
```

Include data for authorization isolation:

``` text
User A → Workspace A
User B → Workspace B
```

This allows testing that User A cannot access Workspace B resources.

------------------------------------------------------------------------

# PART I -- UNIT TESTING

# 6. Unit Testing Definition

Unit tests verify small pieces of logic independently.

Typical backend units:

``` text
service methods
validation helpers
permission helpers
mappers
utility functions
status transition rules
date calculations
```

Typical frontend units:

``` text
utility functions
custom hooks
small components
formatters
permission helpers
form validation logic
```

------------------------------------------------------------------------

# 7. Recommended Backend Test Stack

A typical Node.js backend test stack can use:

``` text
Jest or Vitest
Supertest for HTTP/API tests
MongoDB test database / controlled test strategy
```

The team should select one test runner and use it consistently.

Do not let each intern use a different testing framework without
approval.

------------------------------------------------------------------------

# 8. Example Backend Unit Test

Business function:

``` js
export function canTransition(currentStatus, nextStatus) {
  const transitions = {
    BACKLOG: ["TODO"],
    TODO: ["IN_PROGRESS"],
    IN_PROGRESS: ["IN_REVIEW", "TODO"],
    IN_REVIEW: ["QA", "IN_PROGRESS"],
    QA: ["DONE", "IN_PROGRESS"],
    DONE: []
  };

  return transitions[currentStatus]?.includes(nextStatus) ?? false;
}
```

Test:

``` js
describe("canTransition", () => {
  test("allows TODO to move to IN_PROGRESS", () => {
    expect(canTransition("TODO", "IN_PROGRESS")).toBe(true);
  });

  test("rejects DONE to IN_PROGRESS", () => {
    expect(canTransition("DONE", "IN_PROGRESS")).toBe(false);
  });

  test("rejects unknown status", () => {
    expect(canTransition("UNKNOWN", "TODO")).toBe(false);
  });
});
```

------------------------------------------------------------------------

# 9. Service Unit Testing

Services contain important business rules and require strong coverage.

Example scenarios for `createTask`:

``` text
creates task for valid project
rejects nonexistent project
rejects inaccessible project
rejects invalid assignee
accepts valid project member
creates activity record
creates notification when required
```

Use mocks/stubs where isolation is appropriate.

Example conceptual structure:

``` js
describe("taskService.createTask", () => {
  test("rejects inaccessible project", async () => {
    projectRepository.findById.mockResolvedValue({
      id: "project-1"
    });

    projectMemberRepository.isMember.mockResolvedValue(false);

    await expect(
      taskService.createTask(input, context)
    ).rejects.toMatchObject({
      code: "PROJECT_ACCESS_DENIED"
    });
  });
});
```

------------------------------------------------------------------------

# 10. Validation Unit Testing

For every validation schema test:

``` text
valid input
missing required field
invalid type
invalid enum
too-short/too-long string
invalid ObjectId
invalid date
unexpected field where applicable
```

Example task title:

``` text
"Implement dashboard" → valid
"" → invalid
missing → invalid
251-character title → invalid
```

------------------------------------------------------------------------

# 11. Mapper / DTO Tests

Verify sensitive fields never leak.

Example:

``` js
test("user response excludes password hash", () => {
  const result = toUserResponse({
    _id: "123",
    email: "user@example.com",
    passwordHash: "secret-hash"
  });

  expect(result.passwordHash).toBeUndefined();
});
```

Also test:

``` text
refresh token hashes
reset tokens
internal security fields
```

------------------------------------------------------------------------

# 12. Frontend Unit Testing

Recommended tools may include:

``` text
Vitest
React Testing Library
user-event
```

Test behavior rather than internal implementation details.

Example:

``` jsx
render(
  <TaskCard
    task={{
      id: "1",
      title: "Test task",
      status: "TODO"
    }}
  />
);

expect(
  screen.getByText("Test task")
).toBeInTheDocument();
```

------------------------------------------------------------------------

# 13. Frontend Component Test Example

For a permission-aware button:

``` jsx
test("hides create button without TASK_CREATE permission", () => {
  render(
    <PermissionGate
      permission="TASK_CREATE"
      permissions={["TASK_VIEW"]}
    >
      <button>Create Task</button>
    </PermissionGate>
  );

  expect(
    screen.queryByText("Create Task")
  ).not.toBeInTheDocument();
});
```

Remember: frontend permission tests improve UX correctness, but backend
authorization remains the security boundary.

------------------------------------------------------------------------

# 14. Unit Test Naming

Use descriptive behavior names.

Good:

``` text
should reject task creation when project does not exist
should hide edit button when user lacks TASK_UPDATE
should return false for invalid task transition
```

Avoid:

``` text
test1
service test
working
check function
```

------------------------------------------------------------------------

# PART II -- API TESTING

# 15. API Testing Scope

Every important endpoint should be tested for:

``` text
HTTP method
URL
authentication
authorization
request validation
response body
status code
database effect
error response
pagination/filter behavior
```

Document 04 is the source of truth for expected API behavior.

------------------------------------------------------------------------

# 16. Postman Collection Structure

Recommended collection:

``` text
ETMS API
├── 01 Authentication
├── 02 Users
├── 03 Roles & Permissions
├── 04 Projects
├── 05 Teams
├── 06 Tasks
├── 07 Sprints
├── 08 Comments
├── 09 Attachments
├── 10 Time Tracking
├── 11 Notifications
├── 12 Dashboard
└── 13 Reports
```

Use environments:

``` text
Local
QA
UAT
```

Variables:

``` text
baseUrl
accessToken
workspaceId
projectId
taskId
userId
sprintId
```

------------------------------------------------------------------------

# 17. Standard API Test Cases

For:

``` text
POST /api/v1/tasks
```

test:

### Successful Request

``` json
{
  "title": "Implement login page",
  "projectId": "{{projectId}}",
  "priority": "HIGH"
}
```

Expected:

``` text
201 Created
success = true
task id returned
task stored in database
```

### Missing Authentication

Expected:

``` text
401 Unauthorized
```

### Missing Permission

Expected:

``` text
403 Forbidden
```

### Missing Title

Expected:

``` text
400 Bad Request
VALIDATION_ERROR
```

### Invalid Project

Expected:

``` text
404 or documented business error
```

### Inaccessible Project

Expected:

``` text
403 Forbidden
```

------------------------------------------------------------------------

# 18. Postman Automated Assertions

Example:

``` js
pm.test("Status is 201", function () {
  pm.response.to.have.status(201);
});

pm.test("Response is successful", function () {
  const json = pm.response.json();
  pm.expect(json.success).to.eql(true);
});

pm.test("Task has an id", function () {
  const json = pm.response.json();
  pm.expect(json.data.id).to.exist;
});
```

Store IDs for later requests:

``` js
const json = pm.response.json();

pm.environment.set(
  "taskId",
  json.data.id
);
```

------------------------------------------------------------------------

# 19. API CRUD Test Sequence

For each CRUD module:

``` text
Create
  ↓
Get By ID
  ↓
List
  ↓
Update
  ↓
Verify Update
  ↓
Delete / Soft Delete
  ↓
Verify Deleted Resource Behavior
```

Do not test endpoints only in isolation if their lifecycle matters.

------------------------------------------------------------------------

# 20. Pagination Testing

Test:

``` text
page=1
page=2
pageSize minimum
pageSize maximum
page beyond available results
invalid page
invalid pageSize
```

Verify:

``` text
total
page
pageSize
totalPages
data length
```

according to Document 04.

------------------------------------------------------------------------

# 21. Filter and Sort Testing

Tasks may require:

``` text
status
priority
assignee
project
sprint
label
due date
search
sort
```

Test combinations, not only one filter.

Example:

``` text
status=IN_PROGRESS
priority=HIGH
projectId=<id>
```

Verify returned records actually match all requested conditions.

------------------------------------------------------------------------

# PART III -- INTEGRATION TESTING

# 22. Integration Testing Definition

Integration tests verify that multiple layers/modules work together.

Examples:

``` text
Route + Middleware + Controller + Service + Repository + MongoDB
Auth + Users
Projects + Members + Tasks
Sprints + Tasks
Tasks + Comments
Tasks + Notifications
Task actions + Activity Logs
```

------------------------------------------------------------------------

# 23. Backend Integration Test Example

Conceptual Supertest example:

``` js
describe("POST /api/v1/tasks", () => {
  test("creates task for authorized project member", async () => {
    const response = await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Integration test task",
        projectId
      });

    expect(response.status).toBe(201);

    const savedTask = await Task.findById(
      response.body.data.id
    );

    expect(savedTask).not.toBeNull();
    expect(savedTask.title).toBe(
      "Integration test task"
    );
  });
});
```

------------------------------------------------------------------------

# 24. Cross-Module Integration Scenarios

## Authentication → Users

``` text
Login
→ access protected Users API
→ receive authorized data
```

## Project → Task

``` text
Create project
→ add member
→ member creates task
```

## Sprint → Task

``` text
Create sprint
→ assign task
→ retrieve sprint tasks
```

## Task → Notification

``` text
Assign task to user
→ notification created
→ assignee sees notification
```

## Task → Activity

``` text
Change status
→ task updated
→ activity entry created
```

------------------------------------------------------------------------

# 25. Workspace Isolation Test

This is a critical enterprise test.

Setup:

``` text
Workspace A
  User A
  Project A
  Task A

Workspace B
  User B
  Project B
  Task B
```

Test:

``` text
Login as User A
→ request Task B
```

Expected:

``` text
User A must not receive Workspace B data.
```

Repeat for:

``` text
Users
Projects
Teams
Tasks
Sprints
Reports
Dashboard
Attachments
```

------------------------------------------------------------------------

# 26. Integration Database Cleanup

Tests must be repeatable.

Recommended lifecycle:

``` text
beforeAll → connect test database
beforeEach → seed required data
afterEach → clean test data
afterAll → disconnect
```

Avoid tests depending on execution order unless intentionally testing
one business workflow.

------------------------------------------------------------------------

# PART IV -- UI TESTING

# 27. UI Testing Scope

React UI testing should verify:

``` text
routing
forms
buttons
tables
filters
modals
loading states
empty states
error states
permissions
navigation
API success/failure
responsive behavior
```

------------------------------------------------------------------------

# 28. Manual UI Test Checklist

For every page:

-   [ ] Page loads
-   [ ] Correct title/header displayed
-   [ ] Loading state visible
-   [ ] Data renders correctly
-   [ ] Empty state works
-   [ ] API failure state works
-   [ ] Retry works where provided
-   [ ] Form validation works
-   [ ] Buttons perform correct action
-   [ ] Unauthorized controls hidden/disabled appropriately
-   [ ] Navigation works
-   [ ] Refresh does not break route
-   [ ] Browser console has no major errors
-   [ ] Layout works on supported screen sizes

------------------------------------------------------------------------

# 29. Login UI Test Cases

Test:

``` text
valid login
invalid password
unknown account
empty email
empty password
invalid email format
server unavailable
loading state
double-click submit
successful redirect
protected-route redirect
logout
```

Expected successful flow:

``` text
Login
  ↓
Authentication succeeds
  ↓
User context loaded
  ↓
Redirect to Dashboard
```

------------------------------------------------------------------------

# 30. Task Form UI Test Cases

Test:

``` text
empty title
valid title
priority selection
project selection
assignee selection
due date
successful submit
backend validation error
network error
cancel
duplicate submission protection
```

------------------------------------------------------------------------

# 31. Task List UI Test Cases

Test:

``` text
loading
records returned
no records
search
status filter
priority filter
pagination
sorting
API failure
task click
permission-controlled actions
```

------------------------------------------------------------------------

# 32. Kanban UI Testing

Test:

``` text
columns load
tasks appear in correct status
task moves to valid column
backend update succeeds
backend update fails
UI rolls back failed move
permission prevents move
refresh preserves persisted status
```

------------------------------------------------------------------------

# 33. Responsive UI Testing

Test common viewport categories:

``` text
desktop
laptop
tablet
mobile where supported
```

Verify:

``` text
navigation
tables
forms
modals
Kanban
dashboard cards
buttons
overflow
```

Do not accept a screen that works only at the developer's monitor width.

------------------------------------------------------------------------

# 34. Accessibility Testing

Verify:

``` text
labels connected to inputs
keyboard navigation
focus visibility
button names
alt text
modal focus behavior
error messages
color-independent status cues
```

Automated accessibility tools can help, but manual keyboard testing is
still useful.

------------------------------------------------------------------------

# PART V -- REGRESSION TESTING

# 35. Regression Testing Definition

Regression testing verifies that previously working functionality still
works after code changes.

Example:

``` text
New Sprint feature
        ↓
Task assignment logic changed
        ↓
Re-test:
Task create
Task edit
Task assignment
Kanban
Dashboard
Reports
```

------------------------------------------------------------------------

# 36. When Regression Testing Is Required

Perform regression testing:

``` text
before merging major PRs
after shared middleware changes
after schema changes
after authentication changes
after authorization changes
after API contract changes
before Demo Day
before release
after hotfix
```

------------------------------------------------------------------------

# 37. Smoke Test Suite

A small smoke suite should run quickly.

Recommended:

``` text
Health API works
Login works
Current user works
Users list works
Projects list works
Tasks list works
Create task works
Dashboard loads
Logout works
```

If smoke tests fail, deeper release testing should stop until the
blocking issue is understood.

------------------------------------------------------------------------

# 38. Critical Regression Suite

Before release test:

## Authentication

``` text
login
logout
protected API
invalid token/session
```

## Users/RBAC

``` text
user list
user create
role assignment
403 behavior
```

## Projects

``` text
create
list
members
```

## Tasks

``` text
create
update
assign
status
filters
```

## Sprints

``` text
create
task assignment
lifecycle
```

## Collaboration

``` text
comments
attachments
time entry
```

## Management

``` text
dashboard
notifications
reports
activity
```

------------------------------------------------------------------------

# 39. Regression Test Matrix

  Change                  Minimum Regression
  ----------------------- -----------------------------------
  Auth middleware         All protected APIs
  Permission middleware   Role-sensitive modules
  User schema             Auth, Users, Assignments
  Project schema          Projects, Tasks, Sprints, Reports
  Task schema             Tasks, Kanban, Dashboard, Reports
  API client              All frontend API screens
  Router                  Navigation/protected pages
  Shared form component   All consuming forms
  Error middleware        API error scenarios

------------------------------------------------------------------------

# 40. Automated Regression

CI should run automated tests on pull requests.

Example pipeline:

``` text
Install dependencies
        ↓
Lint
        ↓
Unit tests
        ↓
API/integration tests
        ↓
Frontend tests
        ↓
Build
```

Failed required tests should block merging.

------------------------------------------------------------------------

# PART VI -- SECURITY TESTING

# 41. Security Testing Objectives

Security testing verifies that ETMS correctly protects:

``` text
identity
permissions
workspace data
project data
credentials
tokens/sessions
files
sensitive fields
administrative actions
```

Security testing must include negative tests.

------------------------------------------------------------------------

# 42. Authentication Testing

Test:

``` text
missing token/session
invalid token
expired token
tampered token
logged-out/revoked session
disabled user
invalid credentials
repeated failed login behavior
```

Expected protected endpoint behavior:

``` text
No valid authentication → 401
```

------------------------------------------------------------------------

# 43. Authorization Testing

For every privileged endpoint test:

``` text
Admin
Authorized user
Unauthorized authenticated user
User from another workspace/project
```

Expected:

``` text
Authenticated but not allowed → 403
```

Do not rely only on hidden frontend buttons.

------------------------------------------------------------------------

# 44. IDOR / Object-Level Authorization Testing

Critical scenario:

``` text
User A owns/can access Task A.
User B owns/can access Task B.

Login as User A.
Manually replace taskId in URL with Task B id.
```

Expected:

``` text
Task B must not be exposed.
```

Repeat for:

``` text
users
projects
teams
tasks
comments
attachments
time entries
notifications
```

------------------------------------------------------------------------

# 45. Input Security Testing

Test unexpected input:

``` text
very long strings
invalid JSON
unexpected fields
invalid ObjectIds
HTML/script-like input
operator-like objects
invalid enum values
negative pagination
very large pageSize
malformed dates
```

The system should validate and reject unsafe/invalid input without
exposing internal errors.

------------------------------------------------------------------------

# 46. Mass Assignment Testing

Attempt to submit fields clients should not control.

Example:

``` json
{
  "title": "Normal task",
  "createdBy": "another-user-id",
  "workspaceId": "another-workspace-id",
  "isDeleted": false
}
```

The server must not blindly persist privileged fields from `req.body`.

------------------------------------------------------------------------

# 47. Sensitive Data Exposure Testing

Inspect responses for:

``` text
passwordHash
refreshTokenHash
reset tokens
internal secrets
database errors
stack traces
filesystem paths
private configuration
```

None should be exposed.

------------------------------------------------------------------------

# 48. File Upload Security Testing

Test:

``` text
allowed file
unsupported extension/type
oversized file
empty file
suspicious filename
duplicate filename
unauthorized upload
unauthorized download/access
unauthorized delete
```

Do not trust file extension alone when implementing the final security
policy.

------------------------------------------------------------------------

# 49. Rate-Limit Testing

Sensitive endpoints may require rate limits:

``` text
login
forgot password
reset password
OTP endpoints if added
invitation endpoints
expensive exports
```

Verify excessive requests are handled according to the configured
policy.

------------------------------------------------------------------------

# 50. Security Headers and CORS

Verify deployed API configuration for:

``` text
CORS allowed origins
HTTP security headers
HTTPS
cookie security attributes if cookies are used
```

CORS is not authorization. Backend permissions must still be enforced.

------------------------------------------------------------------------

# 51. Dependency Security

Regularly review dependency vulnerabilities.

Examples of checks can include the package manager's audit tooling and
approved dependency scanning in CI.

Do not automatically apply major dependency upgrades to production
without testing.

------------------------------------------------------------------------

# 52. Logging Security Tests

Verify logs do not contain:

``` text
password
Authorization header
access token
refresh token
reset token
OTP
database credentials
```

Trigger login failures and inspect logs to confirm safe logging.

------------------------------------------------------------------------

# 53. Error Security Tests

Force controlled errors and verify production-style responses do not
expose:

``` text
stack trace
MongoDB driver details
source code paths
environment values
```

Expected:

``` json
{
  "success": false,
  "code": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred",
  "requestId": "..."
}
```

Detailed diagnostics should remain in protected server logs.

------------------------------------------------------------------------

# PART VII -- MODULE TEST PLANS

# 54. Authentication Module

Minimum tests:

``` text
valid login
invalid password
missing fields
logout
current user
expired/invalid authentication
disabled user
protected route
```

------------------------------------------------------------------------

# 55. Users Module

Minimum tests:

``` text
create user
duplicate email
list users
pagination
search
get user
update user
deactivate user
permission checks
workspace isolation
```

------------------------------------------------------------------------

# 56. Roles & Permissions

Minimum tests:

``` text
create role
assign permissions
assign role
protected action allowed
protected action denied
protected/system role behavior
permission changes reflected correctly
```

------------------------------------------------------------------------

# 57. Projects Module

Minimum tests:

``` text
create project
list projects
update project
add member
duplicate member
remove member
unauthorized access
workspace isolation
```

------------------------------------------------------------------------

# 58. Teams Module

Minimum tests:

``` text
create team
add member
duplicate member
remove member
invalid user
permissions
workspace isolation
```

------------------------------------------------------------------------

# 59. Tasks Module

Minimum tests:

``` text
create
get
list
update
assign
status transition
filters
pagination
labels
checklists
invalid project
invalid assignee
permissions
workspace/project isolation
soft delete behavior
```

------------------------------------------------------------------------

# 60. Sprints Module

Minimum tests:

``` text
create sprint
invalid dates
list
details
assign task
start sprint
complete sprint
invalid lifecycle transition
project isolation
```

------------------------------------------------------------------------

# 61. Comments & Attachments

Comments:

``` text
create
edit
delete
ownership
permissions
task access
```

Attachments:

``` text
upload
list
access/download
delete
size validation
type validation
authorization
```

------------------------------------------------------------------------

# 62. Notifications

Test:

``` text
notification created from event
list current user's notifications
unread count
mark read
mark all read
cannot read another user's notification
```

------------------------------------------------------------------------

# 63. Dashboard & Reports

Test:

``` text
correct counts
correct status grouping
project filters
date filters
empty data
workspace isolation
permissions
large dataset behavior
```

Verify report numbers against known seeded data.

------------------------------------------------------------------------

# PART VIII -- DEFECT MANAGEMENT

# 64. Bug Report Standard

Every defect should include:

``` text
Title
Environment
Module
Severity
Preconditions
Steps to Reproduce
Expected Result
Actual Result
Evidence
Affected API/Page
Reporter
Status
```

Example:

``` text
Title:
Task can be assigned to non-project member

Environment:
QA

Severity:
P1

Steps:
1. Login as project manager
2. Open Project Alpha
3. Create task
4. Select user outside project
5. Submit

Expected:
Request rejected.

Actual:
Task created successfully.
```

------------------------------------------------------------------------

# 65. Severity Levels

## P0 -- Critical

``` text
system unavailable
authentication bypass
major data corruption
critical security exposure
```

## P1 -- High

``` text
core workflow broken
authorization defect
major data integrity issue
```

## P2 -- Medium

``` text
feature partially broken
workaround exists
```

## P3 -- Low

``` text
minor visual/text issue
non-blocking usability defect
```

------------------------------------------------------------------------

# 66. Defect Lifecycle

``` text
NEW
 ↓
TRIAGED
 ↓
IN PROGRESS
 ↓
FIXED
 ↓
READY FOR RETEST
 ↓
VERIFIED
 ↓
CLOSED
```

If still failing:

``` text
READY FOR RETEST
 ↓
REOPENED
```

------------------------------------------------------------------------

# 67. Retesting vs Regression

**Retesting** verifies the exact defect was fixed.

Example:

``` text
Bug:
Task assignment accepted non-member.

Retest:
Repeat same invalid assignment.
```

**Regression testing** verifies the fix did not break related behavior.

Example:

``` text
valid task assignment
task update
project members
Kanban
notifications
```

Both may be required.

------------------------------------------------------------------------

# PART IX -- 8-INTERN QA RESPONSIBILITY

# 68. Module Ownership

  Intern     QA Ownership
  ---------- -------------------------------------
  Intern 1   Auth/session tests
  Intern 2   User/profile tests
  Intern 3   RBAC/security authorization tests
  Intern 4   Project/member tests
  Intern 5   Team/sprint/backlog tests
  Intern 6   Task/Kanban/checklist tests
  Intern 7   Comment/attachment/time tests
  Intern 8   Dashboard/notification/report tests

Every intern must test their own module before PR review.

------------------------------------------------------------------------

# 69. Cross-Testing Rule

Developers should not be the only people who test their feature.

Recommended peer cross-test:

``` text
Intern 1 ↔ Intern 2
Intern 3 ↔ Intern 4
Intern 5 ↔ Intern 6
Intern 7 ↔ Intern 8
```

The peer should attempt unexpected flows, not merely repeat the
developer's happy-path demo.

------------------------------------------------------------------------

# 70. Daily QA Practice

Before daily status:

``` text
Run unit tests
Run module API tests
Test changed React flow
Review console/logs
Check validation
Check permissions
Push testable code
```

Before merge:

``` text
Self-test
Peer review
Automated checks
Relevant regression
```

------------------------------------------------------------------------

# PART X -- RELEASE QUALITY GATES

# 71. Pull Request Quality Gate

A PR should not merge if:

``` text
required tests fail
build fails
lint fails
critical validation missing
authorization missing
sensitive data exposed
known P0/P1 introduced
API contract unexpectedly broken
```

------------------------------------------------------------------------

# 72. Demo Day Quality Gate

Before Demo Day:

-   [ ] Critical user journey passes
-   [ ] Postman collection passes critical requests
-   [ ] Authentication works
-   [ ] Authorization works
-   [ ] Cross-workspace isolation tested
-   [ ] Main UI flows work
-   [ ] No known P0 defects
-   [ ] No unresolved P1 defects affecting demo
-   [ ] `develop`/release candidate builds
-   [ ] Demo data prepared
-   [ ] Console/logs reviewed

------------------------------------------------------------------------

# 73. Release Quality Gate

Before production release:

``` text
Unit suite passes
API suite passes
Integration suite passes
Critical UI suite passes
Regression suite passes
Security checklist passes
No P0
No unacceptable P1
Release candidate approved
Rollback strategy known
```

------------------------------------------------------------------------

# 74. Definition of Done -- Testing

A feature is not DONE until:

-   [ ] Unit tests exist for important logic
-   [ ] API success case tested
-   [ ] API validation cases tested
-   [ ] 401 tested where applicable
-   [ ] 403 tested where applicable
-   [ ] Not-found case tested
-   [ ] Business-rule failures tested
-   [ ] Integration with dependent modules tested
-   [ ] UI loading state tested
-   [ ] UI error state tested
-   [ ] UI success state tested
-   [ ] Permissions tested
-   [ ] Relevant regression completed
-   [ ] Security-sensitive behavior checked
-   [ ] Defects fixed/retested
-   [ ] PR checks pass

------------------------------------------------------------------------

# 75. Recommended Critical End-to-End Scenario

The primary ETMS acceptance flow is:

``` text
Login
  ↓
Create User
  ↓
Assign Role
  ↓
Create Project
  ↓
Add Project Member
  ↓
Create Team
  ↓
Create Sprint
  ↓
Create Task
  ↓
Assign Task
  ↓
Add Checklist
  ↓
Add Comment
  ↓
Upload Attachment
  ↓
Change Task Status
  ↓
Record Time
  ↓
Receive Notification
  ↓
View Dashboard
  ↓
View Report
  ↓
Logout
```

This flow should become a high-priority regression scenario.

------------------------------------------------------------------------

# 76. Negative End-to-End Scenario

Also verify:

``` text
Unauthenticated user
  ↓
Attempts protected API
  ↓
401

Authenticated viewer
  ↓
Attempts restricted create/update
  ↓
403

Workspace A user
  ↓
Attempts Workspace B resource
  ↓
Access denied / resource not exposed

Invalid task payload
  ↓
400 validation response
```

A system is not tested adequately if only successful scenarios are
demonstrated.

------------------------------------------------------------------------

# 77. QA Metrics

Useful sprint metrics:

``` text
tests executed
tests passed
tests failed
open defects
P0/P1 defects
reopened defects
automated test count
critical regression pass rate
```

Metrics should help identify risk, not encourage meaningless test-count
inflation.

------------------------------------------------------------------------

# 78. Test Documentation

Each module should maintain:

``` text
Test scenarios
Postman requests
Automated tests
Known limitations
Test data requirements
Regression impact notes
```

When an API contract changes, related tests must change in the same
development cycle.

------------------------------------------------------------------------

# 79. Final Testing Workflow

``` text
Requirement
   ↓
Test Scenarios
   ↓
Development
   ↓
Unit Testing
   ↓
API Testing
   ↓
Integration Testing
   ↓
UI Testing
   ↓
Security Testing
   ↓
Regression Testing
   ↓
Demo / UAT
   ↓
Release
```

Testing begins from the requirement, not after the developer says the
feature is finished.

------------------------------------------------------------------------

# 80. Conclusion

ETMS quality is a shared engineering responsibility.

Every intern must be able to answer:

``` text
What did I test?
What failed?
What negative cases did I test?
What permissions did I verify?
What modules could my change affect?
What regression did I run?
```

The enterprise standard is:

> **A feature is complete only when it works, fails safely, integrates
> correctly, protects data, passes regression, and can be demonstrated
> reliably.**

This QA process ensures that the eight independently developed ETMS
modules become one stable, secure, testable application.
