"use client";

import { TaskCard } from "@/components/tasks/task-card";
import type { TaskListItem } from "@/lib/types";

export function TaskList({
  tasks,
  onOpenTask,
}: {
  tasks: TaskListItem[];
  onOpenTask: (id: string) => void;
}) {
  if (tasks.length === 0) {
    return <p className="py-12 text-center text-sm text-muted-foreground">No tasks match these filters.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onClick={() => onOpenTask(task.id)} />
      ))}
    </div>
  );
}
