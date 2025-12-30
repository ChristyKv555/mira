"use client";

import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { Message, MessageType } from "../types/chat.types";
import type { Task } from "@/database/schema/tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isUser = message.isUser;

  // Parse message content - check if it's JSON (for task cards) or plain text
  const parsedMessage = useMemo(() => {
    try {
      const parsed = JSON.parse(message.content);
      if (parsed.type === MessageType.TASK && parsed.tasks) {
        return {
          type: MessageType.TASK,
          content: parsed.message || "",
          tasks: parsed.tasks as Task[],
        };
      }
      return { type: MessageType.TEXT, content: message.content };
    } catch {
      return { type: MessageType.TEXT, content: message.content };
    }
  }, [message.content]);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div className="flex items-center justify-center rounded-full bg-primary p-2 mr-2 mt-1 h-8 w-8 shrink-0">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
      )}

      <div
        className={`max-w-[85%] rounded-lg p-3 ${
          isUser
            ? "bg-muted text-muted-foreground"
            : "bg-card border border-border"
        }`}
      >
        {renderContent(parsedMessage, isUser)}
        <div className={`text-xs mt-2 ${isUser ? "text-right" : "text-left"}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}

function renderContent(
  parsed: {
    type: MessageType;
    content: string;
    tasks?: Task[];
  },
  isUser: boolean
) {
  if (
    parsed.type === MessageType.TASK &&
    parsed.tasks &&
    parsed.tasks.length > 0
  ) {
    return (
      <div className="flex flex-col gap-3">
        {parsed.content && (
          <p className="text-sm whitespace-pre-wrap wrap-break-word text-muted-foreground">
            {parsed.content}
          </p>
        )}
        <div className="space-y-2">
          {parsed.tasks.map((task) => (
            <Card key={task.id} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-medium">
                    {task.title}
                  </CardTitle>
                  {task.priorityId && (
                    <Badge variant="secondary" className="text-xs">
                      Priority
                    </Badge>
                  )}
                </div>
              </CardHeader>
              {task.description && (
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {task.description}
                  </p>
                </CardContent>
              )}
              {task.dueDate && (
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <p
      className={`text-sm whitespace-pre-wrap wrap-break-word ${
        isUser ? "text-foreground" : "text-foreground"
      }`}
    >
      {parsed.content}
    </p>
  );
}
