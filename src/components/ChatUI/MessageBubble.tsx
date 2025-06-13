"use client";

import { Copy, Check, Volume2 } from "lucide-react";
import React, { useState, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { MemoizedMarkdown } from "../markdown/markdown-rendered";

import { UserMessage } from "./UserMessage";

interface MessageBubbleProps {
  message: { role: string; content: string; id: string };
  isStreaming: boolean;
}

export const MessageBubble = React.memo(({ message, isStreaming }: MessageBubbleProps) => {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const copyMessage = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  }, [message.content]);

  const speakMessage = useCallback(() => {
    if ("speechSynthesis" in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(message.content);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  }, [message.content, isSpeaking]);

  return (
    <div
      className={cn(
        "group mb-6 flex duration-500 animate-in fade-in-0 slide-in-from-bottom-2",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn("min-w-0 max-w-[85%]", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "relative rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-200",
            isUser
              ? "rounded-br-md border-blue-400/20 bg-gradient-to-br from-blue-500 to-purple-600 text-white"
              : "rounded-bl-md border-slate-200/60 bg-white/90 text-slate-800 dark:border-slate-700/60 dark:bg-slate-800/90 dark:text-slate-200"
          )}
        >
          <div className="text-sm">
            {isUser ? (
              <UserMessage content={message.content} className="font-medium" />
            ) : (
              <MemoizedMarkdown content={message.content} />
            )}

            {isStreaming && !isUser && (
              <div className="mt-3 flex items-center gap-2 border-t border-slate-200 pt-2 dark:border-slate-700">
                <div className="flex gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500" />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Assistant is typing...</span>
              </div>
            )}
          </div>
        </div>

        <div
          className={cn(
            "mt-2 flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100",
            isUser ? "justify-end" : "justify-start"
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={speakMessage}
            className="h-8 rounded-lg border border-slate-200 bg-white/90 px-3 text-xs shadow-md backdrop-blur-sm hover:shadow-lg dark:border-slate-700 dark:bg-slate-800/90"
          >
            <Volume2 className={cn("h-3 w-3", isSpeaking && "text-blue-500")} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyMessage}
            className="h-8 rounded-lg border border-slate-200 bg-white/90 px-3 text-xs shadow-md backdrop-blur-sm hover:shadow-lg dark:border-slate-700 dark:bg-slate-800/90"
          >
            {copied ? (
              <>
                <Check className="mr-1 h-3 w-3 text-green-600" />
              </>
            ) : (
              <>
                <Copy className="mr-1 h-3 w-3" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
});

MessageBubble.displayName = "MessageBubble";
