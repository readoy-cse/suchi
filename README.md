# Suchi

Light up every update.

Suchi is an academic information and communication platform. The current Phase 1 foundation contains a JavaScript React/Vite frontend and a JavaScript Express backend, as described in [Docs/architecture.md](Docs/architecture.md).

## Prerequisites

- Node.js 20.19 or newer
- npm 10 or newer
- MongoDB running locally, or a MongoDB connection URI

## Setup

Install the applications independently:

```bash
npm --prefix frontend install
npm --prefix backend install
```

Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI`. The example URI is `mongodb://127.0.0.1:27017/suchi`.

## Run separately

Open two terminals from the project root.

Frontend:

```bash
npm --prefix frontend run dev
```

Backend:

```bash
npm --prefix backend run dev
```

The frontend runs at <http://localhost:5173>; the API runs at <http://localhost:4000>. Vite proxies `/api` requests to the backend. Check `GET /api/health` for service and database status.

Build the frontend with `npm --prefix frontend run build`. The backend reports a clear setup or connection error if MongoDB is unavailable.

## Environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `PORT` | Express API port | `4000` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `CLIENT_ORIGIN` | Allowed browser origin for the API | `http://localhost:5173` |

Authentication, academic modules, submission approval, and Telegram notifications are intentionally not part of Phase 1.