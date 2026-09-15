"use client";

import { useState } from "react";
import type { DailyPoint } from "@/lib/progress";

const LEVEL_OPACITY = [0, 0.35, 0.55, 0.75, 1];

function levelFor(count: number) {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  return 4;
}

function formatFullDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function StreakHeatmap({ data }: { data: DailyPoint[] }) {
  const [hovered, setHovered] = useState<DailyPoint | null>(null);

  const firstDow = new Date(`${data[0]?.date}T00:00:00`).getDay();
  const padded: (DailyPoint | null)[] = [...Array(firstDow).fill(null), ...data];

  const weeks: (DailyPoint | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) =>
              day ? (
                <button
                  key={day.date}
                  type="button"
                  onMouseEnter={() => setHovered(day)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(day)}
                  onBlur={() => setHovered(null)}
                  className="h-3 w-3 shrink-0 rounded-[2px] transition-transform hover:scale-125"
                  style={{
                    backgroundColor:
                      levelFor(day.tasks_completed) === 0
                        ? "var(--muted)"
                        : "var(--chart-1)",
                    opacity:
                      levelFor(day.tasks_completed) === 0 ? 1 : LEVEL_OPACITY[levelFor(day.tasks_completed)],
                  }}
                  aria-label={`${formatFullDate(day.date)}: ${day.tasks_completed} task${day.tasks_completed === 1 ? "" : "s"} completed`}
                />
              ) : (
                <div key={`empty-${di}`} className="h-3 w-3 shrink-0" />
              )
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {hovered
            ? `${hovered.tasks_completed} task${hovered.tasks_completed === 1 ? "" : "s"} · ${formatFullDate(hovered.date)}`
            : "Hover a day for details"}
        </span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          {LEVEL_OPACITY.map((op, i) => (
            <span
              key={i}
              className="h-3 w-3 rounded-[2px]"
              style={{ backgroundColor: i === 0 ? "var(--muted)" : "var(--chart-1)", opacity: i === 0 ? 1 : op }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
