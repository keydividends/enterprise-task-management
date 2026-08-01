# Document 08 -- Git Workflow Guide

**Project:** Enterprise Task Management System (ETMS)\
**Document Type:** Git Workflow, Collaboration & Release Guide\
**Version:** 1.0\
**Team Model:** 8 Interns + Technical Lead / Reviewer\
**Repository:** Single repository containing `frontend/` and `backend/`

------------------------------------------------------------------------

# 1. Purpose

This document defines the Git workflow for the ETMS project so that
eight interns can work on independent frontend and backend modules
without directly overwriting each other's work.

The guide establishes:

-   branch strategy;
-   branch naming;
-   commit standards;
-   pull request rules;
-   code review rules;
-   merge process;
-   release branches;
-   hotfix branches;
-   conflict resolution;
-   protected branch rules;
-   ownership expectations;
-   Definition of Done for Git work.

The main rule is:

> **No intern pushes application changes directly to `main`. Work moves
> through branches, pull requests, review, and controlled merging.**

------------------------------------------------------------------------

# 2. Repository Strategy

The project uses one repository:

``` text
enterprise-task-management/
├── frontend/
├── backend/
├── docs/
├── .github/
├── .gitignore
└── README.md
```

Frontend and backend remain separate applications inside the same
repository.

Example:

``` text
frontend/
├── src/
├── package.json
└── vite.config.js

backend/
├── src/
├── tests/
├── package.json
└── .env.example
```

This structure allows one pull request to contain coordinated
frontend/backend changes when necessary, while still keeping application
boundaries clear.

------------------------------------------------------------------------

# 3. Branch Strategy

ETMS uses a controlled feature-branch workflow with long-lived
integration and production branches.

``` text
main
  ↑
release/*
  ↑
develop
  ↑
feature/*
bugfix/*
refactor/*
docs/*
test/*
```

Production emergencies use:

``` text
main
  ↑
hotfix/*
```

After a hotfix reaches `main`, the same correction must be brought back
into `develop`.

------------------------------------------------------------------------

# 4. Permanent Branches

## 4.1 `main`

`main` represents production-ready code.

Rules:

-   protected branch;
-   no direct intern pushes;
-   only reviewed release/hotfix changes should reach it;
-   production releases should be tagged;
-   CI checks must pass before merge;
-   force pushes should be disabled.

Example:

``` text
main
├── v1.0.0
├── v1.1.0
└── v1.1.1
```

## 4.2 `develop`

`develop` is the primary integration branch for upcoming work.

Intern feature branches normally start from `develop` and return to
`develop` through pull requests.

``` text
develop
   ├── feature/task-create
   ├── feature/user-management
   ├── feature/project-members
   └── feature/dashboard-summary
```

`develop` should always remain buildable and suitable for team
integration testing.

------------------------------------------------------------------------

# 5. Working Branch Types

## Feature Branch

Used for new functionality.

``` text
feature/<ticket-or-module>-<short-description>
```

Examples:

``` text
feature/ETMS-101-login-api
feature/ETMS-118-user-management
feature/ETMS-205-task-create
feature/ETMS-220-kanban-board
feature/ETMS-310-notification-center
```

## Bugfix Branch

Used for non-production bugs found during development/testing.

``` text
bugfix/ETMS-241-task-status-validation
bugfix/ETMS-155-user-pagination
```

## Refactor Branch

Used for internal restructuring without intentional functional change.

``` text
refactor/ETMS-330-task-service
```

## Documentation Branch

``` text
docs/ETMS-401-api-examples
```

## Test Branch

``` text
test/ETMS-402-auth-integration-tests
```

## Release Branch

``` text
release/1.0.0
release/1.1.0
```

## Hotfix Branch

``` text
hotfix/1.0.1-login-failure
hotfix/1.1.1-token-refresh
```

------------------------------------------------------------------------

# 6. Branch Naming Rules

Branch names should:

-   use lowercase letters;
-   use hyphens rather than spaces;
-   include a task/ticket number when available;
-   describe one unit of work;
-   avoid personal names as the main identifier.

Good:

``` text
feature/ETMS-205-task-create
bugfix/ETMS-241-task-status-validation
```

Avoid:

``` text
subbu-branch
manasa-work
new-code
final
final-latest
testing123
my-changes
```

