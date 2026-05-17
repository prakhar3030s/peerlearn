# PeerLearn

PeerLearn is a peer-to-peer academic video learning platform for university students. This monorepo contains both the React frontend and the Express backend, designed to let students browse syllabus content, submit and rate learning videos, and moderate contributions.

---

## Project overview

- **Frontend**: React + Vite app with TailwindCSS, React Router, and React Query.
- **Backend**: Express API server with Supabase as the primary data store.
- **Purpose**: enable students to learn from peer-submitted videos, manage syllabus structure, and moderate content.

---

## Repository structure

- `frontend/` — client application
- `backend/` — API server and database integration
- `package.json` — root monorepo package with workspace scripts
- `README.md` — project overview and setup guide

---

## Key features

- video submission and rating
- syllabus browsing by branch, year, subject, unit, and topic
- moderation workflow for flagged submissions and revisions
- user authentication and notifications
- admin management routes for syllabus, branches, subjects, units, and topics
- progress tracking and leaderboard support

---

## Tech stack

- Node.js
- npm workspaces
- React
- Vite
- TailwindCSS
- Express
- Supabase (PostgreSQL)
- bcrypt
- helmet
- cors
- express-rate-limit
- express-validator
- nodemailer
- React Query
- Radix UI
- Framer Motion

---

## Prerequisites

- Node.js 18 or newer
- npm
- Supabase project with PostgreSQL credentials

---

## Setup

1. Open the project root in your terminal:

   ```bash
   cd (path_to_folder)\peerlearn
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create environment files.

   There are no `.env.example` files in the repository, so create them manually.

   `backend/.env` should include at least:

   ```env
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   SUPABASE_ANON_KEY=your-supabase-anon-key
   NODE_ENV=development
   ```

   `frontend/.env` can include frontend-specific variables if your app requires them, such as API base URL or feature toggles.

4. Configure Supabase and database tables.
   - The backend expects Supabase to manage the main data tables.
   - Existing SQL schema and seed files are in `backend/src/db/` and `backend/src/db/migrations/`.

5. Seed the backend data if needed:

   ```bash
   npm run seed
   ```

   This runs the backend seed script from `backend/src/db/seed.js`.

---

## Running the app

From the project root, start both frontend and backend together:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`


---

## Available scripts

From the root:

- `npm run dev` — launch both backend and frontend concurrently
- `npm run seed` — run backend seed script
- `npm run start` — start the backend server only

From `backend/`:

- `npm run dev` — start backend with nodemon
- `npm run start` — start backend with Node
- `npm run seed` — run `backend/src/db/seed.js`

From `frontend/`:

- `npm run dev` — start Vite development server
- `npm run build` — build production frontend
- `npm run preview` — preview built app
- `npm run lint` — run ESLint

---

## Backend API routes

The backend exposes several route groups under `/api`:

- `/api/auth`
- `/api/users`
- `/api/syllabus`
- `/api/submissions`
- `/api/search`
- `/api/moderation`
- `/api/ratings`
- `/api/flags`
- `/api/notifications`
- `/api/admin`
- `/api/progress`

A health check endpoint is available at `/health`.

---

## Development notes

- The backend uses Supabase client configuration in `backend/src/db/supabase.js`.
- CORS is configured for `http://localhost:5173`, `http://localhost:3000`, and the `FRONTEND_URL` environment variable.
- Error handling is centralized in `backend/src/middleware/errorHandler.js`.
- The frontend is built with React components in `frontend/src`, including a UI library under `frontend/src/components/ui/`.

---

## Notes

- If you do not have push access to the original repository, use a fork and submit a pull request.
- Keep backend secrets out of source control by adding `.env` to `.gitignore`.
- Verify that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are present before starting the backend.
