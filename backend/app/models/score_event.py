import uuid

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import CreatedAtMixin, UUIDPKMixin


class ScoreEvent(UUIDPKMixin, CreatedAtMixin, Base):
    __tablename__ = "score_events"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    task_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="SET NULL"))
    points: Mapped[float] = mapped_column(Numeric(6, 2), nullable=False)
    reason: Mapped[str | None] = mapped_column(String(100))

    user: Mapped["User"] = relationship(back_populates="score_events")
    task: Mapped["Task | None"] = relationship(back_populates="score_events")
