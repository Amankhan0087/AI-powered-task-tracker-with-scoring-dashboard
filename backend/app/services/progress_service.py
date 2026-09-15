import uuid
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.models.progress_snapshot import ProgressSnapshot
from app.models.score_event import ScoreEvent
from app.models.task import Task


def week_start(d: date) -> date:
    return d - timedelta(days=d.weekday())


def month_start(d: date) -> date:
    return d.replace(day=1)


def period_bounds(period_type: str, period_start: date) -> tuple[date, date]:
    if period_type == "week":
        return period_start, period_start + timedelta(days=7)
    if period_start.month == 12:
        next_start = period_start.replace(year=period_start.year + 1, month=1)
    else:
        next_start = period_start.replace(month=period_start.month + 1)
    return period_start, next_start


def _dt(d: date) -> datetime:
    return datetime(d.year, d.month, d.day, tzinfo=timezone.utc)


async def _compute_snapshot_data(db: AsyncSession, user_id: uuid.UUID, period_type: str, period_start: date) -> dict:
    start, end = period_bounds(period_type, period_start)
    start_dt, end_dt = _dt(start), _dt(end)

    created_count = await db.scalar(
        select(func.count(Task.id)).where(
            Task.user_id == user_id, Task.created_at >= start_dt, Task.created_at < end_dt
        )
    )
    completed_count = await db.scalar(
        select(func.count(Task.id)).where(
            Task.user_id == user_id, Task.completed_at >= start_dt, Task.completed_at < end_dt
        )
    )
    total_score = await db.scalar(
        select(func.coalesce(func.sum(ScoreEvent.points), 0)).where(
            ScoreEvent.user_id == user_id, ScoreEvent.created_at >= start_dt, ScoreEvent.created_at < end_dt
        )
    )
    avg_hours = await db.scalar(
        select(func.avg(func.extract("epoch", Task.completed_at - Task.created_at) / 3600.0)).where(
            Task.user_id == user_id, Task.completed_at >= start_dt, Task.completed_at < end_dt
        )
    )

    created_count = created_count or 0
    completed_count = completed_count or 0
    completion_rate = round((completed_count / created_count) * 100, 2) if created_count else 0.0

    return {
        "tasks_created": created_count,
        "tasks_completed": completed_count,
        "total_score": float(total_score or 0),
        "completion_rate": completion_rate,
        "avg_completion_time_hours": round(float(avg_hours), 2) if avg_hours is not None else None,
    }


async def _fetch_snapshot(
    db: AsyncSession, user_id: uuid.UUID, period_type: str, period_start: date
) -> ProgressSnapshot | None:
    result = await db.execute(
        select(ProgressSnapshot).where(
            ProgressSnapshot.user_id == user_id,
            ProgressSnapshot.period_type == period_type,
            ProgressSnapshot.period_start == period_start,
        )
    )
    return result.scalar_one_or_none()


async def refresh_snapshot(
    db: AsyncSession, user_id: uuid.UUID, period_type: str, period_start: date
) -> ProgressSnapshot:
    """Recompute and upsert a snapshot regardless of whether one exists."""
    data = await _compute_snapshot_data(db, user_id, period_type, period_start)
    snapshot = await _fetch_snapshot(db, user_id, period_type, period_start)
    if snapshot is None:
        snapshot = ProgressSnapshot(user_id=user_id, period_type=period_type, period_start=period_start, **data)
        db.add(snapshot)
    else:
        for field, value in data.items():
            setattr(snapshot, field, value)
    await db.commit()
    await db.refresh(snapshot)
    return snapshot


async def get_snapshot(
    db: AsyncSession, user_id: uuid.UUID, period_type: str, period_start: date
) -> ProgressSnapshot:
    """Cached read for closed periods; always recomputes the still-open current period."""
    today = datetime.now(timezone.utc).date()
    is_current_period = (
        (period_type == "week" and week_start(today) == period_start)
        or (period_type == "month" and month_start(today) == period_start)
    )
    if is_current_period:
        return await refresh_snapshot(db, user_id, period_type, period_start)

    snapshot = await _fetch_snapshot(db, user_id, period_type, period_start)
    if snapshot is not None:
        return snapshot
    return await refresh_snapshot(db, user_id, period_type, period_start)


