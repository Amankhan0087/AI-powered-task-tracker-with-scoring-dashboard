import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import CreatedAtMixin, UUIDPKMixin


class AIConversation(UUIDPKMixin, CreatedAtMixin, Base):
    __tablename__ = "ai_conversations"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    task_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="SET NULL"))
    title: Mapped[str | None] = mapped_column(String(255))

    user: Mapped["User"] = relationship(back_populates="ai_conversations")
    messages: Mapped[list["AIMessage"]] = relationship(back_populates="conversation", cascade="all, delete-orphan")


class AIMessage(UUIDPKMixin, CreatedAtMixin, Base):
    __tablename__ = "ai_messages"

    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("ai_conversations.id", ondelete="CASCADE")
    )
    role: Mapped[str] = mapped_column(String(10), nullable=False)  # user, assistant
    content: Mapped[str] = mapped_column(String, nullable=False)
    sources: Mapped[dict | None] = mapped_column(JSONB)

    conversation: Mapped["AIConversation"] = relationship(back_populates="messages")
