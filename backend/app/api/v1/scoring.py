from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.score_event import ScoreEvent
from app.models.user import User
from app.schemas.scoring import ScoreEventRead, ScoreSummary
from app.services.scoring_service import get_streaks, get_total_score

router = APIRouter(prefix="/api/v1/scoring", tags=["scoring"])


@router.get("/summary", response_model=ScoreSummary)
async def summary(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> ScoreSummary:
    total = await get_total_score(db, current_user.id)
    streaks = await get_streaks(db, current_user.id)
    return ScoreSummary(total_score=total, **streaks)


@router.get("/events", response_model=list[ScoreEventRead])
async def events(
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ScoreEvent]:
    result = await db.execute(
        select(ScoreEvent)
        .where(ScoreEvent.user_id == current_user.id)
        .order_by(ScoreEvent.created_at.desc())
        .limit(limit)
    )
    return list(result.scalars().all())
