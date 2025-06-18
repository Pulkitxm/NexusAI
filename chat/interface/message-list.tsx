"use client";

import { Bot } from "lucide-react";

import { ChatMessage } from "./message/chat-message";
import { MessageSkeleton } from "./message-skeleton";

import type { MessageWithAttachments } from "@/types/chat";

interface MessageListProps {
  messages: MessageWithAttachments[];
  isLoading: boolean;
  isLoadingMessages: boolean;
}

export function MessageList({ messages, isLoading, isLoadingMessages }: MessageListProps) {
  if (isLoading || isLoadingMessages) {
    return (
      <div className="space-y-1">
        <MessageSkeleton />
      </div>
    );
  }

  if (messages.length === 0)
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Bot className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">Start a new conversation</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Type a message below to begin chatting with the AI.
          </p>
        </div>
      </div>
    );

  return (
    <div className="space-y-1">
      {messages.map((message, index) => {
        const isLastAssistantMessage = message.role === "ASSISTANT" && index === messages.length - 1;
        const isStreaming = isLastAssistantMessage && isLoading;

        return <ChatMessage key={message.id} message={message} isStreaming={isStreaming} />;
      })}

      {(isLoading || isLoadingMessages) && <MessageSkeleton />}
    </div>
  );
}
