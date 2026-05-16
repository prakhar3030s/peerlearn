# PeerLearn Monorepo

PeerLearn is a peer-to-peer academic video learning platform for university students. This monorepo contains both the React frontend and the Express backend.

## Structure

- `frontend` – Vite + React app, TailwindCSS, React Router, React Query
- `backend` – Express API server using Supabase (PostgreSQL) as the primary database

## Prerequisites

- Node.js 18+ and npm
- Supabase project (PostgreSQL)
- Mailtrap account (for development email testing)

## Setup

1. **Clone the repository** (or open the `peerlearn` folder in Cursor).

2. **Environment configuration**

   - Copy `frontend/.env.example` to `frontend/.env` and adjust if needed.
   - Copy `backend/.env.example` to `backend/.env` and fill in:
     - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`
     - `MAILTRAP_HOST`, `MAILTRAP_PORT`, `MAILTRAP_USER`, `MAILTRAP_PASS`
     - Other values can usually stay at their defaults for local development.

3. **Install dependencies**

   From the monorepo root (`peerlearn`):

   ```bash
   npm install
   ```

4. **Seed data**

   A seed script entry point is wired in the backend as `src/seed.js`. Once implemented, you can run:

   ```bash
   npm run seed
   ```

5. **Run the app**

   From the monorepo root:

   ```bash
   npm run dev
   ```

   This will:

   - Start the backend on `http://localhost:5000`
   - Start the frontend on `http://localhost:5173`

## Development Notes

- **Dev Role Switcher** – Authentication is intentionally skipped in the initial phase. A dev-only role context is wired to support Student / Moderator / Admin roles, persisted in `localStorage` under `peerlearn-dev-role`. A UI switcher component will be added on top of this in later phases.
- **Theme System** – The frontend uses CSS custom properties and Tailwind tokens for a full light/dark theme. The active theme is stored in `localStorage` under `peerlearn-theme` and applied via the `data-theme` attribute on the `html` element.
- **API Client** – The frontend Axios instance points to `http://localhost:5000/api` by default, overridable with `VITE_API_URL`.
- **YouTube Thumbnails** – YouTube thumbnails are derived from the video ID using `https://img.youtube.com/vi/{VIDEO_ID}/hqdefault.jpg`, so no YouTube API key is required for basic imagery.

