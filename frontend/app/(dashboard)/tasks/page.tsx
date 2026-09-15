"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, LayoutGrid, List as ListIcon } from "lucide-react";
import { toast } from "sonner";
import { AuthGate } from "@/components/auth-gate";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { TaskList } from "@/components/tasks/task-list";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { TaskDetailDrawer } from "@/components/tasks/task-detail-drawer";
import { createTask, listCategories, listTasks, updateTask } from "@/lib/tasks";
import type { Category, TaskListItem, TaskStatus } from "@/lib/types";

type ViewMode = "kanban" | "list";

function TasksContent() {
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("kanban");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [taskData, categoryData] = await Promise.all([
        listTasks({
          status: statusFilter === "all" ? undefined : statusFilter,
          category_id: categoryFilter === "all" ? undefined : categoryFilter,
        }),
        listCategories(),
      ]);
      setTasks(taskData);
      setCategories(categoryData);
    } catch {
      toast.error("Couldn't load tasks.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount/filter-change, standard loading-flag pattern
    refresh();
  }, [refresh]);

  async function handleStatusChange(taskId: string, status: TaskStatus) {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
    try {
      await updateTask(taskId, { status });
    } catch {
      toast.error("Couldn't update task status.");
      refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage and track everything you&apos;re working on.</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          New task
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="todo">To do</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? "all")}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="kanban">
              <LayoutGrid className="mr-1.5 h-3.5 w-3.5" />
              Board
            </TabsTrigger>
            <TabsTrigger value="list">
              <ListIcon className="mr-1.5 h-3.5 w-3.5" />
              List
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      ) : view === "kanban" ? (
        <KanbanBoard tasks={tasks} onOpenTask={setOpenTaskId} onStatusChange={handleStatusChange} />
      ) : (
        <TaskList tasks={tasks} onOpenTask={setOpenTaskId} />
      )}

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        categories={categories}
        onCreate={async (input) => {
          await createTask(input);
          await refresh();
        }}
        onCategoryCreated={(category) => setCategories((prev) => [...prev, category])}
      />

      <TaskDetailDrawer
        taskId={openTaskId}
        onOpenChange={(open) => !open && setOpenTaskId(null)}
        onChanged={refresh}
      />
    </div>
  );
}

export default function TasksPage() {
  return <AuthGate>{() => <TasksContent />}</AuthGate>;
}
