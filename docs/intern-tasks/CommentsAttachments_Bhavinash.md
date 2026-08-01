# Comments And Attachments - Bhavinash

## Module Overview

Own collaboration on tasks through comments and attachments. This module manages task comments, optional replies, attachment metadata, file upload/download/delete flows, frontend comment panels, and file UI.

## Execution Prompt

Read all `docs/*.md` files and inspect existing backend/frontend code. Generate and complete tasks for comments and attachments using the documented architecture. Coordinate with Manasa for task access and with Yamini/Venkat for auth and permissions. Build APIs, upload handling, UI, tests, and Postman requests.

## Backend Responsibilities

- Implement `backend/src/modules/comments`.
- Implement `backend/src/modules/attachments`.
- Create comment CRUD for tasks.
- Support replies if documented or needed.
- Create attachment upload/list/download/delete endpoints.
- Validate file size/type and access permissions.
- Store attachment metadata safely.
- Never expose files to unauthorized users.

## Frontend Responsibilities

- Implement `frontend/src/features/comments`.
- Build comments panel, comment form, edit/delete actions, and reply UI if included.
- Build attachment upload, progress/error, file list, download, and delete UI.
- Integrate comments/attachments into task detail page through agreed component contract.

## API Endpoints To Implement Or Consume

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/tasks/:taskId/comments` | List task comments |
| `POST` | `/api/v1/tasks/:taskId/comments` | Add task comment |
| `PATCH` | `/api/v1/comments/:commentId` | Edit comment |
| `DELETE` | `/api/v1/comments/:commentId` | Delete comment |
| `GET` | `/api/v1/tasks/:taskId/attachments` | List task attachments |
| `POST` | `/api/v1/tasks/:taskId/attachments` | Upload task attachment |
| `GET` | `/api/v1/attachments/:attachmentId/download` | Download attachment |
| `DELETE` | `/api/v1/attachments/:attachmentId` | Delete attachment |
| `GET` | `/api/v1/comments/:commentId/attachments` | List comment attachments if included |
| `POST` | `/api/v1/comments/:commentId/attachments` | Upload comment attachment if included |

## Database Collections And Models

- `comments`: comment text, task reference, author, parent comment, timestamps.
- `attachments`: file metadata, owner, linked task/comment/project, storage path/key.
- `tasks`: consumed for access checks.
- `users`: consumed for author display.
- `activitylogs`: shared event logging if available.

## Folder/File Structure To Create Or Update

```text
backend/src/modules/comments/
  comment.routes.js
  comment.controller.js
  comment.service.js
  comment.repository.js
  comment.validation.js
  comment.mapper.js
  comment.model.js
backend/src/modules/attachments/
  attachment.routes.js
  attachment.controller.js
  attachment.service.js
  attachment.repository.js
  attachment.validation.js
  attachment.mapper.js
  attachment.model.js
frontend/src/features/comments/
  components/CommentsPanel.jsx
  components/CommentForm.jsx
  components/CommentItem.jsx
  components/AttachmentList.jsx
  components/AttachmentUploader.jsx
  services/commentService.js
  services/attachmentService.js
  hooks/useComments.js
  hooks/useAttachments.js
```

## Step-By-Step Task Checklist

- [ ] Read comments, attachments, file security, API, UI, and QA docs.
- [ ] Define comment and attachment contracts.
- [ ] Confirm task access contract with Manasa.
- [ ] Choose upload middleware/storage approach with reviewer approval.
- [ ] Implement comment and attachment models.
- [ ] Implement validations for comments and files.
- [ ] Implement repositories and services with ownership/access rules.
- [ ] Implement controllers/routes and register routes.
- [ ] Add seed comments/attachment metadata for tests.
- [ ] Build frontend services/hooks.
- [ ] Build comments panel and attachment UI.
- [ ] Add API, file security, manual UI, and Postman tests.

## Validation Rules

- Comment text is required and cannot be only whitespace.
- Comment author comes from `req.user`, not request body.
- Only authorized users can view comments on a task.
- Only author or privileged user can edit/delete comment.
- Attachment must pass size and type validation.
- Attachment must belong to accessible task/comment/project.
- Download/delete must enforce authorization.

## Test Cases

- Create comment succeeds.
- Edit comment succeeds for owner.
- Delete comment succeeds for owner/authorized user.
- Unauthorized comment access is denied.
- Task access is required for comments.
- Upload valid attachment succeeds.
- Invalid file size/type is rejected.
- List/download/delete attachment enforces authorization.
- Comments UI loads, posts, edits, and deletes.
- Attachment UI uploads, lists, downloads, and deletes.

## Integration Dependencies

- Depends on auth/RBAC for author and permission rules.
- Depends on task module for task access checks.
- Provides comment/attachment counts to dashboard/reports if needed.
- May trigger notifications/activity logs.

## Definition Of Done

- Comment and attachment APIs work with protected access.
- File upload validation is enforced.
- Frontend task detail can show comments and attachments.
- Tests and Postman requests cover comment ownership, upload security, and unauthorized access.

## Sprint-Wise Responsibilities

| Sprint | Responsibility |
|---|---|
| Day 1 | Read docs, define comment/attachment contracts, coordinate task access, create skeletons. |
| Day 2 | Build models/routes/validation/controllers and seed test data. |
| Day 3 | Build services/repositories/access rules/upload handling and API tests. |
| Day 4 | Build comments and attachment UI/services/hooks. |
| Day 5 | Integrate with real auth/tasks/RBAC and test task-detail collaboration flow. |
| Day 6 | Finish tests, Postman requests, file security checklist, documentation, and fixes. |

