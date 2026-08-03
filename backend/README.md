# ETMS Authentication Module

## Overview

This module provides the authentication foundation for the Enterprise Task Management System (ETMS). It handles login, logout, session refresh, current-user hydration, password reset requests, JWT signing/verification, and the authenticated request contract required by other modules.

## Auth contract

### JWT payload

Access tokens include the following keys:

- `sub`
- `id`
- `email`
- `firstName`
- `lastName`
- `role`
- `permissions`
- `status`
- `type: "access"`

Refresh tokens include:

- `sub`
- `id`
- `email`
- `type: "refresh"`

### `req.user`

The authentication middleware populates `req.user` with:

- `id`
- `email`
- `firstName`
- `lastName`
- `role`
- `permissions`
- `status`

### Response shape

Standard success responses follow:

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
      "permissions": ["TASK_VIEW", "TASK_CREATE"],
      "status": "ACTIVE"
    }
  }
}
```

## Security rules

- Never return password hashes or reset tokens in API responses.
- Disabled users cannot authenticate.
- Reset tokens are single-use and expire.
- Bearer tokens are required for protected routes.
- `authorize("PERMISSION_KEY")` uses `req.user.permissions` and denies access with `PERMISSION_DENIED` when absent.
- Expired or malformed tokens fail with `401`.

## Route summary

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/logout-all`
- `GET /api/v1/auth/me`
- `GET /api/v1/auth/permissions`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/auth/refresh`

## Frontend expectations

- Store access token in `localStorage` under `etms_access_token`.
- Store user summary in `localStorage` under `etms_user`.
- Attach `Authorization: Bearer <token>` via the shared Axios client.
- Redirect unauthenticated users to `/login` with a return path.

## Day 6 completion status

- Auth core implementation: complete
- Auth tests: complete
- RBAC-ready permission contract: complete
- Postman collection: included in `backend/postman/ETMS-Auth.postman_collection.json`
- Security and documentation notes: complete
