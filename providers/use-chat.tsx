"use client";

import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";

import { MESSAGE_LIMIT } from "@/data";
import { getAvailableModels } from "@/data/models";
import { useChatMessages, useCreateChat, useSaveUserMessage, useChats } from "@/hooks/use-chat-cache";
import { debugLog, getStoredValue, setStoredValue } from "@/lib/utils";
import { useKeys } from "@/providers/use-keys";
import { useModel } from "@/providers/use-model";
import { Reasoning } from "@/types/provider";

import type { Attachment, MessageWithAttachments } from "@/types/chat";

const STORAGE_KEYS = {
  MESSAGE_COUNT: "chat_message_count",
  SHOW_WARNING: "chat_show_warning",
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

interface ChatState {
  messages: MessageWithAttachments[];
  input: string;
  isStreaming: boolean;
  isInitializing: boolean;
  error: string | null;
  chatId: string | null;
  attachments: Attachment[];
  chatConfig: ChatConfig;
}

interface ChatContextType extends ChatState {
  setInput: (input: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  setChatId: (id: string | null) => void;
  clearMessages: () => void;
  clearChat: () => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  setAttachments: (attachments: Attachment[] | ((prev: Attachment[]) => Attachment[])) => void;
  messageCount: number;
  setChatConfig: (config: ChatConfig) => void;
  isLoadingMessages: boolean;
  isRedirecting: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const initialChatState: ChatState = {
  messages: [],
  input: "",
  isStreaming: false,
  isInitializing: false,
  error: null,
  chatId: null,
  attachments: [],
  chatConfig: {
    error: null,
    reasoning: null,
    webSearch: false,
    attachments: [],
    openRouter: false,
    canUseOpenRouter: false
  }
};

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const streamingMessageRef = useRef<string | null>(null);
  const messagesRef = useRef<MessageWithAttachments[]>([]);

  const [chatState, setChatState] = useState<ChatState>(initialChatState);
  const [messageCount, setMessageCount] = useState(() => getStoredValue(STORAGE_KEYS.MESSAGE_COUNT, 0));
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { selectedModel } = useModel();
  const { keys, hasAnyKeys } = useKeys();
  const availableModels = getAvailableModels(keys);
  const selectedModelConfig = availableModels.find((model) => model.id === selectedModel);

  const apiKey = chatState.chatConfig.openRouter
    ? keys.openrouter
    : selectedModelConfig
      ? keys[selectedModelConfig.provider]
      : undefined;

  const {
    data: cachedMessages = [],
    isLoading: isLoadingMessages,
    error: messagesError
  } = useChatMessages(chatState.chatId);
  const { data: chats = [] } = useChats();
  const createChatMutation = useCreateChat();
  const saveUserMessageMutation = useSaveUserMessage();

  const hasLoadedCachedMessages = useRef(false);
  const isLoadingCachedMessages = useRef(false);

  messagesRef.current = chatState.messages;

  const appendMessage = useCallback((message: Omit<MessageWithAttachments, "id" | "createdAt">) => {
    const newMessage: MessageWithAttachments = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };

    setChatState((prev) => {
      const isDuplicate = prev.messages.some(
        (msg) =>
          msg.content === newMessage.content &&
          msg.role === newMessage.role &&
          Math.abs(new Date(msg.createdAt).getTime() - newMessage.createdAt.getTime()) < 1000
      );

      if (isDuplicate) {
        return prev;
      }

      return {
        ...prev,
        messages: [...prev.messages, newMessage]
      };
    });
    return newMessage.id;
  }, []);

  const updateMessage = useCallback((messageId: string, content: string) => {
    setChatState((prev) => ({
      ...prev,
      messages: prev.messages.map((msg) => (msg.id === messageId ? { ...msg, content } : msg))
    }));
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatState((prev) => ({
      ...prev,
      input: e.target.value
    }));
  }, []);

  const clearChat = useCallback(() => {
    setChatState(initialChatState);
    hasLoadedCachedMessages.current = false;
    isLoadingCachedMessages.current = false;
    if (streamingMessageRef.current) {
      streamingMessageRef.current = null;
    }
  }, []);

  const clearMessages = useCallback(() => {
    setChatState((prev) => ({
      ...prev,
      messages: []
    }));
    hasLoadedCachedMessages.current = false;
  }, []);

  const setChatId = useCallback((id: string | null) => {
    setChatState((prev) => ({
      ...prev,
      chatId: id
    }));
    if (id) {
      setStoredValue(STORAGE_KEYS.LAST_CHAT_ID, id);
    }
    hasLoadedCachedMessages.current = false;
    isLoadingCachedMessages.current = false;
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!chatState.input.trim() || !hasAnyKeys || !selectedModelConfig) return;

      if (!apiKey) {
        return toast.error("No API key found");
      }

      const currentInput = chatState.input.trim();
      const currentChatId = chatState.chatId;
      const currentMessages = messagesRef.current;

      try {
        setChatState((prev) => ({
          ...prev,
          isInitializing: true,
          error: null,
          input: ""
        }));

        appendMessage({
          role: "USER",
          content: currentInput,
          attachments: []
        });

        let activeChatId = currentChatId;

        if (!currentChatId) {
          const chatResult = await createChatMutation.mutateAsync({
            currentInput,
            apiKey,
            openRouter: keys.openrouter ? true : false,
            modelUUId: selectedModelConfig.uuid,
            attachments: []
          });

          if (chatResult) {
            activeChatId = chatResult.id;
            setChatId(chatResult.id);
            router.push(`/${chatResult.id}`);
          }
        } else {
          await saveUserMessageMutation.mutateAsync({
            chatId: currentChatId,
            content: currentInput,
            attachments: []
          });
        }

        setChatState((prev) => ({
          ...prev,
          isStreaming: true
        }));

        streamingMessageRef.current = appendMessage({
          role: "ASSISTANT",
          content: "",
          attachments: []
        });

        debugLog("Starting stream", { messageId: streamingMessageRef.current });

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messages: [...currentMessages, { role: "user", content: currentInput }].map((msg) => ({
              role: msg.role === "USER" ? "user" : "assistant",
              content: msg.content
            })),
            model: selectedModelConfig.uuid,
            provider: selectedModelConfig.provider,
            apiKey,
            chatId: activeChatId || undefined,
            reasoning: chatState.chatConfig.reasoning,
            attachments: chatState.attachments.map((att) => att.id),
            webSearch: chatState.chatConfig.webSearch,
            openRouter: chatState.chatConfig.openRouter
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        let assistantResponse = "";
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                break;
              }
              try {
                const parsed = JSON.parse(data);
                if (parsed.type === "text" && parsed.content && streamingMessageRef.current) {
                  assistantResponse += parsed.content;
                  updateMessage(streamingMessageRef.current, assistantResponse);
                } else if (parsed.type === "done") {
                  break;
                } else if (parsed.type === "error") {
                  throw new Error(parsed.message || "Streaming error");
                }
              } catch (e) {
                console.error("Error parsing SSE data:", e);
              }
            }
          }
        }

        if (assistantResponse && streamingMessageRef.current) {
          updateMessage(streamingMessageRef.current, assistantResponse);
        }

        if (!session) {
          const newCount = messageCount + 1;
          setMessageCount(newCount);
          setStoredValue(STORAGE_KEYS.MESSAGE_COUNT, newCount);

          if (newCount >= MESSAGE_LIMIT - 2) {
            setStoredValue(STORAGE_KEYS.SHOW_WARNING, true);
          }
        }
      } catch (error) {
        console.error("Error in chat submission:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to send message";

        if (streamingMessageRef.current) {
          setChatState((prev) => ({
            ...prev,
            error: errorMessage,
            messages: prev.messages.filter((msg) => msg.id !== streamingMessageRef.current)
          }));
        } else {
          setChatState((prev) => ({
            ...prev,
            error: errorMessage
          }));
        }

        toast.error(errorMessage);
      } finally {
        setChatState((prev) => ({
          ...prev,
          isStreaming: false,
          isInitializing: false
        }));
        streamingMessageRef.current = null;
      }
    },
    [
      chatState.input,
      chatState.chatId,
      chatState.chatConfig.reasoning,
      chatState.chatConfig.webSearch,
      chatState.chatConfig.openRouter,
      chatState.attachments,
      hasAnyKeys,
      selectedModelConfig,
      apiKey,
      createChatMutation,
      keys.openrouter,
      setChatId,
      router,
      saveUserMessageMutation,
      appendMessage,
      updateMessage,
      session,
      messageCount
    ]
  );

  if (chatState.messages.length > 0) {
    debugLog(
      "messages",
      chatState.messages.map((a) => a.content.slice(0, 10))
    );
  }

  useEffect(() => {
    const isRootPage = pathname === "/";
    const searchParams = new URLSearchParams(window.location.search);
    const forceNewChat = searchParams.get("new") === "true";

    if (isRootPage) {
      if (chatState.chatId) {
        clearChat();
      }

      if (session?.user?.id && chats.length > 0 && !forceNewChat) {
        const lastChatId = getStoredValue(STORAGE_KEYS.LAST_CHAT_ID, null);

        if (lastChatId) {
          const lastChatExists = chats.some((chat) => chat.id === lastChatId);

          if (lastChatExists) {
            setIsRedirecting(true);
            router.push(`/${lastChatId}`);
            return;
          }
        }

        const mostRecentChat = chats[0];
        setIsRedirecting(true);
        router.push(`/${mostRecentChat.id}`);
        return;
      }
    }

    setIsRedirecting(false);
  }, [pathname, session?.user?.id, chats, router, chatState.chatId, clearChat]);

  useEffect(() => {
    if (chatState.chatId) {
      setChatState((prev) => ({
        ...prev,
        isInitializing: false
      }));
    }
  }, [chatState.chatId]);

  useEffect(() => {
    if (!chatState.chatId) {
      const isNewChat = new URLSearchParams(window.location.search).get("new") === "true";
      if (!isNewChat) {
        clearMessages();
      }
      return;
    }

    if (cachedMessages.length > 0 && !hasLoadedCachedMessages.current && !isLoadingCachedMessages.current) {
      isLoadingCachedMessages.current = true;

      const formattedMessages = cachedMessages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: new Date(msg.createdAt || Date.now()),
        attachments: msg.attachments || []
      }));

      setChatState((prev) => ({
        ...prev,
        messages: formattedMessages
      }));

      hasLoadedCachedMessages.current = true;
      isLoadingCachedMessages.current = false;
    }
  }, [chatState.chatId, cachedMessages, clearMessages]);

  useEffect(() => {
    if (messagesError) {
      setChatState((prev) => ({
        ...prev,
        chatConfig: {
          ...prev.chatConfig,
          error: messagesError.message
        }
      }));
      toast.error("Failed to load chat messages");
    }
  }, [messagesError]);

  useEffect(() => {
    if (selectedModel) {
      setChatState((prev) => ({
        ...prev,
        chatConfig: {
          error: null,
          reasoning: null,
          webSearch: false,
          attachments: [],
          openRouter: false,
          canUseOpenRouter: false
        }
      }));
    }
  }, [selectedModel]);

  useEffect(() => {
    if (!selectedModelConfig) return;

    if (keys.openrouter) {
      setChatState((prev) => ({
        ...prev,
        chatConfig: {
          ...prev.chatConfig,
          openRouter: true
        }
      }));
    }
  }, [selectedModelConfig, keys]);

  const value: ChatContextType = {
    ...chatState,
    setInput: (input: string) => setChatState((prev) => ({ ...prev, input })),
    handleInputChange,
    handleSubmit,
    isLoading: chatState.isStreaming || chatState.isInitializing || (chatState.chatId ? isLoadingMessages : false),
    setChatId,
    clearMessages,
    clearChat,
    inputRef: inputRef as React.RefObject<HTMLTextAreaElement>,
    setAttachments: (newAttachments) =>
      setChatState((prev) => ({
        ...prev,
        attachments: Array.isArray(newAttachments) ? newAttachments : newAttachments(prev.attachments)
      })),
    messageCount,
    setChatConfig: (config) => setChatState((prev) => ({ ...prev, chatConfig: config })),
    isLoadingMessages: chatState.chatId ? isLoadingMessages : false,
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
