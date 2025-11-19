"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatHistory {
  id: string;
  title: string;
  timestamp: number;
  preview: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentChatId?: string;
}

export function Sidebar({ isOpen, onClose, currentChatId }: SidebarProps) {
  const router = useRouter();
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);

  // Load chat history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("chatHistory");
    if (stored) {
      try {
        setChatHistory(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load chat history", e);
      }
    }
  }, []);

  // Save chat history to localStorage
  const saveChatHistory = (history: ChatHistory[]) => {
    localStorage.setItem("chatHistory", JSON.stringify(history));
    setChatHistory(history);
  };

  // Add new chat to history
  const addToHistory = (title: string, preview: string) => {
    const newChat: ChatHistory = {
      id: `chat-${Date.now()}`,
      title: title.length > 50 ? title.substring(0, 50) + "..." : title,
      timestamp: Date.now(),
      preview: preview.length > 100 ? preview.substring(0, 100) + "..." : preview,
    };
    const updated = [newChat, ...chatHistory].slice(0, 20); // Keep last 20 chats
    saveChatHistory(updated);
  };

  // Delete chat from history
  const deleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = chatHistory.filter((chat) => chat.id !== id);
    saveChatHistory(updated);
  };

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return "Today";
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-80 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out shadow-xl",
          "md:relative md:translate-x-0 md:z-auto md:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#111111]">History</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="md:hidden h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Chat List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {chatHistory.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm text-[#444444]">No chat history yet</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Your previous conversations will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {chatHistory.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => {
                        router.push(`/chat?question=${encodeURIComponent(chat.title)}`);
                        onClose();
                      }}
                      className={cn(
                        "group relative p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-50",
                        currentChatId === chat.id && "bg-blue-50 border border-blue-200"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-[#111111] truncate">
                            {chat.title}
                          </h3>
                          <p className="text-xs text-[#444444] mt-1 line-clamp-2">
                            {chat.preview}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTime(chat.timestamp)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => deleteChat(chat.id, e)}
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}

// Export function to add chat to history (to be called from chat page)
export function addChatToHistory(title: string, preview: string) {
  const stored = localStorage.getItem("chatHistory");
  let history: ChatHistory[] = [];
  if (stored) {
    try {
      history = JSON.parse(stored);
    } catch (e) {
      console.error("Failed to load chat history", e);
    }
  }
  const newChat: ChatHistory = {
    id: `chat-${Date.now()}`,
    title: title.length > 50 ? title.substring(0, 50) + "..." : title,
    timestamp: Date.now(),
    preview: preview.length > 100 ? preview.substring(0, 100) + "..." : preview,
  };
  const updated = [newChat, ...history].slice(0, 20);
  localStorage.setItem("chatHistory", JSON.stringify(updated));
}

