# Suchi API

Base URL: `http://localhost:4000/api`. The browser client sends the session cookie automatically. All API responses use JSON except successful `DELETE` responses, which return `204`.

## Authentication

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Public | Create a student account; submitted role fields are ignored |
| `POST` | `/auth/login` | Public | Start an HttpOnly cookie session |
| `POST` | `/auth/logout` | Public | Clear the session cookie |
| `GET` | `/auth/me` | Authenticated | Get the current public user |

## Academic content

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/routines` | Authenticated | List class routines |
| `POST` | `/routines` | Admin/CR | Create a routine |
| `PATCH` / `DELETE` | `/routines/:id` | Admin/CR | Update or remove a routine |
| `GET` | `/exams` | Authenticated | List exam schedules |
| `POST` | `/exams` | Admin/CR | Create an exam |
| `PATCH` / `DELETE` | `/exams/:id` | Admin/CR | Update or remove an exam |
| `GET` | `/notices` | Authenticated | List published notices |
| `POST` | `/notices` | Admin/CR | Publish a notice |
| `PATCH` / `DELETE` | `/notices/:id` | Admin/CR | Update or remove a notice |

## Submissions and comments

- `POST /submissions` creates a student submission as `pending`; Admin/CR submissions are published immediately.
- `GET /submissions/mine` returns only the current user's items.
- `GET /submissions/pending` is Admin/CR only.
- `GET /submissions/published` returns approved records only.
- `PATCH /submissions/:id` and `DELETE /submissions/:id` are limited to the owner while status is pending.
- `PATCH /submissions/:id/review` is Admin/CR only; body contains `decision: "approved" | "rejected"` and an optional `reviewNote`.
- `GET` and `POST /content/:contentType/:contentId/comments` require authentication and published content.
- `DELETE /comments/:id` is limited to the author, Admin, or CR moderator.
- `GET /notifications` is Admin/CR only and returns recent Telegram delivery logs.

## Common responses

- `400`: invalid input or identifier.
- `401`: missing, expired, or invalid session.
- `403`: authenticated user lacks the required role or ownership.
- `404`: requested item is missing or not published to the caller.
- `409`: duplicate account or invalid state transition.

The API is the authorization boundary. Frontend route guards are only a navigation aid.