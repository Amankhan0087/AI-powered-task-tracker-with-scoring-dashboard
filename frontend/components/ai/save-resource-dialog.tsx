"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createResource, listTasks } from "@/lib/tasks";
import type { TaskListItem } from "@/lib/types";
import type { ResearchSource } from "@/lib/ai-chat";

export function SaveResourceDialog({
  source,
  open,
  onOpenChange,
}: {
  source: ResearchSource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [taskId, setTaskId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      listTasks().then(setTasks).catch(() => toast.error("Couldn't load your tasks."));
    }
  }, [open]);

  async function handleSave() {
    if (!source || !taskId) return;
    setSaving(true);
    try {
      await createResource(taskId, {
        type: "ai_research",
        title: source.title,
        url: source.url,
        content: source.content,
      });
      toast.success("Saved to task.");
      onOpenChange(false);
    } catch {
      toast.error("Couldn't save this resource.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save research to a task</DialogTitle>
          <DialogDescription className="truncate">{source?.title}</DialogDescription>
        </DialogHeader>
        <Select value={taskId} onValueChange={(v) => setTaskId(v ?? "")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a task" />
          </SelectTrigger>
          <SelectContent>
            {tasks.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button onClick={handleSave} disabled={!taskId || saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
