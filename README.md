# Overwatch

Operational intelligence platform. See `PROJECT_STATE.md` for the full architecture,
roadmap, phase process, and decisions log — that file is the source of truth for
this project, not this README.

## Getting Started

```bash
npm install
npm run dev
```

This starts both the backend (Express, `http://localhost:3001`) and the frontend
(Vite/React, `http://localhost:5173`) together. Open `http://localhost:5173` — it
will show a connection check confirming the frontend can reach the backend.

## Project Structure

```
overwatch/
├── web/    React + Vite + PWA frontend
├── api/    Express + Prisma backend
```

Each workspace has its own `package.json`. The root `package.json` uses npm
workspaces to tie them together so one install/dev command runs both.

## Database Setup (Prisma + Neon)

1. Create a Neon project (or use an existing one) and copy its Postgres
   connection string.
2. Copy `api/.env.example` to `api/.env` and paste the connection string in as
   `DATABASE_URL`.
3. From the repo root, run:
   ```bash
   npm run prisma:generate
   ```

We haven't run a real migration yet — the schema currently only defines the
`Organization` model (the foundation for the multi-tenant-ready design
documented in `PROJECT_STATE.md`). Real tables get added phase by phase.

## Branching

- `dev` — all active development happens here
- `main` — production-approved code only

Never commit experimental work directly to `main` (see `PROJECT_STATE.md`,
Section 7).
