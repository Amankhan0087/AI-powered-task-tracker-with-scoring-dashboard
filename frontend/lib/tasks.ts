import { apiFetch } from "@/lib/api";
import type {
  Category,
  Subtask,
  Tag,
  Task,
  TaskCreateInput,
  TaskListItem,
  TaskResource,
  TaskUpdateInput,
} from "@/lib/types";

export function listTasks(params?: { status?: string; category_id?: string }) {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.category_id) search.set("category_id", params.category_id);
  const qs = search.toString();
  return apiFetch<TaskListItem[]>(`/api/v1/tasks${qs ? `?${qs}` : ""}`);
}

export function getTask(id: string) {
  return apiFetch<Task>(`/api/v1/tasks/${id}`);
}

export function createTask(input: TaskCreateInput) {
  return apiFetch<Task>("/api/v1/tasks", { method: "POST", body: JSON.stringify(input) });
}

export function updateTask(id: string, input: TaskUpdateInput) {
  return apiFetch<Task>(`/api/v1/tasks/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function deleteTask(id: string) {
  return apiFetch<void>(`/api/v1/tasks/${id}`, { method: "DELETE" });
}

export function createSubtask(taskId: string, title: string, orderIndex = 0) {
  return apiFetch<Subtask>(`/api/v1/tasks/${taskId}/subtasks`, {
    method: "POST",
    body: JSON.stringify({ title, order_index: orderIndex }),
  });
}

export function updateSubtask(
  taskId: string,
  subtaskId: string,
  input: Partial<Pick<Subtask, "title" | "is_done" | "order_index">>
) {
  return apiFetch<Subtask>(`/api/v1/tasks/${taskId}/subtasks/${subtaskId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteSubtask(taskId: string, subtaskId: string) {
  return apiFetch<void>(`/api/v1/tasks/${taskId}/subtasks/${subtaskId}`, { method: "DELETE" });
}

export function listResources(taskId: string) {
  return apiFetch<TaskResource[]>(`/api/v1/tasks/${taskId}/resources`);
}

export function createResource(
  taskId: string,
  input: { type: TaskResource["type"]; title?: string | null; url?: string | null; content?: string | null }
) {
  return apiFetch<TaskResource>(`/api/v1/tasks/${taskId}/resources`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteResource(taskId: string, resourceId: string) {
  return apiFetch<void>(`/api/v1/tasks/${taskId}/resources/${resourceId}`, { method: "DELETE" });
}

export function listCategories() {
  return apiFetch<Category[]>("/api/v1/categories");
}

export function createCategory(name: string, color?: string | null) {
  return apiFetch<Category>("/api/v1/categories", { method: "POST", body: JSON.stringify({ name, color }) });
}

export function listTags() {
  return apiFetch<Tag[]>("/api/v1/tags");
}

export function createTag(name: string) {
  return apiFetch<Tag>("/api/v1/tags", { method: "POST", body: JSON.stringify({ name }) });
}
