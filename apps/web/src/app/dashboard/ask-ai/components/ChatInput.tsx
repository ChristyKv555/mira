"use client";

import { useRef, useEffect } from "react";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
  onCancel: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onCancel,
  isLoading,
  disabled = false,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading && !disabled) {
        onSend(value);
      }
    }
  };

  return (
    <div className="border-t border-border p-4 bg-background">
      {isLoading && (
        <div className="mb-2 flex items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-7 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Cancel
          </Button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message AI..."
            className={cn(
              "min-h-[60px] max-h-[200px] pr-12 resize-none",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled || isLoading}
            rows={1}
          />
          <Button
            size="icon"
            className={cn(
              "absolute right-2 bottom-2 h-8 w-8",
              (!value.trim() || isLoading || disabled) &&
                "opacity-50 cursor-not-allowed"
            )}
            disabled={!value.trim() || isLoading || disabled}
            onClick={() => onSend(value)}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        AI can make mistakes. Check important info.
      </p>
    </div>
  );
}
