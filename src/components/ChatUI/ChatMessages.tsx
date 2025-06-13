"use client";

import { useChat } from "@/providers/chat-provider";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

export function ChatMessages() {
  const { isLoading, messages } = useChat();

  return (
    <div className="space-y-4 py-4">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isStreaming={
            isLoading && message.id === messages[messages.length - 1]?.id
          }
        />
      ))}
      {isLoading && <TypingIndicator />}
    </div>
  );
}
