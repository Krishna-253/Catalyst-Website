# Catalyst — Complete Fresh Computer Setup Guide

Catalyst is a college-focused event and community platform with:

- A Vibes-inspired frontend
- A Node.js + Express backend
- A PostgreSQL database
- Prisma for database access
- Student authentication
- Events and event registration
- Clubs and communities
- Announcements
- Organizer functionality

This guide is written for someone who has **only the Catalyst ZIP file** on a completely fresh Windows computer.

You do **not** need:

- A GitHub account
- Git
- A domain
- Website hosting
- An API key
- A cloud database
- Python
- The original Vibes website separately

You only need to install the prerequisites below.

---

# 1. Install the Prerequisites

## 1.1 Install Node.js

Node.js is required to run the Catalyst backend.

Download the **LTS** version from:

https://nodejs.org/

Install it using the normal/default options.

After installation, open a **new** PowerShell or Command Prompt window and run:

```powershell
node --version
```

Then:

```powershell
npm --version
```

Both commands should print version numbers.

If they do, Node.js is installed correctly.

---

## 1.2 Install PostgreSQL

Catalyst uses PostgreSQL to store users, events, registrations, clubs, announcements, and other application data.

Download PostgreSQL for Windows from:

https://www.postgresql.org/download/windows/

Install it using the normal options.

During installation, PostgreSQL asks you to create a password for the PostgreSQL `postgres` user.

**Remember this password. You will need it later.**

The normal local PostgreSQL settings are:

```text
Host: localhost
Port: 5432
Username: postgres
```

If you selected different settings during installation, use those settings instead.

---

## 1.3 Install VS Code

VS Code is recommended for running the project.

Download it from:

https://code.visualstudio.com/

Install it normally.

---

# 2. Extract the Catalyst ZIP

Extract the Catalyst ZIP file somewhere convenient.

For example:

```text
C:\Projects\Catalyst-Website-main
```

After extracting it, the project should contain folders/files similar to:

```text
Catalyst-Website-main/
│
├── backend/
├── site/
├── package.json
├── package-lock.json
├── README.md
└── ...
```

The two most important folders are:

```text
backend/
site/
```

---

# 3. Open the Project in VS Code

Open VS Code.

Select:

```text
File → Open Folder
```

Choose the extracted Catalyst project folder.

For example:

```text
C:\Projects\Catalyst-Website-main
```

Then open:

```text
Terminal → New Terminal
```

Make sure the terminal is inside the main Catalyst project folder.

For example:

```text
PS C:\Projects\Catalyst-Website-main>
```

If it is somewhere else, use:

```powershell
cd "C:\Projects\Catalyst-Website-main"
```

Replace the path with wherever you extracted the project.

---

# 4. Create the PostgreSQL Database

Catalyst needs a PostgreSQL database named:

```text
catalyst
```

No tables need to be created manually.

## Using pgAdmin 4

PostgreSQL normally installs **pgAdmin 4** along with it.

Open:

```text
pgAdmin 4
```

from the Windows Start Menu.

### Step 1

On the left side, find:

```text
Servers
```

Expand it.

You should see your PostgreSQL server.

For example:

```text
Servers
└── PostgreSQL 17
```

The version may be different.

### Step 2

Click the PostgreSQL server.

If pgAdmin asks for the password, enter the PostgreSQL password you created during installation.

### Step 3

Expand:

```text
Databases
```

### Step 4

Right-click:

```text
Databases
```

Choose:

```text
Create → Database...
```

### Step 5

In the Database field, enter exactly:

```text
catalyst
```

Leave the owner as:

```text
postgres
```

unless you deliberately created another PostgreSQL user.


### IMPORTANT

Do **not** create tables yourself.

Prisma will create the Catalyst tables in a later step.

---

# 5. Create the Backend `.env` File

The real `.env` file is intentionally **not included in the ZIP**.

It contains local database credentials and the authentication secret.

Inside the extracted project, open:

```text
backend/
```

Create a new file named exactly:

```text
.env
```

The structure should look like:

```text
backend/
├── .env
├── server.js
├── package.json
├── prisma/
└── routes/
```

Open `backend/.env` and put:

