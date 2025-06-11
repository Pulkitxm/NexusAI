"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { useChat as useChatAI } from "ai/react";
import { useModel } from "./model-provider";
import { useKeys } from "./key-provider";
import { getAvailableModels } from "@/lib/models";
import { useToast } from "@/hooks/use-toast";
import { UIMessage } from "ai";

interface ChatContextType {
  messages: UIMessage[];
  input: string;
  isLoading: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  error: Error | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { selectedModel } = useModel();
  const { keys } = useKeys();
  const { toast } = useToast();
  const [error, setError] = useState<Error | null>(null);

  const availableModels = getAvailableModels(keys);
  const selectedModelDetails = availableModels.find((m) => m.id === selectedModel);
  const apiKey = keys[selectedModelDetails?.requiresKey as keyof typeof keys];

  const onError = useCallback((error: Error) => {
    console.error("Chat error:", error);
    setError(error);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message,
    });
  }, [toast]);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useChatAI({
    api: "/api/chat",
    body: {
      model: selectedModel,
      provider: selectedModelDetails?.provider,
      apiKey: apiKey,
    },
    onError,
  });

  return (
    <ChatContext.Provider
      value={{
        messages,
        input,
        isLoading,
        handleInputChange,
        handleSubmit,
        error,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
} 