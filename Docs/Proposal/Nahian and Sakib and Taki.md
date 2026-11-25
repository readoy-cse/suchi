## Step 4 — Features and Functions (Nahian)

Thank you, Munaim. I will explain the features and functions proposed for Suchi.

Students will be able to register and sign in. Their dashboard will show upcoming classes, exams, notices, and updates. Students can check class schedules and upcoming exams.

Admins can manage users and academic information, including routines, exams, and notices. Students can submit an event, news item, or suggestion for review by an Admin or CR. Users can comment on published content. Telegram notifications are optional.

These are the main functions we propose for the Suchi platform.

## Step 5 — A Modern JavaScript Stack (Nahian)

To support these features, we propose a modern JavaScript stack.

The frontend will use React 19, Vite, React Router, and Tailwind CSS. The backend will use Node.js and Express to provide the REST API, authentication, and role checks.

MongoDB will store the project data, and Mongoose will structure the data models. We propose Zod for input validation. Passwords will be hashed, sessions will use an HttpOnly cookie, and role permissions will be checked on the server. Telegram is an optional integration.

Now, Sakib will explain the proposed system design.

## Step 6 — System Design and Architecture (Sakib)

Thank you, Nahian. This slide shows how the main parts of Suchi will work together.

Students, Class Representatives, and Admins will use the web app through a browser. The frontend will use React and Vite. It will send requests to the Express server. The server will check authentication, user roles, ownership, and submitted data before allowing an action.

MongoDB and Mongoose will store academic information, submissions, comments, and delivery logs. The optional Telegram notifier will run after information has been saved. If a Telegram message fails, the saved information will remain in Suchi.

The browser helps users navigate the app, but the server makes the security decisions.

## Step 7 — Expected Outcomes (Sakib)

By project completion, we expect to have a working, responsive web app for the class.

We expect students to find current routines, exams, and notices more easily. A clear review status may reduce repeated questions and help contributors understand what happened to their submissions. Role-based access is intended to protect academic information.

The project will also give our team experience with full-stack development, REST APIs, databases, and testing. These are expected outcomes in our proposal, not results we are claiming as complete.

Now, Taki will present the proposed timeline.

## Step 8 — Project Timeline (Taki)

This is our proposed project schedule. We plan to confirm requirements and user roles from November 25 to 26. Architecture, the data model, proposal writing, and review are planned for November 26 to 27. The proposal submission is planned for November 27.

After that, UI and UX design is planned for November 28. Frontend development is planned for November 29 and 30. Backend and database integration are planned for December 1 and 2. Testing and debugging are planned for December 3, followed by final project submission on December 4.

Now, I will introduce the people behind Suchi.

## Step 9 — The People Behind Suchi (Taki)

Our team has five contributors, with different responsibilities.

Sakib is our System Architect. Nahian works on Frontend Development. I work on Backend Integration. Salman is responsible for Deployment and Security. Munayem works on Software Quality Assurance.

We are bringing these responsibilities together to develop the Suchi project proposal.

Now, all of us are ready for your questions.

## Step 10 — Questions and Answers (Everyone)

Thank you for listening to our project proposal. We are ready to answer your questions. Please feel free to ask any team member about the problem, proposed features, technology, system design, expected outcomes, timeline, or team responsibilities.

After the questions, everyone may say: **Thank you for your time and feedback.**