```env
DATABASE_URL="postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/catalyst"
JWT_SECRET="catalyst-local-development-secret"
PORT=5000
```

## Change `YOUR_POSTGRES_PASSWORD`

Replace:

```text
YOUR_POSTGRES_PASSWORD
```

with the password you created when installing PostgreSQL.

For example:

```env
DATABASE_URL="postgresql://postgres:mypassword123@localhost:5432/catalyst"
JWT_SECRET="catalyst-local-development-secret"
PORT=5000
```

Do **not** use the example password above. Use your own PostgreSQL password.

## What about `JWT_SECRET`?

Yes, you need to provide a value for it.

You do **not** need to get it from a website or service.

For local development, you can choose your own random/unique string.

For example:

```env
JWT_SECRET="catalyst-local-secret-2026"
```

It is used by Catalyst for authentication tokens.

## Final `.env` example

Your file should look similar to:

```env
DATABASE_URL="postgresql://postgres:YOUR_REAL_PASSWORD@localhost:5432/catalyst"
JWT_SECRET="catalyst-local-secret-2026"
PORT=5000
```

Make sure the file is named:

```text
.env
```

and **not**:

```text
.env.txt
```

Never upload or share your real `.env` file.

---

# 6. Install Backend Dependencies

Open a terminal in VS Code.

Go into the backend folder:

```powershell
cd backend
```

Run:

```powershell
npm install
```

Wait for it to finish.

This installs the packages required by the Catalyst backend.

---

# 7. Create the Database Tables Using Prisma

Still inside:

```text
backend/
```

run:

```powershell
npx prisma migrate deploy
```

Prisma will use the `DATABASE_URL` from:

```text
backend/.env
```

and apply the migration included in the project.

This creates the Catalyst database tables.

After that, run:

```powershell
npx prisma generate
```

This generates the Prisma client used by the backend.

You do **not** need to manually create tables in pgAdmin.

---

# 8. Start the Backend

Still inside the `backend` folder, run:

```powershell
node server.js
```

You should see:

```text
Server running on http://localhost:5000
```

**Keep this terminal open.**

The backend is now running.

---

# 9. Test the Backend

Open a browser.

Go to:

```text
http://localhost:5000/api/health
```

A working setup should return something similar to:

```json
{
  "status": "ok",
  "message": "Catalyst backend is running",
  "database": "connected"
}
```

If the response says:

```text
database: connected
```

then the backend is successfully connected to PostgreSQL.

---

# 10. If You See `Cannot GET /`

If you open:

```text
http://localhost:5000/
```

you may see:

```text
Cannot GET /
```

This does **not** mean the backend is broken.

Port `5000` is the Catalyst backend/API server.

The backend does not serve the website homepage at `/`.

To test the backend, use:

```text
http://localhost:5000/api/health
```

To see the actual Catalyst/Vibes website, use the frontend server described below.

---

# 11. Start the Frontend / Vibes Website

The frontend is stored in:

```text
site/
```

The Vibes portion is already included in the project.

There is **no separate Vibes website installation** and no separate Vibes backend.

The `site` folder contains the HTML, CSS, JavaScript, fonts, images, animations, and other frontend assets.

## Install Live Server

In VS Code, open the Extensions panel.

Search for:

```text
Live Server
```

Install the Live Server extension.

## Start the frontend

Make sure the backend terminal from the previous steps is still running.

In VS Code's Explorer, open:

```text
site/index.html
```

Right-click the file.

Choose:

```text
Open with Live Server
```

The frontend should open in your browser.

It will normally use an address similar to:

```text
http://127.0.0.1:5500/site/
```

or:

```text
http://localhost:5500/site/
```

---

# 12. IMPORTANT: Frontend and Backend Connection

The Catalyst frontend communicates with the backend API.

The backend runs on:

```text
http://localhost:5000
```

The frontend is served separately by Live Server.

The frontend makes requests to:

```text
http://localhost:5000/api
```

The general architecture is:

```text
                 PostgreSQL
                localhost:5432
                     │
                     │ Prisma
                     ▼
             Catalyst Backend
               localhost:5000
                     │
                     │ REST API
                     ▼
          Catalyst / Vibes Frontend
             Live Server / site/
```

