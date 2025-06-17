"use client";

import { Bot, User } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";

import { MessageContent } from "./message-content";
import { StreamingIndicator } from "./streaming-indicator";

import type { MessageWithAttachments } from "@/types/chat";

interface ChatMessageProps {
  message: MessageWithAttachments;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
  const isUser = message.role === "USER";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </Avatar>
      )}

      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
        }`}
      >
        <StreamingIndicator content={message.content} isStreaming={isStreaming} isUser={isUser}>
          {(animatedContent) => <MessageContent content={animatedContent} isUser={isUser} isStreaming={isStreaming} />}
        </StreamingIndicator>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
            <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </div>
        </Avatar>
      )}
    </div>
  );
}
