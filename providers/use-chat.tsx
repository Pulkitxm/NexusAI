"use client";

import { useChat as useAIChat } from "@ai-sdk/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useRef, useState } from "react";

import { createChatWithTitle, saveUserMessage, getChatMessages } from "@/actions/chat";
import { MESSAGE_LIMIT } from "@/data";
import { getAvailableModels } from "@/data/models";
import { getStoredValue, setStoredValue } from "@/lib/utils";
import { useKeys } from "@/providers/use-keys";
import { useModel } from "@/providers/use-model";
import { Provider, Reasoning } from "@/types/provider";

import type { Attachment, MessageWithAttachments } from "@/types/chat";

const STORAGE_KEYS = {
  MESSAGE_COUNT: "chat_message_count",
  SHOW_WARNING: "chat_show_warning",
  INPUT: "input",
  ATTACHMENTS: "attachments"
} as const;

interface ChatConfig {
  reasoning: Reasoning | null;
  webSearch: boolean;
  attachments: Attachment[];
  openRouter: boolean;
  canUseOpenRouter: boolean;
}

interface ChatContextType {
  messages: MessageWithAttachments[];
  input: string;
  setInput: (input: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  error: Error | null;
  chatId: string | null;
  setChatId: (id: string | null) => void;
  clearMessages: () => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  attachments: Attachment[];
  setAttachments: (attachments: Attachment[]) => void;
  messageCount: number;
  chatConfig: ChatConfig;
  setChatConfig: (config: ChatConfig) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session } = useSession();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messageCount, setMessageCount] = useState(() => getStoredValue(STORAGE_KEYS.MESSAGE_COUNT, 0));

  const [chatConfig, setChatConfig] = useState<ChatConfig>({
    reasoning: null,
    webSearch: false,
    attachments: [],
    openRouter: false,
    canUseOpenRouter: false
  });

  const { selectedModel } = useModel();
  const { keys, hasAnyKeys } = useKeys();
  const availableModels = getAvailableModels(keys);
  const selectedModelConfig = availableModels.find((model) => model.id === selectedModel);
  const selectedAPIKey =
    !hasAnyKeys || !selectedModelConfig?.provider
      ? undefined
      : selectedModelConfig?.provider === Provider.OpenRouter && selectedModelConfig.provider === Provider.OpenRouter
        ? keys.openrouter
        : keys[selectedModelConfig?.provider] || undefined;

  const aiChatBody = {
    model: selectedModelConfig?.uuid,
    provider: selectedModelConfig?.provider,
    apiKey: chatConfig.openRouter ? keys.openrouter : keys[selectedModelConfig?.provider || Provider.OpenAI],
    openRouter: chatConfig.openRouter,
    reasoning: null,
    webSearch: false,
    attachments: [],
    ...(chatId && { chatId })
  };

  const {
    messages: aiMessages,
    input,
    setInput,
    handleInputChange,
    handleSubmit: handleAISubmit,
    isLoading,
    error,
    setMessages: setAIMessages,
    append
  } = useAIChat({
    api: "/api/chat",
    body: aiChatBody,
    onFinish: async () => {
      if (!session) {
        const newCount = messageCount + 1;
        setMessageCount(newCount);
        setStoredValue(STORAGE_KEYS.MESSAGE_COUNT, newCount);

        if (newCount >= MESSAGE_LIMIT - 2) {
          setStoredValue(STORAGE_KEYS.SHOW_WARNING, true);
        }
      }
    },
    onError: (error) => {
      console.error("Chat error:", error);
    }
  });

  useEffect(() => {
    if (chatId) {
      setIsLoadingMessages(true);

      const loadMessages = async () => {
        try {
          const result = await getChatMessages({ chatId });
          if (result.success && result.messages) {
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
      setAIMessages([]);
    }
  }, [chatId, setAIMessages]);

  useEffect(() => {
    if (selectedModel) {
      setChatConfig({
        reasoning: null,
        webSearch: false,
        attachments: [],
        openRouter: false,
        canUseOpenRouter: false
      });
    }
  }, [selectedModel]);

  useEffect(() => {
    if (!selectedModelConfig) return;

    if (keys.openrouter) {
      setChatConfig((prev) => ({
        ...prev,
        openRouter: true
      }));
    }
  }, [selectedModelConfig, keys]);

  const messages: MessageWithAttachments[] = aiMessages.map((msg) => ({
    id: msg.id,
    role: msg.role === "user" ? "USER" : "ASSISTANT",
    content: msg.content,
    createdAt: new Date(),
    attachments: []
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim() || !hasAnyKeys || !selectedModelConfig) return;

    const currentInput = input.trim();

    try {
      setIsInitializing(true);

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

          append({
            role: "user",
            content: currentInput
          });
          return;
        } else {
          throw new Error(chatResult.error || "Failed to create chat");
        }
      }

      await saveUserMessage({
        chatId,
        content: currentInput,
        attachments: []
      });

      handleAISubmit(e);
    } catch (error) {
      console.error("Error in chat submission:", error);
    } finally {
      setIsInitializing(false);
    }
  };

  const clearMessages = () => {
    setAIMessages([]);
  };

  const value: ChatContextType = {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading: isLoading || isInitializing || isLoadingMessages,
    error: error || null,
    chatId,
    setChatId,
    clearMessages,
    inputRef,
    attachments,
    setAttachments,
    messageCount,
    chatConfig,
    setChatConfig
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