---

# 13. Important Note About Frontend Port

The current backend configuration allows the Catalyst frontend origin:

```text
http://localhost:8000
```

If Live Server opens the site on a different port such as:

```text
http://localhost:5500
```

the browser may block API requests because of CORS.

If this happens, use the frontend on the configured port:

```text
8000
```

or update the backend CORS configuration to match the port being used.

The important rule is:

```text
Frontend origin
        ↓
must be allowed by
        ↓
Backend CORS configuration
```

Do not assume that `5500` will work with the current backend configuration.

---

# 14. Running the Complete Application

Once the initial setup is finished, Catalyst uses:

### PostgreSQL

```text
localhost:5432
```

### Backend

```text
localhost:5000
```

### Frontend

The `site` folder served through Live Server.

The complete flow is:

```text
PostgreSQL
     │
     ▼
Catalyst Backend
     │
     │ /api/*
     ▼
Catalyst / Vibes Frontend
```

Both the backend and frontend need to be running at the same time.

---

# 15. Backend Terminal

The backend terminal should contain:

```powershell
cd backend
node server.js
```

and show:

```text
Server running on http://localhost:5000
```

Keep this terminal open.

---

# 16. Frontend

The frontend is started from:

```text
site/index.html
```

using:

```text
Open with Live Server
```

Keep the frontend server running.

Then open the URL provided by Live Server.

---

# 17. What URL Should Be Used for What?

| Purpose | URL |
|---|---|
| Catalyst website | Live Server URL for `site/index.html` |
| Backend server | `http://localhost:5000` |
| Backend health check | `http://localhost:5000/api/health` |
| PostgreSQL | `localhost:5432` |

Remember:

```text
localhost:5000
```

is the **backend**.

The Live Server URL is the **website**.

---

# 18. Testing the Complete Application

After both the backend and frontend are running:

1. Open the Catalyst website.
2. Register a student account.
3. Log in.
4. Browse events.
5. Open an event.
6. Register for an event.
7. Check My Events.
8. Browse clubs.
9. View announcements.
10. Log out.

For backend verification, open:

```text
http://localhost:5000/api/health
```

and make sure the database is reported as connected.

---

# 19. Main Frontend Pages

| File | Purpose |
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

# 20. Main Backend API Areas

```text
/api/auth
/api/events
/api/clubs
/api/me
/api/organizer
/api/announcements
/api/health
```

Backend health check:

```text
http://localhost:5000/api/health
```

---

# 21. Database Models

Catalyst uses PostgreSQL with Prisma.

The main database models are:

```text
User
Club
ClubMember
Event
Registration
Announcement
```

Schema:

```text
backend/prisma/schema.prisma
```

Migrations:

```text
backend/prisma/migrations/
```

---

# 22. What the Vibes Part Means

The project uses the Vibes website as the visual/frontend foundation.

Vibes-related files are included inside:

```text
site/assets/
site/external/
site/public/
```

These include things such as:

- Styling
- Fonts
- Images
- Animations
- Navigation effects
- Frontend assets

Catalyst functionality has been connected to this frontend.

There is:

- No separate Vibes backend
- No separate Vibes database
- No separate Vibes installation
- No separate Vibes server

The Vibes/Catalyst frontend is simply the `site` folder served locally.

---

# 23. Starting Catalyst Again Later

After the first setup, you do **not** need to reinstall Node.js, PostgreSQL, or the npm packages every time.

Make sure PostgreSQL is running.

Then start the backend:

```powershell
cd backend
node server.js
```

Then start the frontend by opening:

```text
site/index.html
```

with:

```text
Open with Live Server
```

Then open the frontend URL.

---

# 24. Common Problems

## `Cannot GET /`

You opened:

```text
http://localhost:5000/
```

This is the backend root.

Use:

```text
http://localhost:5000/api/health
```

for the backend health check.

Use the Live Server URL for the website.

---

## Prisma says `DATABASE_URL` is required

Make sure this file exists:

```text
backend/.env
```

and contains:

```env
DATABASE_URL="postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/catalyst"
JWT_SECRET="catalyst-local-development-secret"
PORT=5000
```

---

