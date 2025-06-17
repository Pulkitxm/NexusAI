"use client";

import { useChat as useAIChat } from "ai/react";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

import { createChatWithTitle, saveUserMessage, getChatMessages } from "@/actions/chat";
import { getAvailableModels } from "@/data/models";
import { useKeys } from "@/providers/use-keys";
import { useModel } from "@/providers/use-model";

import type { MessageWithAttachments } from "@/types/chat";

interface ChatContextType {
  messages: MessageWithAttachments[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  error: Error | null;
  chatId: string | null;
  setChatId: (id: string | null) => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageWithAttachments[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const router = useRouter();

  const { selectedModel } = useModel();
  const { keys, hasAnyKeys } = useKeys();
  const availableModels = getAvailableModels(keys);
  const selectedModelConfig = availableModels.find((model) => model.id === selectedModel);

  const {
    messages: aiMessages,
    input,
    handleInputChange,
    handleSubmit: handleAISubmit,
    isLoading,
    error,
    setMessages: setAIMessages
  } = useAIChat({
    api: "/api/chat",
    body: {
      chatId,
      model: selectedModelConfig?.uuid,
      provider: selectedModelConfig?.provider,
      apiKey: keys[selectedModelConfig?.provider || "openai"] || "",
      openRouter: keys.openrouter ? true : false,
      reasoning: null,
      webSearch: false,
      attachments: []
    },
    onFinish: async (message) => {
      // Convert AI SDK message to our format
      const newMessage: MessageWithAttachments = {
        id: `temp-${Date.now()}`,
        role: "ASSISTANT",
        content: message.content,
        createdAt: new Date(),
        attachments: []
      };

      setMessages((prev) => [...prev, newMessage]);
    },
    onError: (error) => {
      console.error("Chat error:", error);
    }
  });

  // Load existing messages when chatId changes
  useEffect(() => {
    if (chatId) {
      setIsLoadingMessages(true);
      setMessages([]); // Clear messages when chatId changes
      setAIMessages([]); // Clear AI SDK messages as well

      const loadMessages = async () => {
        try {
          const result = await getChatMessages({ chatId });
          if (result.success && result.messages) {
            // Convert database messages to AI SDK format
            const aiFormatMessages = result.messages.map((msg) => ({
              id: msg.id,
              role: msg.role === "USER" ? ("user" as const) : ("assistant" as const),
              content: msg.content
            }));

            setAIMessages(aiFormatMessages);
          }
        } catch (error) {
          console.error("Error loading chat messages:", error);
        } finally {
          setIsLoadingMessages(false);
        }
      };

      loadMessages();
    } else {
      setMessages([]);
      setAIMessages([]);
    }
  }, [chatId, setAIMessages]);

  // Convert AI SDK messages to our format
  useEffect(() => {
    const convertedMessages: MessageWithAttachments[] = aiMessages.map((msg, index) => ({
      id: msg.id || `msg-${index}`,
      role: msg.role === "user" ? "USER" : "ASSISTANT",
      content: msg.content,
      createdAt: new Date(),
      attachments: []
    }));

    setMessages(convertedMessages);
  }, [aiMessages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim() || !hasAnyKeys || !selectedModelConfig) return;

    const currentInput = input.trim();

    try {
      setIsInitializing(true);

      // If no chatId, create a new chat
      if (!chatId) {
        const chatResult = await createChatWithTitle({
          currentInput,
          apiKey: keys[selectedModelConfig.provider] || "",
          openRouter: keys.openrouter ? true : false,
          modelUUId: selectedModelConfig.uuid,
          attachments: []
        });

        if (chatResult.success && chatResult.chat) {
          setChatId(chatResult.chat.id);
          router.push(`/${chatResult.chat.id}`);
        } else {
          throw new Error(chatResult.error || "Failed to create chat");
        }
      } else {
        // Save user message to database
        await saveUserMessage({
          chatId,
          content: currentInput,
          attachments: []
        });
      }

      // Submit to AI SDK
      handleAISubmit(e);
    } catch (error) {
      console.error("Error in chat submission:", error);
    } finally {
      setIsInitializing(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setAIMessages([]);
  };

  const value: ChatContextType = {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: isLoading || isInitializing || isLoadingMessages,
    error: error || null,
    chatId,
    setChatId,
    clearMessages
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
} 