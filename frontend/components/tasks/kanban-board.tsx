"use client";

import { useState } from "react";
import { TaskCard } from "@/components/tasks/task-card";
import { cn } from "@/lib/utils";
import type { TaskListItem, TaskStatus } from "@/lib/types";

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "todo", label: "To do" },
  { status: "in_progress", label: "In progress" },
  { status: "done", label: "Done" },
  { status: "blocked", label: "Blocked" },
];

export function KanbanBoard({
  tasks,
  onOpenTask,
  onStatusChange,
}: {
  tasks: TaskListItem[];
  onOpenTask: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}) {
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {COLUMNS.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.status);
        return (
          <div
            key={column.status}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverStatus(column.status);
            }}
            onDragLeave={() => setDragOverStatus((s) => (s === column.status ? null : s))}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverStatus(null);
              const taskId = e.dataTransfer.getData("text/task-id");
              if (taskId) onStatusChange(taskId, column.status);
            }}
            className={cn(
              "flex min-h-[200px] flex-col gap-3 rounded-lg border border-border bg-card/30 p-3 transition-colors",
              dragOverStatus === column.status && "border-primary/60 bg-primary/5"
            )}
          >
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-muted-foreground">{column.label}</h3>
              <span className="text-xs text-muted-foreground">{columnTasks.length}</span>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              {columnTasks.length === 0 && (
                <p className="px-1 text-xs text-muted-foreground">No tasks</p>
              )}
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  draggable
                  onClick={() => onOpenTask(task.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