The branch should describe the work, not the person.

------------------------------------------------------------------------

# 7. Starting New Work

Before starting:

``` bash
git checkout develop
git pull origin develop
```

Create a branch:

``` bash
git checkout -b feature/ETMS-205-task-create
```

Confirm:

``` bash
git branch
```

Expected:

``` text
  develop
* feature/ETMS-205-task-create
```

An intern should not begin a new module from an old unrelated feature
branch.

------------------------------------------------------------------------

# 8. Daily Development Workflow

Recommended sequence:

``` text
1. Update local develop
2. Create/switch to assigned branch
3. Implement a small logical change
4. Run application/tests
5. Review git diff
6. Stage intended files
7. Commit with meaningful message
8. Push branch
9. Continue work
10. Open PR when reviewable
```

Commands:

``` bash
git status
git diff

git add backend/src/modules/tasks/task.service.js
git add backend/src/modules/tasks/task.controller.js

git commit -m "feat(tasks): add task creation service"

git push -u origin feature/ETMS-205-task-create
```

After the first push:

``` bash
git push
```

------------------------------------------------------------------------

# 9. Never Commit Secrets

Never commit:

``` text
.env
production credentials
JWT signing secrets
database passwords
API keys
private certificates
access tokens
refresh tokens
password reset tokens
cloud credentials
```

Commit an example configuration instead:

``` text
.env.example
```

Example:

``` env
PORT=5000
MONGODB_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
```

Real values remain outside Git.

If a real secret is accidentally committed, deleting the line in a later
commit is not enough. Inform the lead immediately and rotate/revoke the
exposed credential.

------------------------------------------------------------------------

# 10. Commit Message Standard

ETMS uses Conventional Commit-style messages:

``` text
<type>(<scope>): <short description>
```

Common types:

  Type         Purpose
  ------------ ------------------------------------
  `feat`       New functionality
  `fix`        Bug fix
  `refactor`   Internal restructuring
  `docs`       Documentation
  `test`       Tests
  `chore`      Maintenance/tooling
  `style`      Formatting without behavior change
  `perf`       Performance improvement
  `build`      Build/dependency configuration
  `ci`         CI/CD configuration

Examples:

``` text
feat(auth): add login endpoint
feat(tasks): add task assignment API
fix(users): handle invalid user id
fix(kanban): restore card after failed status update
refactor(projects): extract member repository
test(auth): add refresh token tests
docs(api): document task endpoints
chore(deps): update development dependencies
```

------------------------------------------------------------------------

# 11. Commit Message Rules

Good commit messages answer:

``` text
What changed?
Where did it change?
```

Good:

``` text
feat(sprints): add sprint creation validation
fix(tasks): prevent assignment to inactive user
```

Bad:

``` text
changes
updated
done
working code
final
today work
fixed issue
code completed
```

Use imperative, concise wording.

Prefer:

``` text
add task validation
```

rather than:

``` text
added task validation
```

------------------------------------------------------------------------

# 12. Commit Size

A commit should represent one logical change.

Prefer:

``` text
Commit 1: feat(tasks): add task schema
Commit 2: feat(tasks): add task repository
Commit 3: feat(tasks): add create task service
Commit 4: test(tasks): add task creation tests
```

Avoid one huge commit such as:

``` text
feat: complete whole application
```

Also avoid committing every keystroke. The goal is a reviewable history.

------------------------------------------------------------------------

# 13. Pull Request Workflow

When work is ready:

``` bash
git status
git push
```

Create a pull request:

``` text
feature/ETMS-205-task-create
            ↓
         develop
```

Normal intern work should target `develop`, not `main`.

------------------------------------------------------------------------

# 14. Pull Request Title

Use the same clarity as commit messages.

Example:

``` text
feat(tasks): implement task creation API
```

Other examples:

``` text
feat(users): add user management screens
fix(auth): handle expired refresh tokens
feat(kanban): persist task status changes
```

Avoid:

``` text
Please merge
My work
Day 5 code
Task completed
Final changes
```

------------------------------------------------------------------------

# 15. Pull Request Template

Recommended `.github/pull_request_template.md`:

