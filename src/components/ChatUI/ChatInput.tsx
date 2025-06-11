"use client";

import { useChat } from "@/providers/chat-provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal, Loader2 } from "lucide-react";
import { useRef, useEffect } from "react";

export function ChatInput() {
  const { input, handleInputChange, handleSubmit, isLoading } = useChat();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSubmit(e);
      }
    }
  };

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm sticky bottom-0">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-4">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={onKeyDown}
            placeholder="Type your message..."
            className="min-h-[60px] max-h-[120px] resize-none border-2 border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 focus-visible:ring-1 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:ring-offset-0 bg-white dark:bg-slate-800"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="h-12 w-12 rounded-xl shrink-0 transition-all duration-200 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <SendHorizontal className="h-5 w-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
