import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class ConversationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str | None
    task_id: uuid.UUID | None
    created_at: datetime


class MessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    role: str
    content: str
    sources: Any | None
    created_at: datetime


class ChatRequest(BaseModel):
    conversation_id: uuid.UUID | None = None
    message: str
    task_id: uuid.UUID | None = None


class ChatResponse(BaseModel):
    conversation_id: uuid.UUID
    message: MessageRead
