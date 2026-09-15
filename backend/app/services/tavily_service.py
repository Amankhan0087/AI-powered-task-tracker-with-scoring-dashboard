import asyncio

from tavily import TavilyClient

from app.core.config import settings

_client: TavilyClient | None = None


def _get_client() -> TavilyClient:
    global _client
    if _client is None:
        _client = TavilyClient(api_key=settings.TAVILY_API_KEY)
    return _client


async def research(query: str, max_results: int = 5) -> list[dict]:
    client = _get_client()
    result = await asyncio.to_thread(
        client.search, query=query, max_results=max_results, search_depth="advanced"
    )
    return [
        {
            "title": r.get("title", ""),
            "url": r.get("url", ""),
            "content": (r.get("content") or "")[:600],
        }
        for r in result.get("results", [])
    ]


def format_research_context(sources: list[dict]) -> str:
    lines = [f"- {s['title']} ({s['url']}): {s['content']}" for s in sources]
    return "\n".join(lines)
