import uuid
from datetime import date

from pydantic import BaseModel


class DailyPoint(BaseModel):
    date: date
    tasks_completed: int
    score: float


class WeeklyPoint(BaseModel):
    week_start: date
    tasks_completed: int
    score: float


class CategoryBreakdownItem(BaseModel):
    category_id: uuid.UUID | None
    category_name: str
    color: str | None
    task_count: int
    score: float


class SnapshotRead(BaseModel):
    period_type: str
    period_start: date
    tasks_created: int
    tasks_completed: int
    total_score: float
    completion_rate: float
    avg_completion_time_hours: float | None
