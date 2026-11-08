# Suchi Demo Script

## Prepare

1. Start MongoDB and configure `backend/.env`.
2. Run `npm install`.
3. Create the first admin with `npm run seed:admin --workspace backend`.
4. Add sample class data with `npm run seed:demo --workspace backend`.
5. Start `npm run dev:backend` and `npm run dev:frontend` in separate terminals.

## Walkthrough

1. Sign in as the seeded Admin and show the role-aware dashboard.
2. Open **Users**, find a registered student, and assign the CR role.
3. Sign in as the CR, publish a class notice or adjust the demo routine, and show comments and delivery logs.
4. Register or sign in as a student and review routines, exams, notices, and the approved feed.
5. Submit an event or suggestion; show that it remains pending in **My items** and is absent from the published feed.
6. Sign in as CR, open **Review**, reject the suggestion with a note, then show that only its submitter can see the note.
7. Approve a second submission and show that it appears in the feed.
8. Add a comment to published content and verify a different student cannot delete it.
9. Attempt an Admin-only API as a student and show that the backend returns `403`.

Telegram is optional. Configure `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, and `PUBLIC_APP_URL` to demonstrate external delivery; leave them unset for an offline demo.