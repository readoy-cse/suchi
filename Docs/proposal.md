# Suchi — Project Proposal

**Project title:** Suchi: Academic Information and Class Communication Platform  
**Tagline:** *Light up every update.*  
**Project category:** Web application  
**Project status:** Working MVP

## 1. Abstract

Suchi is a web-based platform for organizing class schedules, exam information, notices, and student contributions in one authenticated workspace. Students can consult academic information, submit events, news, or suggestions, follow the status of their submissions, and discuss published content. Class Representatives (CRs) and Admins maintain academic records and review student submissions before publication. An optional Telegram integration can relay published updates.

The project addresses the fragmentation of class information across messaging groups and documents. It provides a shared place to find current information and a defined process for reviewing student contributions. The current implementation is a single-class MVP built with React, Express, and MongoDB.

## 2. Background and problem statement

Class announcements and academic details are commonly shared through chat messages, images, and separate files. Information can be difficult to find again, older messages may be mistaken for current instructions, and students may not know whether a submitted suggestion has been reviewed. Repeated questions and missed updates can result.

Suchi proposes a centralized class workspace with role-based responsibilities and a review workflow. Authorized representatives maintain the academic information, while student-submitted content remains private to the submitter and reviewers until it is approved.

## 3. Aim and objectives

The aim is to develop an accessible, role-aware web application that improves how a class organizes and shares academic updates.

The objectives are to:

- Provide authenticated access to class routines, exams, notices, and approved updates.
- Give Admins and CRs tools to create and maintain academic information.
- Let students submit events, news, and suggestions for review.
- Show submitters whether their items are pending, approved, or rejected, including reviewer feedback when available.
- Support comments on academic content and approved submissions.
- Offer optional Telegram delivery for published or updated items, while retaining the application as the source of truth.
- Apply server-side validation, authentication, and role-based access control.

## 4. Intended users and roles

| User | Main responsibilities and capabilities |
| --- | --- |
| Student | View academic information and approved content; submit contributions; track personal submission status; comment on published content. |
| Class Representative (CR) | Manage routines, exams, and notices; review student submissions; moderate comments. |
| Admin | Perform CR tasks; manage accounts and assign roles. |

Public registration creates a student account. Elevated roles are assigned through Admin-controlled user management.

## 5. Proposed system and workflow

1. A user registers or signs in. The application verifies the account and role.
2. The dashboard presents relevant upcoming classes and exams, notices, and approved updates.
3. An Admin or CR creates or updates routines, exam schedules, and notices.
4. A student submits an event, news item, or suggestion. The item is stored with pending status and is not included in the published feed.
5. An Admin or CR reviews the item and approves or rejects it, optionally adding a note.
6. Approved items appear in the feed and can receive comments. The submitter can see the review result in their personal submissions.
7. If Telegram is configured, the system attempts to deliver published updates and records the delivery result. A delivery failure does not undo the saved content.

## 6. Project scope

### Included in the current MVP

- Student registration, sign-in, sign-out, and account updates.
- Admin-managed users and Admin, CR, and student roles.
- Routine, exam, and notice management for Admins and CRs.
- Student event, news, and suggestion submissions.
- Approval and rejection workflow, review notes, and personal submission status.
- Approved content feed and comments on supported published records.
- Optional Telegram notifications and delivery logs.
- Demo-data seeding and a database-aware health endpoint.

### Excluded from the current MVP

Attendance, grading, assignment management, online classes, private messaging, file uploads, native mobile apps, multi-institution support, calendar synchronization, automated scheduled reminders, and advanced analytics. These can be considered in later versions if user feedback and resources support them.

## 7. Technical approach

Suchi uses a JavaScript web stack:

- **Frontend:** React 19, Vite, React Router, and Tailwind CSS.
- **Backend:** Node.js, Express 5, and a JSON REST API.
- **Database:** MongoDB with Mongoose models for users, routines, exams, notices, submissions, comments, and notification logs.
- **Validation and access:** Zod request validation, password hashing with bcrypt, signed sessions in HttpOnly cookies, and backend role checks.
- **External service:** Telegram Bot API, enabled only when server environment configuration is provided.

The browser communicates with the Express API. The API authenticates requests, checks roles and ownership, validates input, and reads or writes MongoDB records. Telegram is an optional downstream notification service. The project can be run locally with Node.js, npm, and a MongoDB instance or connection URI.

## 8. Feasibility

The proposed system is feasible as a small academic web project. Its interface, API, database models, role checks, contribution workflow, and optional notification service are implemented in the repository. The project uses established JavaScript libraries and includes setup instructions, environment-variable examples, demo data, and focused automated tests. A local demonstration requires Node.js, npm, MongoDB, and an initial seeded Admin; Telegram credentials are optional.

The current repository supports an MVP demonstration, while internet-facing production use would need deployment-specific review and operational planning. In particular, the project does not include a deployment pipeline, backup and restore procedures, monitoring setup, or file storage.

## 9. Development and rollout plan

1. **Requirements and roles:** Confirm the class information to be managed and identify Admin and CR responsibilities.
2. **Application setup:** Configure the database and environment, create the first Admin, and add initial class information.
3. **Guided use:** Demonstrate academic information management, a student submission, reviewer decision, published feed, and comments.
4. **Feedback and refinement:** Collect feedback from students and representatives; prioritize usability and workflow improvements.
5. **Operational preparation:** If the class adopts the application beyond a local demonstration, configure hosting, backups, monitoring, and deployment security.

## 10. Expected outcomes and evaluation

Expected outcomes include easier access to class information, fewer repeated searches through old messages, clearer review responsibility, and visible status for student contributions. These outcomes should be evaluated after a pilot rather than assumed in advance.

Suggested evaluation measures include:

- Whether students can find current routines, exams, and notices in the application.
- Whether users report less time spent searching for class information.
- The proportion of submissions receiving a review decision and the time taken to reach that decision.
- Student and representative feedback on clarity and ease of use.
- Whether users can distinguish pending submissions from approved content.

## 11. Risks and limitations

- **Out-of-date information:** Representatives need a clear process for checking and updating records.
- **Adoption:** Users may continue relying on existing chats; a short onboarding and consistent use are needed for the platform to help.
- **External delivery:** Telegram may be unavailable or unconfigured, so users should treat Suchi as the canonical record.
- **Production readiness:** Hosting, backups, monitoring, and deployment-specific security review are not provided by the current MVP.
- **Growth:** The current application is designed for a small class context; broader deployments may need pagination, tenant separation, and additional operational controls.

## 12. Conclusion

Suchi brings essential class information, student contributions, and reviewer decisions into one web application. Its role-based workflow helps keep academic records manageable and ensures that student contributions are reviewed before publication. The implemented MVP provides a practical foundation for a class pilot, with user feedback and operational preparation guiding any future expansion.
