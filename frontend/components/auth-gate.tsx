"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/api";
import { fetchMe } from "@/lib/auth";
import type { User } from "@/lib/types";

export function AuthGate({ children }: { children: (user: User) => React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    fetchMe()
      .then(setUser)
      .catch(() => router.replace("/login"))
      .finally(() => setChecked(true));
  }, [router]);

  if (!checked || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  return <>{children(user)}</>;
}
