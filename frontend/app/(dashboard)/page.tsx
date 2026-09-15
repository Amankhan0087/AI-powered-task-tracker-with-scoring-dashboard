"use client";

import { useEffect, useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getScoreSummary, type ScoreSummary } from "@/lib/scoring";
import { listTasks } from "@/lib/tasks";
import type { TaskListItem } from "@/lib/types";

function OverviewContent({ userName }: { userName: string | null }) {
  const [summary, setSummary] = useState<ScoreSummary | null>(null);
  const [openTasks, setOpenTasks] = useState<TaskListItem[] | null>(null);

  useEffect(() => {
    getScoreSummary().then(setSummary).catch(() => setSummary(null));
    listTasks({ status: "todo" }).then(setOpenTasks).catch(() => setOpenTasks(null));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back{userName ? `, ${userName}` : ""}
        </h1>
        <p className="text-muted-foreground">Here&apos;s how things are going.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Score</CardTitle>
            <CardDescription>All-time points earned</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {summary ? Math.round(summary.total_score) : <Skeleton className="h-8 w-16" />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>To do</CardTitle>
            <CardDescription>Tasks not yet started</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {openTasks ? openTasks.length : <Skeleton className="h-8 w-16" />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Streak</CardTitle>
            <CardDescription>
              {summary ? `Best: ${summary.best_streak} days` : "Current streak"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {summary ? `${summary.current_streak}d` : <Skeleton className="h-8 w-16" />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  return <AuthGate>{(user) => <OverviewContent userName={user.full_name} />}</AuthGate>;
}
