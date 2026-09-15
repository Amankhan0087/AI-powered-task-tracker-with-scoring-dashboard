import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.ai_chat import AIConversation, AIMessage
from app.models.user import User
from app.schemas.ai_chat import ChatRequest, ChatResponse, ConversationRead, MessageRead
from app.services import gemini_service, tavily_service

router = APIRouter(prefix="/api/v1/ai_chat", tags=["ai_chat"])


async def _get_owned_conversation(
    conversation_id: uuid.UUID, user: User, db: AsyncSession
) -> AIConversation:
    result = await db.execute(
        select(AIConversation).where(
            AIConversation.id == conversation_id, AIConversation.user_id == user.id
        )
    )
    conversation = result.scalar_one_or_none()
    if conversation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    return conversation


@router.get("/conversations", response_model=list[ConversationRead])
async def list_conversations(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> list[AIConversation]:
    result = await db.execute(
        select(AIConversation)
        .where(AIConversation.user_id == current_user.id)
        .order_by(AIConversation.created_at.desc())
    )
    return list(result.scalars().all())


@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageRead])
async def list_messages(
    conversation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[AIMessage]:
    await _get_owned_conversation(conversation_id, current_user, db)
    result = await db.execute(
        select(AIMessage)
        .where(AIMessage.conversation_id == conversation_id)
        .order_by(AIMessage.created_at)
    )
    return list(result.scalars().all())


@router.post("/chat", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ChatResponse:
    if payload.conversation_id:
        conversation = await _get_owned_conversation(payload.conversation_id, current_user, db)
    else:
        conversation = AIConversation(
            user_id=current_user.id,
            task_id=payload.task_id,
            title=payload.message[:60],
        )
        db.add(conversation)
        await db.flush()

    history_result = await db.execute(
        select(AIMessage)
        .where(AIMessage.conversation_id == conversation.id)
        .order_by(AIMessage.created_at)
    )
    history = list(history_result.scalars().all())

    user_message = AIMessage(conversation_id=conversation.id, role="user", content=payload.message)
    db.add(user_message)
    await db.commit()

    sources: list[dict] | None = None
    if payload.use_research:
        try:
            sources = await tavily_service.research(payload.message)
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Web research is unavailable: {exc}"
            ) from exc

    research_context = tavily_service.format_research_context(sources) if sources else None

    try:
        reply_text = await gemini_service.chat(payload.message, history, research_context)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail=f"AI assistant is unavailable: {exc}"
        ) from exc

    assistant_message = AIMessage(
        conversation_id=conversation.id, role="assistant", content=reply_text, sources=sources
    )
    db.add(assistant_message)
    await db.commit()
    await db.refresh(assistant_message)

    return ChatResponse(
        conversation_id=conversation.id, message=MessageRead.model_validate(assistant_message)
    )
