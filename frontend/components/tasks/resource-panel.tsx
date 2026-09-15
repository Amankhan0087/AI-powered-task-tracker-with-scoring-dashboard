"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Link as LinkIcon, FileText, StickyNote, Sparkles } from "lucide-react";
import type { ResourceType, TaskResource } from "@/lib/types";

const ICONS: Record<ResourceType, React.ComponentType<{ className?: string }>> = {
  link: LinkIcon,
  file: FileText,
  note: StickyNote,
  ai_research: Sparkles,
};

export function ResourcePanel({
  resources,
  onAdd,
  onDelete,
}: {
  resources: TaskResource[];
  onAdd: (input: { type: ResourceType; title?: string | null; url?: string | null; content?: string | null }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState<ResourceType>("link");
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setSubmitting(true);
    try {
      await onAdd({
        type,
        title: title.trim() || null,
        url: type === "link" || type === "file" ? value.trim() : null,
        content: type === "note" ? value.trim() : null,
      });
      setTitle("");
      setValue("");
      setAdding(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Resources</h4>
        <Button type="button" variant="ghost" size="sm" onClick={() => setAdding((v) => !v)}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add
        </Button>
      </div>

      <div className="space-y-2">
        {resources.length === 0 && !adding && (
          <p className="text-xs text-muted-foreground">No resources attached yet.</p>
        )}
        {resources.map((resource) => {
          const Icon = ICONS[resource.type];
          return (
            <div key={resource.id} className="group flex items-start gap-2 rounded-md border border-border p-2">
              <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  {resource.title && <span className="text-sm font-medium">{resource.title}</span>}
                  {resource.type === "ai_research" && (
                    <Badge variant="secondary" className="text-[10px]">
                      AI research
                    </Badge>
                  )}
                </div>
                {resource.url && (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-xs text-primary underline underline-offset-2"
                  >
                    {resource.url}
                  </a>
                )}
                {resource.content && (
                  <p className="line-clamp-3 text-xs text-muted-foreground">{resource.content}</p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
                onClick={() => onDelete(resource.id)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        })}
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="space-y-2 rounded-md border border-border p-2">
          <div className="flex gap-2">
            <Select value={type} onValueChange={(v) => setType(v as ResourceType)}>
              <SelectTrigger className="h-8 w-28 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="link">Link</SelectItem>
                <SelectItem value="file">File</SelectItem>
                <SelectItem value="note">Note</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="h-8 text-xs"
            />
          </div>
          {type === "note" ? (
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Note content"
              rows={2}
              className="text-xs"
            />
          ) : (
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="https://..."
              className="h-8 text-xs"
            />
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting || !value.trim()}>
              Save
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
