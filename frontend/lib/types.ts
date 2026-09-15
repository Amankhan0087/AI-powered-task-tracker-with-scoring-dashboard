export interface User {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
}

export type TaskStatus = "todo" | "in_progress" | "done" | "blocked";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type ResourceType = "link" | "file" | "note" | "ai_research";

export interface Category {
  id: string;
  name: string;
  color: string | null;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Subtask {
  id: string;
  title: string;
  is_done: boolean;
  order_index: number;
}

export interface TaskResource {
  id: string;
  type: ResourceType;
  title: string | null;
  url: string | null;
  content: string | null;
  created_at: string;
}

export interface TaskListItem {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  difficulty: number;
  due_date: string | null;
  category: Category | null;
  tags: Tag[];
}

export interface Task extends TaskListItem {
  description: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  subtasks: Subtask[];
  resources: TaskResource[];
}

export interface TaskCreateInput {
  title: string;
  description?: string | null;
  category_id?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  difficulty?: number;
  estimated_hours?: number | null;
  due_date?: string | null;
  tag_ids?: string[];
}

export type TaskUpdateInput = Partial<TaskCreateInput> & { actual_hours?: number | null };
