"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { User, Bot, Copy, Check, Edit3, RefreshCw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { MemoizedMarkdown } from "../markdown-rendered";
import type { AIModel } from "@/types/models";

interface MessageBubbleProps {
  message: { role: string; content: string; id: string };
  isStreaming: boolean;
  onStartEdit?: () => void;
  onReload?: (modelId?: string) => void;
  availableModels?: AIModel[];
  selectedModel?: string;
}

export const MessageBubble = React.memo(
  ({ message, isStreaming, onStartEdit, onReload, availableModels, selectedModel }: MessageBubbleProps) => {
    const isUser = message.role === "user";
    const [copied, setCopied] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const bubbleRef = useRef<HTMLDivElement>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);

    // Use Intersection Observer to detect when message is visible
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsVisible(entry.isIntersecting);
        },
        { threshold: 0.1 }
      );

      if (bubbleRef.current) {
        observer.observe(bubbleRef.current);
      }

      return () => {
        if (bubbleRef.current) {
          observer.unobserve(bubbleRef.current);
        }
      };
    }, []);

    const copyMessage = useCallback(async () => {
      try {
        await navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy message:", error);
      }
    }, [message.content]);

    const handleReload = useCallback(
      async (modelId?: string) => {
        if (onReload) {
          setIsRegenerating(true);
          setIsDropdownOpen(false);
          try {
            await onReload(modelId);
          } finally {
            setIsRegenerating(false);
          }
        }
      },
      [onReload]
    );

    return (
      <div
        ref={bubbleRef}
        className={cn(
          "group flex gap-2 sm:gap-4 mb-4 sm:mb-6 animate-in fade-in-0 slide-in-from-bottom-3 duration-500 ease-out",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
        aria-live={isStreaming && !isUser ? "polite" : "off"}
      >
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full sm:rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm",
            isUser
              ? "bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 text-white shadow-blue-200 dark:shadow-blue-900/20"
              : "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-700 border border-emerald-200 dark:border-slate-600 text-emerald-700 dark:text-emerald-400 shadow-emerald-100 dark:shadow-slate-900/20"
          )}
          aria-hidden="true"
        >
          {isUser ? <User className="w-4 h-4 sm:w-5 sm:h-5" /> : <Bot className="w-4 h-4 sm:w-5 sm:h-5" />}
        </div>

        <div className={cn("flex-1 min-w-0 max-w-full", isUser ? "items-end" : "items-start")}>
          <div
            className={cn(
              "relative rounded-2xl px-3 py-2 sm:px-5 sm:py-4 transition-all duration-300 backdrop-blur-sm",
              isUser
                ? "bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 text-white shadow-md shadow-blue-200/50 dark:shadow-blue-900/30 rounded-tr-md ml-auto max-w-[85%] sm:max-w-[80%]"
                : "bg-white/80 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 shadow-md shadow-slate-200/50 dark:shadow-slate-900/30 rounded-tl-md max-w-[90%] sm:max-w-[85%]"
            )}
            role="article"
            aria-label={`${isUser ? "Your message" : "Assistant message"}`}
          >
            <div
              className={cn(
                "flex items-center justify-between mb-1 sm:mb-2 opacity-70",
                isUser ? "text-blue-100" : "text-slate-500 dark:text-slate-400"
              )}
            >
              <span className="text-xs font-medium">{isUser ? "You" : "Assistant"}</span>
              <span className="text-xs">
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div className="text-sm leading-relaxed">
              {isUser ? (
                <div className="whitespace-pre-wrap font-medium break-words">{message.content}</div>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-slate-800 dark:prose-headings:text-slate-200 prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-code:text-emerald-700 dark:prose-code:text-emerald-400 prose-pre:bg-slate-50 dark:prose-pre:bg-slate-900 break-words">
                  <MemoizedMarkdown content={message.content} id={message.id} />
                </div>
              )}
              {(isStreaming || isRegenerating) && !isUser && (
                <div className="flex items-center gap-1 mt-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                    {isRegenerating ? "Regenerating..." : "Assistant is typing..."}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons that appear when message is visible */}
          <div
            className={cn(
              "flex items-center gap-1 mt-1 transition-all duration-200",
              isUser ? "justify-end" : "justify-start",
              isVisible ? "opacity-100" : "opacity-0"
            )}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={copyMessage}
              className="h-7 px-2 sm:h-8 sm:px-3 bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md rounded-lg backdrop-blur-sm text-xs"
              aria-label="Copy message"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  <span className="text-xs text-green-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  <span className="hidden xs:inline text-xs">Copy</span>
                </>
              )}
            </Button>

            {isUser && onStartEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onStartEdit}
                className="h-7 px-2 sm:h-8 sm:px-3 bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md rounded-lg backdrop-blur-sm text-xs"
                aria-label="Edit message"
              >
                <Edit3 className="h-3 w-3 mr-1" />
                <span className="hidden xs:inline text-xs">Edit</span>
              </Button>
            )}

            {!isUser && onReload && availableModels && (
              <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isRegenerating}
                    className="h-7 px-2 sm:h-8 sm:px-3 bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md rounded-lg backdrop-blur-sm text-xs"
                    aria-label="Regenerate response"
                  >
                    <RefreshCw className={cn("h-3 w-3 mr-1", isRegenerating && "animate-spin")} />
                    <span className="hidden xs:inline text-xs">
                      {isRegenerating ? "Regenerating..." : "Regenerate"}
                    </span>
                    <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Regenerate with model</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleReload()} className="flex items-center justify-between">
                    <span>Current model</span>
                    <span className="text-xs text-muted-foreground">
                      {availableModels?.find((m) => m.id === selectedModel)?.name || selectedModel}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {availableModels?.map((model) => (
                    <DropdownMenuItem
                      key={model.id}
                      onClick={() => handleReload(model.id)}
                      disabled={model.id === selectedModel}
                      className="flex items-center gap-2"
                    >
                      <model.icon className="h-3 w-3" />
                      <span>{model.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    );
  }
);

MessageBubble.displayName = "MessageBubble";
