"use client";

import { ThemeToggle } from "@/components/ThemeToggle";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 h-16 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-full items-center justify-end px-6">
        <ThemeToggle />
      </div>
    </header>
  );
}

