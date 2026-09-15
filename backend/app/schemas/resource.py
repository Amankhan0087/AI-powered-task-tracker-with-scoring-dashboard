import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict

ResourceType = Literal["link", "file", "note", "ai_research"]


class TaskResourceCreate(BaseModel):
    type: ResourceType
    title: str | None = None
    url: str | None = None
    content: str | None = None


class TaskResourceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    type: str
    title: str | None
    url: str | None
    content: str | None
    created_at: datetime
