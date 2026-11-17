# Suchi

Light up every update.

Suchi is an academic information and communication platform built with a JavaScript React/Vite frontend and a JavaScript Express/MongoDB backend. It currently includes authentication and roles, academic routines/exams/notices, student submissions and review, comments, and optional Telegram delivery.

## Prerequisites

- Node.js 20.19 or newer
- npm 10 or newer
- MongoDB running locally, or a MongoDB connection URI

## Quick Start

### 1. Install Dependencies
Run from the project root (this installs packages for the root, frontend, and backend workspaces):

```bash
npm install
```

### 2. Environment Configuration
- **Backend**: Ensure `backend/.env` exists (copy `backend/.env.example` if starting fresh). Set:
  - `MONGODB_URI`: Your MongoDB connection string (local or MongoDB Atlas).
  - `JWT_SECRET`: A secure random string (at least 32 characters).
  - `PORT`: (Default `4000`) Express server port.
  - `CLIENT_ORIGIN`: (Default `http://localhost:5173`) Allowed frontend origin for CORS.
- **Frontend**: No configuration required! Vite dev server automatically proxies all `/api` requests to `http://localhost:4000`.

### 3. Seed Initial Admin (Fresh Database Only)
If starting with a brand new, empty database, create the initial administrator account:

```bash
npm run seed:admin --workspace backend
```

> [!NOTE]
> If your database already has an active admin user (e.g., when connecting to the existing cloud database), this command will be skipped automatically as only one initial seed admin is allowed.

*(Optional)* For sample routines, exams, notices, and submissions:
```bash
npm run seed:demo --workspace backend
```
The seed is idempotent and leaves existing records unchanged. See [Docs/demo-script.md](Docs/demo-script.md) for a walkthrough and [Docs/api.md](Docs/api.md) for endpoint details.

---

## Running the Application

### Option 1: Run Both Concurrently (Recommended)
From the project root, launch both frontend and backend together in one terminal:

```bash
npm run dev
```

### Option 2: Run Separately in Two Terminals
From the project root:

- **Frontend terminal:**
  ```bash
  npm run dev:frontend
  ```
- **Backend terminal:**
  ```bash
  npm run dev:backend
  ```

---

## Access & Verification

- **Frontend App**: <http://localhost:5173>
- **Backend API**: <http://localhost:4000>
- **Health Check**: <http://localhost:4000/api/health> (returns database & service status)
- **Login / Register**:
  - Sign in at `/login` with your credentials.
  - Register new student accounts at `/register`.

---

## Testing & Quality Checks

Run all workspace checks from the root:

```bash
npm run lint         # Run ESLint across all workspaces
npm test             # Run backend and frontend unit tests
npm run build        # Build frontend assets for production
```

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