export function CompletionMeter({
  rate,
  completed,
  created,
}: {
  rate: number;
  completed: number;
  created: number;
}) {
  const clamped = Math.max(0, Math.min(100, rate));

  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-semibold tabular-nums">{Math.round(clamped)}%</span>
        <span className="text-sm text-muted-foreground">
          {completed} of {created} tasks
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: "#184f95" }}>
        <div
          className="h-full rounded-full transition-[width]"
          style={{ width: `${clamped}%`, backgroundColor: "var(--chart-1)" }}
        />
      </div>
    </div>
  );
}
