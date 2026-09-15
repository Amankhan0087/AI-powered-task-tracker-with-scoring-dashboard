import uuid
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.score_event import ScoreEvent
from app.models.task import Task

ON_TIME_BONUS = 15
OVERDUE_PENALTY_PER_DAY = 5
OVERDUE_PENALTY_CAP = 30
STREAK_BONUS = 5


async def score_task_completion(db: AsyncSession, task: Task) -> list[ScoreEvent]:
    """Create score events for a task that just transitioned to 'done'.

    Caller is responsible for committing afterward.
    """
    if task.completed_at is None:
        return []

    events: list[ScoreEvent] = []

    base_points = task.difficulty * 10
    events.append(
        ScoreEvent(user_id=task.user_id, task_id=task.id, points=base_points, reason="task_completed")
    )

    if task.due_date is not None:
        completed_date = task.completed_at.date()
        if completed_date <= task.due_date:
            events.append(
                ScoreEvent(user_id=task.user_id, task_id=task.id, points=ON_TIME_BONUS, reason="on_time_bonus")
            )
        else:
            days_late = (completed_date - task.due_date).days
            penalty = min(days_late * OVERDUE_PENALTY_PER_DAY, OVERDUE_PENALTY_CAP)
            events.append(
                ScoreEvent(user_id=task.user_id, task_id=task.id, points=-penalty, reason="overdue_penalty")
            )

    for event in events:
        db.add(event)

    streak_event = await _award_daily_streak_bonus(db, task.user_id, task.completed_at.date())
    if streak_event is not None:
        events.append(streak_event)

    return events


async def _award_daily_streak_bonus(db: AsyncSession, user_id: uuid.UUID, on_date: date) -> ScoreEvent | None:
    """A flat bonus for each calendar day that has at least one completed task.

    Idempotent per user/day so completing several tasks in one day only
    awards it once.
    """
    already_awarded = await db.execute(
        select(ScoreEvent.id).where(
            ScoreEvent.user_id == user_id,
            ScoreEvent.reason == "streak_bonus",
            func.date(ScoreEvent.created_at) == on_date,
        )
    )
    if already_awarded.scalar_one_or_none() is not None:
        return None

    event = ScoreEvent(user_id=user_id, task_id=None, points=STREAK_BONUS, reason="streak_bonus")
    db.add(event)
    return event


async def get_total_score(db: AsyncSession, user_id: uuid.UUID) -> float:
    result = await db.execute(
        select(func.coalesce(func.sum(ScoreEvent.points), 0)).where(ScoreEvent.user_id == user_id)
    )
    return float(result.scalar_one())


async def get_streaks(db: AsyncSession, user_id: uuid.UUID) -> dict[str, int]:
    result = await db.execute(
        select(func.date(Task.completed_at).label("day"))
        .where(Task.user_id == user_id, Task.completed_at.isnot(None))
        .group_by("day")
        .order_by("day")
    )
    days: list[date] = sorted({row.day for row in result.all()})
    if not days:
        return {"current_streak": 0, "best_streak": 0}

    best_streak = 1
    current_run = 1
    for i in range(1, len(days)):
        if (days[i] - days[i - 1]).days == 1:
            current_run += 1
        else:
            current_run = 1
        best_streak = max(best_streak, current_run)

    today = datetime.now(timezone.utc).date()
    last_day = days[-1]
    current_streak = 0
    if last_day in (today, today - timedelta(days=1)):
        current_streak = 1
        for i in range(len(days) - 1, 0, -1):
            if (days[i] - days[i - 1]).days == 1:
                current_streak += 1
            else:
                break

    return {"current_streak": current_streak, "best_streak": best_streak}
