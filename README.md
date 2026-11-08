# Suchi

Light up every update.

Suchi is an academic information and communication platform built with a JavaScript React/Vite frontend and a JavaScript Express/MongoDB backend. It currently includes authentication and roles, academic routines/exams/notices, student submissions and review, comments, and optional Telegram delivery.

## Prerequisites

- Node.js 20.19 or newer
- npm 10 or newer
- MongoDB running locally, or a MongoDB connection URI

## Setup

Install both workspaces from the project root:

```bash
npm install
```

If `backend/.env` does not exist, copy `backend/.env.example` to that path. Set `MONGODB_URI` to a reachable database; the example URI is `mongodb://127.0.0.1:27017/suchi`. Set `JWT_SECRET` to a random value of at least 32 characters. Set `ADMIN_NAME`, `ADMIN_EMAIL`, and a strong `ADMIN_PASSWORD` of at least 12 characters for the initial admin.

After MongoDB is running, create the first admin once:

```bash
npm run seed:admin --workspace backend
```

Public registration always creates a student account. The seed command refuses to run if an active admin already exists.

## Run separately

Open two terminals from the project root.

Frontend:

```bash
npm run dev:frontend
```

Backend:

```bash
npm run dev:backend
```

The frontend runs at <http://localhost:5173>; the API runs at <http://localhost:4000>. Vite proxies `/api` requests to the backend. Check `GET /api/health` for service and database status.

Sign in at `/login` or register a student at `/register`. Auth sessions use an HttpOnly, SameSite=Lax cookie; cookies are Secure in production.

Run checks with `npm run lint`, `npm test`, and `npm run build`. The backend reports a clear setup or connection error if MongoDB is unavailable.

For labeled sample routines, exams, notices, and submissions, run `npm run seed:demo --workspace backend` after creating the Admin. The seed is idempotent and leaves existing records unchanged. See [Docs/demo-script.md](Docs/demo-script.md) for a walkthrough and [Docs/api.md](Docs/api.md) for endpoint details.

## Environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `PORT` | Express API port | `4000` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `CLIENT_ORIGIN` | Allowed browser origin for the API | `http://localhost:5173` |
| `JWT_SECRET` | JWT signing secret, at least 32 characters | Required in production |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Initial admin seed data | Required to seed admin |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Optional Telegram delivery | Disabled when unset |
| `PUBLIC_APP_URL` | Base URL used in Telegram links | `http://localhost:5173` |

Submissions use one `Submission` record throughout pending, approved, and rejected states. Approved records are the published feed; no duplicate content record is created. Telegram delivery is optional and happens only after persistence and publication.