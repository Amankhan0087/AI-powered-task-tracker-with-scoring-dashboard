"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltipContent } from "@/components/progress/chart-tooltip";
import type { DailyPoint } from "@/lib/progress";

const GRID_COLOR = "#2c2c2a";
const AXIS_COLOR = "#898781";
const LINE_COLOR = "var(--chart-1)";

function formatDay(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ScoreTrendChart({ data }: { data: DailyPoint[] }) {
  const cumulative = useMemo(
    () =>
      data.map((d, i) => ({
        date: d.date,
        cumulative_score: Math.round(data.slice(0, i + 1).reduce((sum, p) => sum + p.score, 0)),
      })),
    [data]
  );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={cumulative} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="fill-cumulative" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={LINE_COLOR} stopOpacity={0.18} />
            <stop offset="100%" stopColor={LINE_COLOR} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="0" stroke={GRID_COLOR} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDay}
          tick={{ fill: AXIS_COLOR, fontSize: 11 }}
          axisLine={{ stroke: GRID_COLOR }}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: AXIS_COLOR, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          cursor={{ stroke: GRID_COLOR }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            const value = payload[0]?.value as number;
            return (
              <ChartTooltipContent
                label={formatDay(String(label))}
                rows={[{ key: "cumulative", label: "Total score", value: String(value), color: LINE_COLOR }]}
              />
            );
          }}
        />
        <Area
          type="monotone"
          dataKey="cumulative_score"
          stroke={LINE_COLOR}
          strokeWidth={2}
          fill="url(#fill-cumulative)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: "#1a1a19" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
