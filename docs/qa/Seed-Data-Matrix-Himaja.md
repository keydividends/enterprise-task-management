# Seed Data Matrix — Himaja

**Last Updated:** Initial inspection run

---

## Seed Scripts Available

| Script | Command | Storage | Status |
|--------|---------|---------|--------|
| `seedUsers.js` | `npm run seed:users` | MongoDB | ✅ Ready |
| `seedProjects.js` | `npm run seed:projects` | MongoDB | ✅ Ready |
| `seedTasks.js` | `npm run seed:tasks` | MongoDB | ✅ Ready |
| `seedTeams.js` | `node scripts/seedTeams.js` | In-memory (team service) | ⚠️ In-memory only — lost on restart |
| `role.seed.js` | Auto-runs on app start | MongoDB | ✅ Ready |

---

## Entity Matrix

### users

| Record | Email | Role | Status | Permissions | Demo Purpose |
|--------|-------|------|--------|-------------|--------------|
| Admin User | admin@etms.com | ADMIN | ACTIVE | Full set (17 keys) | Login, create everything |
| Demo User | demo@etms.com | USER | ACTIVE | Task + Team perms | Regular user flows |
| Disabled User | disabled@etms.com | USER | DISABLED | None | Test disabled-account rejection |

**Missing:** No seed user with DEVELOPER or MANAGER role to test RBAC permission boundaries.  
**Missing:** No seed user with only PROJECT_VIEW to test project isolation.  
**Action required:** Add 2 more seed users (one DEVELOPER, one MANAGER role) for regression coverage.

---

### roles

| Role | Type | Permissions | Status |
|------|------|-------------|--------|
| ADMIN | System | All 31 permissions | ✅ Seeded via role.seed.js |
| USER | System | 7 read permissions | ✅ Seeded |
| DEVELOPER | Custom | 15 permissions | ✅ Seeded |
| MANAGER | Custom | 27 permissions | ✅ Seeded |

---

### permissions

| Count | Modules Covered | Status |
|-------|----------------|--------|
| 31 total | USER, ROLE, PROJECT, TEAM, TASK, SPRINT, DASHBOARD, REPORT, NOTIFICATION, ATTACHMENT, COMMENT | ✅ Seeded via role.seed.js |

---

### projects

| Record | Key | Status | Manager | Members | Demo Purpose |
|--------|-----|--------|---------|---------|--------------|
| Enterprise Task Management | ETMS | ACTIVE | User[0] (64a1...001) | 5 members | Primary demo project |
| Payment Gateway | PAY | PLANNING | User[1] (64a1...002) | 2 members | Secondary project |
| Mobile App | MOB | ON_HOLD | User[2] (64a1...003) | 2 members | On-hold state demo |

**Issue:** Project seed uses hardcoded ObjectIds (64a1...001–005) that do NOT match the users seeded by seedUsers.js (which generates new ObjectIds). → BUG-007  
**Action required:** Coordinate seedProjects.js to reference actual user IDs from seedUsers.js output.

---

### projectmembers

| Project | Members Seeded | Roles | Status |
|---------|---------------|-------|--------|
| ETMS | 5 | PROJECT_MANAGER, TEAM_LEAD, DEVELOPER, QA_TESTER, VIEWER | ✅ Seeded |
| PAY | 2 | PROJECT_MANAGER, DEVELOPER | ✅ Seeded |
| MOB | 2 | PROJECT_MANAGER, DEVELOPER | ✅ Seeded |

**Same ID mismatch issue as projects above.** → BUG-007

---

### teams

| Record | Lead | Members | Storage | Demo Purpose |
|--------|------|---------|---------|--------------|
| Platform Engineering | mock-admin | mock-maya, mock-alex | In-memory | Team list demo |
| Frontend Core | mock-maya | mock-alex | In-memory | Team detail demo |
| QA & Testing | mock-admin | none | In-memory | Empty members state |
| DevOps | mock-admin | mock-maya | In-memory | Team member demo |

**Critical issue:** Teams use in-memory storage with mock user IDs (mock-admin, mock-maya, mock-alex). These IDs do not correspond to real MongoDB user documents. → BUG-008  
**Action required:** Teams module needs MongoDB persistence or seed data must align with real user IDs.

---

### teammembers

Stored inside team objects in-memory. Same issue as teams above. → BUG-008

---

### sprints

| Status | Notes |
|--------|-------|
| ❌ No sprint collection | No sprint model, no sprint routes, no sprint seed |

Tasks reference `sprintId` in seedTasks.js using mock sprint IDs from `task.mockData.js`. Sprint data is mock-only.  
**Action required:** Sprint module is not implemented. Tasks with sprintId will have dangling references.

---

### tasks

| Count | Project | Statuses Covered | Labels | Checklists | Demo Purpose |
|-------|---------|-----------------|--------|------------|--------------|
| 15 tasks | ETMS (64a2...001) | TODO, IN_PROGRESS, QA, BACKLOG, IN_REVIEW, DONE, CANCELLED | 5 labels | 1 checklist (IN_REVIEW tasks) | Board, list, filters, dashboard |

**Issue:** Tasks reference project ID 64a2...001 and user IDs 64a1...001–005 which must exist in MongoDB. Run seedProjects.js before seedTasks.js.  
**Missing:** No seed comments or attachments linked to tasks.

---

### taskassignments

Handled via `primaryAssigneeId` on task documents. No separate taskassignments collection seeded.

---

### labels

| Count | Project | Colors | Status |
|-------|---------|--------|--------|
| 5 labels | ETMS | Frontend(#6366f1), Backend(#10b981), Bug(#ef4444), High Prio(#f59e0b), Design(#ec4899) | ✅ Seeded via seedTasks.js |

---

### checklists / checklistitems

| Count | Task | Items | Status |
|-------|------|-------|--------|
| 1 checklist | IN_REVIEW tasks | 3 items (2 complete, 1 incomplete) | ✅ Seeded via seedTasks.js |

---

### comments

| Status | Notes |
|--------|-------|
| ❌ Not seeded | No seed script for comments |

**Action required:** Add seed comments to at least 2 tasks for demo flow.

---

### attachments

| Status | Notes |
|--------|-------|
| ⚠️ Files exist in uploads/ | 15 files in uploads/attachments/ but no seed records in DB |

**Action required:** Add seed attachment metadata records linked to tasks.

---

### dashboardwidgets

| Status | Notes |
|--------|-------|
| ❌ Not seeded | Dashboard module not implemented |

---

## Seed Execution Order

Run in this order to avoid foreign key / reference failures:

```
1. node scripts/seedUsers.js          (creates users with real ObjectIds)
2. node src/modules/roles/role.seed.js (auto-runs on app start)
3. node scripts/seedProjects.js        (requires user IDs — see BUG-007)
4. node scripts/seedTasks.js           (requires project IDs)
5. node scripts/seedTeams.js           (in-memory only — see BUG-008)
```

---

## Missing Seed Data for Demo Flow

| Entity | Missing | Priority | Owner |
|--------|---------|----------|-------|
| Comments | No seed records | High | Bhavinash |
| Attachments | No DB records (files exist) | High | Bhavinash |
| Sprints | No model or seed | Medium | LakshmiPrasanna |
| Dashboard widgets | No model or seed | Low | Konaiah |
| DEVELOPER/MANAGER users | No seed users with these roles | Medium | Himaja/Raheema |
