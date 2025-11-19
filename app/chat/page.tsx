"use client";

import { useState, useEffect, useRef, startTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/chat/message";
import { Message } from "@/types/chat";
import {
  makeStreamingRequest,
  iterateTextStream,
  parseStreamChunk,
  createInitialStreamingState,
} from "@/lib/stream";
import { Send, Plus, Search, HelpCircle, Globe, Cpu, Paperclip, Mic, ArrowUp, Sparkles, Menu } from "lucide-react";
import { Sidebar, addChatToHistory } from "@/components/chat/sidebar";
import { cn } from "@/lib/utils";

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [activeMode, setActiveMode] = useState<"search" | "sources" | "help">("search");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasProcessedInitialQuestion = useRef(false);
  const lastQuestionRef = useRef<string | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle initial question from URL - optimized to prevent delays
  useEffect(() => {
    const initialQuestion = searchParams.get("question");
    if (initialQuestion && messages.length === 0 && !hasProcessedInitialQuestion.current) {
      hasProcessedInitialQuestion.current = true;
      // Use setTimeout to ensure state is ready and prevent blocking
      const timer = setTimeout(() => {
        handleSendMessage(initialQuestion);
      }, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const streamMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await makeStreamingRequest(question);
      return { response, question };
    },
    onMutate: async (question) => {
      // Prevent duplicate messages
      if (lastQuestionRef.current === question) {
        // Find existing assistant message for this question
        const existingMessages = messages;
        const lastUserIndex = existingMessages.map(m => m.role).lastIndexOf("user");
        if (lastUserIndex >= 0) {
          const existingAssistant = existingMessages[lastUserIndex + 1];
          if (existingAssistant && existingAssistant.role === "assistant") {
            return { assistantMessage: existingAssistant };
          }
        }
      }

      lastQuestionRef.current = question;

      // Generate IDs before state update to ensure consistency
      const timestamp = Date.now();
      const userMessageId = `user-${timestamp}`;
      const assistantMessageId = `assistant-${timestamp}`;

      // Add user message
      const userMessage: Message = {
        id: userMessageId,
        role: "user",
        content: question,
        timestamp: timestamp,
      };

      // Add empty assistant message with streaming state
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        streamingState: createInitialStreamingState(),
        timestamp: timestamp + 1,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);

      return { assistantMessage };
    },
    onSuccess: async (data, variables, context) => {
      const { response } = data;
      const assistantMessageId = context?.assistantMessage.id;

      if (!assistantMessageId) return;

      try {
        // Process the stream
        for await (const line of iterateTextStream(response)) {
          setMessages((prev) => {
            return prev.map((msg) => {
              if (msg.id === assistantMessageId && msg.streamingState) {
                const newStreamingState = parseStreamChunk(
                  line,
                  msg.streamingState
                );
                return {
                  ...msg,
                  streamingState: newStreamingState,
                  content: newStreamingState.answerText,
                };
              }
              return msg;
            });
          });
        }

        // Mark as done
        setMessages((prev) => {
          return prev.map((msg) => {
            if (msg.id === assistantMessageId && msg.streamingState) {
              // Save to chat history when done
              const userMsg = prev.find((m) => m.role === "user" && m.timestamp < msg.timestamp);
              if (userMsg) {
                addChatToHistory(userMsg.content, msg.streamingState.answerText || "");
              }
              return {
                ...msg,
                streamingState: {
                  ...msg.streamingState,
                  done: true,
                },
              };
            }
            return msg;
          });
        });
      } catch (error) {
        console.error("Streaming error:", error);
        // Handle error state
        setMessages((prev) => {
          return prev.map((msg) => {
            if (msg.id === assistantMessageId) {
              return {
                ...msg,
                content: "Sorry, there was an error processing your request.",
                streamingState: {
                  ...createInitialStreamingState(),
                  done: true,
                },
              };
            }
            return msg;
          });
        });
      }
    },
    onError: (error, variables, context) => {
      console.error("Mutation error:", error);
      const assistantMessageId = context?.assistantMessage.id;
      if (!assistantMessageId) return;

      setMessages((prev) => {
        return prev.map((msg) => {
          if (msg.id === assistantMessageId) {
            return {
              ...msg,
              content: "Sorry, there was an error processing your request.",
              streamingState: {
                ...createInitialStreamingState(),
                done: true,
              },
            };
          }
          return msg;
        });
      });
    },
  });

  const handleSendMessage = async (messageText?: string) => {
    const question = messageText || input.trim();
    if (!question || streamMutation.isPending) return;

    // Clear input immediately for better UX
    setInput("");
    // Start mutation
    streamMutation.mutate(question);
  };

  const handleNewChat = () => {
    // Clear state immediately for instant feedback - this happens synchronously
    setMessages([]);
    setInput("");
    hasProcessedInitialQuestion.current = false;
    lastQuestionRef.current = null;
    
    // Use startTransition for non-urgent navigation update
    startTransition(() => {
      router.replace("/chat", { scroll: false });
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="border-b border-gray-200 px-4 py-3 bg-white sticky top-0 z-10 shadow-sm backdrop-blur-sm">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <button
                onClick={() => router.push("/")}
                className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                title="Go to home"
              >
                S&S
              </button>
              <div>
                <h1 className="text-lg font-semibold text-[#111111]">Sit and Start AI</h1>
                <p className="text-xs text-[#444444]">Ask questions and get summarized answers with sources</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={handleNewChat}
                disabled={streamMutation.isPending}
                className="gap-2 rounded-xl border-gray-200 hover:bg-gray-50 hover:shadow-md transition-all disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
            </div>
          </div>
        </div>

      {/* Messages Container */}
      <ScrollArea className="flex-1 px-4 py-6" ref={scrollAreaRef}>
        <div className="max-w-5xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center space-y-6 animate-fade-in">
                <div className="inline-block p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 mb-4">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    S&S
                  </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#111111]">
                  What would you like to know?
                </h2>
                <p className="text-lg text-[#444444]">
                  Ask me anything and I'll search the web for answers
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onEdit={(id: string, newText: string) => {
                  setMessages((prev) =>
                    prev.map((m) => {
                      if (m.id === id) {
                        return {
                          ...m,
                          content: newText,
                          streamingState: m.streamingState
                            ? { ...m.streamingState, answerText: newText }
                            : undefined,
                        };
                      }
                      return m;
                    })
                  );
                }}
              />
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Enhanced Input Bar */}
      <div className="border-t border-gray-200 bg-white sticky bottom-0 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4">
          {streamMutation.isPending && (
            <div className="mb-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 animate-fade-in">
              <div className="h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-blue-700 font-medium">Processing your request...</span>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className={cn(
              "flex items-center gap-1 bg-white rounded-2xl border p-1 shadow-lg transition-all focus-within:ring-1 focus-within:ring-gray-300",
              streamMutation.isPending 
                ? "border-blue-300 shadow-blue-100" 
                : "border-gray-200 hover:shadow-xl"
            )}>
              {/* Left Icons */}
              <div className="flex items-center gap-1 px-2 py-2 border-r border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveMode("search")}
                  className={`p-2 rounded-lg transition-all ${
                    activeMode === "search"
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <Search className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode("sources")}
                  className={`p-2 rounded-lg transition-all ${
                    activeMode === "sources"
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <Sparkles className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode("help")}
                  className={`p-2 rounded-lg transition-all ${
                    activeMode === "help"
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <HelpCircle className="h-5 w-5" />
                </button>
              </div>

              {/* Input Field */}
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder={streamMutation.isPending ? "Generating answer..." : "Ask a follow-up"}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={streamMutation.isPending}
                  className="w-full border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-gray-500 h-12 pr-8"
                />
                {streamMutation.isPending && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Right Icons */}
              <div className="flex items-center gap-1 px-2 py-2 border-l border-gray-200">
                <button
                  type="button"
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-all"
                  title="Web search"
                >
                  <Globe className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-all"
                  title="AI mode"
                >
                  <Cpu className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-all"
                  title="Attach file"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-all"
                  title="Voice input"
                >
                  <Mic className="h-5 w-5" />
                </button>
                <Button
                  type="submit"
                  disabled={!input.trim() || streamMutation.isPending}
                  className="rounded-lg px-4 h-9 bg-[#111111] hover:bg-[#222222] text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[36px]"
                >
                  {streamMutation.isPending ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowUp className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
