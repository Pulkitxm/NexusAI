"use client";

import type React from "react";

import { useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Globe, GlobeIcon as GlobeOff } from "lucide-react";
import { VisuallyHidden } from "@/components/ui/vissually-hidden";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  selectedModelDetails?: { name?: string };
  messages: Array<{ role: string; content: string; id: string }>;
  copyConversation: () => void;
  webSearchEnabled: boolean;
  onWebSearchToggle: (enabled: boolean) => void;
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  selectedModelDetails,
  messages,
  copyConversation,
  webSearchEnabled,
  onWebSearchToggle,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  // Focus textarea when "/" is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || "") &&
        textareaRef.current
      ) {
        e.preventDefault();
        textareaRef.current.focus();
      }

      if (e.key === "Escape" && document.activeElement === textareaRef.current && input) {
        e.preventDefault();
        // Clear input will be handled by parent component
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [input]);

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;
      handleSubmit(e);
    },
    [input, isLoading, handleSubmit]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onSubmit(e as any);
      }
    },
    [onSubmit]
  );

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm sticky bottom-0">
      <div className="max-w-3xl mx-auto p-2 sm:p-3">
        <form onSubmit={onSubmit} className="flex items-end gap-2" aria-label="Message input form">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={onKeyDown}
              placeholder={`Message ${selectedModelDetails?.name || "AI Assistant"}...${
                webSearchEnabled ? " (Web search enabled)" : ""
              }`}
              className="min-h-[40px] sm:min-h-[48px] max-h-[120px] resize-none border-2 border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 pr-12 transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 focus-visible:ring-1 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:ring-offset-0 bg-white dark:bg-slate-800 text-sm"
              disabled={isLoading}
              aria-label="Message input"
            />

            {/* Web search toggle button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onWebSearchToggle(!webSearchEnabled)}
                    className={cn(
                      "absolute right-2 top-2 h-6 w-6 p-0 transition-all duration-200",
                      webSearchEnabled
                        ? "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30"
                        : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                    )}
                    aria-label={webSearchEnabled ? "Disable web search" : "Enable web search"}
                  >
                    {webSearchEnabled ? <Globe className="h-3 w-3" /> : <GlobeOff className="h-3 w-3" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{webSearchEnabled ? "Disable web search" : "Enable web search"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl shrink-0 transition-all duration-200 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            ) : (
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
            <VisuallyHidden>Send</VisuallyHidden>
          </Button>
        </form>

        {messages.length > 0 && (
          <div className="flex justify-center mt-1 sm:mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyConversation}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors h-6 px-2"
            >
              Copy conversation
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