``` md
## Summary

Describe what this PR implements.

## Ticket

ETMS-XXX

## Modules Changed

- [ ] Frontend
- [ ] Backend
- [ ] Database/model
- [ ] Documentation
- [ ] Tests

## Changes

- Change 1
- Change 2
- Change 3

## API Changes

List added/changed endpoints or write `None`.

## Database Changes

List schema/index/migration-impact changes or write `None`.

## Testing

Explain how the change was tested.

## Postman / UI Verification

Describe relevant requests or UI flow.

## Screenshots

Add screenshots for visible UI changes when useful.

## Security Checklist

- [ ] No secrets committed
- [ ] Authentication applied where required
- [ ] Authorization applied where required
- [ ] Input validation implemented

## Final Checklist

- [ ] Application builds
- [ ] Tests pass
- [ ] No avoidable console errors
- [ ] API follows specification
- [ ] Self-review completed
```

------------------------------------------------------------------------

# 16. Draft Pull Requests

Use a draft PR when:

-   implementation is still underway;
-   early architectural feedback is needed;
-   another intern needs visibility into an upcoming contract;
-   the code should not yet be merged.

A draft PR should not be treated as completed work.

------------------------------------------------------------------------

# 17. Self-Review Before Requesting Review

Before requesting review, the author must inspect:

``` bash
git status
git diff develop...HEAD
```

Check:

-   accidental files;
-   debug logs;
-   commented-out experiments;
-   hardcoded URLs;
-   credentials;
-   duplicate code;
-   incorrect endpoint names;
-   missing validation;
-   missing authorization;
-   unused imports;
-   formatting/lint failures.

The author is the first reviewer.

------------------------------------------------------------------------

# 18. Code Review Process

Recommended flow:

``` text
Intern completes branch
        ↓
Self-review
        ↓
Open PR to develop
        ↓
Automated checks
        ↓
Peer/Lead review
        ↓
Changes requested?
   ┌────┴────┐
  Yes        No
   ↓          ↓
Fix + push   Approval
   ↓          ↓
Re-review    Merge
```

Reviewers should review behavior and architecture, not only syntax.

------------------------------------------------------------------------

# 19. Backend Review Checklist

For backend PRs verify:

-   routes match REST API specification;
-   authentication middleware exists;
-   authorization is correct;
-   validation is present;
-   controller remains thin;
-   service owns business logic;
-   repository owns database access;
-   workspace/project scope is enforced;
-   errors use standard exception handling;
-   sensitive fields are not returned;
-   pagination exists where required;
-   soft-delete rules are followed;
-   indexes/model changes match database design;
-   tests cover important paths.

------------------------------------------------------------------------

# 20. Frontend Review Checklist

For React PRs verify:

-   route is correct;
-   page uses service layer;
-   API URLs are not duplicated in components;
-   loading state exists;
-   error state exists;
-   empty state exists;
-   forms validate input;
-   protected routes are protected;
-   permission-sensitive actions are handled;
-   reusable components are reused;
-   no token is hardcoded;
-   no avoidable console warnings/errors;
-   responsive behavior is reasonable.

------------------------------------------------------------------------

# 21. Review Comments

Review comments should be specific and actionable.

Good:

``` text
This controller performs a Mongoose query directly.
Please move the query into task.repository.js and call it through the service.
```

Good:

``` text
TASK_DELETE requires authorization middleware according to the API contract.
Please add the permission check before the controller.
```

Avoid:

``` text
Bad code.
Change this.
Wrong.
```

Review the code, not the person.

------------------------------------------------------------------------

# 22. Review Decision Types

A reviewer can:

### Approve

The change is ready to merge.

### Comment

Feedback exists but is not necessarily merge-blocking.

### Request Changes

Important issues must be fixed before merge.

Examples of blocking issues:

-   security problem;
-   broken build;
-   failing tests;
-   incorrect API contract;
-   data-loss risk;
-   missing authorization;
-   secrets committed;
-   major architecture violation.

------------------------------------------------------------------------

# 23. Responding to Review Feedback

The author should:

1.  read every comment;
2.  make required changes;
3.  commit the fixes;
4.  push to the same branch;
5.  reply to resolved discussions where useful;
6.  request re-review.

Example:

``` bash
git add .
git commit -m "fix(tasks): enforce project membership validation"
git push
```

Do not open another PR for review fixes belonging to the same work item.

