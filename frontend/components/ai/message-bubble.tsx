import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/ai-chat";
import { Sparkles } from "lucide-react";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-2", isUser && "flex-row-reverse")}>
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
