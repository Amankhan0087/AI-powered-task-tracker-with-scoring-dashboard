"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltipContent } from "@/components/progress/chart-tooltip";
import type { WeeklyPoint } from "@/lib/progress";

const GRID_COLOR = "#2c2c2a";
const AXIS_COLOR = "#898781";
const BAR_COLOR = "var(--chart-1)";

function formatWeek(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function WeeklyBarChart({ data }: { data: WeeklyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="24%">
        <CartesianGrid strokeDasharray="0" stroke={GRID_COLOR} vertical={false} />
        <XAxis
          dataKey="week_start"
          tickFormatter={formatWeek}
          tick={{ fill: AXIS_COLOR, fontSize: 11 }}
          axisLine={{ stroke: GRID_COLOR }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: AXIS_COLOR, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            const value = payload[0]?.value as number;
            return (
              <ChartTooltipContent
                label={`Week of ${formatWeek(String(label))}`}
                rows={[{ key: "tasks", label: "Tasks completed", value: String(value), color: BAR_COLOR }]}
              />
            );
          }}
        />
        <Bar dataKey="tasks_completed" fill={BAR_COLOR} radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}
