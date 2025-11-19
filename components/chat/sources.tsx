"use client";

import { Source } from "@/types/chat";
import { cn } from "@/lib/utils";
import { ExternalLink, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface SourcesProps {
  sources: Source[];
}

export function Sources({ sources }: SourcesProps) {
  if (sources.length === 0) return null;

  const successfulSources = sources.filter(s => s.status === "success").length;
  const totalSources = sources.length;

  return (
    <div className="space-y-3 pb-4 border-b border-gray-200 animate-fade-in">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-[#444444] uppercase tracking-wide">
          Sources
        </h4>
        {totalSources > 0 && (
          <span className="text-xs text-[#444444] font-medium">
            Reviewed {successfulSources || totalSources} {totalSources === 1 ? 'source' : 'sources'}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {sources.map((source, index) => (
          <a
            key={index}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all",
              "bg-white border shadow-sm hover:shadow-md",
              source.status === "crawling" &&
                "border-blue-200 text-blue-700 bg-blue-50",
              source.status === "success" &&
                "border-green-200 text-green-700 bg-green-50",
              source.status === "error" &&
                "border-red-200 text-red-700 bg-red-50"
            )}
          >
            {source.status === "crawling" && (
              <Loader2 className="h-3 w-3 animate-spin" />
            )}
            {source.status === "success" && (
              <CheckCircle2 className="h-3 w-3" />
            )}
            {source.status === "error" && <XCircle className="h-3 w-3" />}
            
            <span className="truncate max-w-[200px]">
              {source.title || getDomainFromUrl(source.url)}
            </span>
            <ExternalLink className="h-3 w-3" />
          </a>
        ))}
      </div>
    </div>
  );
}

function getDomainFromUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace("www.", "");
  } catch {
    return url;
  }
}
