# HandsOn

Community volunteering platform: match skills/causes to events, verify attendance, track impact hours, and coordinate help requests and teams.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite, Tailwind CSS 4, DaisyUI |
| Backend | Node.js, Express, Zod, JWT |
| Database | PostgreSQL |
| Ops | Docker Compose, GitHub Actions, Vitest |

API version: `/api/v1` (legacy `/auth`, `/api`, `/dashboard` still mounted for compatibility).

## Quick start (Docker Compose)

Requires Docker Desktop / Engine.

```bash
cd hands-on-volunteering-platform
docker compose up --build
```

| Service | URL |
|---------|-----|
| Web | http://localhost:8080 |
| API | http://localhost:5000 |
| Health | http://localhost:5000/health |
| OpenAPI | http://localhost:5000/api/docs |
| Postgres | localhost:5432 (`postgres` / `postgres` / `HandsOn`) |

Compose runs migrations on API start and seeds demo accounts when `SEED_ON_START=true`.

### Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Organizer | `demo.organizer@handson.local` | `DemoPass123!` |
| Volunteer | `demo.volunteer@handson.local` | `DemoPass123!` |

## Local development (without Docker for apps)

### 1. Database

Use Compose for Postgres only:

```bash
docker compose up db -d
```

Or point `DATABASE_URL` at any PostgreSQL 16 instance.

### 2. Backend

```bash
cd HandsOn_Server
cp .env.example .env   # set DATABASE_URL, JWT_SECRET, CLIENT_ORIGIN
npm install
npm run migrate
npm run seed           # optional
npm run dev            # http://localhost:5000
```

### 3. Frontend

```bash
cd HandsOn_frontend
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api/v1
npm install
npm run dev            # http://localhost:5173
```

Set backend `CLIENT_ORIGIN` to the Vite origin (default `http://localhost:5173`).

## Environment variables

### Backend (`HandsOn_Server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | yes | Postgres connection string |
| `JWT_SECRET` | yes | Signing secret (min 8 chars; use a long random value in prod) |
| `CLIENT_ORIGIN` | yes | Allowed CORS origin (exact frontend URL) |
| `PORT` | no | Default `5000` |
| `NODE_ENV` | no | `development` \| `test` \| `production` |
| `SEED_ON_START` | no | Compose/Docker: run demo seed on boot |

### Frontend (`HandsOn_frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | yes | e.g. `http://localhost:5000/api/v1` or your deployed API `/api/v1` |

Never commit `.env` files. Use `.env.example` as the template.

## Scripts

### Backend

- `npm run dev` — watch server
- `npm start` — production-style start via `tsx`
- `npm run migrate` / `migrate:down`
- `npm run seed`
- `npm test` — Vitest (matching unit + API integration when DB is set)
- `npm run lint`

### Frontend

- `npm run dev` / `build` / `preview`
- `npm test` — Vitest + Testing Library
- `npm run lint`

## Architecture

```text
Browser (React SPA)
    │  JWT in Authorization header
    ▼
Express (/api/v1) ── Zod validate ── services ── repositories ── PostgreSQL
    │
    ├── matching (skills/causes ↔ event tags/category)
    ├── attendance → verified impact hours
    ├── help posts (open / claimed / resolved)
    ├── teams (owner | admin | member + invite codes)
    └── notifications (in-app bell)
```

Key product flows:

1. Register with skills & causes → recommended events scored by overlap  
2. Join event → organizer marks attendance → impact hours update  
3. Help request → claim / comment → notifications  
4. Teams → roles, private invite codes  

## Tests & CI

GitHub Actions (`.github/workflows/ci.yml`) on push/PR:

- Backend: migrate against Postgres service → lint → test  
- Frontend: lint → test → build  

## Deploy

Documented path: **Render** (API + managed Postgres) + **Vercel** (frontend).

### Render (API)

1. Create a PostgreSQL instance; copy the internal/external `DATABASE_URL`.
2. New Web Service from `HandsOn_Server`, Node, start command:  
   `npm run migrate && npx tsx server.js`
3. Env vars: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_ORIGIN` (your Vercel URL), `NODE_ENV=production`, `PORT` (Render sets this — ensure the app reads `process.env.PORT`).
4. After first deploy, optionally run seed from a one-off shell: `npm run seed`.

### Vercel (frontend)

1. Root directory: `HandsOn_frontend`
2. Build: `npm run build` · Output: `dist`
3. Env: `VITE_API_URL=https://<your-render-api>/api/v1`
4. Redeploy after changing env (Vite bakes `VITE_*` at build time).

CORS: set API `CLIENT_ORIGIN` to the exact Vercel origin (no trailing slash mismatch).

> Public live URL: publish with your own Render/Vercel accounts using the steps above. Compose remains the clone-and-run path without cloud credentials.

## Portfolio demo script (≈3 minutes)

1. Login as volunteer → open Events → note **Recommended** match scores  
2. Join an open event (or create as organizer)  
3. As organizer, mark attendance → refresh volunteer dashboard impact  
4. Post or claim a help request → check notification bell  
5. Open Teams → show role / invite code for a private team  

## Interview talking points

- **Security baseline:** JWT on `/api`, IDOR checks on profile updates, Zod validation, rate-limited auth, Helmet, locked CORS  
- **Versioned API:** `/api/v1` layered routes/controllers/services/repos while legacy mounts remain during migration  
- **Differentiator:** skill/cause matching + verified attendance hours (not vanity counters)  
- **Ops:** migrations, seed, Docker Compose, CI with real Postgres integration tests  

## Project layout

```text
hands-on-volunteering-platform/
├── docker-compose.yml
├── .github/workflows/ci.yml
├── HandsOn_Server/          # Express API
│   ├── src/                 # v1 app, routes, services, validators
│   ├── migrations/
│   ├── seeds/
│   └── tests/
└── HandsOn_frontend/        # Vite React SPA
    └── src/
```

Modernization plan: see [`PRODUCTION_MODERNIZATION_PLAN.md`](./PRODUCTION_MODERNIZATION_PLAN.md).

## License

ISC
