"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";

interface AnswerProps {
  text: string;
  done: boolean;
  messageId?: string;
  onEdit?: (id: string, newText: string) => void;
}

export function Answer({ text, done, messageId, onEdit }: AnswerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(text);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Extract image URLs from markdown image syntax or direct links
  const images = useMemo(() => {
    const imgs: string[] = [];
    const mdImageRegex = /!\[[^\]]*\]\((https?:\/\/[^)]+)\)/g;
    let match: RegExpExecArray | null;
    while ((match = mdImageRegex.exec(text))) {
      imgs.push(match[1]);
    }
    // find plain image URLs
    const urlRegex = /(https?:\/\/[^\s)]+\.(?:png|jpg|jpeg|gif|webp))/gi;
    while ((match = urlRegex.exec(text))) {
      if (!imgs.includes(match[1])) imgs.push(match[1]);
    }
    return imgs;
  }, [text]);

  if (!text) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const handleSaveEdit = () => {
    if (onEdit && messageId) onEdit(messageId, editValue);
    setIsEditing(false);
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          className="text-sm text-[#444444] hover:text-[#111111]"
          onClick={handleCopy}
        >
          Copy
        </button>
        <button
          type="button"
          className="text-sm text-[#444444] hover:text-[#111111]"
          onClick={() => {
            setIsEditing((s) => !s);
            setEditValue(text);
          }}
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>
        {isEditing && (
          <button
            type="button"
            className="text-sm text-white bg-[#111111] hover:bg-[#222222] px-3 py-1 rounded-lg shadow-sm"
            onClick={handleSaveEdit}
          >
            Save
          </button>
        )}
      </div>

      {/* Images carousel */}
      {images.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto py-2">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setSelectedImage(src)}
              className="flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm"
            >
              <img src={src} alt={`img-${i}`} className="h-20 w-32 object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Editable textarea */}
      {isEditing ? (
        <div>
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full rounded-lg border border-gray-200 p-3 text-sm min-h-[120px] focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>
      ) : (
        <div
          className={cn(
            "prose prose-sm max-w-none",
            "prose-p:leading-relaxed prose-p:my-2",
            "prose-headings:font-semibold prose-headings:my-3",
            "prose-ul:my-2 prose-ol:my-2",
            "prose-li:my-1",
            "prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800",
            "prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
            "prose-pre:bg-gray-100 prose-pre:text-[#111111] prose-pre:p-4 prose-pre:rounded-lg"
          )}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node, ...props }) => (
                <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline" />
              ),
              table: ({ node, children, ...props }) => (
                <div className="overflow-x-auto my-6 rounded-xl border border-gray-200 shadow-lg bg-white animate-fade-in scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:shadow-xl transition-shadow duration-300 table-container w-full">
                  <table 
                    className="w-full text-left border-collapse min-w-[800px] sm:min-w-[900px] md:min-w-full"
                    {...props}
                  >
                    {children}
                  </table>
                </div>
              ),
              thead: ({ node, ...props }) => (
                <thead className="bg-gradient-to-r from-gray-50 via-gray-50 to-gray-100 border-b-2 border-gray-300 sticky top-0 z-20" {...props} />
              ),
              th: ({ node, ...props }) => (
                <th className="px-3 sm:px-4 md:px-5 py-3 md:py-3.5 text-xs font-bold text-[#111111] bg-gradient-to-r from-gray-50 via-gray-50 to-gray-100 uppercase tracking-wider border-r border-gray-200 last:border-r-0 whitespace-nowrap first:rounded-tl-xl last:rounded-tr-xl" {...props} />
              ),
              tbody: ({ node, ...props }) => (
                <tbody className="bg-white divide-y divide-gray-200 [&>tr]:animate-table-row" {...props} />
              ),
              tr: ({ node, ...props }) => (
                <tr 
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 border-b border-gray-200 last:border-b-0 group cursor-pointer" 
                  {...props} 
                />
              ),
              td: ({ node, ...props }) => (
                <td className="px-3 sm:px-4 md:px-5 py-3 md:py-3.5 text-sm text-[#111111] border-r border-gray-100 last:border-r-0 align-top group-hover:text-blue-700 transition-colors duration-200 break-words" {...props} />
              ),
              h1: ({ node, ...props }) => (
                <h1 className="text-2xl font-bold text-[#111111] mt-6 mb-4" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-xl font-semibold text-[#111111] mt-5 mb-3" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-lg font-semibold text-[#111111] mt-4 mb-2" {...props} />
              ),
              sup: ({ node, children, ...props }) => {
                const text = String(children);
                if (text.match(/^\[\d+\]$/)) {
                  return (
                    <sup
                      {...props}
                      className="text-blue-600 font-medium cursor-pointer hover:text-blue-800 ml-0.5 hover:underline"
                      title="Click to view source"
                    >
                      {children}
                    </sup>
                  );
                }
                return <sup {...props}>{children}</sup>;
              },
              blockquote: ({ node, ...props }) => (
                <blockquote className="border-l-4 border-blue-300 pl-4 italic text-[#444444] my-4" {...props} />
              ),
              strong: ({ node, ...props }) => (
                <strong className="font-semibold text-[#111111]" {...props} />
              ),
              em: ({ node, ...props }) => (
                <em className="italic text-[#111111]" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="text-[#111111] leading-relaxed my-3" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc list-inside my-3 space-y-1" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal list-inside my-3 space-y-1" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="text-[#111111]" {...props} />
              ),
            }}
          >
            {text}
          </ReactMarkdown>
        </div>
      )}

      {/* Image modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/25"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-3xl max-h-[80vh] p-4">
            <img src={selectedImage} alt="selected" className="w-full h-auto rounded-lg shadow-lg" />
          </div>
        </div>
      )}
    </div>
  );
}

