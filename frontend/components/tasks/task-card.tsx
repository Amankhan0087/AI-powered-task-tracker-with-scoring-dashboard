"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PriorityBadge } from "@/components/tasks/priority-badge";
import type { TaskListItem } from "@/lib/types";
import { cn } from "@/lib/utils";

function formatDueDate(dueDate: string | null) {
  if (!dueDate) return null;
  const date = new Date(`${dueDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue = date < today;
  return {
    label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    isOverdue,
  };
}

export function TaskCard({
  task,
  draggable = false,
  onClick,
}: {
  task: TaskListItem;
  draggable?: boolean;
  onClick?: () => void;
}) {
  const due = formatDueDate(task.due_date);

  return (
    <Card
      role="button"
      tabIndex={0}
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/task-id", task.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={onClick}
      className="cursor-pointer gap-3 py-4 transition-colors hover:border-primary/50"
    >
      <CardHeader className="px-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug">{task.title}</p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-1.5 px-4">
        <PriorityBadge priority={task.priority} />
        {task.category && (
          <Badge variant="outline" className="gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: task.category.color ?? "#71717a" }}
            />
            {task.category.name}
          </Badge>
        )}
        {due && (
          <Badge variant="outline" className={cn(due.isOverdue && "border-red-500/40 text-red-300")}>
            {due.label}
          </Badge>
        )}
        {task.tags.map((tag) => (
          <Badge key={tag.id} variant="secondary">
            {tag.name}
          </Badge>
        ))}
      </CardContent>
    </Card>
  );
}
