interface TooltipRow {
  key: string;
  label: string;
  value: string;
  color: string;
}

export function ChartTooltipContent({
  label,
  rows,
}: {
  label: string;
  rows: TooltipRow[];
}) {
  if (rows.length === 0) return null;
  return (
    <div className="min-w-36 rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
      <p className="mb-1.5 text-xs text-muted-foreground">{label}</p>
      <div className="space-y-1">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="inline-block h-[2px] w-3 shrink-0" style={{ backgroundColor: row.color }} />
              {row.label}
            </span>
            <span className="font-medium tabular-nums text-foreground">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
