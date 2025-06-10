"use client"

import { Bot } from "lucide-react"

export function TypingIndicator() {
  return (
    <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full sm:rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-700 border border-emerald-200 dark:border-slate-600 text-emerald-700 dark:text-emerald-400 shadow-emerald-100 dark:shadow-slate-900/20">
        <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <div className="bg-white/80 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl rounded-tl-md px-3 py-2 sm:px-5 sm:py-4 shadow-md shadow-slate-200/50 dark:shadow-slate-900/30 backdrop-blur-sm max-w-[90%] sm:max-w-[85%]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Assistant is thinking...</span>
        </div>
      </div>
    </div>
  )
}
