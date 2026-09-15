"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltipContent } from "@/components/progress/chart-tooltip";
import type { CategoryBreakdownItem } from "@/lib/progress";

const CATEGORICAL_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
];
const AXIS_COLOR = "#898781";
const MAX_SLOTS = 8;

function foldToSlots(items: CategoryBreakdownItem[]) {
  const sorted = [...items].sort((a, b) => b.score - a.score);
  if (sorted.length <= MAX_SLOTS) return sorted;

  const kept = sorted.slice(0, MAX_SLOTS - 1);
  const rest = sorted.slice(MAX_SLOTS - 1);
  const other: CategoryBreakdownItem = {
    category_id: null,
    category_name: "Other",
    color: null,
    task_count: rest.reduce((sum, r) => sum + r.task_count, 0),
    score: rest.reduce((sum, r) => sum + r.score, 0),
  };
  return [...kept, other];
}

export function CategoryBreakdownChart({ data }: { data: CategoryBreakdownItem[] }) {
  const slots = foldToSlots(data);
  const height = Math.max(180, slots.length * 36);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={slots} layout="vertical" margin={{ top: 4, right: 24, bottom: 0, left: 0 }}>
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="category_name"
          tick={{ fill: AXIS_COLOR, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={96}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const item = payload[0]?.payload as CategoryBreakdownItem;
            const color = payload[0]?.payload?.fill as string;
            return (
              <ChartTooltipContent
                label={item.category_name}
                rows={[
                  { key: "score", label: "Score", value: Math.round(item.score).toString(), color },
                  { key: "count", label: "Tasks done", value: String(item.task_count), color },
                ]}
              />
            );
          }}
        />
        <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={20}>
          {slots.map((entry, index) => (
            <Cell key={entry.category_id ?? entry.category_name} fill={CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
