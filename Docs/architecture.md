# Suchi — Project Architecture

**Tagline:** Light up every update.  
**Project type:** Academic information, communication, and contribution platform  
**Purpose:** A centralized platform where students can access verified academic updates, contribute events/news/suggestions for review, and discuss published content.

---

## 1. Product Overview

Suchi brings class-related academic information into one organized web platform. It reduces the problem of updates being scattered across Messenger/Telegram groups, personal messages, and documents.

The platform supports three roles:

- **Admin:** Full system control, including user management and role changes.
- **CR (Class Representative):** Manages class academic information and reviews student submissions.
- **General Student:** Reads published information, submits events/news/suggestions for approval, and comments on published content.

All users must authenticate to access the platform. Public registration creates a `student` account only. Admin and CR privileges must never be selectable from the public registration form.

**Core principle:** Only approved/published content is visible to the general student audience. Student submissions must not become public automatically.

## 2. Goals and Scope

### MVP goals

1. Authentication for all users.
2. Role-based access control (RBAC) for Admin, CR, and Student.
3. Student dashboard with published academic information.
4. CR management of routines, exam schedules, notices, suggestions, and events.
5. Student-submitted events/news/suggestions with an approval workflow.
6. Comments on published content.
7. Telegram notifications for successfully published or updated content.
8. Submission status visibility for the student who submitted it.

### Out of scope for the first version

- Multiple institutions and complex multi-tenant support.
- Private student-to-student chat.
- Real-time video or audio.
- Mobile native applications.
- Google Calendar integration.
- Automated scheduled reminders/cron jobs.
- Complex analytics and recommendation engines.
- Publicly accessible academic content without login.

Keep the first implementation suitable for a small university Web Programming project. Prefer a working, understandable MVP over unnecessary enterprise complexity.

## 3. Roles and Permissions

### Admin

Admin has full authority:

- View, create, update, deactivate, and manage users.
- Change a user's role among `admin`, `cr`, and `student`.
- Assign or remove CR privileges.
- Manage all academic content.
- Review, approve, or reject student submissions.
- Edit or remove content created by CRs or students.
- Moderate comments.
- View basic activity/audit logs.

Protect against accidental privilege escalation. Public registration must always assign `student` on the server, regardless of any role field sent by the client.

### CR

CR manages class-level academic information:

- Create, update, and delete class routines.
- Create, update, and delete exam schedules and exam suggestions.
- Publish academic notices.
- Create and manage class events.
- Review student-submitted events, news, and suggestions.
- Approve or reject submissions with an optional review note.
- Moderate comments where permitted by the authorization policy.

CR must not manage users' roles or create Admin accounts.

### General Student

Student permissions:

- View published routines, exam schedules, notices, events, and suggestions.
- Submit an event, news item, or suggestion for review.
- Comment on published content.
- View their own submissions and each submission's status.
- Edit or withdraw their own pending submission.
- View review notes when a submission is rejected.

Students cannot publish directly, manage academic schedules, approve submissions, or change roles.

## 4. Permission Matrix

| Capability | Admin | CR | Student |
|---|---:|---:|---:|
| View published academic content | Yes | Yes | Yes |
| Manage users | Yes | No | No |
| Change user roles | Yes | No | No |
| Manage class routine | Yes | Yes | No |
| Manage exam schedule/suggestions | Yes | Yes | No |
| Publish academic notices | Yes | Yes | No |
| Create/manage class events | Yes | Yes | Submit for approval |
| Submit news/suggestions | Yes | Yes | Submit for approval |
| Review student submissions | Yes | Yes | No |
| Comment on published content | Yes | Yes | Yes |
| Moderate/delete comments | Yes | Limited/allowed by policy | No |
| View own submission status | Yes | Yes | Yes |

Authorization must be enforced by the backend API, not only by hiding frontend buttons or routes.

## 5. Content Approval Workflow

Student-created content uses a moderation lifecycle:

1. Student submits an event, news item, or suggestion.
2. Backend validates the data and stores it with `status: "pending"`.
3. Admin or CR reviews the submission.
4. Reviewer approves or rejects it. A rejection note may be provided.
5. On approval, the content becomes published and visible to authenticated students.
6. Telegram notification is sent only after successful publication, if Telegram integration is enabled.
7. The submitting student can see the status and review note.

Allowed statuses:

- `pending`
- `approved`
- `rejected`

Do not expose pending or rejected student submissions in public/student content feeds. The submitter and authorized reviewers may see them according to permissions.

