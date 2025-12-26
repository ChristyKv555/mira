"use client";

import { ChatBot } from "./components/ChatBot";

export default function AskAIPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <ChatBot />
    </div>
  );
}
