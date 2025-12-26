"use client";

import { useState } from "react";
import { Sparkles, Send, Wand2, MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/SidebarContext";

export default function AskAIPage() {
  const [mode, setMode] = useState<"ask" | "generate">("ask");
  const [input, setInput] = useState("");
  const { sidebarWidth } = useSidebar();

  const handleNewChat = () => {
    setInput("");
    // TODO: Create new chat session and reset chat history
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Toggle Switcher */}
      <div className="w-full flex justify-center pt-8 pb-4 px-4">
        <div className="relative inline-flex items-center bg-muted rounded-full p-1">
          <button
            onClick={() => setMode("ask")}
            className={cn(
              "relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ease-in-out",
              mode === "ask"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            Ask
          </button>
          <button
            onClick={() => setMode("generate")}
            className={cn(
              "relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ease-in-out",
              mode === "generate"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Wand2 className="w-4 h-4" />
            Generate
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-40">
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
          {/* Content Area */}
          <Tabs
            value={mode}
            onValueChange={(value) => setMode(value as "ask" | "generate")}
            className="w-full flex flex-col items-center"
          >
            {/* Ask Mode */}
            <TabsContent
              value="ask"
              className="w-full mt-0 flex flex-col items-center"
            >
              <div className="flex flex-col items-center justify-center w-full">
                {/* Welcome Message */}
                <div className="text-center space-y-4 mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <h1 className="text-4xl font-semibold">
                    How can I help you today?
                  </h1>
                </div>

                {/* Quick Suggestions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                  {[
                    "What tasks need my attention today?",
                    "Show me productivity trends",
                    "Which tasks are overdue?",
                    "Help me prioritize my work",
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(suggestion)}
                      className="p-4 text-left border rounded-lg hover:bg-accent transition-colors text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Generate Mode */}
            <TabsContent
              value="generate"
              className="w-full mt-0 flex flex-col items-center"
            >
              <div className="flex flex-col items-center justify-center w-full">
                <div className="text-center space-y-6">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Wand2 className="w-12 h-12 text-primary" />
                    </div>
                  </div>
                  <h1 className="text-4xl font-semibold">Generate Content</h1>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    Create reports, summaries, and insights from your tasks and
                    data
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 w-full max-w-2xl mx-auto">
                    {[
                      {
                        title: "Task Summary",
                        desc: "Generate a summary of your tasks",
                      },
                      {
                        title: "Productivity Report",
                        desc: "Create a productivity analysis",
                      },
                      { title: "Action Plan", desc: "Generate an action plan" },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="p-6 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                      >
                        <h3 className="font-semibold mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Fixed Input Area */}
      <div
        className="fixed bottom-0 right-0 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 transition-all duration-300"
        style={{ left: `${sidebarWidth}px` }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-3xl mx-auto flex items-center gap-2">
            <Button
              size="icon"
              className="h-8 w-8"
              onClick={handleNewChat}
              title="New chat"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <div className="relative flex-1">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === "ask"
                    ? "Message AI..."
                    : "Describe what you want to generate..."
                }
                className="min-h-[60px] max-h-[200px] pr-12 resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    // Handle send
                    setInput("");
                  }
                }}
              />
              <Button
                size="icon"
                className={cn(
                  "absolute right-2 bottom-2 h-8 w-8",
                  !input.trim() && "opacity-50 cursor-not-allowed"
                )}
                disabled={!input.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            AI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
}
