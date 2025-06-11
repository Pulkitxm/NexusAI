"use client";

import React, { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserMessage } from "./UserMessage";
import { MemoizedMarkdown } from "../markdown-rendered";

interface MessageBubbleProps {
  message: { role: string; content: string; id: string };
  isStreaming: boolean;
}

export const MessageBubble = React.memo(({ message, isStreaming }: MessageBubbleProps) => {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const copyMessage = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  }, [message.content]);

  return (
    <div
      className={cn(
        "group flex mb-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-500",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn("max-w-[85%] min-w-0", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "relative rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm border transition-all duration-200",
            isUser
              ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white border-blue-400/20 rounded-br-md"
              : "bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border-slate-200/60 dark:border-slate-700/60 rounded-bl-md"
          )}
        >
          <div className="text-sm">
            {isUser ? (
              <UserMessage content={message.content} className="font-medium" />
            ) : (
              <MemoizedMarkdown content={message.content} />
            )}

            {isStreaming && !isUser && (
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Assistant is typing...</span>
              </div>
            )}
          </div>
        </div>

        <div
          className={cn(
            "flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
            isUser ? "justify-end" : "justify-start"
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={copyMessage}
            className="h-8 px-3 bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg rounded-lg backdrop-blur-sm text-xs"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 mr-1 text-green-600" />
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
});

MessageBubble.displayName = "MessageBubble";