## Prisma cannot connect to PostgreSQL

Check:

- PostgreSQL is installed.
- PostgreSQL is running.
- The `catalyst` database exists.
- The PostgreSQL username is correct.
- The PostgreSQL password is correct.
- The PostgreSQL port is correct.
- `DATABASE_URL` is correct.

The normal PostgreSQL port is:

```text
5432
```

---

## `node` is not recognized

Install Node.js LTS:

https://nodejs.org/

Then close and reopen VS Code.

Test:

```powershell
node --version
```

---

## `npm` is not recognized

Install Node.js LTS and restart VS Code.

Test:

```powershell
npm --version
```

---

## Website opens but data does not load

First check:

```text
http://localhost:5000/api/health
```

It should report:

```text
database: connected
```

Then make sure:

- The backend terminal is still running.
- The frontend is being served through Live Server.
- The frontend origin is allowed by the backend CORS configuration.
- You did not open `index.html` directly using `file://`.

---

## Frontend gives CORS errors

The current backend configuration allows a specific frontend origin.

If Live Server is using a different port, the backend may reject the browser request.

Check the frontend URL and make sure it matches the allowed origin in:

```text
backend/server.js
```

---

## PostgreSQL service is stopped

Press:

```text
Windows + R
```

Enter:

```text
services.msc
```

Find the PostgreSQL service and start it.

---

## Port 5000 is already in use

Another application may already be using port 5000.

Stop that application and restart Catalyst.

---

# 25. Fresh Computer Quick Checklist

```text
INSTALL
1. Install Node.js LTS
2. Install PostgreSQL
3. Install VS Code

DATABASE
4. Make sure PostgreSQL is running
5. Open pgAdmin 4
6. Create database named: catalyst

PROJECT
7. Extract the Catalyst ZIP
8. Open the project in VS Code
9. Open a VS Code terminal

ENVIRONMENT
10. Create backend/.env
11. Add DATABASE_URL
12. Add JWT_SECRET
13. Add PORT=5000

BACKEND
14. cd backend
15. npm install
16. npx prisma migrate deploy
17. npx prisma generate
18. node server.js

BACKEND TEST
19. Open http://localhost:5000/api/health
20. Confirm database is connected

FRONTEND
21. Install Live Server extension in VS Code
22. Open site/index.html
23. Right-click → Open with Live Server
24. Open the URL provided by Live Server

DONE
25. Keep PostgreSQL running
26. Keep backend terminal running
27. Keep frontend server running
28. Use the frontend URL for the website
```

---

# 26. Final Local Architecture

```text
┌───────────────────────────────┐
│         PostgreSQL            │
│         localhost:5432        │
│                               │
│         catalyst DB           │
└───────────────┬───────────────┘
                │
                │ Prisma
                ▼
┌───────────────────────────────┐
│       Catalyst Backend        │
│       Node + Express          │
│       localhost:5000          │
│                               │
│       /api/auth               │
│       /api/events             │
│       /api/clubs              │
│       /api/me                 │
│       /api/organizer          │
│       /api/announcements      │
│       /api/health             │
└───────────────┬───────────────┘
                │
                │ REST API
                ▼
┌───────────────────────────────┐
│    Catalyst / Vibes Frontend  │
│       site/ + Live Server     │
│                               │
│       HTML + CSS + JS         │
│       Vibes visual assets     │
│       Catalyst functionality  │
└───────────────────────────────┘
```

Catalyst is running correctly when:

```text
✓ Node.js is installed
✓ PostgreSQL is running
✓ The catalyst database exists
✓ backend/.env exists and is correct
✓ Prisma migrations completed
✓ Backend says:
  Server running on http://localhost:5000

✓ http://localhost:5000/api/health
  reports database: connected

✓ Live Server is serving site/index.html
✓ The Catalyst/Vibes website opens
✓ The website can communicate with the backend
```

---

# 27. Important Security Note

Never commit or share:

```text
backend/.env
```

The `.env` file contains local database credentials and authentication configuration.

Every person running Catalyst on their own computer should create their **own** `backend/.env` using their own PostgreSQL password and a local JWT secret.

The database and application run locally on the computer. No external domain or cloud service is required for local development.
