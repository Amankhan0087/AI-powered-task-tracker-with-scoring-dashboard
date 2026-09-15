import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import auth, categories, progress, scoring, tags, tasks
from app.core.config import settings
from app.services.nightly_job import run_nightly_refresh_loop


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(run_nightly_refresh_loop())
    yield
    task.cancel()


app = FastAPI(title="AI Task Tracker API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(tags.router)
app.include_router(tasks.router)
app.include_router(scoring.router)
app.include_router(progress.router)


@app.get("/api/v1/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
