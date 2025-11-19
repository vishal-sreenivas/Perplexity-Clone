"use client";

import { Message } from "@/types/chat";
import { Plan } from "./plan";
import { Sources } from "./sources";
import { Answer } from "./answer";
import { Skeleton } from "@/components/ui/skeleton";

interface StreamingAnswerProps {
  message: Message;
  onEdit?: (id: string, newText: string) => void;
}

export function StreamingAnswer({ message, onEdit }: StreamingAnswerProps) {
  const streamingState = message.streamingState;

  if (!streamingState) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  const { planSteps, sources, answerText, done } = streamingState;

  return (
    <div className="space-y-4">
      {/* Plan Steps - Always show if present */}
      {planSteps.length > 0 && (
        <div className="mb-3">
          <Plan steps={planSteps} />
        </div>
      )}

      {/* Sources - Always show if present, even while streaming */}
      {sources.length > 0 && (
        <div className="mb-3">
          <Sources sources={sources} />
        </div>
      )}

      {/* Answer - Show as it streams */}
      {answerText && (
        <div className="prose-sm max-w-none">
          <Answer text={answerText} done={done} messageId={message.id} onEdit={onEdit} />
        </div>
      )}

      {/* Loading state - Show when no content yet */}
      {!done && !answerText && planSteps.length === 0 && sources.length === 0 && (
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/6" />
        </div>
      )}

      {/* Progress indicator while streaming */}
      {!done && (planSteps.length > 0 || sources.length > 0 || answerText) && (
        <div className="flex items-center gap-2 pt-3 mt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
          </div>
          <span className="text-xs text-[#444444] font-medium">Generating answer...</span>
        </div>
      )}
    </div>
  );
}
