# Suchi — Project Proposal Presentation Prompt Guide

This document contains a ready-to-use, comprehensive master prompt designed for **Gemini** (or any advanced LLM) to generate a complete, high-impact **Project Proposal Presentation Slide Deck** for the **Suchi** platform.

---

## How to Use This Prompt
1. Copy the entire prompt text in the section below (between the triple backticks or the designated prompt block).
2. Open [Gemini](https://gemini.google.com).
3. Paste the prompt and submit.
4. Gemini will generate a complete slide-by-slide deck featuring **slide content, visual layouts, visual asset descriptions, and detailed speaker notes** for each slide.
5. You can copy the generated slide content directly into Google Slides, Microsoft PowerPoint, Keynote, or AI slide makers like Gamma / Beautiful.ai.

---

## Master Prompt for Gemini

```markdown
Act as a senior software architect, academic evaluator, and expert presentation designer. I need a comprehensive, highly persuasive, and professional Project Proposal Presentation slide deck for my university Web Programming / Software Engineering capstone project named **"Suchi"**.

Below are the complete project specifications, architecture details, problem statement, technical stack, and workflow. Use this context to create a detailed, ready-to-present 12-slide presentation.

---

### Project Context & Specifications:
- **Project Name:** Suchi (সুচি)
- **Tagline:** Light up every update.
- **Project Type:** Academic Information, Communication, and Student Contribution Web Platform.
- **Problem Statement:** In university departments, academic updates (class schedules, room changes, exam routines, syllabus suggestions, deadline notices) are chaotically scattered across unofficial Messenger groups, Telegram chats, WhatsApp threads, and physical notice boards. Students miss critical deadlines, updates get buried under casual chatter, CRs (Class Representatives) face repetitive queries, and unverified rumors circulate without moderation.
- **Proposed Solution:** Suchi is a centralized single-source-of-truth academic portal where students receive verified, real-time academic schedules and notices, submit events and academic suggestions through a structured moderation workflow, engage in discussions through moderated comments, and receive automated broadcast notifications via Telegram.
- **User Roles & RBAC:**
  1. **Admin:** Full system governance, user directory management, role upgrades (promoting students to CR), content oversight, and audit logs.
  2. **Class Representative (CR):** Manages routines, exam schedules, suggestions, and notices. Reviews, approves, or rejects student-submitted items with constructive review notes.
  3. **General Student:** Secure registration/login, personalized schedule dashboard, views verified notices and schedules, submits events/news/suggestions into an approval queue, tracks submission status, and comments on published content.
- **Core Technology Stack:**
  - **Frontend:** React 19, Vite, Tailwind CSS v4, React Router v7, responsive SPA architecture.
  - **Backend:** Node.js, Express.js (RESTful API, ES Modules), JWT authentication using HttpOnly & SameSite secure cookies, bcrypt password hashing, Zod schema validation.
  - **Database:** MongoDB & Mongoose ODM (Collections: `users`, `routines`, `exams`, `notices`, `submissions`, `comments`, `notificationlogs`).
  - **Integration:** Telegram Bot API for automated external channel broadcasts whenever announcements or approved submissions are published.
- **Key Architectural & Security Highlights:**
  - Strict server-side RBAC validation on all endpoints (never relying merely on hiding UI buttons).
  - Single-entity submission state machine (`pending` -> `approved` / `rejected`); approved submissions immediately publish to the live feed without duplicate records.
  - Resilient notification pipeline: Database persistence occurs first; external Telegram dispatch failure never cancels database transactions, and failure logs are preserved in `NotificationLogs`.
  - Protection against XSS/CSRF via HttpOnly session cookies and Zod payload sanitization.
- **Brand Identity & Project Theme Colors:**
  - **Primary / Deep Pine Green (`#17392f`)**: The foundational brand color; used for primary slide titles, key headers, emphasized metrics, and major icons.
  - **Accent 1 / Warm Terracotta (`#a75a3b`)**: Used for highlight badges, callout cards, active states, pipeline arrows, and warning/attention tags.
  - **Accent 2 / Electric Lime (`#d6ef79`)**: Used for high-energy accents, success badges, glowing highlights, and selection tags.
  - **Canvas Background / Warm Parchment (`#f4f4ef`)**: Clean, warm, editorial background that replaces standard harsh white.
  - **Card Surfaces / Soft Ivory (`#fbfbf8`)**: Elevated module cards, diagrams, and comparison boxes with subtle borders (`#d8ddd5`).
  - **Secondary Text / Muted Slate-Green (`#63756d` & `#354f45`)**: High-readability secondary labels and descriptions.
  - **Typography Styling**: `Manrope` for bold display titles, `DM Sans` for body text, and `Noto Sans Bengali` for the project logo wordmark (**সূচি**).

---

### Slide Deck Requirements:
Generate a 12-slide presentation structure tailored for university professors, evaluators, and academic audiences.

For **EACH** of the 12 slides, you MUST provide:
1. **Slide Title & Slide Number**
2. **Slide Goal / Key Takeaway** (1 sentence summary)
3. **Recommended Visual Layout & Theme Styling** (e.g., 2-column comparison, 3-card metric layout, pipeline flowchart, architecture diagram; specify exact uses of `#17392f`, `#a75a3b`, `#d6ef79`, and `#f4f4ef` for each slide's backgrounds, cards, and text accents)
4. **Slide Content** (Bullet points, concise phrases, data highlights — formatted cleanly for presentation slides, not dense walls of text)
5. **Visual Elements / Diagrams** (Specific instructions on what icon, diagram, mock UI, or flowchart to display, incorporating the project color palette)
6. **Speaker Notes** (A natural, professional 2-3 paragraph presentation script that I can read out loud to the audience during the presentation)

---

### Slide Structure to Follow:

- **Slide 1: Title Slide**
  - Project Title: Suchi
  - Tagline: Light up every update
  - Subtitle: Centralized Academic Information & Collaboration Platform
  - Presenter info, Course/Department details, Date.

- **Slide 2: The Problem: Academic Communication in Chaos**
  - Fragmented communication channels (Messenger, WhatsApp, Telegram, physical bulletin boards).
  - Important deadlines lost in message spam.
  - CR burnout from answering repetitive queries.
  - Lack of a verified single source of truth.

- **Slide 3: The Solution: Introducing Suchi**
  - Unified, verified departmental hub.
  - Verified academic calendar, daily routine, exam schedules, and notices.
  - Structured student contribution and moderation funnel.
  - Bridge between web platform and instant mobile notifications.

- **Slide 4: Role-Based Access Control (RBAC) & User Personas**
  - Three distinct roles: Admin, Class Representative (CR), and Student.
  - Permission matrix overview (who can read, create, publish, and moderate).
  - Security principle: Public registration defaults to Student; privilege escalation prevention.

- **Slide 5: Core Functional Modules**
  - Academic Routine Manager (courses, instructors, time slots, rooms, resources).
  - Exam Tracker & Syllabus Suggestions (dates, syllabi, past question links).
  - Departmental Notices Board (categorized, prioritized, downloadable attachments).
  - Discussion Engine (moderated comments on verified posts).

- **Slide 6: Student Contribution & Approval Workflow**
  - End-to-end lifecycle of a student submission:
    `Submit (Event/News/Suggestion)` ➔ `Pending Queue` ➔ `CR/Admin Review` ➔ `Approved & Published` OR `Rejected with Feedback Note`.
  - Submitter transparency: Students see live submission status and reviewer notes.
  - Prevention of unmoderated or inaccurate spam.

- **Slide 7: System Architecture & Technology Stack**
  - Frontend: React 19 + Vite + Tailwind CSS.
  - Backend: Node.js + Express.js REST API.
  - Database: MongoDB Atlas (Document model for schedules, notices, submissions).
  - External Services: Telegram Bot API webhook/dispatch.
  - Architectural flow from Client ➔ Express Middleware (Auth/RBAC/Zod) ➔ MongoDB ➔ Telegram Bot.

- **Slide 8: Security & Reliability Engineering**
  - HttpOnly & SameSite cookie-based JWT sessions (XSS protection).
  - Strict server-level RBAC enforcement.
  - Input validation using Zod schemas.
  - Fault-tolerant notifications (DB write guarantees before external API calls, persistent notification logs).

- **Slide 9: Live Demo & Walkthrough Scenario**
  - Step-by-step user journey:
    1. Student registers and checks daily routine and upcoming exam schedule.
    2. Student submits a workshop proposal.
    3. CR logs in, reviews proposal, approves it with notes.
    4. Proposal publishes instantly to student feed and triggers a Telegram notification alert.
    5. Classmates discuss the announcement via comments.

- **Slide 10: Project Milestones & Current Implementation Status**
  - What has already been built and verified:
    - Complete REST API and React UI.
    - Database schemas and seed scripts.
    - Automated unit tests passing for academic validation, submission sanitization, and auth rules.
    - Production build verification.
  - Next planned milestones.

- **Slide 11: Future Scope & Roadmap**
  - Multi-department / Multi-batch multi-tenancy.
  - Push notifications & Progressive Web App (PWA) support.
  - Google Calendar / iCal routine synchronization.
  - Real-time notification socket updates.

- **Slide 12: Conclusion & Q&A**
  - Core value summary: Efficiency, transparency, and organized academic life.
  - Open floor for questions from the evaluation committee.

---

Produce the complete, fully written slides now with in-depth speaker scripts for each slide. Make the speaker notes sound natural, confident, and technically articulate.
```

---

## Quick Tips for Presenting Suchi

1. **Focus on the Pain Point:** Start by asking the audience/evaluators: *"How many times have you missed an exam date or class cancellation because it was buried under 500 Messenger stickers?"* This immediately validates the necessity of Suchi.
2. **Highlight the Approval Workflow:** Emphasize that Suchi is not just a bulletin board, but a **moderated collaboration ecosystem** (Student submits ➔ CR reviews ➔ System publishes & alerts).
3. **Emphasize Engineering Quality:** Mention that the project features **strict server-side RBAC**, **HttpOnly JWT cookies**, **automated schema validation (Zod)**, and **fault-tolerant asynchronous notification logging**.
4. **Brand & Visual Consistency:** Style your presentation slides using Suchi's actual color palette: Deep Pine Green (`#17392f`), Warm Terracotta (`#a75a3b`), Electric Lime (`#d6ef79`), and Warm Parchment (`#f4f4ef`). This connects your presentation visually to your live application.
