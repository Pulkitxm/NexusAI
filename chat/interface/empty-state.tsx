"use client";

import { Bot } from "lucide-react";

interface EmptyStateProps {
  type: "no-keys" | "no-messages";
}

export function EmptyState({ type }: EmptyStateProps) {
  const getContent = () => {
    switch (type) {
      case "no-keys":
        return {
          title: "No API Keys Configured",
          description: "Please configure your API keys in settings to start chatting."
        };
      case "no-messages":
        return {
          title: "Start a new conversation",
          description: "Type a message below to begin chatting with the AI."
        };
    }
  };

  const content = getContent();

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <Bot className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">{content.title}</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{content.description}</p>
      </div>
    </div>
  );
}
