from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.tag import Tag
from app.models.user import User
from app.schemas.tag import TagCreate, TagRead

router = APIRouter(prefix="/api/v1/tags", tags=["tags"])


@router.get("", response_model=list[TagRead])
async def list_tags(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> list[Tag]:
    result = await db.execute(select(Tag).where(Tag.user_id == current_user.id).order_by(Tag.name))
    return list(result.scalars().all())


@router.post("", response_model=TagRead, status_code=status.HTTP_201_CREATED)
async def create_tag(
    payload: TagCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Tag:
    tag = Tag(user_id=current_user.id, name=payload.name)
    db.add(tag)
    await db.commit()
    await db.refresh(tag)
    return tag
