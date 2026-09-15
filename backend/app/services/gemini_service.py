import asyncio

import google.generativeai as genai

from app.core.config import settings
from app.models.ai_chat import AIMessage

MODEL_NAME = "gemini-3.6-flash"

SYSTEM_PROMPT = (
    "You are the AI assistant embedded in a personal task tracker app. "
    "Help the user think through their tasks, plans, and priorities. "
    "Be concise and practical. When web research context is provided, "
    "ground your answer in it and mention that it reflects current information."
)

_configured = False


def _ensure_configured() -> None:
    global _configured
    if not _configured:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _configured = True


def _to_gemini_history(history: list[AIMessage]) -> list[dict]:
    return [
        {"role": "user" if m.role == "user" else "model", "parts": [m.content]} for m in history
    ]


async def chat(message: str, history: list[AIMessage], research_context: str | None = None) -> str:
    _ensure_configured()
    model = genai.GenerativeModel(MODEL_NAME, system_instruction=SYSTEM_PROMPT)
    chat_session = model.start_chat(history=_to_gemini_history(history))

    prompt = message
    if research_context:
        prompt = f"{message}\n\nWeb research findings:\n{research_context}"

    response = await asyncio.to_thread(chat_session.send_message, prompt)
    return response.text
