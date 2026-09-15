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

Everything is designed to run on free tiers: Neon (DB), Render (backend),
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

### 2. Backend — Render

1. [render.com](https://render.com) → **New +** → **Web Service** → connect this GitHub repo
2. **Root directory**: `backend`
3. **Build command**: `pip install -r requirements.txt`
4. **Start command**: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Instance type**: Free
6. Environment variables (Render → your service → Environment):

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | your Neon connection string, `postgresql+asyncpg://...?ssl=require` (note: `+asyncpg` driver, and `ssl=require` not `sslmode=require`) |
   | `JWT_SECRET` | a long random string (don't reuse the local dev one) |
   | `JWT_ALGORITHM` | `HS256` |
   | `ACCESS_TOKEN_EXPIRE_MINUTES` | `10080` |
   | `GEMINI_API_KEY` | your Gemini key |
   | `TAVILY_API_KEY` | your Tavily key |
   | `CORS_ORIGINS` | your Vercel URL once deployed, e.g. `https://your-app.vercel.app` (comma-separate if you need more than one) |

7. Deploy. Render gives you a URL like `https://ai-task-tracker-api.onrender.com` — note it for step 3.

Free-tier Render web services sleep after inactivity and take ~30–60s to wake on the next request — expected, not a bug.

### 3. Frontend — Vercel

1. [vercel.com](https://vercel.com) → **Add New → Project** → import this GitHub repo
2. **Root directory**: `frontend` (Next.js is auto-detected)
3. Environment variable:

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | the Render backend URL from step 2, no trailing slash |

4. Deploy. Vercel gives you a URL like `https://your-app.vercel.app`.

### 4. Close the loop

Go back to Render and set `CORS_ORIGINS` to the real Vercel URL from step 3 (it won't be known until after the frontend's first deploy), then redeploy the backend so CORS actually allows requests from it.
