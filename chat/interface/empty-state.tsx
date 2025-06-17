"use client";

import { Bot } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
          <Bot className="h-8 w-8 text-white" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-slate-800 dark:text-slate-200">Start a new conversation</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Type a message below to begin chatting with the AI.
        </p>
      </div>
    </div>
  );
}
