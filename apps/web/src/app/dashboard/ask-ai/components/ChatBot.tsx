"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useStreamAssistantChatMutation } from "../queries/chatApi";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { ChatLoading } from "./ChatLoading";
import { ChatWelcome } from "./ChatWelcome";
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

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages, streamContent, scrollToBottom]);

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

  const handleClose = () => {
    cancelChatRequest();
    // Could add logic to close/minimize chat if needed
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Mode Toggle */}
      <div className="w-full flex justify-center pt-4 pb-2 px-4 border-b border-border">
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

      {/* Chat Header */}
      <ChatHeader
        onClose={handleClose}
        onHistoryClick={() => {
          // TODO: Implement history sidebar
        }}
        onNewChatClick={handleNewChat}
        selectedChatTitle={selectedSessionTitle}
      />

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
    </div>
  );
}
