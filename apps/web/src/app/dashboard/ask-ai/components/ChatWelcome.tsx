"use client";

import { Sparkles } from "lucide-react";

interface ChatWelcomeProps {
  userName?: string;
}

export function ChatWelcome({ userName }: ChatWelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="flex items-center justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
      </div>
      <h2 className="text-2xl font-semibold mb-2">
        {userName ? `Hello, ${userName}!` : "Hello!"}
      </h2>
      <p className="text-muted-foreground text-center max-w-md">
        How can I help you today? Ask me anything about your tasks or generate
        insights from your data.
      </p>
    </div>
  );
}
