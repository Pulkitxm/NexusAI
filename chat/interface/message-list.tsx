"use client";

import { AnimatePresence, motion } from "framer-motion";

import { ChatMessage } from "./message/chat-message";
import { MessageSkeleton } from "./message-skeleton";

import type { MessageWithAttachments } from "@/types/chat";

interface MessageListProps {
  messages: MessageWithAttachments[];
  isStreaming: boolean;
  isLoadingMessages: boolean;
  isRedirecting: boolean;
}

export function MessageList({ messages, isStreaming, isLoadingMessages, isRedirecting }: MessageListProps) {
  if (isLoadingMessages && messages.length === 0) {
    return (
      <div className="space-y-4">
        <MessageSkeleton />
        <MessageSkeleton />
      </div>
    );
  }

  if (isRedirecting) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-bounce rounded-full bg-purple-500 [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-purple-500 [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-purple-500"></div>
        </div>
      </div>
    );
  }

  if (messages.length === 0) return null;

  return (
    <AnimatePresence mode="popLayout">
      <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        {messages.map((message, index) => {
          const isLastAssistantMessage = message.role === "ASSISTANT" && index === messages.length - 1;
          const showStreaming = isLastAssistantMessage && isStreaming;

          return (
            <motion.div
              key={message.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ChatMessage message={message} isStreaming={showStreaming} />
            </motion.div>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}
