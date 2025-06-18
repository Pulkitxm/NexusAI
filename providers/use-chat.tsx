"use client";

import { useChat as useAIChat } from "@ai-sdk/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { MESSAGE_LIMIT } from "@/data";
import { getAvailableModels } from "@/data/models";
import { useChatMessages, useCreateChat, useSaveUserMessage } from "@/hooks/use-chat-cache";
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
  error: string | null;
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
  setAttachments: Dispatch<SetStateAction<Attachment[]>>;
  messageCount: number;
  chatConfig: ChatConfig;
  setChatConfig: (config: ChatConfig) => void;
  isLoadingMessages: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session } = useSession();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [messageCount, setMessageCount] = useState(() => getStoredValue(STORAGE_KEYS.MESSAGE_COUNT, 0));

  const [chatConfig, setChatConfig] = useState<ChatConfig>({
    error: null,
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

  // Use cached hooks
  const { data: cachedMessages = [], isLoading: isLoadingMessages, error: messagesError } = useChatMessages(chatId);
  const createChatMutation = useCreateChat();
  const saveUserMessageMutation = useSaveUserMessage();

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

  // Update AI messages when cached messages change
  useEffect(() => {
    if (cachedMessages.length > 0) {
      const aiFormatMessages = cachedMessages.map((msg) => ({
        id: msg.id,
        role: msg.role === "USER" ? ("user" as const) : ("assistant" as const),
        content: msg.content
      }));
      setAIMessages(aiFormatMessages);
    } else if (chatId) {
      setAIMessages([]);
    }
  }, [cachedMessages, chatId, setAIMessages]);

  // Handle messages error
  useEffect(() => {
    if (messagesError) {
      setChatConfig((prev) => ({
        ...prev,
        error: messagesError.message
      }));
      toast.error("Failed to load chat messages");
    }
  }, [messagesError]);

  useEffect(() => {
    if (selectedModel) {
      setChatConfig({
        error: null,
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
        const chatResult = await createChatMutation.mutateAsync({
          currentInput,
          apiKey: keys[selectedModelConfig.provider] || "",
          openRouter: keys.openrouter ? true : false,
          modelUUId: selectedModelConfig.uuid,
          attachments: []
        });

        if (chatResult) {
          setChatId(chatResult.id);
          router.push(`/${chatResult.id}`);

          append({
            role: "user",
            content: currentInput
          });
          return;
        }
      } else {
        await saveUserMessageMutation.mutateAsync({
          chatId,
          content: currentInput,
          attachments: []
        });
      }

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
    error: error || messagesError || null,
    chatId,
    setChatId,
    clearMessages,
    inputRef,
    attachments,
    setAttachments,
    messageCount,
    chatConfig,
    setChatConfig,
    isLoadingMessages
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
