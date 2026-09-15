import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user
from app.services.scoring_service import score_task_completion
from app.models.subtask import Subtask
from app.models.tag import Tag
from app.models.task import Task
from app.models.task_resource import TaskResource
from app.models.user import User
from app.schemas.subtask import SubtaskCreate, SubtaskRead, SubtaskUpdate
from app.schemas.resource import TaskResourceCreate, TaskResourceRead
from app.schemas.task import TaskCreate, TaskListItem, TaskRead, TaskUpdate

router = APIRouter(prefix="/api/v1/tasks", tags=["tasks"])

TASK_EAGER_LOAD = (
    selectinload(Task.category),
    selectinload(Task.tags),
    selectinload(Task.subtasks),
    selectinload(Task.resources),
)


async def _get_owned_task(task_id: uuid.UUID, user: User, db: AsyncSession, *, eager: bool = True) -> Task:
    query = select(Task).where(Task.id == task_id, Task.user_id == user.id)
    if eager:
        query = query.options(*TASK_EAGER_LOAD)
    result = await db.execute(query)
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


async def _resolve_tags(tag_ids: list[uuid.UUID], user: User, db: AsyncSession) -> list[Tag]:
    if not tag_ids:
        return []
    result = await db.execute(select(Tag).where(Tag.id.in_(tag_ids), Tag.user_id == user.id))
    tags = list(result.scalars().all())
    if len(tags) != len(set(tag_ids)):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="One or more tags not found")
    return tags


def _apply_status_side_effects(task: Task, new_status: str | None) -> None:
    if new_status is None or new_status == task.status:
        return
    now = datetime.now(timezone.utc)
    if new_status == "done" and task.completed_at is None:
        task.completed_at = now
    elif new_status != "done":
        task.completed_at = None
    if new_status == "in_progress" and task.started_at is None:
        task.started_at = now


@router.get("", response_model=list[TaskListItem])
async def list_tasks(
    status_filter: str | None = Query(None, alias="status"),
    category_id: uuid.UUID | None = None,
    priority: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Task]:
    query = (
        select(Task)
        .where(Task.user_id == current_user.id)
        .options(selectinload(Task.category), selectinload(Task.tags))
        .order_by(Task.created_at.desc())
    )
    if status_filter:
        query = query.where(Task.status == status_filter)
    if category_id:
        query = query.where(Task.category_id == category_id)
    if priority:
        query = query.where(Task.priority == priority)

    result = await db.execute(query)
    return list(result.scalars().all())


@router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
async def create_task(
    payload: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Task:
    tags = await _resolve_tags(payload.tag_ids, current_user, db)

    task = Task(
        user_id=current_user.id,
        category_id=payload.category_id,
        title=payload.title,
        description=payload.description,
        status=payload.status,
        priority=payload.priority,
        difficulty=payload.difficulty,
        estimated_hours=payload.estimated_hours,
        due_date=payload.due_date,
        tags=tags,
    )
    _apply_status_side_effects(task, payload.status)
    db.add(task)
    await db.commit()

    if task.status == "done":
        await score_task_completion(db, task)
        await db.commit()

    return await _get_owned_task(task.id, current_user, db)


@router.get("/{task_id}", response_model=TaskRead)
async def get_task(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Task:
    return await _get_owned_task(task_id, current_user, db)


@router.patch("/{task_id}", response_model=TaskRead)
async def update_task(
    task_id: uuid.UUID,
    payload: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Task:
    task = await _get_owned_task(task_id, current_user, db)
    was_done = task.status == "done"
    data = payload.model_dump(exclude_unset=True)

    if "tag_ids" in data:
        task.tags = await _resolve_tags(data.pop("tag_ids") or [], current_user, db)

    new_status = data.get("status")
    for field, value in data.items():
        setattr(task, field, value)
    _apply_status_side_effects(task, new_status)

    await db.commit()

    if new_status == "done" and not was_done:
        await score_task_completion(db, task)
        await db.commit()

    return await _get_owned_task(task_id, current_user, db)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    task = await _get_owned_task(task_id, current_user, db, eager=False)
    await db.delete(task)
    await db.commit()


# --- Subtasks ---


@router.post("/{task_id}/subtasks", response_model=SubtaskRead, status_code=status.HTTP_201_CREATED)
async def create_subtask(
    task_id: uuid.UUID,
    payload: SubtaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Subtask:
    await _get_owned_task(task_id, current_user, db, eager=False)
    subtask = Subtask(task_id=task_id, title=payload.title, order_index=payload.order_index)
    db.add(subtask)
    await db.commit()
    await db.refresh(subtask)
    return subtask


@router.patch("/{task_id}/subtasks/{subtask_id}", response_model=SubtaskRead)
async def update_subtask(
    task_id: uuid.UUID,
    subtask_id: uuid.UUID,
    payload: SubtaskUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Subtask:
    await _get_owned_task(task_id, current_user, db, eager=False)
    result = await db.execute(
        select(Subtask).where(Subtask.id == subtask_id, Subtask.task_id == task_id)
    )
    subtask = result.scalar_one_or_none()
    if subtask is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subtask not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(subtask, field, value)
    await db.commit()
    await db.refresh(subtask)
    return subtask


@router.delete("/{task_id}/subtasks/{subtask_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subtask(
    task_id: uuid.UUID,
    subtask_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await _get_owned_task(task_id, current_user, db, eager=False)
    result = await db.execute(
        select(Subtask).where(Subtask.id == subtask_id, Subtask.task_id == task_id)
    )
    subtask = result.scalar_one_or_none()
    if subtask is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subtask not found")
    await db.delete(subtask)
    await db.commit()


# --- Resources ---


@router.get("/{task_id}/resources", response_model=list[TaskResourceRead])
async def list_resources(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[TaskResource]:
    await _get_owned_task(task_id, current_user, db, eager=False)
    result = await db.execute(
        select(TaskResource).where(TaskResource.task_id == task_id).order_by(TaskResource.created_at)
    )
    return list(result.scalars().all())


@router.post("/{task_id}/resources", response_model=TaskResourceRead, status_code=status.HTTP_201_CREATED)
async def create_resource(
    task_id: uuid.UUID,
    payload: TaskResourceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TaskResource:
    await _get_owned_task(task_id, current_user, db, eager=False)
    resource = TaskResource(
        task_id=task_id,
        type=payload.type,
        title=payload.title,
        url=payload.url,
        content=payload.content,
    )
    db.add(resource)
    await db.commit()
    await db.refresh(resource)
    return resource


@router.delete("/{task_id}/resources/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resource(
    task_id: uuid.UUID,
    resource_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await _get_owned_task(task_id, current_user, db, eager=False)
    result = await db.execute(
        select(TaskResource).where(TaskResource.id == resource_id, TaskResource.task_id == task_id)
    )
    resource = result.scalar_one_or_none()
    if resource is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
    await db.delete(resource)
    await db.commit()
