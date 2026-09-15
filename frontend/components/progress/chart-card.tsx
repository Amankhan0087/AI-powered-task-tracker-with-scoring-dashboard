import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ChartCard({
  title,
  description,
  loading,
  empty,
  emptyMessage = "No data yet for this range.",
  className,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn("gap-4", className)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-full min-h-[180px] w-full" />
        ) : empty ? (
          <div className="flex min-h-[180px] items-center justify-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
