"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  startTransition,
} from "react";
import { History, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useStreamAssistantChatMutation,
  useGetChatSessionQuery,
} from "../queries/chatApi";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { ChatLoading } from "./ChatLoading";
import { ChatWelcome } from "./ChatWelcome";
import { ChatHistorySidebar } from "./ChatHistorySidebar";
import { useAuth } from "@/hooks/useAuth";
import { Message, MessageType } from "../types/chat.types";

export function ChatBot() {
  const { user } = useAuth();
  const userName = user?.name || user?.email?.split("@")[0] || "User";

  const [streamAssistantChat, { isLoading: isStreaming }] =
    useStreamAssistantChatMutation();

  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<
    string | undefined
  >();
  const [selectedSessionTitle, setSelectedSessionTitle] = useState<string>("");
  const [isChatProcessing, setIsChatProcessing] = useState(false);
  const [streamContent, setStreamContent] = useState("");
  const [mode, setMode] = useState<"ask" | "generate">("ask");
  const [inputValue, setInputValue] = useState("");
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);

  // Load session when selectedSessionId changes
  const { data: sessionData } = useGetChatSessionQuery(
    selectedSessionId || "",
    {
      skip: !selectedSessionId,
    }
  );

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadedSessionIdRef = useRef<string | undefined>(undefined);

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages, streamContent, scrollToBottom]);

  // Load session messages when session data is fetched
  useEffect(() => {
    if (
      selectedSessionId &&
      sessionData?.session &&
      sessionData?.messages &&
      loadedSessionIdRef.current !== selectedSessionId
    ) {
      loadedSessionIdRef.current = selectedSessionId;

      // Use startTransition to batch state updates and avoid cascading renders
      startTransition(() => {
        setSelectedSessionTitle(sessionData.session.title);
        setMode(sessionData.session.type);

        // Convert API messages to Message format
        const loadedMessages: Message[] = sessionData.messages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          isUser: msg.role === "user",
          timestamp: new Date(msg.createdAt),
          type: MessageType.TEXT,
        }));

        setMessages(loadedMessages);
      });
    }
  }, [sessionData, selectedSessionId]);

  // Reset loaded session ref when selectedSessionId changes to undefined
  useEffect(() => {
    if (!selectedSessionId) {
      loadedSessionIdRef.current = undefined;
    }
  }, [selectedSessionId]);

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;

    // Cancel any ongoing request
    cancelChatRequest();

    // Clear input
    setInputValue("");

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: message,
      isUser: true,
      timestamp: new Date(),
      type: MessageType.TEXT,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsChatProcessing(true);
    setStreamContent("");

    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Track accumulated content
    let accumulatedContent = "";
    let sessionIdFromStream: string | undefined = selectedSessionId;

    // Start streaming
    streamAssistantChat({
      message: message.trim(),
      sessionId: selectedSessionId,
      type: mode,
      signal: abortController.signal,
      handleStream: (chunk: string) => {
        // Try to parse as JSON (for metadata/completion events)
        try {
          const parsed = JSON.parse(chunk);

          // Handle metadata event
          if (parsed.type === "metadata" && parsed.data) {
            if (parsed.data.sessionId) {
              sessionIdFromStream = parsed.data.sessionId;
              setSelectedSessionId(parsed.data.sessionId);
            }
            return; // Don't add metadata to stream content
          }

          // Handle completion event
          if (parsed.type === "complete" && parsed.data) {
            // Use the content from completion event if available, otherwise use accumulated
            const finalContent = parsed.data.content || accumulatedContent;
            // Save the complete message
            if (finalContent.trim()) {
              const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: finalContent,
                isUser: false,
                timestamp: new Date(),
                type: MessageType.TEXT,
              };
              setMessages((prev) => [...prev, assistantMessage]);
            }
            setStreamContent("");
            setIsChatProcessing(false);
            abortControllerRef.current = null;
            return;
          }

          // Handle error event
          if (parsed.type === "error") {
            console.error("Stream error:", parsed.error);
            setIsChatProcessing(false);
            setStreamContent("");
            abortControllerRef.current = null;
            return;
          }

          // If it's valid JSON but not a known event type, treat as text
          accumulatedContent += chunk;
          setStreamContent(accumulatedContent);
        } catch {
          // Not JSON, treat as plain text chunk
          accumulatedContent += chunk;
          setStreamContent(accumulatedContent);
        }
      },
      handleClose: () => {
        // Fallback: Save accumulated stream content if stream closes without completion event
        if (accumulatedContent.trim() && isChatProcessing) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: accumulatedContent,
            isUser: false,
            timestamp: new Date(),
            type: MessageType.TEXT,
          };
          setMessages((prev) => [...prev, assistantMessage]);
        }
        setStreamContent("");
        setIsChatProcessing(false);
        abortControllerRef.current = null;
      },
    }).catch((error) => {
      console.error("Error streaming chat:", error);
      setIsChatProcessing(false);
      setStreamContent("");
      abortControllerRef.current = null;
    });
  };

  const cancelChatRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsChatProcessing(false);
    setStreamContent("");
  };

  const handleNewChat = () => {
    cancelChatRequest();
    setSelectedSessionId(undefined);
    setSelectedSessionTitle("");
    setMessages([]);
    setStreamContent("");
    setInputValue("");
    setMode("ask");
  };

  const handleHistoryClick = () => {
    setIsHistorySidebarOpen(true);
  };

  const handleSelectSession = (sessionId: string) => {
    cancelChatRequest();
    if (sessionId) {
      setSelectedSessionId(sessionId);
    } else {
      // Clear selection - new chat
      setSelectedSessionId(undefined);
      setSelectedSessionTitle("");
      setMessages([]);
      setStreamContent("");
      setInputValue("");
      setMode("ask");
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Mode Toggle with New Chat and History */}
      <div className="w-full flex items-center justify-between pt-4 pb-2 px-4 border-b border-border gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewChat}
            className="h-8 gap-2"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHistoryClick}
            className="h-8 gap-2"
          >
            <History className="h-4 w-4" />
            History
          </Button>
        </div>
        <div className="relative inline-flex items-center bg-muted rounded-full p-1">
          <button
            onClick={() => {
              if (mode !== "ask") {
                handleNewChat();
                setMode("ask");
              }
            }}
            className={`relative flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${
              mode === "ask"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Ask
          </button>
          <button
            onClick={() => {
              if (mode !== "generate") {
                handleNewChat();
                setMode("generate");
              }
            }}
            className={`relative flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${
              mode === "generate"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Generate
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {!hasMessages && <ChatWelcome userName={userName} />}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {streamContent && (
          <ChatMessage
            message={{
              id: "streaming",
              content: streamContent,
              isUser: false,
              timestamp: new Date(),
              type: MessageType.TEXT,
            }}
          />
        )}

        {isChatProcessing && !streamContent && <ChatLoading />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSendMessage}
        onCancel={cancelChatRequest}
        isLoading={isChatProcessing}
      />

      {/* History Sidebar */}
      <ChatHistorySidebar
        isOpen={isHistorySidebarOpen}
        onClose={() => setIsHistorySidebarOpen(false)}
        onSelectSession={handleSelectSession}
        selectedSessionId={selectedSessionId}
      />
    </div>
  );
}
