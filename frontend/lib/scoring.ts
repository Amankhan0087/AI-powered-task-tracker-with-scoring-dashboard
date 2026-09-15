import { apiFetch } from "@/lib/api";

export interface ScoreSummary {
  total_score: number;
  current_streak: number;
  best_streak: number;
}

export function getScoreSummary() {
  return apiFetch<ScoreSummary>("/api/v1/scoring/summary");
}
