# 🎓 PeerLearn

PeerLearn is a modern **peer-to-peer academic video learning platform** built for university students.  
It allows students to explore syllabus topics, upload educational videos, rate learning content, track progress, and collaborate with peers in a structured learning environment.

This repository is a **full-stack monorepo** containing both the frontend and backend applications.

---

# 🚀 Project Overview

PeerLearn is designed to make academic learning more collaborative and accessible by combining:

- 📚 Structured syllabus-based learning
- 🎥 Student-contributed educational videos
- ⭐ Community-driven ratings and moderation
- 📈 Progress tracking and leaderboard systems
- 🔐 Secure authentication and administration

The project follows a modern full-stack architecture using **React**, **Express**, and **Supabase**.

---

# 🏗️ Architecture

## 🖥️ Frontend

Built with:

- ⚛️ React
- ⚡ Vite
- 🎨 TailwindCSS
- 🧭 React Router
- 🔄 React Query
- ✨ Framer Motion
- 🧩 Radix UI

The frontend provides:

- Responsive user interface
- Syllabus navigation
- Video browsing and submissions
- Authentication pages
- User dashboard and progress tracking
- Admin and moderation panels

---

## 🔧 Backend

Built with:

- 🟢 Node.js
- 🚂 Express.js
- 🗄️ Supabase (PostgreSQL)

The backend handles:

- REST API services
- Authentication and authorization
- Video submission workflows
- Moderation system
- Notifications
- Ratings and flags
- Database communication

---

# 📂 Repository Structure

```bash
peerlearn/
│
├── frontend/          # React + Vite frontend application
├── backend/           # Express backend server
├── package.json       # Root workspace configuration
└── README.md          # Project documentation
```

---

# ✨ Key Features

## 📚 Academic Learning System

- Browse syllabus by:
  - Branch
  - Year
  - Subject
  - Unit
  - Topic

## 🎥 Video Learning Platform

- Upload educational videos
- Watch peer-submitted content
- Rate and review learning materials

## 🛡️ Moderation & Quality Control

- Flag inappropriate submissions
- Review and moderation workflow
- Admin approval system

## 👤 User Features

- Secure authentication
- Notifications system
- Learning progress tracking
- Leaderboards and engagement metrics

## ⚙️ Admin Features

- Manage branches and subjects
- Create and edit syllabus structure
- Manage topics and units
- Moderate submissions and reports

---

# 🛠️ Tech Stack

## Frontend Technologies

- ⚛️ React
- ⚡ Vite
- 🎨 TailwindCSS
- 🔄 React Query
- 🧭 React Router
- ✨ Framer Motion
- 🧩 Radix UI

## Backend Technologies

- 🟢 Node.js
- 🚂 Express.js
- 🗄️ Supabase (PostgreSQL)

## Security & Utilities

- 🔐 bcrypt
- 🛡️ helmet
- 🌐 cors
- 🚦 express-rate-limit
- ✅ express-validator
- 📧 nodemailer

---

# 📋 Prerequisites

Before running the project, make sure you have:

- Node.js **v18+**
- npm
- A configured Supabase project
- PostgreSQL credentials from Supabase

---

# ⚙️ Installation & Setup

## 1️⃣ Clone the Repository

```bash
git clone <repository-url>
cd peerlearn
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

This installs dependencies for both frontend and backend workspaces.

---

## 3️⃣ Configure Environment Variables

Since `.env.example` files are not included, create environment files manually.

---

## 🔧 Backend Environment Setup

Create:

```bash
backend/.env
```

Add the following:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173

SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

NODE_ENV=development
```

---

## 🖥️ Frontend Environment Setup

Create:

```bash
frontend/.env
```

Add frontend-specific variables if required, for example:

```env
VITE_API_URL=http://localhost:5000
```

---

# 🗄️ Database Setup

PeerLearn uses **Supabase PostgreSQL** as the primary database.

Database-related files are available inside:

```bash
backend/src/db/
backend/src/db/migrations/
```

These folders contain:

- Database schema
- SQL migration files
- Seed scripts

---

# 🌱 Seed Initial Data

To populate the database with initial data:

```bash
npm run seed
```

This executes:

```bash
backend/src/db/seed.js
```

---

# ▶️ Running the Application

Start both frontend and backend together:

```bash
npm run dev
```

### Local Development URLs

| Service | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend | `http://localhost:5000` |

---

# 📜 Available Scripts

## Root Workspace Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start frontend and backend together |
| `npm run seed` | Run database seed script |
| `npm run start` | Start backend server |

---

## Backend Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start backend using nodemon |
| `npm run start` | Start production backend |
| `npm run seed` | Run seed script |

---

## Frontend Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build production frontend |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---


## Available Routes

| Route | Purpose |
|---|---|
| `/api/auth` | Authentication |
| `/api/users` | User management |
| `/api/syllabus` | Syllabus structure |
| `/api/submissions` | Video submissions |
| `/api/search` | Search functionality |
| `/api/moderation` | Moderation system |
| `/api/ratings` | Ratings & reviews |
| `/api/flags` | Content reporting |
| `/api/notifications` | Notifications |
| `/api/admin` | Admin controls |
| `/api/progress` | Progress tracking |

---

# 🧠 Development Notes

- Supabase configuration is managed in:

```bash
backend/src/db/supabase.js
```

- Centralized error handling is implemented in:

```bash
backend/src/middleware/errorHandler.js
```

- Frontend components are located inside:

```bash
frontend/src/
```

- Reusable UI components are available in:

```bash
frontend/src/components/ui/
```

---

# 🔒 Security Notes

- Never commit `.env` files to source control
- Add environment files to `.gitignore`
- Keep Supabase service keys private
- Verify all required environment variables before starting the backend

---

# 🤝 Contribution Guidelines

If you do not have direct access to the repository:

1. Fork the repository
2. Create a new feature branch
3. Commit your changes
4. Push to your fork
5. Open a Pull Request

---

# 📌 Future Improvements

Planned improvements for PeerLearn:

- 📱 Better mobile responsiveness
- 🎯 AI-powered learning recommendations
- 💬 Real-time discussions
- 📹 Live learning sessions
- 🏆 Gamification system
- 📊 Advanced analytics dashboard

---

# 👨‍💻 Developed For

PeerLearn is built to encourage:

- Collaborative learning
- Peer knowledge sharing
- Accessible education
- Structured academic growth

---
