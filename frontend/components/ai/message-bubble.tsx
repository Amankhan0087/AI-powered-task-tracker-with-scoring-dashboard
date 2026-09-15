import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/ai-chat";
import { Sparkles } from "lucide-react";
import { SourceCard } from "@/components/ai/source-card";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-2", isUser && "flex-row-reverse")}>
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
      )}
      <div className={cn("flex max-w-[80%] flex-col gap-2", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
            isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
          )}
        >
          {message.content}
        </div>
        {message.sources && message.sources.length > 0 && (
          <div className="w-full space-y-1.5">
            {message.sources.map((source) => (
              <SourceCard key={source.url} source={source} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
