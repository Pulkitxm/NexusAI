"use client";

import { MessageSquare } from "lucide-react";

export function EmptyState() {
  return (
    <div className="py-8 text-center text-gray-500 dark:text-gray-400">
      <MessageSquare className="mx-auto mb-2 h-8 w-8 opacity-30" />
      <p className="text-sm font-medium">No conversations yet</p>
      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Start a new chat to begin</p>
    </div>
  );
}
