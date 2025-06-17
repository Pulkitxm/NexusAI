"use client";

import { useRef, useEffect } from "react";

import { useChat } from "@/providers/use-chat";
import { useKeys } from "@/providers/use-keys";

import { EmptyState } from "./empty-state";
import { MessageInput } from "./message-input";
import { MessageList } from "./message-list";

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const { hasAnyKeys } = useKeys();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!hasAnyKeys) {
    return <EmptyState type="no-keys" />;
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} isLoading={isLoading} />
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <MessageInput input={input} isLoading={isLoading} onInputChange={handleInputChange} onSubmit={handleSubmit} />
    </div>
  );
}
