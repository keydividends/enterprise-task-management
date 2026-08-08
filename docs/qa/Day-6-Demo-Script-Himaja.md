# Day 6 Demo Script — Himaja

**Purpose:** Step-by-step demo walkthrough for the final ETMS presentation.  
**Status:** Draft — update once all modules are stable.

---

## Demo Prerequisites

- Backend running at `http://localhost:5000`
- Frontend running at `http://localhost:5173`
- MongoDB running with seed data loaded:
  ```
  npm run seed:users
  npm run seed:projects
  npm run seed:tasks
  ```
- Postman open with ETMS collections loaded (optional, for API demo)
- Browser open at `http://localhost:5173`

---

## Demo Flow

### Scene 1 — Login (2 min)

**Narrator:** "The ETMS application requires authentication. Let's log in as the admin user."

1. Open `http://localhost:5173` → redirects to `/login`
2. Enter email: `admin@etms.com`, password: `Admin@123`
3. Click Login
4. **Expected:** Redirect to `/dashboard`
5. Show dashboard page — stats cards, activity timeline
6. **Note:** Dashboard currently shows static data. Konaiah's module will connect live metrics.

**Fallback if login fails:** Use Postman — POST `/api/v1/auth/login`, copy accessToken, show `/dashboard` directly.

---

### Scene 2 — User Management (2 min)

**Narrator:** "Admins can manage users across the system."

1. Navigate to `/users`
2. Show user list — admin, demo, disabled users
3. Click "Create User" → `/users/create`
4. Fill in: firstName=Demo, lastName=Presenter, email=presenter@etms.com, role=USER
5. Submit → user created
6. Navigate to new user's detail page
7. Show status badge, profile fields

---

### Scene 3 — Roles & Permissions (2 min)

**Narrator:** "The RBAC system controls what each user can do."

1. Navigate to `/roles`
2. Show role list — ADMIN, USER, DEVELOPER, MANAGER
3. Click DEVELOPER role → show permission matrix
4. Show PermissionGate component in action (if visible in UI)
5. Navigate to `/roles/create` — show role creation form

---

### Scene 4 — Project Management (2 min)

**Narrator:** "Projects are the top-level containers for work."

1. Navigate to `/projects`
2. Show project list — ETMS, Payment Gateway, Mobile App
3. Click ETMS project → project detail page
4. Show project members tab
5. Add a new member (use the presenter user created in Scene 2)
6. Show task summary for the project

---

### Scene 5 — Team Management (2 min)

**Narrator:** "Teams group users for collaboration."

1. Navigate to `/teams`
2. Show team list
3. Click a team → team detail
4. Show team members
5. Navigate to `/teams/create` — create a "Demo Team"
6. Add a member to the team

---

### Scene 6 — Task Management (3 min)

**Narrator:** "Tasks are the core unit of work in ETMS."

1. Navigate to `/tasks`
2. Show task list with filters
3. Navigate to `/tasks/board` — show kanban board with columns
4. Click a task → task detail page
5. Show: title, status, priority, assignee, labels, checklist
6. Change task status (e.g., TODO → IN_PROGRESS)
7. Navigate to `/tasks/new` — create a new task
8. Fill in: title, project (ETMS), priority (HIGH), assign to admin
9. Submit → task created, appears in board

---

### Scene 7 — Comments & Attachments (2 min)

**Narrator:** "Users can collaborate on tasks through comments and file attachments."

1. Open a task detail page
2. Scroll to Comments panel
3. Type a comment and submit → comment appears
4. Edit the comment → updated text shown
5. Scroll to Attachments panel
6. Upload a file (any small file)
7. Show file in attachment list
8. Click download link

---

### Scene 8 — Dashboard (1 min)

**Narrator:** "The dashboard provides a real-time overview of delivery health."

1. Navigate to `/dashboard`
2. Show stats cards, portfolio overview chart, recent tasks
3. **Note:** "Dashboard is currently showing representative data. The live API integration is in progress by Konaiah."

---

### Scene 9 — Logout (30 sec)

1. Click logout button in navigation
2. **Expected:** Redirect to `/login`, localStorage cleared
3. Attempt to navigate to `/dashboard` → redirected to `/login`

---

## Demo Contingency Plan

| Issue | Fallback |
|-------|---------|
| Backend not running | Use Postman to show API responses |
| MongoDB not seeded | Use mock-token in Postman headers |
| Login fails | Show auth.test.js passing in terminal |
| Dashboard empty | Explain BUG-006 status, show static UI |
| Teams lost on restart | Re-run seedTeams.js before demo |

---

## Demo Checklist (Pre-Demo)

- [ ] Backend starts without errors
- [ ] Frontend builds without errors
- [ ] `npm run seed:users` completed
- [ ] `npm run seed:projects` completed
- [ ] `npm run seed:tasks` completed
- [ ] Login with admin@etms.com works
- [ ] `/tasks/board` shows tasks in columns
- [ ] At least one comment can be posted
- [ ] At least one file can be uploaded
- [ ] All frontend routes load without console errors
- [ ] Known bugs documented and owners notified
