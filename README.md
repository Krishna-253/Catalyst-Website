# Catalyst — Campus Events & Community Platform

Catalyst is a college-focused platform for discovering campus events, joining communities, registering for events, and managing student activities in one place.

The project combines a Vibes-inspired frontend with a real backend for authentication, events, registrations, clubs, and announcements.

---

# How the Project Works

Catalyst is made up of three connected parts:

```text
                    ┌─────────────────────┐
                    │     PostgreSQL      │
                    │   catalyst database │
                    └──────────┬──────────┘
                               │
                               │ Prisma
                               ▼
                    ┌─────────────────────┐
                    │   Catalyst Backend  │
                    │   Node + Express    │
                    │   localhost:5000    │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               │ /api/*
                               ▼
                    ┌─────────────────────┐
                    │ Catalyst Frontend   │
                    │                     │
                    │ Vibes visual base   │
                    │ + Catalyst pages    │
                    │ localhost:5500      │
                    └─────────────────────┘
```

### 1. PostgreSQL

Stores the application data:

- Users
- Clubs
- Club members
- Events
- Registrations
- Announcements

### 2. Catalyst Backend

The backend is responsible for:

- Authentication
- User accounts
- Event creation and management
- Event registration
- Registration cancellation
- Clubs
- Announcements
- Organizer functionality
- Database communication

The backend runs on:

```text
http://localhost:5000
```

### 3. Catalyst Frontend / Vibes

The `site` directory contains the frontend.

It uses the Vibes visual foundation, assets, fonts, animations and styling, with Catalyst functionality connected through JavaScript.

The frontend communicates with the Catalyst backend through:

```text
http://localhost:5000/api
```

---

# Tech Stack

## Frontend

- HTML
- CSS
- JavaScript
- Vibes visual foundation
- Vibes assets and animations

## Backend

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT authentication
- HTTP-only cookies

## Development

- Git
- GitHub
- VS Code

---

# Project Structure

```text
Catalyst-Website/
│
├── backend/
│   ├── lib/
│   │   ├── eventStatus.js
│   │   └── prisma.js
│   │
│   ├── middleware/
│   │   └── auth.js
│   │
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   │
│   ├── routes/
│   │   ├── announcements.js
│   │   ├── auth.js
│   │   ├── clubs.js
│   │   ├── events.js
│   │   ├── me.js
│   │   └── organizer.js
│   │
│   ├── prisma7.config.ts
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── site/
│   ├── assets/
│   │   ├── built/
│   │   ├── fonts/
│   │   ├── images/
│   │   └── js/
│   │
│   ├── external/
│   ├── public/
│   │
│   ├── index.html
│   ├── events.html
│   ├── event.html
│   ├── clubs.html
│   ├── club.html
│   ├── announcements.html
│   ├── login.html
│   ├── register.html
│   ├── my-events.html
│   ├── registrations.html
│   └── organizer.html
│
├── package.json
├── package-lock.json
├── README.md
├── scraper.py
├── scrape_inspect.py
└── .gitignore
```

---

# Running Catalyst Locally

To run the complete application, you need:

1. PostgreSQL
2. Catalyst backend
3. Catalyst frontend

They all run together locally.

---

# 1. Start PostgreSQL

Make sure PostgreSQL is installed and running.

The project uses a PostgreSQL database named:

```text
catalyst
```

The backend connects to PostgreSQL using the `DATABASE_URL` stored in:

```text
backend/.env
```

Do not commit `.env` to GitHub.

---

# 2. Install Dependencies

From the project root:

```bash
npm install
```

Then install backend dependencies:

```bash
cd backend
npm install
```

Return to the project root:

```bash
cd ..
```

---

# 3. Configure the Backend

Create:

```text
backend/.env
```

The environment file contains the local database connection and authentication configuration.

Example structure:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/catalyst"
JWT_SECRET="your-secret-key"
PORT=5000
```

Use your own local PostgreSQL username, password and secret.

Never commit the real `.env` file.

---

# 4. Set Up the Database

From the `backend` directory, run:

```bash
npx prisma migrate deploy
```

If you are setting up a fresh development database and need to generate the Prisma client:

```bash
npx prisma generate
```

The database schema is stored in:

```text
backend/prisma/schema.prisma
```

Migration files are stored in:

```text
backend/prisma/migrations/
```

---

# 5. Start the Catalyst Backend

Open a terminal in the `backend` directory:

```bash
cd backend
npm run dev
```

The backend should start on:

```text
http://localhost:5000
```

The API is available under:

```text
http://localhost:5000/api
```

Main API areas include:

```text
/api/auth
/api/events
/api/clubs
/api/me
/api/organizer
/api/announcements
```

Keep this terminal running.

---

# 6. Start the Catalyst Frontend

The frontend is inside:

```text
site/
```

The site should be served through a local HTTP server rather than opened directly using `file://`.

