"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltipContent } from "@/components/progress/chart-tooltip";
import type { DailyPoint } from "@/lib/progress";

const GRID_COLOR = "#2c2c2a";
const AXIS_COLOR = "#898781";

function formatDay(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function MiniAreaChart({
  data,
  dataKey,
  color,
  seriesLabel,
  valueFormatter,
}: {
  data: DailyPoint[];
  dataKey: "tasks_completed" | "score";
  color: string;
  seriesLabel: string;
  valueFormatter: (v: number) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`fill-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
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
          width={32}
        />
        <Tooltip
          cursor={{ stroke: GRID_COLOR }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            const value = payload[0]?.value as number;
            return (
              <ChartTooltipContent
                label={formatDay(String(label))}
                rows={[{ key: dataKey, label: seriesLabel, value: valueFormatter(value), color }]}
              />
            );
          }}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#fill-${dataKey})`}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: "#1a1a19" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function DailyTrendChart({ data }: { data: DailyPoint[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div>
        <p className="mb-1 text-xs text-muted-foreground">Tasks completed</p>
        <MiniAreaChart
          data={data}
          dataKey="tasks_completed"
          color="var(--chart-1)"
          seriesLabel="Completed"
          valueFormatter={(v) => String(Math.round(v))}
        />
      </div>
      <div>
        <p className="mb-1 text-xs text-muted-foreground">Score</p>
        <MiniAreaChart
          data={data}
          dataKey="score"
          color="var(--chart-2)"
          seriesLabel="Score"
          valueFormatter={(v) => Math.round(v).toString()}
        />
      </div>
    </div>
  );
}
