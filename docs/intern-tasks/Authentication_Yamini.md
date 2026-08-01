# Authentication - Yamini

## Module Overview

Own the authentication foundation for ETMS. This module must provide login, JWT creation/verification, logout/session behavior, current-user API, password reset, auth middleware, frontend auth state, and protected routes. All other interns depend on the auth contract, so publish the contract on Day 1 even if implementation is incomplete.

## Execution Prompt

Read all `docs/*.md` files and inspect existing backend/frontend code. Generate and complete tasks for authentication using the documented MERN architecture. Create the backend auth module, auth middleware, frontend login/forgot/reset pages, route guards, auth state, tests, and Postman requests. Define the JWT and `req.user` contract first so other interns can work with mock auth until real authentication is merged.

## Backend Responsibilities

- Implement `backend/src/modules/auth`.
- Support login, logout, current user, forgot password, reset password, and token verification.
- Add password hashing and password comparison.
- Add JWT helper utilities and authentication middleware.
- Ensure disabled users cannot authenticate.
- Never return password hashes or reset tokens in responses.
- Coordinate JWT payload and `req.user` shape with users, roles, and permissions modules.

## Frontend Responsibilities

- Implement `frontend/src/features/auth`.
- Build login, forgot password, and reset password screens.
- Add auth service functions that call `axiosClient`.
- Add auth state through context or hook according to UI blueprint.
- Add protected route behavior.
- Attach bearer token to API requests.
- Handle expired/invalid sessions cleanly.

## API Endpoints To Implement Or Consume

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Authenticate active user and return JWT plus user summary |
| `POST` | `/api/v1/auth/logout` | End current session/token usage |
| `GET` | `/api/v1/auth/me` | Return current authenticated user |
| `POST` | `/api/v1/auth/forgot-password` | Generate password reset request |
| `POST` | `/api/v1/auth/reset-password` | Reset password using reset token |
| `POST` | `/api/v1/auth/refresh` | Refresh session if included by API spec |

## Database Collections And Models

- `users`: email, password hash, status, role references, profile fields.
- `usersessions`: active/expired session tracking if implemented.
- `passwordresettokens`: reset token hash, user reference, expiry, used flag.
- `auditlogs`: security events if shared audit logging is available.

## Folder/File Structure To Create Or Update

```text
backend/src/modules/auth/
  auth.routes.js
  auth.controller.js
  auth.service.js
  auth.repository.js
  auth.validation.js
  auth.mapper.js
backend/src/middleware/
  authenticate.js
frontend/src/features/auth/
  pages/LoginPage.jsx
  pages/ForgotPasswordPage.jsx
  pages/ResetPasswordPage.jsx
  services/authService.js
  hooks/useAuth.js
  components/ProtectedRoute.jsx
```

Shared files needing coordination: `backend/src/app.js`, `frontend/src/routes/AppRoutes.jsx`, `frontend/src/api/axiosClient.js`.

## Step-By-Step Task Checklist

- [ ] Read all project docs and current code.
- [ ] Publish auth contract: token format, `req.user`, response shape, error codes.
- [ ] Create auth routes and register under `/api/v1/auth`.
- [ ] Add validation for login and reset-password requests.
- [ ] Implement user lookup by email and password hash comparison.
- [ ] Implement JWT signing and verification with env-based secret/expiry.
- [ ] Implement `authenticate` middleware that sets `req.user`.
- [ ] Implement current-user response mapper.
- [ ] Implement password reset token generation/storage/expiry/usage.
- [ ] Add frontend auth pages and API service.
- [ ] Add token persistence strategy and axios bearer-token interceptor.
- [ ] Add protected route component and redirect behavior.
- [ ] Create Postman requests and backend tests.

## Validation Rules

- Email is required and must be valid.
- Password is required and must meet project password rules.
- Login fails for disabled/deleted users.
- Reset token must be valid, unexpired, and unused.
- New password must not be empty and should meet password policy.
- Authenticated endpoints require `Authorization: Bearer <token>`.

## Test Cases

- Valid login returns token and user summary.
- Invalid password returns standard error response.
- Missing email/password returns validation errors.
- Disabled user cannot login.
- `/auth/me` works with valid JWT.
- `/auth/me` fails with missing, expired, or malformed JWT.
- Logout succeeds and clears frontend auth state.
- Forgot password creates reset token without exposing it.
- Reset password works once and rejects reused/expired token.
- Protected frontend route redirects unauthenticated users to login.

## Integration Dependencies

- User module provides user profile/status fields.
- Role module provides role and permission data for auth user summary.
- All modules consume `authenticate` middleware and `req.user`.
- Frontend modules consume auth state and protected route behavior.

## Definition Of Done

- Auth API returns standard success/error responses.
- JWT middleware protects routes and sets documented `req.user`.
- Frontend login/logout/protected routes work.
- Password reset flow is implemented or clearly documented if email sending is mocked.
- Postman requests and test cases are available.
- Other interns can reliably integrate with auth.

## Sprint-Wise Responsibilities

| Sprint | Responsibility |
|---|---|
| Day 1 | Read docs, define auth API/JWT/`req.user` contract, create skeletons, share mock auth data. |
| Day 2 | Implement auth model dependencies, routes, validation, controller, password/JWT helpers. |
| Day 3 | Finish services/repositories/middleware and test auth API flows. |
| Day 4 | Build frontend auth pages, service, hook/context, protected route, axios token handling. |
| Day 5 | Replace mocks with real auth across app, verify RBAC integration with Venkat. |
| Day 6 | Finish auth tests, Postman collection, security checks, and auth documentation. |

