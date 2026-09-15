from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import auth, categories, scoring, tags, tasks
from app.core.config import settings

app = FastAPI(title="AI Task Tracker API", version="0.1.0")

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


@app.get("/api/v1/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