async def get_daily_series(db: AsyncSession, user_id: uuid.UUID, start_date: date, end_date: date) -> list[dict]:
    start_dt, end_dt = _dt(start_date), _dt(end_date)

    completed_result = await db.execute(
        select(func.date(Task.completed_at).label("day"), func.count(Task.id))
        .where(Task.user_id == user_id, Task.completed_at >= start_dt, Task.completed_at < end_dt)
        .group_by("day")
    )
    completed_map = {row[0]: row[1] for row in completed_result.all()}

    score_result = await db.execute(
        select(func.date(ScoreEvent.created_at).label("day"), func.sum(ScoreEvent.points))
        .where(ScoreEvent.user_id == user_id, ScoreEvent.created_at >= start_dt, ScoreEvent.created_at < end_dt)
        .group_by("day")
    )
    score_map = {row[0]: float(row[1]) for row in score_result.all()}

    num_days = (end_date - start_date).days
    days = [start_date + timedelta(days=i) for i in range(num_days)]
    return [
        {"date": d, "tasks_completed": completed_map.get(d, 0), "score": score_map.get(d, 0.0)} for d in days
    ]


async def get_weekly_series(db: AsyncSession, user_id: uuid.UUID, weeks: int) -> list[dict]:
    today = datetime.now(timezone.utc).date()
    current_week_start = week_start(today)
    week_starts = [current_week_start - timedelta(weeks=i) for i in range(weeks - 1, -1, -1)]

    range_start = week_starts[0]
    range_end = week_starts[-1] + timedelta(days=7)
    start_dt, end_dt = _dt(range_start), _dt(range_end)

    completed_result = await db.execute(
        select(func.date_trunc("week", Task.completed_at).label("week"), func.count(Task.id))
        .where(Task.user_id == user_id, Task.completed_at >= start_dt, Task.completed_at < end_dt)
        .group_by("week")
    )
    completed_map = {row[0].date(): row[1] for row in completed_result.all()}

    score_result = await db.execute(
        select(func.date_trunc("week", ScoreEvent.created_at).label("week"), func.sum(ScoreEvent.points))
        .where(ScoreEvent.user_id == user_id, ScoreEvent.created_at >= start_dt, ScoreEvent.created_at < end_dt)
        .group_by("week")
    )
    score_map = {row[0].date(): float(row[1]) for row in score_result.all()}

    return [
        {
            "week_start": ws,
            "tasks_completed": completed_map.get(ws, 0),
            "score": score_map.get(ws, 0.0),
        }
        for ws in week_starts
    ]


async def get_category_breakdown(db: AsyncSession, user_id: uuid.UUID) -> list[dict]:
    result = await db.execute(
        select(
            Category.id,
            Category.name,
            Category.color,
            func.count(Task.id.distinct()).filter(Task.status == "done"),
            func.coalesce(func.sum(ScoreEvent.points), 0),
        )
        .select_from(Category)
        .outerjoin(Task, Task.category_id == Category.id)
        .outerjoin(ScoreEvent, ScoreEvent.task_id == Task.id)
        .where(Category.user_id == user_id)
        .group_by(Category.id, Category.name, Category.color)
        .order_by(Category.name)
    )
    rows = [
        {
            "category_id": r[0],
            "category_name": r[1],
            "color": r[2],
            "task_count": r[3],
            "score": float(r[4]),
        }
        for r in result.all()
    ]

    uncategorized_count = await db.scalar(
        select(func.count(Task.id)).where(
            Task.user_id == user_id, Task.category_id.is_(None), Task.status == "done"
        )
    )
    uncategorized_score = await db.scalar(
        select(func.coalesce(func.sum(ScoreEvent.points), 0))
        .select_from(ScoreEvent)
        .join(Task, Task.id == ScoreEvent.task_id)
        .where(Task.user_id == user_id, Task.category_id.is_(None))
    )
    if uncategorized_count:
        rows.append(
            {
                "category_id": None,
                "category_name": "Uncategorized",
                "color": None,
                "task_count": uncategorized_count,
                "score": float(uncategorized_score or 0),
            }
        )

    return rows
