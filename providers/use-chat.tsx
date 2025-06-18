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

interface ChatContextType {
  messages: MessageWithAttachments[];
  input: string;
  setInput: (input: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  isStreaming: boolean;
  chatId: string | null;
  setChatId: (id: string | null) => void;
  clearMessages: () => void;
  clearChat: () => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  attachments: Attachment[];
  setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
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

  const [messages, setMessages] = useState<MessageWithAttachments[]>([]);
  const [input, setInput] = useState("");
  const [chatId, setChatIdState] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
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

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { selectedModel } = useModel();
  const { keys, hasAnyKeys } = useKeys();
  const availableModels = getAvailableModels(keys);
  const selectedModelConfig = availableModels.find((model) => model.id === selectedModel);

  const apiKey = chatConfig.openRouter
    ? keys.openrouter
    : selectedModelConfig
      ? keys[selectedModelConfig.provider]
      : undefined;

  const { data: cachedMessages = [], isLoading: isLoadingMessages, error: messagesError } = useChatMessages(chatId);
  const { data: chats = [] } = useChats();
  const createChatMutation = useCreateChat();
  const saveUserMessageMutation = useSaveUserMessage();

  const appendMessage = useCallback((message: Omit<MessageWithAttachments, "id" | "createdAt">) => {
    const newMessage: MessageWithAttachments = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  const updateLastMessage = useCallback((content: string) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const newMessages = [...prev];
      newMessages[newMessages.length - 1] = {
        ...newMessages[newMessages.length - 1],
        content
      };
      return newMessages;
    });
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, []);

  const clearChat = useCallback(() => {
    setChatIdState(null);
    setMessages([]);
    setInput("");
    setAttachments([]);
    setIsStreaming(false);
    setChatConfig({
      error: null,
      reasoning: null,
      webSearch: false,
      attachments: [],
      openRouter: false,
      canUseOpenRouter: false
    });
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const setChatId = useCallback((id: string | null) => {
    setChatIdState(id);
    if (id) {
      setStoredValue(STORAGE_KEYS.LAST_CHAT_ID, id);
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!input.trim() || !hasAnyKeys || !selectedModelConfig) return;

      if (!apiKey) {
        return toast.error("No API key found");
      }

      const currentInput = input.trim();

      try {
        setIsInitializing(true);

        appendMessage({
          role: "USER",
          content: currentInput,
          attachments: []
        });

        if (!chatId) {
          const chatResult = await createChatMutation.mutateAsync({
            currentInput,
            apiKey,
            openRouter: keys.openrouter ? true : false,
            modelUUId: selectedModelConfig.uuid,
            attachments: []
          });

          if (chatResult) {
            setChatId(chatResult.id);
            router.push(`/${chatResult.id}`);
          }
        } else {
          await saveUserMessageMutation.mutateAsync({
            chatId,
            content: currentInput,
            attachments: []
          });
        }

        setIsStreaming(true);
        setInput("");

        appendMessage({
          role: "ASSISTANT",
          content: "",
          attachments: []
        });

        debugLog("apikey", {
          openrouter: chatConfig.openRouter,
          keys,
          selectedKey: chatConfig.openRouter ? keys.openrouter : keys[selectedModelConfig.provider],
          selectedModelConfig
        });

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messages: [
              ...messages.map((msg) => ({
                role: msg.role === "USER" ? "user" : "assistant",
                content: msg.content
              })),
              {
                role: "user",
                content: currentInput
              }
            ],
            model: selectedModelConfig.uuid,
            provider: selectedModelConfig.provider,
            apiKey,
            chatId: chatId || undefined,
            reasoning: chatConfig.reasoning,
            attachments: attachments.map((att) => att.id),
            webSearch: chatConfig.webSearch,
            openRouter: chatConfig.openRouter
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error?.message || `HTTP error! status: ${response.status}`;
          throw new Error(errorMessage);
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
                if (parsed.type === "text" && parsed.content) {
                  assistantResponse += parsed.content;
                  updateLastMessage(assistantResponse);
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
        toast.error("Failed to send message");

        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsStreaming(false);
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
      saveUserMessageMutation,
      messages,
      appendMessage,
      updateLastMessage,
      session,
      messageCount,
      attachments,
      chatConfig,
      apiKey
    ]
  );

  if (messages.length) console.log({ messages });

  useEffect(() => {
    const isRootPage = pathname === "/";
    const searchParams = new URLSearchParams(window.location.search);
    const forceNewChat = searchParams.get("new") === "true";

    if (isRootPage) {
      if (chatId) {
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
  }, [pathname, session?.user?.id, chats, router, chatId, clearChat]);

  useEffect(() => {
    if (chatId) {
      setIsInitializing(false);
    }
  }, [chatId]);

  useEffect(() => {
    debugLog("chatId", { chatId, cachedMessages });
    if (!chatId) {
      debugLog("clearing messages coz chatId is null");
      setMessages([]);
      return;
    }

    if (cachedMessages.length > 0) {
      const formattedMessages = cachedMessages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: new Date(msg.createdAt || Date.now()),
        attachments: msg.attachments || []
      }));

      setMessages((prevMessages) => {
        if (prevMessages.length !== formattedMessages.length) {
          return formattedMessages;
        }

        const isSame = prevMessages.every(
          (prev, index) => prev.id === formattedMessages[index].id && prev.content === formattedMessages[index].content
        );

        return isSame ? prevMessages : formattedMessages;
      });
    } else if (messages.length > 0) {
      setMessages([]);
    }
  }, [chatId, cachedMessages.length]);

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

  const value: ChatContextType = {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading: isStreaming || isInitializing || (chatId ? isLoadingMessages : false),
    isStreaming,
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
