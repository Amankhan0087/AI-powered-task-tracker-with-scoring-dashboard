import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Plus, MessageSquare } from "lucide-react";
import type { Conversation } from "@/lib/ai-chat";

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <div className="flex h-full flex-col border-r border-border">
      <div className="border-b border-border p-3">
        <Button variant="outline" size="sm" className="w-full justify-start" onClick={onNew}>
          <Plus className="mr-1.5 h-4 w-4" />
          New conversation
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-0.5 p-2">
          {conversations.length === 0 && (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">No conversations yet.</p>
          )}
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={cn(
                "flex items-center gap-2 truncate rounded-md px-2.5 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                activeId === c.id && "bg-accent text-foreground"
              )}
            >
              <MessageSquare className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{c.title || "New conversation"}</span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
