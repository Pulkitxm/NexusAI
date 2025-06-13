"use client";

import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="mb-4 flex gap-2 duration-500 animate-in fade-in-0 slide-in-from-bottom-2 sm:mb-6 sm:gap-4">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700 shadow-emerald-100 dark:border-slate-600 dark:from-slate-800 dark:to-slate-700 dark:text-emerald-400 dark:shadow-slate-900/20 sm:h-10 sm:w-10 sm:rounded-xl">
        <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>
      <div className="max-w-[90%] rounded-2xl rounded-tl-md border border-slate-200/60 bg-white/80 px-3 py-2 shadow-md shadow-slate-200/50 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/90 dark:shadow-slate-900/30 sm:max-w-[85%] sm:px-5 sm:py-4">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500" style={{ animationDelay: "0ms" }} />
            <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500" style={{ animationDelay: "150ms" }} />
            <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500" style={{ animationDelay: "300ms" }} />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Assistant is thinking...</span>
        </div>
      </div>
    </div>
  );
}
