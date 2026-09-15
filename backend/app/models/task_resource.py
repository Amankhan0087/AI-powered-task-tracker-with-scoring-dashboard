import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import CreatedAtMixin, UUIDPKMixin


class TaskResource(UUIDPKMixin, CreatedAtMixin, Base):
    __tablename__ = "task_resources"

    task_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="CASCADE"))
    type: Mapped[str] = mapped_column(String(20), nullable=False)  # link, file, note, ai_research
    title: Mapped[str | None] = mapped_column(String(255))
    url: Mapped[str | None] = mapped_column(String)
    content: Mapped[str | None] = mapped_column(String)

    task: Mapped["Task"] = relationship(back_populates="resources")
