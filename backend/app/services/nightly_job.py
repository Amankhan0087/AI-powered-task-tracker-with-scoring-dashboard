import asyncio
import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import select

from app.core.database import async_session_maker
from app.models.user import User
from app.services.progress_service import month_start, refresh_snapshot, week_start

logger = logging.getLogger(__name__)


async def _refresh_all_users_for_date(target_date) -> None:
    async with async_session_maker() as db:
        result = await db.execute(select(User.id))
        user_ids = [row[0] for row in result.all()]
        for user_id in user_ids:
            await refresh_snapshot(db, user_id, "week", week_start(target_date))
            await refresh_snapshot(db, user_id, "month", month_start(target_date))


async def run_nightly_refresh_loop() -> None:
    """Freezes each user's closed week/month snapshot once it rolls over.

    The current (still-open) period is always recomputed live on read by
    get_snapshot(), so this loop only needs to finalize yesterday's data
    once a day. No Celery/Redis needed for a single background worker.
    """
    while True:
        now = datetime.now(timezone.utc)
        next_run = (now + timedelta(days=1)).replace(hour=2, minute=0, second=0, microsecond=0)
        await asyncio.sleep((next_run - now).total_seconds())

        yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).date()
        try:
            await _refresh_all_users_for_date(yesterday)
        except Exception:
            logger.exception("Nightly progress snapshot refresh failed")