------------------------------------------------------------------------

# 24. Keeping a Feature Branch Updated

If `develop` changes while the feature is in progress:

``` bash
git checkout develop
git pull origin develop

git checkout feature/ETMS-205-task-create
git merge develop
```

Resolve conflicts locally, test again, commit the merge if required,
then:

``` bash
git push
```

A team may choose rebasing for cleaner history, but interns should not
rewrite shared branch history casually. Use the workflow chosen by the
lead consistently.

------------------------------------------------------------------------

# 25. Merge Conflicts

Example conflict:

``` text
<<<<<<< HEAD
const API_URL = "/api/v1/tasks";
=======
const API_URL = "/api/v1/task";
>>>>>>> develop
```

Do not simply delete markers without understanding both changes.

Resolution process:

``` text
1. Identify what each branch changed.
2. Compare against the agreed architecture/API contract.
3. Keep or combine the correct implementation.
4. Remove conflict markers.
5. Run tests/build.
6. Stage resolved files.
7. Complete merge.
```

Commands:

``` bash
git status
git add path/to/resolved-file
git commit
git push
```

If the conflict involves another intern's module, discuss it with that
owner rather than guessing.

------------------------------------------------------------------------

# 26. Merge Strategy

Recommended default for feature PRs:

**Squash and merge** into `develop`.

Example feature history:

``` text
feat(tasks): add model
feat(tasks): add repository
fix(tasks): review corrections
test(tasks): add tests
```

can become:

``` text
feat(tasks): implement task creation API
```

in `develop`.

Benefits:

-   clean integration history;
-   one logical commit per PR;
-   easier rollback;
-   easier release notes.

The team may retain individual commits for unusually large work where
commit history itself provides meaningful value.

------------------------------------------------------------------------

# 27. Who Can Merge?

Recommended:

``` text
Intern
  → creates PR
Reviewer/Lead
  → approves
Authorized maintainer
  → merges
```

Interns should not self-approve and immediately merge important work
unless the project lead explicitly allows it.

------------------------------------------------------------------------

# 28. Protected Branch Rules

Recommended protection for `main`:

``` text
Require pull request
Require approvals
Require passing status checks
Require resolved conversations
Block force push
Block branch deletion
Restrict direct pushes
```

Recommended protection for `develop`:

``` text
Require pull request
Require at least one approval
Require CI checks
Require resolved conversations
Block force push
```

------------------------------------------------------------------------

# 29. CI Checks Before Merge

At minimum, automated checks should verify relevant applications.

Frontend:

``` bash
npm ci
npm run lint
npm run build
npm test
```

Backend:

``` bash
npm ci
npm run lint
npm test
```

The exact commands should match the repository's `package.json`.

A PR with failing required checks should not be merged merely because it
works on one developer's machine.

------------------------------------------------------------------------

# 30. Release Branch Strategy

When `develop` contains the features planned for a release:

``` bash
git checkout develop
git pull origin develop
git checkout -b release/1.0.0
git push -u origin release/1.0.0
```

Release branches are for stabilization, not unrelated new features.

Allowed work:

-   release testing;
-   bug fixes;
-   version changes;
-   release documentation;
-   deployment configuration corrections;
-   final integration corrections.

Avoid adding new unplanned features during release stabilization.

------------------------------------------------------------------------

# 31. Release Flow

``` text
feature branches
      ↓
   develop
      ↓
release/1.0.0
      ↓
 QA / UAT
      ↓
 final fixes
      ↓
    main
      ↓
   v1.0.0
```

After production release, ensure release corrections are also
represented in `develop`.

------------------------------------------------------------------------

# 32. Semantic Versioning

Use:

``` text
MAJOR.MINOR.PATCH
```

Example:

``` text
1.0.0
```

### MAJOR

Breaking/incompatible release.

``` text
1.0.0 → 2.0.0
```

### MINOR

Backward-compatible feature release.

``` text
1.0.0 → 1.1.0
```

### PATCH

Backward-compatible bug fix.

``` text
1.1.0 → 1.1.1
```

------------------------------------------------------------------------

# 33. Release Tags

After approved release reaches `main`:

``` bash
git checkout main
git pull origin main

git tag -a v1.0.0 -m "ETMS version 1.0.0"
git push origin v1.0.0
```