A simple option is the VS Code Live Server extension.

Open the project in VS Code and launch Live Server for:

```text
site/index.html
```

The frontend will normally be available at an address similar to:

```text
http://127.0.0.1:5500/site/
```

or:

```text
http://localhost:5500/site/
```

The exact port can vary depending on the local server configuration.

---

# 7. How the Frontend Connects to the Backend

The Catalyst frontend JavaScript connects to the backend API.

The backend runs on:

```text
http://localhost:5000
```

The frontend sends requests to:

```text
http://localhost:5000/api
```

For example:

```text
Frontend
   │
   │ GET /api/events
   ▼
Catalyst Backend
   │
   │ Prisma
   ▼
PostgreSQL
```

For authentication:

```text
Login Page
   │
   │ POST /api/auth/login
   ▼
Catalyst Backend
   │
   │ verifies user
   ▼
PostgreSQL
   │
   ▼
Authentication Cookie
   │
   ▼
Frontend
```

This allows the frontend to display real database information instead of only static HTML.

---

# Running Everything Together

The easiest development setup is to use two terminals, while PostgreSQL runs as a background service.

## Terminal 1 — Backend

```bash
cd backend
npm run dev
```

Keep this terminal running.

## Terminal 2 — Frontend

Start VS Code Live Server for:

```text
site/index.html
```

Keep the frontend server running.

## PostgreSQL

PostgreSQL should be running as a local service in the background.

The complete setup is:

```text
PostgreSQL
     │
     ▼
Backend :5000
     │
     ▼
Vibes/Catalyst Frontend :5500
```

Open the frontend URL in your browser.

---

# Vibes Website / Frontend

Catalyst was built using a Vibes-based frontend foundation.

The Vibes portion of the project includes:

- Original Vibes styling
- Fonts
- Images
- CSS
- Frontend animations
- Navigation effects
- Vibes visual assets

These files are mainly located inside:

```text
site/assets/
site/external/
site/public/
```

The original Vibes homepage structure has been retained where useful, while Catalyst functionality has been connected to it.

The Vibes visual layer does not require a separate backend.

It is served as part of the Catalyst frontend.

The current homepage integrates real Catalyst data such as:

- Upcoming events
- Announcements
- Clubs and communities

---

# Main Catalyst Pages

| Page | Purpose |
|---|---|
| `index.html` | Catalyst homepage |
| `events.html` | Browse campus events |
| `event.html` | Individual event details |
| `clubs.html` | Browse clubs |
| `club.html` | Individual club |
| `announcements.html` | Campus announcements |
| `login.html` | User login |
| `register.html` | Account registration |
| `my-events.html` | Student's registered events |
| `registrations.html` | Event registrations |
| `organizer.html` | Organizer dashboard |
| `create-event.html` | Create an event |
| `create-club.html` | Create a club |
| `create-announcement.html` | Create an announcement |

---

# Student Features

Students can:

- Register for an account
- Log in and log out
- Browse events
- View event details
- Register for events
- Cancel registrations
- View their registered events
- Browse clubs
- View announcements

---

# Organizer Features

Organizers can:

- Create events
- Submit events for approval
- Manage events
- View event registrations
- Create clubs
- Manage clubs
- Create announcements
- Manage organizer activities

---

# Event Approval Flow

Events support an approval workflow:

```text
DRAFT
  │
  ▼
PENDING_APPROVAL
  │
  ▼
PUBLISHED
```

Rejected events can be handled through the organizer workflow.

Registration availability is handled by the backend, allowing the frontend to display the current registration state.

---

# Database Models

The main Prisma models are:

- `User`
- `Club`
- `ClubMember`
- `Event`
- `Registration`
- `Announcement`

---

# API Structure

The backend is organized into:

```text
/api/auth
/api/events
/api/clubs
/api/me
/api/organizer
/api/announcements
```

Authentication-protected routes use the Catalyst authentication middleware.

---

# Development Notes

The project currently focuses on getting the core college event and community experience working end-to-end.

The frontend retains parts of the original Vibes design foundation while Catalyst-specific functionality is connected to the real backend and database.

The application is intended to be developed locally first before deployment.

---

# Security

Never commit:

```text
.env
```

to GitHub.

The repository `.gitignore` is configured to prevent local environment files and other development-only files from being committed.

---

# Repository

GitHub:

**Krishna-253/Catalyst-Website**

---

# Current Status

Catalyst currently has working flows for:

- Student registration
- Login and logout
- Authentication
- Event discovery
- Event details
- Event registration
- Registration cancellation
- Student registered events
- Clubs and communities
- Announcements
- Organizer dashboard
- Event creation and management
- Club creation and management

The core frontend, backend and database are connected and can be run together locally.