### Telegram reliability

Database persistence must happen before attempting Telegram delivery. A Telegram API failure must never undo or lose a saved/published update. Store delivery outcome in `NotificationLogs` and show an appropriate status to authorized users. Do not send Telegram notifications for pending submissions.

## 6. Main Modules

### Authentication and user management

- Register student.
- Login and logout.
- Get current authenticated user.
- Admin user list and user detail.
- Admin role update and account activation/deactivation.
- Secure password hashing using bcrypt.
- JWT-based authentication.

Prefer an HttpOnly, Secure (in production), SameSite cookie for JWT storage. If the implementation uses a bearer token instead, document the storage choice and protect against XSS/CSRF risks appropriately. Never store plain-text passwords.

### Student dashboard

- Latest published notices.
- Upcoming classes and exams.
- Latest approved events and suggestions.
- Recent academic updates.
- Student's pending/rejected submissions and review feedback.
- Links to details and downloadable resources.

### Class routine

Each routine entry may include:

- Course title and course code.
- Teacher/instructor.
- Day and time.
- Room.
- Topic or note.
- Optional resource/material/recording URL.

### Exam schedule and suggestions

- Course and course code.
- Exam type.
- Date, time, and room.
- Topics/chapters.
- Optional suggestion text, previous-question file, or resource link.

### Notices

- Title, body, category, publication date.
- Optional attachment or external resource.
- Author and timestamps.

### Events, news, and suggestions

- Title, type (`event`, `news`, `suggestion`), description.
- Optional event date/time/location.
- Optional resource/attachment.
- Submitter, status, reviewer, review note, and timestamps.

CR/Admin-created content can be published directly according to permissions. Student-created content must enter the approval workflow.

### Comments

- Comments are attached to published content.
- Store author, content reference, text, and timestamps.
- Authenticated users can comment.
- Admin can moderate all comments.
- Define and consistently enforce CR moderation permissions.
- Validate length and sanitize/render user text safely.

### Telegram notifications

- Send a concise notification after CR/Admin publishes or updates an item.
- Send student-submission notifications only after approval.
- Include a link to the relevant Suchi page.
- Keep bot token on the backend in environment variables.
- Store success/failure in `NotificationLogs`.
- Telegram must be an auxiliary notification channel; Suchi remains the source of truth.

## 7. Suggested Technology Stack

### Frontend

- React
- Vite
- JavaScript (ES modules; JSX in the frontend)
- Tailwind CSS
- React Router
- Axios or a small fetch client
- React Hook Form + Zod (optional, if useful)

### Backend

- Node.js
- Express.js
- JavaScript (ES modules)
- MongoDB
- Mongoose
- JWT
- bcrypt
- Zod or express-validator
- Multer for file uploads, if local uploads are included

### Integrations

- Telegram Bot API
- Optional local filesystem storage for development; document the production storage approach.

Use compatible, stable package versions and keep dependencies minimal.

## 8. High-Level Architecture

```text
Browser (React + Vite)
        |
        | HTTPS / REST API
        v
Express Backend
  |-- Authentication & RBAC middleware
  |-- User management
  |-- Academic content services
  |-- Submission review service
  |-- Comments service
  |-- Telegram notification service
  |
  +------ MongoDB (Mongoose)
  |
  +------ Telegram Bot API
```

Frontend route guards improve navigation and user experience, but backend middleware is the security boundary.

## 9. Suggested Project Structure

A simple monorepo is recommended:

```text
suchi/
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── routines/
│   │   │   ├── exams/
│   │   │   ├── notices/
│   │   │   ├── submissions/
│   │   │   ├── events/
│   │   │   ├── comments/
│   │   │   └── users/
│   │   ├── layouts/
│   │   ├── lib/
│   │   └── routes/
│   └── ...
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── routines/
│   │   │   ├── exams/
│   │   │   ├── notices/
│   │   │   ├── submissions/
│   │   │   ├── events/
│   │   │   ├── comments/
│   │   │   └── notifications/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   └── ...
├── Docs/
│   └── architecture.md
├── .gitignore
├── package.json
└── README.md
```

Each application has its own package manifest. Root scripts can run the frontend and backend independently. Backend secrets belong in `backend/.env`, which must not be committed.

The agent may adjust this structure if it has a clear reason, but it must preserve module boundaries and update this document if the structure changes.

## 10. Suggested MongoDB Collections