Tags identify the exact source code used for a production version.

Do not move an existing production tag to different code.

------------------------------------------------------------------------

# 34. Hotfix Branches

A hotfix is for an urgent production problem.

Examples:

-   login completely broken;
-   production API crashes;
-   critical authorization failure;
-   severe data integrity bug;
-   release-blocking security issue.

A normal backlog bug is not automatically a hotfix.

------------------------------------------------------------------------

# 35. Creating a Hotfix

Hotfixes start from production code:

``` bash
git checkout main
git pull origin main

git checkout -b hotfix/1.0.1-login-failure
```

Implement the smallest safe correction.

``` bash
git add .
git commit -m "fix(auth): handle production login failure"
git push -u origin hotfix/1.0.1-login-failure
```

Open a PR into `main`.

------------------------------------------------------------------------

# 36. Hotfix Flow

``` text
main
  ↓
hotfix/1.0.1-login-failure
  ↓
review + tests
  ↓
main
  ↓
v1.0.1
```

Then propagate the fix:

``` text
main/hotfix result
      ↓
   develop
```

This prevents a future release from reintroducing the production bug.

------------------------------------------------------------------------

# 37. Hotfix Rules

A hotfix should:

-   solve the production incident;
-   remain small;
-   include tests where practical;
-   receive review;
-   avoid unrelated refactoring;
-   be tagged as a patch release after deployment;
-   be synchronized back to `develop`.

Do not combine:

``` text
production login fix
+ dashboard redesign
+ dependency cleanup
+ task refactor
```

into one hotfix.

------------------------------------------------------------------------

# 38. Reverting a Bad Change

If a merged change causes serious problems, reverting can be safer than
manually editing production code.

Example:

``` bash
git log --oneline
git revert <commit-hash>
git push
```

For protected branches, perform the revert on a dedicated branch and use
a PR according to team policy.

Never repair production by editing files directly on the server and
leaving Git unaware of the change.

------------------------------------------------------------------------

# 39. Intern Module Isolation

Eight interns can work independently using module branches.

Example:

``` text
Intern 1
feature/ETMS-101-authentication

Intern 2
feature/ETMS-120-users

Intern 3
feature/ETMS-140-roles-permissions

Intern 4
feature/ETMS-160-projects

Intern 5
feature/ETMS-180-teams-sprints

Intern 6
feature/ETMS-200-tasks

Intern 7
feature/ETMS-240-comments-attachments

Intern 8
feature/ETMS-280-dashboard-reports
```

However, long-running branches containing an entire multi-week module
should be avoided where possible.

Prefer smaller branches:

``` text
feature/ETMS-201-task-model
feature/ETMS-202-create-task-api
feature/ETMS-203-task-list-api
feature/ETMS-204-task-details-ui
```

Smaller PRs reduce conflicts and review difficulty.

------------------------------------------------------------------------

# 40. Shared Files

Files likely to cause conflicts include:

``` text
frontend/src/app/router.jsx
frontend/src/App.jsx
backend/src/app.js
backend/src/routes/index.js
package.json
package-lock.json
README.md
shared middleware
shared constants
```

Rules:

-   coordinate before large shared-file edits;
-   keep changes minimal;
-   do not reformat an entire shared file for one small feature;
-   inform the lead when changing a common contract;
-   update your branch before resolving shared-file conflicts.

------------------------------------------------------------------------

# 41. Dependency Changes

When adding a package:

``` bash
npm install <package>
```

Commit both:

``` text
package.json
package-lock.json
```

The PR description should explain why the dependency is required.

Do not add multiple libraries that solve the same problem without team
agreement.

------------------------------------------------------------------------

# 42. Database and API Contract Changes

Changes affecting shared contracts require additional care.

Examples:

``` text
renaming task.status
changing role permission names
changing /api/v1/tasks
removing a response property
changing MongoDB relationship fields
```

Before merging:

1.  verify Documents 03/04/05/06;
2.  identify frontend/backend impact;
3.  coordinate with affected module owners;
4.  update tests;
5.  update documentation.

Do not silently break another intern's module.

------------------------------------------------------------------------

# 43. Pull Request Size

Prefer reviewable PRs.

A PR should ideally represent one story or coherent unit:

