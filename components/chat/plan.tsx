"use client";

import { PlanStep } from "@/types/chat";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

interface PlanProps {
  steps: PlanStep[];
}

export function Plan({ steps }: PlanProps) {
  if (steps.length === 0) return null;

  return (
    <div className="space-y-2 pb-4 border-b border-gray-200 animate-fade-in">
      <h4 className="text-xs font-semibold text-[#444444] uppercase tracking-wide mb-3">
        Plan
      </h4>
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn(
              "flex items-start gap-3 text-sm transition-all duration-200",
              step.status === "active" && "text-blue-700 font-medium",
              step.status === "complete" && "text-[#222222]",
              step.status === "pending" && "text-[#444444]"
            )}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="mt-0.5 flex-shrink-0">
              {step.status === "complete" && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
              {step.status === "active" && (
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              )}
              {step.status === "pending" && (
                <Circle className="h-4 w-4 text-gray-300" />
              )}
            </div>
            <span className="leading-relaxed flex-1">{step.step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
