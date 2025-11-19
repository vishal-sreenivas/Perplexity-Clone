"use client";

import { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import { StreamingAnswer } from "./streaming-answer";
import { Card } from "@/components/ui/card";

interface MessageProps {
  message: Message;
  onEdit?: (id: string, newText: string) => void;
}

export function ChatMessage({ message, onEdit }: MessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full gap-3 items-end animate-fade-in",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-[#111111] font-semibold shadow-sm hover:shadow-md transition-shadow">
            AI
          </div>
        </div>
      )}

      <div className={cn(isUser ? "items-end" : "items-start", "flex")}>
        <Card
          className={cn(
            "max-w-[85%] px-4 py-3 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md",
            isUser
              ? "bg-[#e8f3ff] text-blue-700 border border-blue-200"
              : "bg-white text-[#111111] border border-gray-200"
          )}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <StreamingAnswer message={message} onEdit={onEdit} />
          )}
        </Card>
      </div>

      {isUser && (
        <div className="flex-shrink-0">
          <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-[#111111] font-medium shadow-sm hover:shadow-md transition-shadow">
            You
          </div>
        </div>
      )}
    </div>
  );
}
