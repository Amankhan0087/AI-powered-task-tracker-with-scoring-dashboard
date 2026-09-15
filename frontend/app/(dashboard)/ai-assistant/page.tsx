"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { AuthGate } from "@/components/auth-gate";
import { ConversationList } from "@/components/ai/conversation-list";
import { ChatWindow } from "@/components/ai/chat-window";
import { listConversations, type Conversation } from "@/lib/ai-chat";

function AiAssistantContent() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    listConversations()
      .then(setConversations)
      .catch(() => toast.error("Couldn't load your conversations."));
  }, []);

  async function refreshConversations() {
    try {
      setConversations(await listConversations());
    } catch {
      toast.error("Couldn't refresh conversations.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Assistant</h1>
        <p className="text-muted-foreground">Talk through your tasks and plans.</p>
      </div>

      <Card className="grid h-[calc(100vh-14rem)] grid-cols-[220px_1fr] overflow-hidden p-0">
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
          onNew={() => setActiveId(null)}
        />
        <ChatWindow
          conversationId={activeId}
          onConversationCreated={(id) => {
            setActiveId(id);
            refreshConversations();
          }}
        />
      </Card>
    </div>
  );
}

export default function AiAssistantPage() {
  return <AuthGate>{() => <AiAssistantContent />}</AuthGate>;
}
