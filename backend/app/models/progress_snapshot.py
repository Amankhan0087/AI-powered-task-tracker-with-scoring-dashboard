import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, Numeric, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import UUIDPKMixin


class ProgressSnapshot(UUIDPKMixin, Base):
    __tablename__ = "progress_snapshots"
    __table_args__ = (UniqueConstraint("user_id", "period_type", "period_start"),)

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    period_type: Mapped[str] = mapped_column(String(10), nullable=False)  # week, month
    period_start: Mapped[date] = mapped_column(Date, nullable=False)

    tasks_completed: Mapped[int] = mapped_column(Integer, default=0)
    tasks_created: Mapped[int] = mapped_column(Integer, default=0)
    total_score: Mapped[float] = mapped_column(Numeric(8, 2), default=0)
    completion_rate: Mapped[float | None] = mapped_column(Numeric(5, 2))
    avg_completion_time_hours: Mapped[float | None] = mapped_column(Numeric(6, 2))

    user: Mapped["User"] = relationship(back_populates="progress_snapshots")
