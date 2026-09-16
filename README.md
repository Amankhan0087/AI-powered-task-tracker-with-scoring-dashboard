# AI-Powered Task Tracker

A full-stack task tracker with a completion/streak scoring engine, a BI-style
progress dashboard, and an AI assistant that can research the web on your
behalf and attach findings to a task.

## Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind + shadcn/ui (Base UI primitives) |
| Charts | Recharts |
| Backend | FastAPI (async) |
| Database | PostgreSQL (Neon.tech free tier) |
| ORM | SQLAlchemy 2.0 async + Alembic |
| Auth | JWT (OAuth2PasswordBearer) |
| AI chat | Google Gemini (`gemini-3.6-flash`) |
| Web research | Tavily |

Everything is designed to run on free tiers: Neon (DB), Railway (backend),
Vercel (frontend).

## Repo layout

```
backend/    FastAPI app, SQLAlchemy models, Alembic migrations, services
frontend/   Next.js app
```

## Local development

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate     # Windows
pip install -r requirements.txt
cp .env.example .env       # fill in DATABASE_URL, JWT_SECRET, GEMINI_API_KEY, TAVILY_API_KEY
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # fill in NEXT_PUBLIC_API_URL
npm run dev
```

## Environment variables

See `backend/.env.example` and `frontend/.env.example`. Real secrets are
never committed — only empty placeholders.

## Scoring model

```
base_points     = difficulty * 10
on_time_bonus   = +15 if completed_at <= due_date else 0
overdue_penalty = -5 per day late, capped at -30
streak_bonus    = +5 per consecutive day with >=1 task completed (computed once per day)
```

## Deployment

### 1. Database — Neon (already set up)

Nothing to do here beyond the connection string already in use for local dev.

### 2. Backend — Railway

**Live at:** `https://ai-powered-task-tracker-with-scoring-dashboard-production.up.railway.app`

We tried Render first, but the workspace's payment method had been removed and
Render requires card verification to create *any* service — even free ones —
so we moved to Railway instead (a $5-credit/30-day trial, not a permanent
free tier, but card-free to start).

To redeploy or reproduce this setup:

1. [railway.com](https://railway.com) → sign in with GitHub → **New Project** →
   **GitHub Repository** → select this repo (first time: you'll need to
   install/authorize the Railway GitHub App — `Configure GitHub App` in the
   repo picker if it shows no repos)
2. On the service → **Settings → Source**: set **Root Directory** to `backend`
3. **Settings → Build**: Custom Build Command → `pip install -r requirements.txt`
4. **Settings → Deploy**: Custom Start Command →
   `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Variables** tab: Railway auto-detects the variable names from
   `app/core/config.py` as "Suggested Variables" — fill in `DATABASE_URL`
   (Neon connection string, `postgresql+asyncpg://...?ssl=require` — note the
   `+asyncpg` driver and `ssl=require`, not `sslmode=require`), `GEMINI_API_KEY`,
   `TAVILY_API_KEY`; `JWT_SECRET` auto-fills with a generated secret,
   `JWT_ALGORITHM`/`ACCESS_TOKEN_EXPIRE_MINUTES`/`CORS_ORIGINS` auto-fill with
   sensible defaults (update `CORS_ORIGINS` per step 4 below). Click **Add**
   to save the suggested variables — typing into them alone doesn't persist.
6. **Settings → Networking**: **Generate Domain** (port `8080` — Railway maps
   this to the `$PORT` your start command already reads)
7. Click **Deploy** to apply all staged settings/variables together.

Gotcha we hit: the build failed the first time with
`ValueError: the greenlet library is required to use this function` during
the Alembic migration step — `greenlet` was present locally as a transitive
dependency but wasn't pinned in `requirements.txt`, so a different resolver
didn't install it. Fixed by adding `greenlet==3.5.6` explicitly.

### 3. Frontend — Vercel

**Live at:** `https://ai-powered-task-tracker-with-scorin.vercel.app`

1. [vercel.com](https://vercel.com) → **Add New → Project** → import this GitHub repo
   (first time: click **Install** to grant the Vercel GitHub App access to the repo)
2. **Root directory**: `frontend` — Vercel auto-detects this from the monorepo
   layout and auto-detects the Next.js framework preset too
3. Environment variable:

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | the Railway backend URL from step 2, no trailing slash |

4. Deploy. Vercel gives you a URL like `https://your-app.vercel.app`.

### 4. Close the loop

Go back to Railway (Variables tab) and set `CORS_ORIGINS` to a comma-separated
list including the real Vercel URL from step 3 (it won't be known until after
the frontend's first deploy) — e.g.
`http://localhost:3000,https://your-app.vercel.app` — then redeploy so CORS
actually allows requests from it. Skipping this step doesn't break the build;
it just makes every request from the deployed frontend fail with a generic
"Something went wrong" (a browser-blocked CORS error, not a 4xx/5xx from the
API), which only shows up once you actually click around the live site.
