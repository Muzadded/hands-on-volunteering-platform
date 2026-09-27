# HandsOn — Community Volunteering & Impact Platform

[![CI](https://github.com/Muzadded/hands-on-volunteering-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/Muzadded/hands-on-volunteering-platform/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/Node.js-v22.x-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-v19.0-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-v6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Express](https://img.shields.io/badge/Express-v4.21-000000?logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v16.0-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![DaisyUI](https://img.shields.io/badge/DaisyUI-v5.0-5A0E2D?logo=daisyui&logoColor=white)](https://daisyui.com)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

> **HandsOn** is a modern, community-driven social volunteering platform that intelligently matches volunteers with local events based on skills and cause preferences, verifies event attendance to track real impact hours, coordinates mutual aid help requests, and manages volunteer teams.

---

## 🚀 Key Features

- 🎯 **Intelligent Skill & Cause Matching**: Dynamic recommendation engine that scores events based on overlapping user skills, interests, and cause preferences (0–100% match score).
- ⏱️ **Verified Impact Tracking**: Track actual volunteer hours verified by event organizers through digital attendance check-ins, moving beyond unverified vanity counters.
- 📅 **Event Lifecycle Management**: Full event management workflow featuring location mapping, category tagging, volunteer capacity limits, and status tracking (*Upcoming*, *Ongoing*, *Completed*, *Cancelled*).
- 🤝 **Community Help Requests Board**: Mutual aid micro-task board supporting *Open*, *Claimed*, and *Resolved* workflow cycles for neighborhood assistance.
- 👥 **Team & Organization Governance**: Create and manage volunteer organizations and teams with role-based access control (*Owner*, *Admin*, *Member*) and secure private invite codes.
- 🔔 **In-App Notification Center**: Interactive notification system with bell alerts for event status updates, help request claims, and team invitations.
- 🗺️ **Interactive Maps**: Map visualization using Leaflet for event discoverability and location mapping.
- 🛡️ **Production-Grade Security**: JWT authentication with rate limiting (`express-rate-limit`), security headers (`helmet`), Zod schema validation, and strict CORS policies.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19, Vite 6 | Fast modern Single-Page Application (SPA) with HMR |
| **Styling & UI** | Tailwind CSS 4, DaisyUI 5 | Responsive utility-first styling & component library |
| **Maps & UI Utilities** | Leaflet, React Icons, Axios | Dynamic maps, icons, and centralized API client |
| **Backend API** | Node.js 22, Express 4 | Layered v1 RESTful API architecture |
| **Validation & Auth** | Zod 4, JWT, Bcrypt | Schema-driven request validation & password hashing |
| **Database** | PostgreSQL 16, `node-pg-migrate` | Relational storage with versioned SQL schema migrations |
| **Logging & Hardening**| Pino, Helmet, Express Rate Limit | Structured JSON logging & backend security |
| **DevOps & Testing** | Docker Compose, Vitest, GitHub Actions | Full containerization, unit/integration testing & CI |

---

## 🏛️ System Architecture

```text
                               ┌───────────────────────────────────┐
                               │       Browser (React 19 SPA)       │
                               └─────────────────┬─────────────────┘
                                                 │
                                                 │ HTTP/REST (Bearer JWT)
                                                 ▼
                               ┌───────────────────────────────────┐
                               │   Express API Server (/api/v1)    │
                               └─────────────────┬─────────────────┘
                                                 │
   ┌───────────────────┬─────────────────────────┼─────────────────────────┬───────────────────┐
   ▼                   ▼                         ▼                         ▼                   ▼
┌──────────────┐ ┌──────────────┐     ┌───────────────────┐     ┌─────────────────────┐ ┌─────────────┐
│ Auth & Users │ │ Event Match  │     │ Verified Impact   │     │  Community Help     │ │   Teams &   │
│ Service      │ │ Engine       │     │ Hours Service     │     │  Post Service       │ │ Invites     │
└──────┬───────┘ └──────┬───────┘     └─────────┬─────────┘     └──────────┬──────────┘ └──────┬──────┘
       │                │                       │                          │                 │
       └────────────────┴───────────────────────┼──────────────────────────┴─────────────────┘
                                                │
                                                ▼
                               ┌───────────────────────────────────┐
                               │    Repository Layer (pg pool)     │
                               └────────────────┬──────────────────┘
                                                │
                                                ▼
                               ┌───────────────────────────────────┐
                               │       PostgreSQL 16 Database      │
                               └───────────────────────────────────┘
```

### Modular Layer Structure

- **Routes (`/src/routes/v1`)**: Expose versioned REST endpoints for resources.
- **Middleware**: Transmit request IDs, enforce JWT auth, limit request rates, parse Zod payloads, and handle errors.
- **Controllers (`/src/controllers`)**: Parse incoming request context, execute domain services, and return JSON responses.
- **Services (`/src/services`)**: Encapsulate domain rules (matching engine, attendance verification, team permission checks).
- **Repositories (`/src/repositories`)**: Parameterized SQL queries executing against PostgreSQL.

---

## 🚦 Quick Start (Docker Compose)

The fastest way to run the entire HandsOn environment (PostgreSQL, Express Backend, React Frontend) is using Docker Compose.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine + Docker Compose.

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Muzadded/hands-on-volunteering-platform.git
   cd hands-on-volunteering-platform
   ```

2. **Start all services**:
   ```bash
   docker compose up --build
   ```

3. **Access Application Endpoints**:

   | Service | URL | Description |
   | :--- | :--- | :--- |
   | **Frontend Web** | [http://localhost:8080](http://localhost:8080) | React SPA Client |
   | **Backend API** | [http://localhost:5000](http://localhost:5000) | Express v1 REST API |
   | **Health Check** | [http://localhost:5000/health](http://localhost:5000/health) | API Status Check |
   | **OpenAPI Docs** | [http://localhost:5000/api/docs](http://localhost:5000/api/docs) | Interactive Swagger UI |
   | **PostgreSQL** | `localhost:5432` | DB: `HandsOn`, User: `postgres`, Pass: `postgres` |

---

### 🔑 Demo Accounts

When running via Docker Compose (or executing `npm run seed`), pre-populated demo accounts are available:

| Role | Email | Password | Permissions & Features |
| :--- | :--- | :--- | :--- |
| **Organizer** | `demo.organizer@handson.local` | `DemoPass123!` | Create & manage events, mark attendance, verify impact hours |
| **Volunteer** | `demo.volunteer@handson.local` | `DemoPass123!` | Match scoring, join events, post/claim help requests, join teams |

---

## 💻 Local Development (Manual Setup)

To run the frontend and backend applications natively on your machine:

### 1. Database

Start PostgreSQL 16 using Compose:
```bash
docker compose up db -d
```
*(Or use any local or cloud PostgreSQL instance).*

### 2. Backend Server (`HandsOn_Server`)

```bash
cd HandsOn_Server

# Copy environment template
cp .env.example .env

# Install dependencies
npm install

# Run database migrations
npm run migrate

# (Optional) Seed demo accounts & sample data
npm run seed

# Start API dev server with live auto-reload
npm run dev
```
The API will run at `http://localhost:5000`.

### 3. Frontend Application (`HandsOn_frontend`)

```bash
cd HandsOn_frontend

# Copy environment template
cp .env.example .env

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
The web client will run at `http://localhost:5173`.

---

## ⚙️ Environment Variables

### Backend (`HandsOn_Server/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `JWT_SECRET` | Yes | - | Secret key used to sign JWT authentication tokens (min 8 chars) |
| `CLIENT_ORIGIN` | Yes | - | Allowed CORS origin (e.g. `http://localhost:5173` or `http://localhost:8080`) |
| `PORT` | No | `5000` | HTTP port for the Express API |
| `NODE_ENV` | No | `development` | Operating environment (`development`, `test`, `production`) |
| `SEED_ON_START` | No | `false` | Run database seeder automatically upon boot |

### Frontend (`HandsOn_frontend/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `VITE_API_URL` | Yes | `http://localhost:5000/api/v1` | Base API URL for backend requests |

> ⚠️ **Security Notice**: Do not commit `.env` files to git repository. Use `.env.example` as a template.

---

## 📖 API Documentation

Interactive Swagger/OpenAPI documentation is available when the API server is running at:  
👉 **`http://localhost:5000/api/docs`**

### Key REST API Routes (`/api/v1`)

| Endpoint Category | HTTP Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- | :---: |
| **Health Check** | `GET` | `/health` | Server & DB health status | ✅ |
| **Authentication**| `POST` | `/api/v1/auth/register` | Register a new user | ✅ |
| **Authentication**| `POST` | `/api/v1/auth/login` | Authenticate user & retrieve JWT | ✅ |
| **User Profile** | `GET` | `/api/v1/users/me` | Fetch active user profile | ✅ |
| **User Profile** | `PUT` | `/api/v1/users/me` | Update skills, causes, and bio | ✅ |
| **Events** | `GET` | `/api/v1/events` | List events with filtering & match score | ✅ |
| **Events** | `POST` | `/api/v1/events` | Create a new volunteering event | ✅ |
| **Events** | `POST` | `/api/v1/events/:id/join` | Join an upcoming event | ✅ |
| **Events** | `POST` | `/api/v1/events/:id/attendance` | Verify volunteer attendance & log hours | ✅ (Organizer) |
| **Help Requests**| `GET` | `/api/v1/help-posts` | List mutual aid micro-task posts | ✅ |
| **Help Requests**| `POST` | `/api/v1/help-posts` | Create a new help request | ✅ |
| **Help Requests**| `POST` | `/api/v1/help-posts/:id/claim` | Claim an open help request | ✅ |
| **Teams** | `GET` | `/api/v1/teams` | List volunteer teams | ✅ |
| **Teams** | `POST` | `/api/v1/teams` | Create a new team | ✅ |
| **Teams** | `POST` | `/api/v1/teams/join-by-code` | Join a team with a private invite code | ✅ |
| **Notifications**| `GET` | `/api/v1/notifications` | Fetch user notification bell alerts | ✅ |

---

## 🧪 Testing & Linting

### Server Scripts (`HandsOn_Server`)

- `npm run dev` — Launch development server via nodemon + tsx
- `npm start` — Production server execution via tsx
- `npm test` — Run unit and API integration tests with Vitest
- `npm run test:watch` — Interactive test runner
- `npm run migrate` / `npm run migrate:down` — Apply / rollback SQL migrations
- `npm run seed` — Populate database with demo data
- `npm run lint` — ESLint validation
- `npm run format` — Prettier code formatting

### Frontend Scripts (`HandsOn_frontend`)

- `npm run dev` — Launch Vite dev server
- `npm run build` — Compile production SPA bundle
- `npm run preview` — Locally preview production build
- `npm test` — Run component & unit tests with Vitest + Testing Library
- `npm run lint` — ESLint validation

---

## ⚙️ Continuous Integration (CI)

GitHub Actions (`.github/workflows/ci.yml`) runs automatically on push and pull request:

- **Backend CI Job**: Boots a real PostgreSQL 16 service container, runs database migrations, lints code, and executes Vitest integration tests.
- **Frontend CI Job**: Lints code, executes Vitest tests, and verifies the production build (`npm run build`).

---

## 🌐 Production Deployment

HandsOn can be deployed using **Render** for the API and PostgreSQL, and **Vercel** for the frontend SPA.

### Render Deployment (Backend API + Database)

1. Provision a PostgreSQL 16 instance on Render; copy the internal `DATABASE_URL`.
2. Create a Web Service connected to `HandsOn_Server`.
3. Set **Start Command**: `npm run migrate && npx tsx server.js`
4. Set Environment Variables: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_ORIGIN` (your Vercel frontend URL), `NODE_ENV=production`.

### Vercel Deployment (Frontend SPA)

1. Import repository to Vercel and choose `HandsOn_frontend` as the root directory.
2. Select **Vite** framework preset.
3. Set Environment Variable: `VITE_API_URL=https://<your-render-api>/api/v1`.

---

## 🎬 3-Minute Portfolio Demo Walkthrough

1. **Volunteer Matching**: Log in as a volunteer (`demo.volunteer@handson.local`). Open **Events** and observe the personalized **Match %** scores.
2. **Event Join & Attendance**: Join an event as a volunteer. Log in as an organizer (`demo.organizer@handson.local`), navigate to the event, and mark attendance for the volunteer.
3. **Verified Impact**: Switch back to the volunteer profile to see updated **Verified Impact Hours** on the dashboard.
4. **Mutual Aid & Help Requests**: Post or claim a help request on the Help Board, then check the notification bell for instant updates.
5. **Teams**: Browse volunteer teams, view team member roles, or join a private group using a 6-character invite code.

---

## 📁 Project Structure

```text
hands-on-volunteering-platform/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI workflow
├── docker-compose.yml             # Full-stack container configuration
├── README.md                      # Platform documentation
├── PRODUCTION_MODERNIZATION_PLAN.md # Technical roadmap & design decisions
├── HandsOn_Server/                # Express API Backend
│   ├── src/
│   │   ├── config/                # Environment variables & DB pool connection
│   │   ├── controllers/           # HTTP Request Handlers
│   │   ├── docs/                  # OpenAPI / Swagger specs
│   │   ├── middleware/            # Auth, Rate limiting, Request tracing, Validation
│   │   ├── repositories/          # Data Access Layer (SQL queries)
│   │   ├── routes/                # API Route Definitions (/api/v1)
│   │   ├── services/              # Business Logic & Algorithms
│   │   └── utils/                 # Logging & utilities
│   ├── migrations/                # Versioned SQL migrations
│   ├── seeds/                     # Demo data seeder
│   └── tests/                     # Vitest API & unit tests
└── HandsOn_frontend/              # React + Vite Frontend SPA
    ├── src/
    │   ├── components/            # Reusable UI components & modals
    │   ├── context/               # React Auth & Toast contexts
    │   ├── pages/                 # Main views (Events, Help, Teams, Profile)
    │   ├── services/              # Axios API Client integration
    │   └── utils/                 # Formatting & helper utilities
    └── public/                    # Static assets
```

---

## 📜 License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).

