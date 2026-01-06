"use client";

import { X, MessageSquare, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useGetChatSessionsQuery, useDeleteChatSessionMutation } from "../queries/chatApi";
import { ChatSession } from "../types/chat.types";
// Simple date formatter
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
};

interface ChatHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSession: (sessionId: string) => void;
  selectedSessionId?: string;
}

export function ChatHistorySidebar({
  isOpen,
  onClose,
  onSelectSession,
  selectedSessionId,
}: ChatHistorySidebarProps) {
  const { data, isLoading, refetch } = useGetChatSessionsQuery(undefined, {
    // Refetch when sidebar opens
    skip: !isOpen,
  });
  const [deleteSession] = useDeleteChatSessionMutation();

  const handleDeleteSession = async (
    e: React.MouseEvent,
    sessionId: string
  ) => {
    e.stopPropagation();
    try {
      await deleteSession(sessionId).unwrap();
      refetch();
      // If deleted session was selected, clear selection
      if (selectedSessionId === sessionId) {
        onSelectSession("");
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    if (sessionId) {
      onSelectSession(sessionId);
    } else {
      onSelectSession("");
    }
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            exit={{ x: -400 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 z-50 h-full w-[400px] bg-background border-r border-border shadow-lg flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Chat History</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-muted-foreground">Loading...</div>
                </div>
              ) : !data?.sessions || data.sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    No chat sessions yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Start a new conversation to see it here
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.sessions.map((session: ChatSession) => (
                    <div
                      key={session.id}
                      onClick={() => handleSelectSession(session.id)}
                      className={`group relative flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedSessionId === session.id
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted border border-transparent"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              session.type === "ask"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                            }`}
                          >
                            {session.type === "ask" ? "Ask" : "Generate"}
                          </span>
                        </div>
                        <p className="text-sm font-medium truncate">
                          {session.title || "Untitled Chat"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(
                            session.updatedAt instanceof Date
                              ? session.updatedAt.toISOString()
                              : session.updatedAt
                          )}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        onClick={(e) => handleDeleteSession(e, session.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

