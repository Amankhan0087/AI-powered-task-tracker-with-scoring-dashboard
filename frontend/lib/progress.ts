import { apiFetch } from "@/lib/api";

export interface DailyPoint {
  date: string;
  tasks_completed: number;
  score: number;
}

export interface WeeklyPoint {
  week_start: string;
  tasks_completed: number;
  score: number;
}

export interface CategoryBreakdownItem {
  category_id: string | null;
  category_name: string;
  color: string | null;
  task_count: number;
  score: number;
}

export interface SnapshotRead {
  period_type: "week" | "month";
  period_start: string;
  tasks_created: number;
  tasks_completed: number;
  total_score: number;
  completion_rate: number;
  avg_completion_time_hours: number | null;
}

export function getDailySeries(days: number) {
  return apiFetch<DailyPoint[]>(`/api/v1/progress/daily?days=${days}`);
}

export function getWeeklySeries(weeks: number) {
  return apiFetch<WeeklyPoint[]>(`/api/v1/progress/weekly?weeks=${weeks}`);
}

export function getCategoryBreakdown() {
  return apiFetch<CategoryBreakdownItem[]>("/api/v1/progress/category-breakdown");
}

export function getSnapshot(periodType: "week" | "month") {
  return apiFetch<SnapshotRead>(`/api/v1/progress/snapshot?period_type=${periodType}`);
}
