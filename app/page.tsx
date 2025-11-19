"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/chat/message";
import { Message } from "@/types/chat";
import { Search, HelpCircle, Globe, Cpu, Paperclip, Mic, ArrowUp, Sparkles, Heart, Lightbulb, CheckSquare, Network, MapPin, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, FormEvent, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  makeStreamingRequest,
  iterateTextStream,
  parseStreamChunk,
  createInitialStreamingState,
} from "@/lib/stream";
import { addChatToHistory } from "@/components/chat/sidebar";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [activeMode, setActiveMode] = useState<"search" | "sources" | "help">("search");
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastQuestionRef = useRef<string | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const streamMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await makeStreamingRequest(question);
      return { response };
    },
    onMutate: async (question) => {
      // Prevent duplicate messages
      if (lastQuestionRef.current === question) {
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
      setHasSearched(true);

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
      const assistantMessage = context?.assistantMessage;
      if (!assistantMessage) return;

      const assistantMessageId = assistantMessage.id;
      let currentState = createInitialStreamingState();

      try {
        for await (const line of iterateTextStream(response)) {
          currentState = parseStreamChunk(line, currentState);

          setMessages((prev) => {
            return prev.map((msg) => {
              if (msg.id === assistantMessageId) {
                return {
                  ...msg,
                  content: currentState.answerText,
                  streamingState: currentState,
                };
              }
              return msg;
            });
          });
        }

        // Mark as done
        setMessages((prev) => {
          return prev.map((msg) => {
            if (msg.id === assistantMessageId) {
              const finalMessage = {
                ...msg,
                streamingState: {
                  ...currentState,
                  done: true,
                },
              };
              // Add to chat history
              const userMessage = prev.find(m => m.role === "user" && m.timestamp === msg.timestamp - 1);
              if (userMessage) {
                addChatToHistory(userMessage.content, finalMessage.content);
              }
              return finalMessage;
            }
            return msg;
          });
        });
      } catch (error) {
        console.error("Streaming error:", error);
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedQuestion = question.trim();
    if (trimmedQuestion && !streamMutation.isPending) {
      setQuestion("");
      streamMutation.mutate(trimmedQuestion);
    }
  };

  const handleNewChat = () => {
    // Clear state immediately for instant feedback
    setMessages([]);
    setQuestion("");
    setHasSearched(false);
    lastQuestionRef.current = null;
    // Cancel any pending mutations if possible
    if (streamMutation.isPending) {
      streamMutation.reset();
    }
  };

  const exampleQuestions = [
    "What is quantum computing?",
    "How do neural networks work?",
    "Explain climate change",
    "Latest AI developments",
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6 flex-1 flex flex-col">
        {/* Header with Logo and Search Bar */}
        <div className={cn(
          "space-y-6 transition-all duration-300",
          hasSearched ? "pt-4" : "pt-16"
        )}>
          {/* Header Bar - Show when searched */}
          {hasSearched && (
            <div className="flex items-center justify-between mb-2 animate-fade-in">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleNewChat}
                  className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                  title="Sit and Start AI"
                >
                  S&S
                </button>
                <div>
                  <h1 className="text-lg font-semibold text-[#111111]">Sit and Start AI</h1>
                  <p className="text-xs text-[#444444]">Ask questions and get summarized answers with sources</p>
                </div>
              </div>
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
          )}

          {/* Hero Section - Only show when no search */}
          {!hasSearched && (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="inline-flex items-center justify-center mb-4">
                <button
                  onClick={handleNewChat}
                  className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg animate-float hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                  title="Sit and Start AI"
                >
                  S&S
                </button>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-[#111111] tracking-tight">
                Where knowledge begins
              </h1>
              <p className="text-xl md:text-2xl text-[#444444] max-w-2xl mx-auto leading-relaxed">
                Ask anything and get instant, accurate answers powered by AI
              </p>
            </div>
          )}

          {/* Enhanced Search Bar */}
          <form onSubmit={handleSubmit} className="w-full animate-fade-in sticky top-4 z-10">
            <Card className="p-1 shadow-lg border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-1 bg-white rounded-2xl">
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
                <Input
                  type="text"
                  placeholder={streamMutation.isPending ? "Generating answer..." : hasSearched ? "Ask a follow-up" : "Ask anything..."}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={streamMutation.isPending}
                  className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-gray-500 h-12"
                />

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
                    disabled={!question.trim() || streamMutation.isPending}
                    className="rounded-lg px-4 h-9 bg-[#111111] hover:bg-[#222222] text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {streamMutation.isPending ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArrowUp className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </form>

          {/* Feature Cards and Suggestions - Only show when no search */}
          {!hasSearched && (
            <>
              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-gray-200">
                  <div className="space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-[#111111]">AI-Powered</h3>
                    <p className="text-sm text-[#444444]">Get intelligent answers powered by advanced AI models</p>
                  </div>
                </Card>
                <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-gray-200">
                  <div className="space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center">
                      <Globe className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-[#111111]">Web Search</h3>
                    <p className="text-sm text-[#444444]">Real-time information from across the internet</p>
                  </div>
                </Card>
                <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-gray-200">
                  <div className="space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center">
                      <Cpu className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-[#111111]">Fast & Accurate</h3>
                    <p className="text-sm text-[#444444]">Instant responses with cited sources</p>
                  </div>
                </Card>
              </div>

              {/* Suggestion Buttons */}
              <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <p className="text-sm text-[#444444] text-center font-medium">Explore:</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {[
                    { icon: Heart, label: "Health", query: "What are the latest health recommendations?" },
                    { icon: Lightbulb, label: "Learn", query: "Explain how machine learning works" },
                    { icon: CheckSquare, label: "Fact Check", query: "Verify the latest news about AI" },
                    { icon: Network, label: "Analyze", query: "Analyze current market trends" },
                    { icon: MapPin, label: "Local", query: "What's happening in my local area?" },
                  ].map((suggestion, index) => {
                    const Icon = suggestion.icon;
                    return (
                      <button
                        key={suggestion.label}
                        onClick={() => {
                          setQuestion(suggestion.query);
                          setTimeout(() => {
                            const form = document.querySelector('form');
                            form?.requestSubmit();
                          }, 100);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm bg-white border border-gray-200 rounded-full hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all shadow-sm hover:shadow-md hover:scale-105"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <Icon className="h-4 w-4" />
                        {suggestion.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Example Questions */}
              <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                <p className="text-sm text-[#444444] text-center font-medium">Try asking:</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {exampleQuestions.map((example, index) => (
                    <button
                      key={example}
                      onClick={() => {
                        setQuestion(example);
                        setTimeout(() => {
                          const form = document.querySelector('form');
                          form?.requestSubmit();
                        }, 100);
                      }}
                      className="px-5 py-2.5 text-sm bg-white border border-gray-200 rounded-full hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all shadow-sm hover:shadow-md hover:scale-105"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Messages/Results Section */}
        {hasSearched && messages.length > 0 && (
          <ScrollArea className="flex-1 min-h-0" ref={scrollAreaRef}>
            <div className="space-y-6 pb-6">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onEdit={(newContent) => {
                    // Handle edit if needed
                    console.log("Edit message:", newContent);
                  }}
                />
              ))}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>
        )}

        {/* Loading indicator */}
        {streamMutation.isPending && messages.length > 0 && (
          <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 animate-fade-in">
            <div className="h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-blue-700 font-medium">Processing your request...</span>
          </div>
        )}
      </div>
    </div>
  );
}
