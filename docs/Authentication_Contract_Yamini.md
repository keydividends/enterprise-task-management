# Authentication Contract

## JWT contract

- Access token is a signed JWT using the app secret from `JWT_SECRET`.
- Access token payload contains at minimum: `sub`, `id`, `email`, `firstName`, `lastName`, `role`, `permissions`, `status`, and `type: "access"`.
- Refresh token payload contains at minimum: `sub`, `id`, `email`, and `type: "refresh"`.
- `req.user` is populated by the authentication middleware with:
  - `id`
  - `email`
  - `firstName`
  - `lastName`
  - `role`
  - `permissions`
  - `status`

## Response contract

### Login success

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>",
    "user": {
      "id": "USER_ID",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@etms.com",
      "role": "ADMIN",
      "permissions": ["USER_VIEW", "TASK_VIEW"],
      "status": "ACTIVE"
    }
  }
}
```

### Current user success

```json
{
  "success": true,
  "data": {
    "id": "USER_ID",
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@etms.com",
    "role": "ADMIN",
    "permissions": ["USER_VIEW", "TASK_VIEW"],
    "status": "ACTIVE"
  }
}
```

### Standard error

```json
{
  "success": false,
  "code": "AUTH_INVALID_CREDENTIALS",
  "message": "Invalid email or password."
}
```

## Frontend token strategy

- Store the access token in `localStorage` under `etms_access_token`.
- Store the authenticated user summary in `localStorage` under `etms_user`.
- Attach `Authorization: Bearer <token>` in every authenticated request via the Axios interceptor.
- Redirect unauthenticated users to `/login` and allow a return path via router state.

## Security rules

- Never return password hashes or reset tokens in API responses.
- Disabled users cannot authenticate.
- Reset tokens must be single-use and expire.
- Protected routes require a valid access token.
