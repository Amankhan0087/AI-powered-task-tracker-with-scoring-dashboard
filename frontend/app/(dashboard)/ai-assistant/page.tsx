"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AuthGate } from "@/components/auth-gate";
import { ConversationList } from "@/components/ai/conversation-list";
import { ChatWindow } from "@/components/ai/chat-window";
import { listConversations, type Conversation } from "@/lib/ai-chat";
import { History } from "lucide-react";

function AiAssistantContent() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileListOpen, setMobileListOpen] = useState(false);

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
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Assistant</h1>
          <p className="text-muted-foreground">Talk through your tasks and plans.</p>
        </div>
        <Button variant="outline" size="sm" className="sm:hidden" onClick={() => setMobileListOpen(true)}>
          <History className="mr-1.5 h-4 w-4" />
          History
        </Button>
      </div>

      <Card className="grid h-[calc(100vh-14rem)] grid-cols-1 overflow-hidden p-0 sm:grid-cols-[220px_1fr]">
        <div className="hidden sm:block">
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            onSelect={setActiveId}
            onNew={() => setActiveId(null)}
          />
        </div>
        <ChatWindow
          conversationId={activeId}
          onConversationCreated={(id) => {
            setActiveId(id);
            refreshConversations();
          }}
        />
      </Card>

      <Sheet open={mobileListOpen} onOpenChange={setMobileListOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b border-border">
            <SheetTitle>Conversations</SheetTitle>
          </SheetHeader>
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            onSelect={(id) => {
              setActiveId(id);
              setMobileListOpen(false);
            }}
            onNew={() => {
              setActiveId(null);
              setMobileListOpen(false);
            }}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function AiAssistantPage() {
  return <AuthGate>{() => <AiAssistantContent />}</AuthGate>;
}
