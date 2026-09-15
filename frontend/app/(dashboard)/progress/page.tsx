"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthGate } from "@/components/auth-gate";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartCard } from "@/components/progress/chart-card";
import { DailyTrendChart } from "@/components/progress/daily-trend-chart";
import { WeeklyBarChart } from "@/components/progress/weekly-bar-chart";
import { CompletionMeter } from "@/components/progress/completion-meter";
import { CategoryBreakdownChart } from "@/components/progress/category-breakdown-chart";
import { StreakHeatmap } from "@/components/progress/streak-heatmap";
import { ScoreTrendChart } from "@/components/progress/score-trend-chart";
import {
  getCategoryBreakdown,
  getDailySeries,
  getSnapshot,
  getWeeklySeries,
  type CategoryBreakdownItem,
  type DailyPoint,
  type SnapshotRead,
  type WeeklyPoint,
} from "@/lib/progress";

const DAY_RANGES = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
];

function ProgressContent() {
  const [days, setDays] = useState(30);
  const [daily, setDaily] = useState<DailyPoint[] | null>(null);
  const [heatmapDaily, setHeatmapDaily] = useState<DailyPoint[] | null>(null);
  const [weekly, setWeekly] = useState<WeeklyPoint[] | null>(null);
  const [categories, setCategories] = useState<CategoryBreakdownItem[] | null>(null);
  const [periodType, setPeriodType] = useState<"week" | "month">("week");
  const [snapshot, setSnapshot] = useState<SnapshotRead | null>(null);

  const loadDaily = useCallback(async (d: number) => {
    setDaily(null);
    try {
      setDaily(await getDailySeries(d));
    } catch {
      toast.error("Couldn't load trend data.");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount/range-change, standard loading-flag pattern
    loadDaily(days);
  }, [days, loadDaily]);

  useEffect(() => {
    getDailySeries(84)
      .then(setHeatmapDaily)
      .catch(() => toast.error("Couldn't load the streak calendar."));
    getWeeklySeries(8)
      .then(setWeekly)
      .catch(() => toast.error("Couldn't load weekly comparison."));
    getCategoryBreakdown()
      .then(setCategories)
      .catch(() => toast.error("Couldn't load category breakdown."));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- clear stale snapshot while the new period loads
    setSnapshot(null);
    getSnapshot(periodType)
      .then(setSnapshot)
      .catch(() => toast.error("Couldn't load completion rate."));
  }, [periodType]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
          <p className="text-muted-foreground">Trends, streaks, and where your effort is going.</p>
        </div>
        <Tabs value={String(days)} onValueChange={(v) => v && setDays(Number(v))}>
          <TabsList>
            {DAY_RANGES.map((r) => (
              <TabsTrigger key={r.value} value={String(r.value)}>
                {r.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <ChartCard
        title="Daily activity"
        description={`Tasks completed and score over the last ${days} days`}
        loading={daily === null}
        empty={!!daily && daily.every((d) => d.tasks_completed === 0 && d.score === 0)}
      >
        {daily && <DailyTrendChart data={daily} />}
      </ChartCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Score trend"
          description="Cumulative score over the selected range"
          loading={daily === null}
          empty={!!daily && daily.every((d) => d.score === 0)}
        >
          {daily && <ScoreTrendChart data={daily} />}
        </ChartCard>

        <ChartCard
          title="Weekly comparison"
          description="Tasks completed per week, last 8 weeks"
          loading={weekly === null}
          empty={!!weekly && weekly.every((w) => w.tasks_completed === 0)}
        >
          {weekly && <WeeklyBarChart data={weekly} />}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Streak calendar" description="Last 12 weeks of completions" loading={heatmapDaily === null}>
          {heatmapDaily && <StreakHeatmap data={heatmapDaily} />}
        </ChartCard>

        <ChartCard
          title="Completion rate"
          description={
            <Tabs value={periodType} onValueChange={(v) => v && setPeriodType(v as "week" | "month")}>
              <TabsList>
                <TabsTrigger value="week">This week</TabsTrigger>
                <TabsTrigger value="month">This month</TabsTrigger>
              </TabsList>
            </Tabs>
          }
          loading={snapshot === null}
        >
          {snapshot && (
            <CompletionMeter
              rate={snapshot.completion_rate}
              completed={snapshot.tasks_completed}
              created={snapshot.tasks_created}
            />
          )}
        </ChartCard>
      </div>

      <ChartCard
        title="Score by category"
        description="Where your points are coming from"
        loading={categories === null}
        empty={!!categories && categories.length === 0}
        emptyMessage="Complete some categorized tasks to see a breakdown."
      >
        {categories && <CategoryBreakdownChart data={categories} />}
      </ChartCard>
    </div>
  );
}

export default function ProgressPage() {
  return <AuthGate>{() => <ProgressContent />}</AuthGate>;
}
