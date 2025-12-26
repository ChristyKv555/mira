"use client";

import { X, History, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onClose: () => void;
  onHistoryClick: () => void;
  onNewChatClick: () => void;
  selectedChatTitle?: string;
}

export function ChatHeader({
  onClose,
  onHistoryClick,
  onNewChatClick,
  selectedChatTitle,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onHistoryClick}
          className="h-8 w-8"
        >
          <History className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewChatClick}
          className="h-8 w-8"
        >
          <Plus className="h-4 w-4" />
        </Button>
        {selectedChatTitle && (
          <h3 className="text-sm font-medium ml-2 truncate max-w-[200px]">
            {selectedChatTitle}
          </h3>
        )}
      </div>
      <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
