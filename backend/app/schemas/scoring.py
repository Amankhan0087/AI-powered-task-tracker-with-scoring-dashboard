import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ScoreEventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    task_id: uuid.UUID | None
    points: float
    reason: str | None
    created_at: datetime


class ScoreSummary(BaseModel):
    total_score: float
    current_streak: int
    best_streak: int
