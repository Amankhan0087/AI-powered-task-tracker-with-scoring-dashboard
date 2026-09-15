"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { clearToken } from "@/lib/api";

const LINKS = [
  { href: "/", label: "Overview", short: "Home" },
  { href: "/tasks", label: "Tasks", short: "Tasks" },
  { href: "/progress", label: "Progress", short: "Progress" },
  { href: "/ai-assistant", label: "AI Assistant", short: "AI" },
];

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:px-4">
        <nav className="flex min-w-0 items-center gap-0.5 overflow-x-auto sm:gap-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "shrink-0 rounded-md px-2 py-1.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground sm:px-3",
                pathname === link.href && "bg-secondary text-foreground"
              )}
            >
              <span className="sm:hidden">{link.short}</span>
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          ))}
        </nav>
        <Button variant="ghost" size="sm" className="shrink-0" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </header>
  );
}
