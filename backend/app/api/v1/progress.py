from datetime import date, datetime, timedelta, timezone
from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.progress import CategoryBreakdownItem, DailyPoint, SnapshotRead, WeeklyPoint
from app.services.progress_service import (
    get_category_breakdown,
    get_daily_series,
    get_snapshot,
    get_weekly_series,
    month_start,
    week_start,
)

router = APIRouter(prefix="/api/v1/progress", tags=["progress"])


@router.get("/daily", response_model=list[DailyPoint])
async def daily_series(
    days: int = Query(30, ge=1, le=180),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[dict]:
    end_date = datetime.now(timezone.utc).date() + timedelta(days=1)
    start_date = end_date - timedelta(days=days)
    return await get_daily_series(db, current_user.id, start_date, end_date)


@router.get("/weekly", response_model=list[WeeklyPoint])
async def weekly_series(
    weeks: int = Query(8, ge=1, le=52),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[dict]:
    return await get_weekly_series(db, current_user.id, weeks)


@router.get("/category-breakdown", response_model=list[CategoryBreakdownItem])
async def category_breakdown(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> list[dict]:
    return await get_category_breakdown(db, current_user.id)


@router.get("/snapshot", response_model=SnapshotRead)
async def snapshot(
    period_type: Literal["week", "month"] = "week",
    period_start: date | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SnapshotRead:
    today = datetime.now(timezone.utc).date()
    if period_start is None:
        period_start = week_start(today) if period_type == "week" else month_start(today)

    result = await get_snapshot(db, current_user.id, period_type, period_start)
    return SnapshotRead(
        period_type=result.period_type,
        period_start=result.period_start,
        tasks_created=result.tasks_created,
        tasks_completed=result.tasks_completed,
        total_score=float(result.total_score),
        completion_rate=float(result.completion_rate or 0),
        avg_completion_time_hours=float(result.avg_completion_time_hours) if result.avg_completion_time_hours is not None else None,
    )
