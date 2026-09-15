import uuid

from pydantic import BaseModel, ConfigDict


class SubtaskCreate(BaseModel):
    title: str
    order_index: int = 0


class SubtaskUpdate(BaseModel):
    title: str | None = None
    is_done: bool | None = None
    order_index: int | None = None


class SubtaskRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    is_done: bool
    order_index: int
