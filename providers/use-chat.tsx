"use client";

import { useChat as useAIChat } from "@ai-sdk/react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";

import { MESSAGE_LIMIT } from "@/data";
import { getAvailableModels } from "@/data/models";
import { useChatMessages, useCreateChat, useSaveUserMessage, useChats } from "@/hooks/use-chat-cache";
import { getStoredValue, setStoredValue } from "@/lib/utils";
import { useKeys } from "@/providers/use-keys";
import { useModel } from "@/providers/use-model";
import { Provider, Reasoning } from "@/types/provider";

import type { Attachment, MessageWithAttachments } from "@/types/chat";

const STORAGE_KEYS = {
  MESSAGE_COUNT: "chat_message_count",
  SHOW_WARNING: "chat_show_warning",
  INPUT: "input",
  ATTACHMENTS: "attachments",
  LAST_CHAT_ID: "last_chat_id"
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
  clearChat: () => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  attachments: Attachment[];
  setAttachments: Dispatch<SetStateAction<Attachment[]>>;
  messageCount: number;
  chatConfig: ChatConfig;
  setChatConfig: (config: ChatConfig) => void;
  isLoadingMessages: boolean;
  isRedirecting: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [chatId, setChatIdState] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
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
  const { data: chats = [] } = useChats();
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

  // Clear new=true query parameter when user starts typing
  const handleInputChangeWithCleanup = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e);

    // Clear the new=true query parameter when user starts typing
    if (e.target.value.trim() && pathname === "/" && window.location.search.includes("new=true")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("new");
      window.history.replaceState({}, "", url.toString());
    }
  };

  const clearChat = useCallback(() => {
    setChatIdState(null);
    setAIMessages([]);
    setInput("");
    setAttachments([]);
    setChatConfig({
      error: null,
      reasoning: null,
      webSearch: false,
      attachments: [],
      openRouter: false,
      canUseOpenRouter: false
    });
  }, [setAIMessages, setInput, setAttachments, setChatConfig]);

  // Handle chat ID changes and redirect to last chat
  useEffect(() => {
    const isRootPage = pathname === "/";
    const searchParams = new URLSearchParams(window.location.search);
    const forceNewChat = searchParams.get("new") === "true";

    if (isRootPage) {
      // Clear chat ID when on root page (unless redirecting)
      if (chatId) {
        clearChat();
      }

      // Only redirect if user has chats and not forcing new chat
      if (session?.user?.id && chats.length > 0 && !forceNewChat) {
        const lastChatId = getStoredValue(STORAGE_KEYS.LAST_CHAT_ID, null);

        if (lastChatId) {
          // Verify the last chat still exists
          const lastChatExists = chats.some((chat) => chat.id === lastChatId);

          if (lastChatExists) {
            setIsRedirecting(true);
            router.push(`/${lastChatId}`);
            return;
          }
        }

        // If no last chat or it doesn't exist, redirect to the most recent chat
        const mostRecentChat = chats[0]; // chats are sorted by updatedAt desc
        setIsRedirecting(true);
        router.push(`/${mostRecentChat.id}`);
        return;
      }
    }

    setIsRedirecting(false);
  }, [pathname, session?.user?.id, chats, router, chatId, clearChat]);

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

  // Set chat ID and store it as last chat
  const setChatId = useCallback((id: string | null) => {
    setChatIdState(id);
    if (id) {
      setStoredValue(STORAGE_KEYS.LAST_CHAT_ID, id);
    }
  }, []);

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

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
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
    },
    [
      input,
      hasAnyKeys,
      selectedModelConfig,
      chatId,
      createChatMutation,
      keys,
      setChatId,
      router,
      append,
      saveUserMessageMutation,
      handleAISubmit
    ]
  );

  const clearMessages = useCallback(() => {
    setAIMessages([]);
  }, [setAIMessages]);

  const value: ChatContextType = {
    messages,
    input,
    setInput,
    handleInputChange: handleInputChangeWithCleanup,
    handleSubmit,
    isLoading: isLoading || isInitializing || (chatId ? isLoadingMessages : false),
    error: error || messagesError || null,
    chatId,
    setChatId,
    clearMessages,
    clearChat,
    inputRef,
    attachments,
    setAttachments,
    messageCount,
    chatConfig,
    setChatConfig,
    isLoadingMessages: chatId ? isLoadingMessages : false,
    isRedirecting
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
