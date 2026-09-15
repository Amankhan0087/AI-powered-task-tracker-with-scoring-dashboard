import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import UUIDPKMixin


class Task(UUIDPKMixin, Base):
    __tablename__ = "tasks"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    category_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL")
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String)

    status: Mapped[str] = mapped_column(String(20), default="todo")
    priority: Mapped[str] = mapped_column(String(10), default="medium")
    difficulty: Mapped[int] = mapped_column(Integer, default=1)

    estimated_hours: Mapped[float | None] = mapped_column(Numeric(5, 2))
    actual_hours: Mapped[float | None] = mapped_column(Numeric(5, 2))

    due_date: Mapped[date | None] = mapped_column(Date)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="tasks")
    category: Mapped["Category | None"] = relationship(back_populates="tasks")
    resources: Mapped[list["TaskResource"]] = relationship(back_populates="task", cascade="all, delete-orphan")
    subtasks: Mapped[list["Subtask"]] = relationship(
        back_populates="task", cascade="all, delete-orphan", order_by="Subtask.order_index"
    )
    tags: Mapped[list["Tag"]] = relationship(secondary="task_tags", back_populates="tasks")
    score_events: Mapped[list["ScoreEvent"]] = relationship(back_populates="task")
