"use client";

import { ChatMessage } from "./message/chat-message";
import { MessageSkeleton } from "./message-skeleton";

import type { MessageWithAttachments } from "@/types/chat";

interface MessageListProps {
  messages: MessageWithAttachments[];
  isLoading: boolean;
  isLoadingMessages: boolean;
  isRedirecting: boolean;
}

export function MessageList({ messages, isLoading, isLoadingMessages, isRedirecting }: MessageListProps) {
  if (isLoadingMessages && messages.length === 0) {
    return (
      <div className="space-y-1">
        <MessageSkeleton />
      </div>
    );
  }

  if (messages.length === 0 && !isRedirecting) return null;

  return (
    <div className="space-y-1">
      {messages.map((message, index) => {
        const isLastAssistantMessage = message.role === "ASSISTANT" && index === messages.length - 1;
        const isStreaming = isLastAssistantMessage && isLoading;

        return <ChatMessage key={message.id} message={message} isStreaming={isStreaming} />;
      })}
    </div>
  );
}