### User

```js
{
  name: String,
  email: String,          // unique, normalized
  passwordHash: String,
  role: "admin" | "cr" | "student",
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Routine

```js
{
  courseTitle: String,
  courseCode: String,
  teacher: String,
  day: String,
  startTime: String,
  endTime: String,
  room: String,
  topic: String,
  resourceUrl: String,
  createdBy: ObjectId,
  updatedAt: Date
}
```

### Exam

```js
{
  courseTitle: String,
  courseCode: String,
  examType: String,
  date: Date,
  startTime: String,
  room: String,
  topics: [String],
  suggestion: String,
  resourceUrl: String,
  createdBy: ObjectId,
  updatedAt: Date
}
```

### Notice

```js
{
  title: String,
  body: String,
  category: String,
  attachmentUrl: String,
  createdBy: ObjectId,
  publishedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Submission

```js
{
  title: String,
  type: "event" | "news" | "suggestion",
  description: String,
  eventDate: Date,
  location: String,
  resourceUrl: String,
  submittedBy: ObjectId,
  status: "pending" | "approved" | "rejected",
  reviewedBy: ObjectId,
  reviewedAt: Date,
  reviewNote: String,
  publishedContentId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

Suchi uses the unified `Submission` model as the published record. Approval changes the record's status to `approved`; authenticated student feeds query approved records only. The content is not copied into a second collection.

### Comment

```js
{
  contentType: String,
  contentId: ObjectId,
  author: ObjectId,
  body: String,
  createdAt: Date,
  updatedAt: Date
}
```

### NotificationLog

```js
{
  contentType: String,
  contentId: ObjectId,
  channel: "telegram",
  status: "sent" | "failed",
  errorMessage: String,
  sentAt: Date,
  createdAt: Date
}
```

Add indexes for unique email and common queries such as status, createdAt, courseCode, and content references where appropriate.

## 11. API Design (Initial Proposal)

All endpoints are under `/api`.

### Auth

- `POST /auth/register` — public; always creates a student.
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

### Users (Admin)

- `GET /users`
- `GET /users/:id`
- `PATCH /users/:id/role`
- `PATCH /users/:id/status`

### Academic content (CR/Admin)

- `/routines` — GET published/list, POST, PATCH `/:id`, DELETE `/:id`
- `/exams` — GET, POST, PATCH `/:id`, DELETE `/:id`
- `/notices` — GET, POST, PATCH `/:id`, DELETE `/:id`

### Student submissions

- `POST /submissions`
- `GET /submissions/mine`
- `PATCH /submissions/:id` — submitter may edit only while pending.
- `DELETE /submissions/:id` — submitter may withdraw only while pending.
- `GET /submissions/pending` — Admin/CR.
- `PATCH /submissions/:id/review` — Admin/CR; approve or reject with optional note.
- `GET /submissions/published` — authenticated users; approved items only.

### Comments

- `GET /content/:contentType/:contentId/comments`
- `POST /content/:contentType/:contentId/comments`
- `DELETE /comments/:id` — author under defined conditions, Admin, or authorized moderator.

API details may evolve. Keep validation, response format, status codes, and access rules consistent.

## 12. Security Requirements

- Hash passwords with bcrypt; never log or return password hashes.
- Public registration must hardcode `role: "student"` on the server.
- Do not trust role, author ID, reviewer ID, or status sent by the client.
- Apply authentication and role authorization middleware to protected endpoints.
- Validate all request bodies, params, and query values.
- Restrict upload size, MIME types, and file extensions; generate safe filenames.
- Keep secrets in `.env`; commit only `.env.example`.
- Configure CORS for the known frontend origin.
- Add Helmet and sensible rate limiting for authentication endpoints.
- Prevent users from editing another user's submissions.
- Do not reveal pending/rejected submissions to other students.
- Escape or safely render user-generated text to prevent XSS.
- Use soft deactivation for user accounts where appropriate.
- Record important admin actions and review decisions.

## 13. UI / Page Map

### Public pages

- Login
- Student registration

### Authenticated student experience

- Student dashboard
- Routine
- Exam schedule and suggestions
- Notice board
- Events/news/suggestions feed (approved only)
- Content details and comments
- Submit content
- My submissions and statuses
- Profile

### CR experience

- CR dashboard
- Manage routine
- Manage exam schedules/suggestions
- Manage notices
- Manage events
- Submission review queue
- Comment moderation (if enabled)

### Admin experience

- Admin dashboard
- User management and role assignment
- All content management
- Submission review queue
- Comment moderation
- Activity logs

Navigation and dashboard widgets must be role-aware.

## 14. UX and Design Direction

Product identity:

- Name: **Suchi**
- Tagline: **Light up every update.**

Design goals:

- Modern, clean, academic, friendly, and responsive.
- Strong information hierarchy; updates should be easy to scan.
- Clear status indicators: Pending, Approved/Published, Rejected.
- Consistent empty, loading, success, and error states.
- Accessible contrast, keyboard focus, and form labels.
- Mobile-first responsive layout.
- Avoid excessive gradients, animation, and decorative clutter.
- Use a consistent design system for spacing, typography, buttons, cards, badges, and forms.

## 15. Implementation Phases

Build in small, testable phases. Do not generate the entire application in one uncontrolled pass.

### Phase 1 — Foundation

- Create monorepo structure.
- Set up React/Vite client and Express server.
- Configure JavaScript tooling, linting, environment variables, MongoDB connection.
- Add health endpoint and basic responsive app shell.
- Write setup instructions.

### Phase 2 — Authentication and RBAC

- Student registration, login, logout, current-user endpoint.
- Seed the first Admin securely through a script.
- Admin can assign CR role.
- Backend auth and role middleware.
- Frontend role-aware routes and navigation.
- Test that students cannot access CR/Admin APIs.

### Phase 3 — Academic modules

- Routine, exams, notices CRUD for CR/Admin.
- Student read-only views.
- Form validation and resource links.

### Phase 4 — Student contribution and approval

- Student creates event/news/suggestion submissions.
- My Submissions status page.
- Admin/CR review queue.
- Approve/reject with review note.
- Approved content appears in student feed.

### Phase 5 — Comments and Telegram

- Comments on published content.
- Comment moderation.
- Telegram notification after successful publication/update/approval.
- Notification logs and graceful failure handling.

### Phase 6 — Quality and demo readiness

- Test role permissions and approval workflow.
- Responsive and accessibility pass.
- Seed demo data.
- Add README, architecture documentation, API notes, and demo script.

## 16. Acceptance Criteria

The MVP is not complete until these scenarios work:

1. A visitor can register, and the resulting account is always `student`.
2. A student cannot assign themselves `admin` or `cr`, even by editing the API request.
3. Admin can change a user's role to CR.
4. Student, CR, and Admin see the correct dashboard/navigation.
5. Student cannot create or update routine, exam, or notice records.
6. Student can submit an event/news/suggestion; it remains pending.
7. Other students cannot see pending or rejected submissions.
8. CR/Admin can approve or reject a submission.
9. Approved content becomes visible to authenticated students.
10. Rejected content remains hidden and the submitter can see the review note.
11. Authenticated users can comment on published content.
12. Telegram is notified only after content is published; Telegram failure does not lose database data.
13. Secrets are not exposed in frontend code or committed files.
14. README explains installation, environment variables, seeding, and running both apps.

## 17. Development Rules for AI Coding Agents

- Read this file before writing or modifying code.
- Treat this architecture as the source of truth.
- Do not rename the product or alter the tagline.
- Do not remove role distinctions or the student approval workflow.
- Never make student submissions public before approval.
- Never trust frontend-only authorization.
- Do not add unrequested features that expand the MVP.
- Before each phase, state the intended files and implementation plan.
- Implement one phase at a time and run available checks.
- Do not overwrite working code or documentation without inspecting it first.
- Keep code modular, readable, and suitable for a university project demonstration.
- Update this architecture and README when an approved design decision changes.
- If a requirement is ambiguous or conflicts with this document, ask before making a major architectural change.
"""

prompt = r"""
# VS Code AI Agent Prompt — Start Suchi

You are the lead full-stack engineer working inside my VS Code workspace. Build a complete, clean, maintainable university Web Programming project named **Suchi**.

**Tagline:** Light up every update.

## First: inspect, do not rush

1. Inspect the current workspace and all existing files before changing anything.
2. Read `Docs/architecture.md` completely. If it does not exist, create it from the architecture specification I provide separately before implementing features.
3. Do not delete, overwrite, or restructure existing work without understanding it.
4. If the workspace is empty, initialize the project as a simple monorepo with `frontend` and `backend`.
5. Give me a short implementation plan and the proposed folder structure first. Then proceed with Phase 1 only.

## Product requirements

Suchi is a centralized academic information and communication platform. It helps students access verified class updates and contribute useful events, news, and suggestions.

There are exactly three roles:

### Admin
- Full system control.
- Manage users and change roles (`admin`, `cr`, `student`).
- Manage all academic content.
- Approve/reject student submissions.
- Moderate comments and view basic activity logs.

### CR (Class Representative)
- Create, update, and delete class routines, exam schedules/suggestions, notices, and events.
- Review student-submitted events, news, and suggestions.
- Approve/reject submissions with an optional review note.
- No user-role management and no Admin creation.

### General Student
- Must log in to access the platform.
- View published academic information.
- Submit events, news, and suggestions for approval.
- Comment on published content.
- View own submission status and review notes.
- Edit/withdraw own submissions only while pending.
- Cannot directly publish academic updates or approve content.

## Non-negotiable rules

- All platform pages and academic content require authentication, except login and student registration.
- Public registration always creates a `student` account. The backend must ignore/reject any submitted `role` value. Never allow public Admin/CR registration.
- Admin account is created through a secure seed script. Admin assigns CR role from the Admin dashboard.
- Enforce RBAC in backend middleware for every protected API. Frontend route guards are for UX only.
- Student-created content must be stored as `pending`; it must never appear in the student feed until approved by Admin or CR.
- Only approved/published content is visible to other students.
- Telegram notification is sent only after a successful publish/update/approval. A pending submission must never trigger a public Telegram notification.
- Save data to MongoDB before calling Telegram. Telegram failure must not roll back or lose the saved content.
- Keep bot token, JWT secret, database URI, and other secrets in backend environment variables. Never expose secrets to the frontend or commit `.env`.
- Hash passwords with bcrypt. Never store plain-text passwords.
- Do not invent extra roles or add unnecessary features outside the MVP.
- Follow `docs/architecture.md` for schemas, routes, permissions, page map, security, and acceptance criteria.

## Technology

Use:
- Frontend: React + Vite + JavaScript + Tailwind CSS.
- Routing: React Router.
- Backend: Node.js + Express + JavaScript.
- Database: MongoDB + Mongoose.
- Authentication: JWT + bcrypt.
- Validation: Zod (preferred) or an equivalent consistent validator.
- File uploads: Multer only if needed for the agreed MVP.
- Notifications: Telegram Bot API, integrated on the backend.

Use stable compatible package versions. Keep dependencies lean and explain any additional dependency.

## UI expectations

- Product name must appear as **Suchi**.
- Tagline must appear exactly as **Light up every update.**
- Create a modern, clean, responsive academic dashboard.
- Use role-aware navigation and separate Admin, CR, and Student dashboards.
- Provide clear Pending, Approved/Published, and Rejected states.
- Include loading, empty, validation, success, and error states.
- Make forms accessible and mobile responsive.
- Avoid clutter and unnecessary animation.
- Do not use fake buttons or non-functional controls. If a UI element is shown, implement its behavior or clearly mark it as not part of the current phase.

## Required working style

Work incrementally. Do not generate the whole system in one huge pass.

For each phase:
1. Briefly list the files you will create/change and why.
2. Implement only that phase.
3. Run type checks, lint, tests, and/or build commands that exist.
4. Fix errors caused by your changes.
5. Summarize what works, what commands I should run, and any environment variables needed.
6. Update README and architecture docs if the implementation changes an agreed decision.

Do not claim a feature is complete unless it is implemented and checked. Do not silently skip failing checks.

## Start now — Phase 1 only

Implement the foundation:
- Monorepo folder structure (`frontend`, `backend`, `Docs`).
- React/Vite/JavaScript frontend scaffold.
- Express/JavaScript backend scaffold.
- Tailwind CSS configured correctly for the installed version.
- MongoDB connection module using environment variables (connection should fail with a clear message if not configured; local development instructions must explain it).
- `GET /api/health` endpoint.
- Shared, consistent environment configuration patterns.
- Separate package scripts to run frontend and backend independently.
- `.gitignore` and `.env.example` files with placeholders only.
- README with prerequisites, installation, environment setup, and run commands.
- Add the Suchi name and exact tagline to the initial app shell.

Do not implement authentication, dashboards, CRUD modules, approval logic, or Telegram integration in Phase 1. Those belong to later phases.

At the end, stop and report:
- Created folder/file tree.
- Commands to install and run.
- Required environment variables.
- Checks executed and their results.
- Any manual setup I need to complete.
