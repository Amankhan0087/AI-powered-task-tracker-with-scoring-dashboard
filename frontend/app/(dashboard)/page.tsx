"use client";

import { AuthGate } from "@/components/auth-gate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OverviewPage() {
  return (
    <AuthGate>
      {(user) => (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back{user.full_name ? `, ${user.full_name}` : ""}
            </h1>
            <p className="text-muted-foreground">Here&apos;s where your overview dashboard will live.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Score</CardTitle>
                <CardDescription>Coming in the scoring module</CardDescription>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">--</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Today&apos;s tasks</CardTitle>
                <CardDescription>Coming in the tasks module</CardDescription>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">--</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Streak</CardTitle>
                <CardDescription>Coming in the progress module</CardDescription>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">--</CardContent>
            </Card>
          </div>
        </div>
      )}
    </AuthGate>
  );
}
