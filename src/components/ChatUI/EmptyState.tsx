"use client"

import { Bot, Command } from "lucide-react"

interface EmptyStateProps {
  selectedModelDetails?: {
    name?: string
    description?: string
  }
}

export function EmptyState({ selectedModelDetails }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4 px-4">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center shadow-lg">
        <Bot className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <h2 className="text-lg sm:text-xl font-medium mb-2 text-slate-800 dark:text-slate-200">
          {selectedModelDetails?.name || "AI Assistant"}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md">
          {selectedModelDetails?.description || "Ask me anything and I'll do my best to help you."}
        </p>
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-500 mt-6 sm:mt-8 flex items-center gap-1">
        <Command className="h-3 w-3" />
        <span>Press</span>
        <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-xs font-mono">
          /
        </kbd>
        <span>to start typing</span>
      </div>
    </div>
  )
}
