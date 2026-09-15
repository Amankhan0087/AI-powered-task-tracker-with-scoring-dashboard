"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import type { Subtask } from "@/lib/types";

export function SubtaskChecklist({
  subtasks,
  onAdd,
  onToggle,
  onDelete,
}: {
  subtasks: Subtask[];
  onAdd: (title: string) => Promise<void>;
  onToggle: (id: string, isDone: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);

  const done = subtasks.filter((s) => s.is_done).length;

  async function submitSubtask() {
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      await onAdd(newTitle.trim());
      setNewTitle("");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Subtasks</h4>
        {subtasks.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {done}/{subtasks.length} done
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        {subtasks.map((subtask) => (
          <div key={subtask.id} className="group flex items-center gap-2">
            <Checkbox
              checked={subtask.is_done}
              onCheckedChange={(checked) => onToggle(subtask.id, checked === true)}
            />
            <span className={subtask.is_done ? "flex-1 text-sm text-muted-foreground line-through" : "flex-1 text-sm"}>
              {subtask.title}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={() => onDelete(subtask.id)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitSubtask();
        }}
        className="flex gap-2"
      >
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submitSubtask();
            }
          }}
          placeholder="Add a subtask..."
          className="h-8 text-sm"
        />
        <Button type="submit" size="icon" variant="secondary" className="h-8 w-8 shrink-0" disabled={adding || !newTitle.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
