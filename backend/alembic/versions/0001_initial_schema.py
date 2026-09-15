"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-09-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

UUID = postgresql.UUID(as_uuid=True)
GEN_UUID = sa.text("gen_random_uuid()")
NOW = sa.text("now()")


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS pgcrypto')

    op.create_table(
        "users",
        sa.Column("id", UUID, primary_key=True, server_default=GEN_UUID),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=NOW),
    )

    op.create_table(
        "categories",
        sa.Column("id", UUID, primary_key=True, server_default=GEN_UUID),
        sa.Column("user_id", UUID, sa.ForeignKey("users.id", ondelete="CASCADE")),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("color", sa.String(20)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=NOW),
    )

    op.create_table(
        "tasks",
        sa.Column("id", UUID, primary_key=True, server_default=GEN_UUID),
        sa.Column("user_id", UUID, sa.ForeignKey("users.id", ondelete="CASCADE")),
        sa.Column("category_id", UUID, sa.ForeignKey("categories.id", ondelete="SET NULL")),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("status", sa.String(20), server_default="todo"),
        sa.Column("priority", sa.String(10), server_default="medium"),
        sa.Column("difficulty", sa.Integer, server_default="1"),
        sa.Column("estimated_hours", sa.Numeric(5, 2)),
        sa.Column("actual_hours", sa.Numeric(5, 2)),
        sa.Column("due_date", sa.Date),
        sa.Column("started_at", sa.DateTime(timezone=True)),
        sa.Column("completed_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=NOW),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=NOW),
    )

    op.create_table(
        "task_resources",
        sa.Column("id", UUID, primary_key=True, server_default=GEN_UUID),
        sa.Column("task_id", UUID, sa.ForeignKey("tasks.id", ondelete="CASCADE")),
        sa.Column("type", sa.String(20), nullable=False),
        sa.Column("title", sa.String(255)),
        sa.Column("url", sa.Text),
        sa.Column("content", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=NOW),
    )

    op.create_table(
        "subtasks",
        sa.Column("id", UUID, primary_key=True, server_default=GEN_UUID),
        sa.Column("task_id", UUID, sa.ForeignKey("tasks.id", ondelete="CASCADE")),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("is_done", sa.Boolean, server_default=sa.false()),
        sa.Column("order_index", sa.Integer, server_default="0"),
    )

    op.create_table(
        "tags",
        sa.Column("id", UUID, primary_key=True, server_default=GEN_UUID),
        sa.Column("user_id", UUID, sa.ForeignKey("users.id", ondelete="CASCADE")),
        sa.Column("name", sa.String(50), nullable=False),
    )

    op.create_table(
        "task_tags",
        sa.Column("task_id", UUID, sa.ForeignKey("tasks.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("tag_id", UUID, sa.ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
    )

    op.create_table(
        "score_events",
        sa.Column("id", UUID, primary_key=True, server_default=GEN_UUID),
        sa.Column("user_id", UUID, sa.ForeignKey("users.id", ondelete="CASCADE")),
        sa.Column("task_id", UUID, sa.ForeignKey("tasks.id", ondelete="SET NULL")),
        sa.Column("points", sa.Numeric(6, 2), nullable=False),
        sa.Column("reason", sa.String(100)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=NOW),
    )

    op.create_table(
        "progress_snapshots",
        sa.Column("id", UUID, primary_key=True, server_default=GEN_UUID),
        sa.Column("user_id", UUID, sa.ForeignKey("users.id", ondelete="CASCADE")),
        sa.Column("period_type", sa.String(10), nullable=False),
        sa.Column("period_start", sa.Date, nullable=False),
        sa.Column("tasks_completed", sa.Integer, server_default="0"),
        sa.Column("tasks_created", sa.Integer, server_default="0"),
        sa.Column("total_score", sa.Numeric(8, 2), server_default="0"),
        sa.Column("completion_rate", sa.Numeric(5, 2)),
        sa.Column("avg_completion_time_hours", sa.Numeric(6, 2)),
        sa.UniqueConstraint("user_id", "period_type", "period_start"),
    )

    op.create_table(
        "ai_conversations",
        sa.Column("id", UUID, primary_key=True, server_default=GEN_UUID),
        sa.Column("user_id", UUID, sa.ForeignKey("users.id", ondelete="CASCADE")),
        sa.Column("task_id", UUID, sa.ForeignKey("tasks.id", ondelete="SET NULL")),
        sa.Column("title", sa.String(255)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=NOW),
    )

    op.create_table(
        "ai_messages",
        sa.Column("id", UUID, primary_key=True, server_default=GEN_UUID),
        sa.Column("conversation_id", UUID, sa.ForeignKey("ai_conversations.id", ondelete="CASCADE")),
        sa.Column("role", sa.String(10), nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("sources", postgresql.JSONB),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=NOW),
    )

    op.create_index("idx_tasks_user_status", "tasks", ["user_id", "status"])
    op.create_index("idx_tasks_due_date", "tasks", ["due_date"])
    op.create_index("idx_score_events_user_date", "score_events", ["user_id", "created_at"])
    op.create_index(
        "idx_snapshots_user_period", "progress_snapshots", ["user_id", "period_type", "period_start"]
    )


def downgrade() -> None:
    op.drop_index("idx_snapshots_user_period", table_name="progress_snapshots")
    op.drop_index("idx_score_events_user_date", table_name="score_events")
    op.drop_index("idx_tasks_due_date", table_name="tasks")
    op.drop_index("idx_tasks_user_status", table_name="tasks")

    op.drop_table("ai_messages")
    op.drop_table("ai_conversations")
    op.drop_table("progress_snapshots")
    op.drop_table("score_events")
    op.drop_table("task_tags")
    op.drop_table("tags")
    op.drop_table("subtasks")
    op.drop_table("task_resources")
    op.drop_table("tasks")
    op.drop_table("categories")
    op.drop_table("users")
