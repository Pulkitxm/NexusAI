"use client";

import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { EditMessageForm } from "./EditMessageForm";
import type { AIModel } from "@/types/models";

interface ChatMessagesProps {
  messages: Array<{ role: string; content: string; id: string }>;
  isLoading: boolean;
  isTyping: boolean;
  editingMessageId: string | null;
  onEditMessage: (messageId: string, newContent: string) => void;
  onStartEdit: (messageId: string) => void;
  onCancelEdit: () => void;
  onReloadMessage: (messageId: string, modelId?: string) => void;
  availableModels: AIModel[];
  selectedModel: string;
}

export function ChatMessages({
  messages,
  isLoading,
  isTyping,
  editingMessageId,
  onEditMessage,
  onStartEdit,
  onCancelEdit,
  onReloadMessage,
  availableModels,
  selectedModel,
}: ChatMessagesProps) {
  return (
    <div role="log" aria-label="Chat conversation" className="space-y-1">
      {messages.map((message, index) => (
        <div key={message.id}>
          {editingMessageId === message.id ? (
            <EditMessageForm
              message={message}
              onSave={(newContent) => onEditMessage(message.id, newContent)}
              onCancel={onCancelEdit}
            />
          ) : (
            <MessageBubble
              message={message}
              isStreaming={isLoading && index === messages.length - 1}
              onStartEdit={
                message.role === "user"
                  ? () => onStartEdit(message.id)
                  : undefined
              }
              onReload={
                message.role === "assistant"
                  ? (modelId) => onReloadMessage(message.id, modelId)
                  : undefined
              }
              availableModels={availableModels}
              selectedModel={selectedModel}
            />
          )}
        </div>
      ))}
      {isTyping && !isLoading && <TypingIndicator />}
    </div>
  );
}