``` text
Create Task API
Task List UI
User Deactivation
Sprint Creation
Notification Preferences
```

Avoid PRs such as:

``` text
Complete backend
Complete frontend
All sprint work
50 files changed for unrelated reasons
```

Large PRs hide defects and increase conflicts.

------------------------------------------------------------------------

# 44. Pull Request Dependencies

Sometimes one PR depends on another.

Example:

``` text
PR A: Task API
PR B: Task React page consuming Task API
```

Preferred approach:

``` text
Merge API contract/backend first
       ↓
Update frontend branch from develop
       ↓
Complete/merge frontend PR
```

If work must proceed simultaneously, both interns should use the agreed
Document 04 contract rather than inventing temporary incompatible APIs.

------------------------------------------------------------------------

# 45. Code Ownership

Recommended `.github/CODEOWNERS` concept:

``` text
/backend/src/modules/auth/           @auth-reviewer
/backend/src/modules/tasks/          @task-reviewer
/frontend/src/features/tasks/        @task-reviewer
/docs/                               @project-lead
```

For an internship project, the lead may remain a required reviewer for
all sensitive areas.

High-sensitivity areas include:

``` text
authentication
authorization
security middleware
database configuration
deployment configuration
release workflows
```

------------------------------------------------------------------------

# 46. Example Complete Feature Workflow

Task: **ETMS-205 -- Create Task API**

### Step 1

``` bash
git checkout develop
git pull origin develop
```

### Step 2

``` bash
git checkout -b feature/ETMS-205-task-create
```

### Step 3

Implement:

``` text
task validation
task repository method
task service method
task controller
route
tests
```

### Step 4

``` bash
npm test
npm run lint
```

### Step 5

``` bash
git status
git diff
```

### Step 6

``` bash
git add backend/src/modules/tasks
git commit -m "feat(tasks): implement task creation API"
```

### Step 7

``` bash
git push -u origin feature/ETMS-205-task-create
```

### Step 8

Open:

``` text
feature/ETMS-205-task-create → develop
```

### Step 9

Reviewer requests project-membership validation.

### Step 10

``` bash
git add .
git commit -m "fix(tasks): validate project membership on creation"
git push
```

### Step 11

CI passes and reviewer approves.

### Step 12

Squash merge:

``` text
feat(tasks): implement task creation API
```

------------------------------------------------------------------------

# 47. Example Release Workflow

Assume version `1.0.0` is ready.

``` bash
git checkout develop
git pull origin develop
git checkout -b release/1.0.0
git push -u origin release/1.0.0
```

QA finds a report export bug.

Create the fix on the release branch according to team
permissions/review rules.

After stabilization:

``` text
release/1.0.0
      ↓ PR
main
```

Tag:

``` bash
git checkout main
git pull origin main
git tag -a v1.0.0 -m "ETMS version 1.0.0"
git push origin v1.0.0
```

Then synchronize release corrections into `develop`.

------------------------------------------------------------------------

# 48. Example Hotfix Workflow

Production version:

``` text
v1.0.0
```

Critical login problem:

``` bash
git checkout main
git pull origin main
git checkout -b hotfix/1.0.1-login-failure
```

After fix:

``` bash
git add .
git commit -m "fix(auth): correct login token validation"
git push -u origin hotfix/1.0.1-login-failure
```

PR:

``` text
hotfix/1.0.1-login-failure → main
```

After approval and deployment:

``` bash
git checkout main
git pull origin main
git tag -a v1.0.1 -m "ETMS version 1.0.1"
git push origin v1.0.1
```

Then ensure the same correction reaches `develop`.

------------------------------------------------------------------------

# 49. Git Commands Interns Must Know

## Inspect

``` bash
git status
git branch
git log --oneline
git diff
```

## Branch

``` bash
git checkout develop
git checkout -b feature/ETMS-205-task-create
git switch develop
git switch -c feature/ETMS-205-task-create
```

## Update

``` bash
git pull origin develop
git fetch origin
```

## Stage and Commit

``` bash
git add <file>
git add .
git commit -m "feat(tasks): add task creation API"
```

`git add .` should be used only after checking `git status`.

## Push

``` bash
git push
git push -u origin <branch>
```

## Merge

``` bash
git merge develop
```

## Undo Local Unstaged Change

