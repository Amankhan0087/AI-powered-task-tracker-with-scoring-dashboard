"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { SubtaskChecklist } from "@/components/tasks/subtask-checklist";
import { ResourcePanel } from "@/components/tasks/resource-panel";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createResource,
  createSubtask,
  deleteResource,
  deleteSubtask,
  deleteTask,
  getTask,
  updateSubtask,
  updateTask,
} from "@/lib/tasks";
import type { Task, TaskPriority, TaskStatus } from "@/lib/types";

export function TaskDetailDrawer({
  taskId,
  onOpenChange,
  onChanged,
}: {
  taskId: string | null;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

  const [prevTaskId, setPrevTaskId] = useState(taskId);
  if (taskId !== prevTaskId) {
    setPrevTaskId(taskId);
    if (!taskId) setTask(null);
  }

  useEffect(() => {
    if (!taskId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard loading-flag-then-fetch pattern
    setLoading(true);
    getTask(taskId)
      .then(setTask)
      .catch(() => toast.error("Couldn't load this task."))
      .finally(() => setLoading(false));
  }, [taskId]);

  async function refresh() {
    if (!taskId) return;
    const fresh = await getTask(taskId);
    setTask(fresh);
    onChanged();
  }

  async function handleFieldChange(patch: Partial<{ status: TaskStatus; priority: TaskPriority; description: string }>) {
    if (!taskId) return;
    await updateTask(taskId, patch);
    await refresh();
  }

  async function handleDelete() {
    if (!taskId) return;
    await deleteTask(taskId);
    onOpenChange(false);
    onChanged();
  }

  return (
    <Sheet open={!!taskId} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-lg">
        {loading || !task ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>{task.title}</SheetTitle>
              <SheetDescription>
                Created {new Date(task.created_at).toLocaleDateString()}
                {task.due_date && ` · due ${new Date(`${task.due_date}T00:00:00`).toLocaleDateString()}`}
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-6 px-4 pb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={task.status}
                    onValueChange={(v) => handleFieldChange({ status: v as TaskStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To do</SelectItem>
                      <SelectItem value="in_progress">In progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={task.priority}
                    onValueChange={(v) => handleFieldChange({ priority: v as TaskPriority })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  defaultValue={task.description ?? ""}
                  rows={3}
                  onBlur={(e) => {
                    if (e.target.value !== (task.description ?? "")) {
                      handleFieldChange({ description: e.target.value });
                    }
                  }}
                  placeholder="No description"
                />
              </div>

              <Separator />

              <SubtaskChecklist
                subtasks={task.subtasks}
                onAdd={async (title) => {
                  await createSubtask(task.id, title, task.subtasks.length);
                  await refresh();
                }}
                onToggle={async (id, isDone) => {
                  await updateSubtask(task.id, id, { is_done: isDone });
                  await refresh();
                }}
                onDelete={async (id) => {
                  await deleteSubtask(task.id, id);
                  await refresh();
                }}
              />

              <Separator />

              <ResourcePanel
                resources={task.resources}
                onAdd={async (input) => {
                  await createResource(task.id, input);
                  await refresh();
                }}
                onDelete={async (id) => {
                  await deleteResource(task.id, id);
                  await refresh();
                }}
              />

              <Separator />

              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete task
                    </Button>
                  }
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this task?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This permanently removes the task, its subtasks, and its resources.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
