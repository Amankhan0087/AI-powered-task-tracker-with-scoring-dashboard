# AI-Powered Task Tracker

A full-stack task tracker with a completion/streak scoring engine, a BI-style
progress dashboard, and an AI assistant that can research the web on your
behalf and attach findings to a task.

## Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui |
| Charts | Recharts |
| Backend | FastAPI (async) |
| Database | PostgreSQL (Neon.tech free tier) |
| ORM | SQLAlchemy 2.0 async + Alembic |
| Auth | JWT (OAuth2PasswordBearer) |
| AI chat | Google Gemini |
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

- **Database**: [Neon.tech](https://neon.tech) free tier (serverless Postgres)
- **Backend**: [Render](https://render.com) free Web Service
- **Frontend**: [Vercel](https://vercel.com) free tier
