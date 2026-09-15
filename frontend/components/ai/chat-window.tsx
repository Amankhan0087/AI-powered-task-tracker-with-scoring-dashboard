"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageBubble } from "@/components/ai/message-bubble";
import { Sparkles, Send, Globe } from "lucide-react";
import { listMessages, sendChatMessage, type ChatMessage } from "@/lib/ai-chat";

export function ChatWindow({
  conversationId,
  onConversationCreated,
}: {
  conversationId: string | null;
  onConversationCreated: (id: string) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [useResearch, setUseResearch] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [prevConversationId, setPrevConversationId] = useState(conversationId);
  if (conversationId !== prevConversationId) {
    setPrevConversationId(conversationId);
    if (!conversationId) setMessages([]);
  }

  useEffect(() => {
    if (!conversationId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard loading-flag-then-fetch pattern
    setLoading(true);
    listMessages(conversationId)
      .then(setMessages)
      .catch(() => toast.error("Couldn't load this conversation."))
      .finally(() => setLoading(false));
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const optimisticUserMessage: ChatMessage = {
      id: `pending-${Date.now()}`,
      role: "user",
      content: trimmed,
      sources: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUserMessage]);
    setInput("");
    setSending(true);

    try {
      const res = await sendChatMessage({
        conversation_id: conversationId,
        message: trimmed,
        use_research: useResearch,
      });
      setMessages((prev) => [...prev, res.message]);
      if (!conversationId) {
        onConversationCreated(res.conversation_id);
      }
    } catch {
      toast.error("The assistant didn't respond. Please try again.");
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUserMessage.id));
      setInput(trimmed);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 px-4">
        <div className="flex flex-col gap-4 py-4">
          {messages.length === 0 && !loading && (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
              <Sparkles className="h-6 w-6" />
              <p className="text-sm">Ask about your tasks, plans, or priorities.</p>
            </div>
          )}
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {sending && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              {useResearch ? "Searching the web..." : "Thinking..."}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-border p-3">
        <label className="mb-2 flex w-fit items-center gap-2 text-xs text-muted-foreground">
          <Checkbox checked={useResearch} onCheckedChange={(c) => setUseResearch(c === true)} />
          <Globe className="h-3.5 w-3.5" />
          Search the web for current information
        </label>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-end gap-2"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Message the assistant..."
            rows={1}
            className="max-h-32 min-h-10 resize-none"
          />
          <Button type="submit" size="icon" disabled={sending || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
