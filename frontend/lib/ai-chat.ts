import { apiFetch } from "@/lib/api";

export interface Conversation {
  id: string;
  title: string | null;
  task_id: string | null;
  created_at: string;
}

export interface ResearchSource {
  title: string;
  url: string;
  content: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: ResearchSource[] | null;
  created_at: string;
}

export interface ChatResponse {
  conversation_id: string;
  message: ChatMessage;
}

export function listConversations() {
  return apiFetch<Conversation[]>("/api/v1/ai_chat/conversations");
}

export function listMessages(conversationId: string) {
  return apiFetch<ChatMessage[]>(`/api/v1/ai_chat/conversations/${conversationId}/messages`);
}

export function sendChatMessage(input: {
  conversation_id?: string | null;
  message: string;
  task_id?: string | null;
  use_research?: boolean;
}) {
  return apiFetch<ChatResponse>("/api/v1/ai_chat/chat", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
