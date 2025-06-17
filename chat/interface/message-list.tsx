"use client";

import { Bot } from "lucide-react";

import { ChatMessage } from "./message/chat-message";
import { MessageSkeleton } from "./message-skeleton";

import type { MessageWithAttachments } from "@/types/chat";

interface MessageListProps {
  messages: MessageWithAttachments[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  if (messages.length === 0) {
    if (isLoading) {
      return (
        <div className="space-y-1">
          <MessageSkeleton isUser={false} lines={4} />
          <MessageSkeleton isUser={true} lines={2} />
          <MessageSkeleton isUser={false} lines={3} />
        </div>
      );
    }

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
  }

  return (
    <div className="space-y-1">
      {messages.map((message, index) => {
        // Check if this is the last assistant message and we're currently loading
        const isLastAssistantMessage = message.role === "ASSISTANT" && index === messages.length - 1;
        const isStreaming = isLastAssistantMessage && isLoading;

        return <ChatMessage key={message.id} message={message} isStreaming={isStreaming} />;
      })}

      {/* Show skeleton for the next message when loading */}
      {isLoading && <MessageSkeleton isUser={false} lines={3} />}
    </div>
  );
}
