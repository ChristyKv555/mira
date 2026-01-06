"use client";

interface ChatHeaderProps {
  selectedChatTitle?: string;
}

export function ChatHeader({ selectedChatTitle }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border">
      {selectedChatTitle && (
        <h3 className="text-sm font-medium truncate max-w-[200px]">
          {selectedChatTitle}
        </h3>
      )}
    </div>
  );
}
