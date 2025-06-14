"use client";

import { Prisma } from "@prisma/client";
import { Copy, Check, Volume2, FileText, Image, FileIcon } from "lucide-react";
import Link from "next/link";
import React, { useState, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { cn, formatBytes } from "@/lib/utils";

import { MemoizedMarkdown } from "../markdown/markdown-rendered";

import { UserMessage } from "./UserMessage";

interface MessageBubbleProps {
  message: Prisma.MessageGetPayload<{
    select: {
      id: true;
      role: true;
      content: true;
      createdAt: true;
      attachments: {
        select: {
          id: true;
          url: true;
          name: true;
          size: true;
        };
      };
    };
  }>;
  isStreaming: boolean;
}

const getFileIcon = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || "")) {
    return Image;
  }
  if (["pdf", "doc", "docx", "txt", "md"].includes(extension || "")) {
    return FileText;
  }
  return FileIcon;
};

export const MessageBubble = React.memo(({ message, isStreaming }: MessageBubbleProps) => {
  const isUser = message.role.toLowerCase() === "user";
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
      <div className={cn("flex min-w-0 max-w-[85%] flex-col", isUser ? "items-end" : "items-start")}>
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

        {message.attachments && message.attachments.length > 0 && (
          <div className={cn("mt-2 flex w-full flex-col gap-2", isUser ? "items-end" : "items-start")}>
            {message.attachments.map((attachment) => {
              const FileIconComponent = getFileIcon(attachment.name);
              return (
                <Link
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={attachment.id}
                  className={cn(
                    "flex max-w-xs cursor-pointer items-center gap-3 rounded-lg border border-slate-200/60 bg-white/80 p-3 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-white/90 hover:shadow-md",
                    "dark:border-slate-700/60 dark:bg-slate-800/80 dark:hover:bg-slate-800/90",
                    isUser ? "bg-white/90 dark:bg-slate-700/90" : ""
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      isUser
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                    )}
                  >
                    <FileIconComponent className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                      {attachment.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{formatBytes(attachment.size)}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

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
