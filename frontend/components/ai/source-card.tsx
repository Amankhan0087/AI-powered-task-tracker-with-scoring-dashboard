"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { SaveResourceDialog } from "@/components/ai/save-resource-dialog";
import type { ResearchSource } from "@/lib/ai-chat";

export function SourceCard({ source }: { source: ResearchSource }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="flex items-start gap-2 rounded-lg border border-border bg-card/50 p-2.5">
        <div className="min-w-0 flex-1">
          <a
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="block truncate text-xs font-medium text-primary underline underline-offset-2"
          >
            {source.title}
          </a>
          {source.content && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{source.content}</p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          title="Save to a task"
          onClick={() => setDialogOpen(true)}
        >
          <Bookmark className="h-3.5 w-3.5" />
        </Button>
      </div>
      <SaveResourceDialog source={source} open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
