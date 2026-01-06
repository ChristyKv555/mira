"use client";

import { Sparkles } from "lucide-react";

export function ChatLoading() {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-center justify-center rounded-full bg-primary p-2 mr-2 mt-1 h-8 w-8 shrink-0">
        <Sparkles className="w-4 h-4 text-primary-foreground" />
      </div>

      <div className="bg-card border border-border rounded-lg p-3 text-start max-w-[85%]">
        <div className="flex items-center gap-2">
          <div className="relative overflow-hidden">
            <p className="text-sm text-muted-foreground italic">
              AI is thinking...
            </p>
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-card/60 to-transparent animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