``` bash
git restore <file>
```

Use destructive Git commands carefully and ask the lead when uncertain.

------------------------------------------------------------------------

# 50. Actions Interns Should Avoid

Do not casually use:

``` bash
git push --force
git reset --hard
git clean -fd
```

These can destroy or rewrite work.

Also avoid:

``` text
direct push to main
direct push to develop
committing .env
merging without review
deleting another intern's branch
rewriting a shared branch
resolving unfamiliar conflicts by guessing
```

------------------------------------------------------------------------

# 51. Git Ignore Baseline

Example:

``` gitignore
# dependencies
node_modules/

# environment
.env
.env.*
!.env.example

# builds
dist/
build/

# logs
*.log
logs/

# coverage
coverage/

# editor/OS
.vscode/
.idea/
.DS_Store
Thumbs.db

# local uploads if not intended for source control
uploads/
```

Adjust the final file to project requirements.

------------------------------------------------------------------------

# 52. Definition of Done -- Pull Request

A PR is ready to merge only when:

-   assigned work is complete;
-   branch name follows convention;
-   commits are meaningful;
-   PR targets the correct branch;
-   PR description is complete;
-   no secrets are present;
-   build succeeds;
-   lint passes;
-   required tests pass;
-   API contract is respected;
-   database changes are documented;
-   authentication/authorization are correct;
-   UI states are handled where relevant;
-   reviewer comments are resolved;
-   required approvals exist;
-   merge conflicts are resolved;
-   CI is green.

------------------------------------------------------------------------

# 53. Team Workflow Summary

Normal feature:

``` text
develop
   ↓
feature/*
   ↓
Pull Request
   ↓
Code Review
   ↓
CI
   ↓
develop
```

Release:

``` text
develop
   ↓
release/*
   ↓
QA/UAT
   ↓
main
   ↓
version tag
```

Production emergency:

``` text
main
   ↓
hotfix/*
   ↓
review/test
   ↓
main
   ↓
patch tag
   ↓
develop
```

------------------------------------------------------------------------

# 54. Recommended Rules for the 8-Intern Team

1.  Each intern receives clearly defined tickets/modules.
2.  Each ticket uses its own branch whenever practical.
3.  All normal work starts from updated `develop`.
4.  No direct intern changes to `main`.
5.  No direct intern changes to `develop`.
6.  Every integration happens through a pull request.
7.  Authors self-review before requesting review.
8.  At least one approval is required for `develop`.
9.  Production/security-sensitive changes should require lead approval.
10. CI must pass.
11. Shared contracts must be coordinated.
12. Merge conflicts are resolved by understanding both changes.
13. Release branches contain stabilization work only.
14. Hotfix branches start from `main`.
15. Hotfix corrections are propagated to `develop`.
16. Production releases receive immutable version tags.
17. Secrets never enter Git.
18. Commit history should explain the evolution of the system.

------------------------------------------------------------------------

# 55. Final Git Workflow

The ETMS development workflow is:

``` text
                    ┌──────────────────┐
                    │     feature/*    │
                    └────────┬─────────┘
                             │ PR
                             ▼
                    ┌──────────────────┐
                    │     develop      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   release/x.y.z  │
                    └────────┬─────────┘
                             │ PR
                             ▼
                    ┌──────────────────┐
                    │       main       │
                    └────────┬─────────┘
                             │
                             ▼
                         vX.Y.Z
```

Production emergencies:

``` text
main
 │
 ▼
hotfix/x.y.z-description
 │
 ├──────────────→ main → patch tag
 │
 └──────────────→ develop
```

This workflow gives the eight-intern ETMS team independent development
space while protecting shared integration and production code through
pull requests, reviews, automated checks, controlled releases and
traceable Git history.

------------------------------------------------------------------------

# 56. Conclusion

Git is not only a place to store ETMS source code. It is the
collaboration and change-control system for the project.

Every intern should understand this sequence:

``` text
Ticket
  ↓
Branch
  ↓
Code
  ↓
Commit
  ↓
Push
  ↓
Pull Request
  ↓
Review
  ↓
Automated Tests
  ↓
Merge
  ↓
Release
```

Following this process consistently will allow the team to work on
independent modules while integrating into one enterprise application
with a maintainable, reviewable and production-safe source history.
