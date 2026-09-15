import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict

from app.schemas.category import CategoryRead
from app.schemas.resource import TaskResourceRead
from app.schemas.subtask import SubtaskRead
from app.schemas.tag import TagRead

TaskStatus = Literal["todo", "in_progress", "done", "blocked"]
TaskPriority = Literal["low", "medium", "high", "urgent"]


class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    category_id: uuid.UUID | None = None
    status: TaskStatus = "todo"
    priority: TaskPriority = "medium"
    difficulty: int = 1
    estimated_hours: float | None = None
    due_date: date | None = None
    tag_ids: list[uuid.UUID] = []


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category_id: uuid.UUID | None = None
    status: TaskStatus | None = None
    priority: TaskPriority | None = None
    difficulty: int | None = None
    estimated_hours: float | None = None
    actual_hours: float | None = None
    due_date: date | None = None
    tag_ids: list[uuid.UUID] | None = None


class TaskRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str | None
    status: str
    priority: str
    difficulty: int
    estimated_hours: float | None
    actual_hours: float | None
    due_date: date | None
    started_at: datetime | None
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime
    category: CategoryRead | None
    tags: list[TagRead]
    subtasks: list[SubtaskRead]
    resources: list[TaskResourceRead]


class TaskListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    status: str
    priority: str
    difficulty: int
    due_date: date | None
    category: CategoryRead | None
    tags: list[TagRead]
