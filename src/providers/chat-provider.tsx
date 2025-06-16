"use client";

import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type SetStateAction,
  type Dispatch,
  type FormEventHandler,
  type RefObject,
  type ReactNode,
  type FormEvent,
  useEffect
} from "react";

import { createChatWithTitle, saveUserMessage } from "@/actions/chat";
import { useToast } from "@/hooks/use-toast";
import { MESSAGE_LIMIT } from "@/lib/data";
import { getAvailableModels } from "@/lib/models";
import { getStoredValue, removeStoredValue, setStoredValue } from "@/lib/utils";
import { type Attachment, validateAttachment } from "@/types/chat";
import { Provider, Reasoning } from "@/types/providers";

import { useKeys } from "./key-provider";
import { useModel } from "./model-provider";
import { useSettingsModal } from "./settings-modal-provider";
import { useSidebar } from "./sidebar-provider";

export interface MessageWithAttachments {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: Date;
  attachments?: Attachment[];
}

interface ChatContextType {
  messages: MessageWithAttachments[];
  input: string;
  setInput: (input: string | ((prev: string) => string)) => void;
  isLoading: boolean;
  handleSubmit: FormEventHandler;
  error: Error | null;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  messageCount: number;
  setMessageCount: Dispatch<SetStateAction<number>>;
  showWarning: boolean;
  setShowWarning: Dispatch<SetStateAction<boolean>>;
  clearChat: () => void;
  chatId: string | null;
  setChatId: (id: string | null) => void;
  setMessages: (messages: MessageWithAttachments[]) => void;
  resetChat: () => void;
  micError: string | null;
  setMicError: Dispatch<SetStateAction<string | null>>;
  webSearch: boolean | null;
  setWebSearch: (enabled: boolean | null) => void;
  reasoning: Reasoning | null;
  setReasoning: (level: Reasoning | null) => void;
  attachments: Attachment[];
  setAttachments: Dispatch<SetStateAction<Attachment[]>>;
  retryLastMessage: () => void;
  connectionError: string | null;
  setConnectionError: Dispatch<SetStateAction<string | null>>;
  loadingChatId: string | null;
  setLoadingChatId: Dispatch<SetStateAction<string | null>>;
  useOpenRouter: boolean;
  setUseOpenRouter: Dispatch<SetStateAction<boolean>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const STORAGE_KEYS = {
  MESSAGE_COUNT: "chat_message_count",
  SHOW_WARNING: "chat_show_warning"
} as const;

const localAttachments = getStoredValue<Attachment[]>("attachments", []);
const isValid = validateAttachment.safeParse(localAttachments);

export function ChatProvider({
  children,
  initialMessages = [],
  initialChatId = null
}: {
  children: ReactNode;
  initialMessages?: MessageWithAttachments[];
  initialChatId?: string | null;
}) {
  const { selectedModel } = useModel();
  const { keys, hasAnyKeys, haveOnlyOpenRouterKey } = useKeys();
  const { toast } = useToast();
  const { openModal } = useSettingsModal();
  const [error, setError] = useState<Error | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [webSearch, setWebSearch] = useState<boolean | null>(null);
  const [useOpenRouter, setUseOpenRouter] = useState(false);
  const [reasoning, setReasoning] = useState<Reasoning | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInputState] = useState(() => getStoredValue("input", ""));
  const [messages, setMessages] = useState<MessageWithAttachments[]>(initialMessages);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [chatId, setChatId] = useState<string | null>(initialChatId || (params?.id as string) || null);
  const [attachments, setAttachments] = useState<Attachment[]>(isValid.success ? localAttachments : []);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);

  const [messageCount, setMessageCount] = useState(() => getStoredValue(STORAGE_KEYS.MESSAGE_COUNT, 0));
  const [showWarning, setShowWarning] = useState(() => getStoredValue(STORAGE_KEYS.SHOW_WARNING, true));

  const prevMessageLengthRef = useRef(0);

  const availableModels = getAvailableModels(keys);
  const selectedModelDetails = availableModels.find((m) => m.id === selectedModel);
  const apiKey =
    useOpenRouter && keys.openrouter
      ? keys.openrouter
        ? keys.openrouter
        : undefined
      : keys[selectedModelDetails?.provider.toString() as keyof typeof keys];

  const { addChat } = useSidebar();
  const [loadingChatId, setLoadingChatId] = useState<string | null>(null);

  const setInput = useCallback((value: string | ((prev: string) => string)) => {
    if (typeof value === "function") {
      setInputState((prev) => {
        const newInput = value(prev);
        setStoredValue("input", newInput);
        return newInput;
      });
    } else {
      setInputState(value);
      setStoredValue("input", value);
    }
  }, []);

  const setAttachmentsWithStorage = useCallback((value: SetStateAction<Attachment[]>) => {
    setAttachments((prev) => {
      const newAttachments = typeof value === "function" ? value(prev) : value;
      setStoredValue("attachments", newAttachments);
      return newAttachments;
    });
  }, []);

  const retryLastMessage = useCallback(() => {
    if (lastFailedMessage) {
      setInput(lastFailedMessage);
      setLastFailedMessage(null);
      setError(null);
      setConnectionError(null);
    }
  }, [lastFailedMessage, setInput]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (isLoading) return;

      if (!hasAnyKeys || !apiKey) {
        toast({
          variant: "destructive",
          title: "No API Keys",
          description: (
            <>
              Please{" "}
              <span className="cursor-pointer font-bold underline" onClick={openModal}>
                add an API key
              </span>{" "}
              to continue chatting.
            </>
          )
        });
        return;
      }

      if (!session && messageCount >= MESSAGE_LIMIT) {
        toast({
          variant: "destructive",
          title: "Message Limit Reached",
          description:
            "Please sign in to continue chatting. You've reached the limit of 10 messages for non-logged-in users."
        });
        return;
      }

      const currentInput = input.trim();
      if (!currentInput) return;

      if (!navigator.onLine) {
        setConnectionError("You're offline. Please check your internet connection.");
        setLastFailedMessage(currentInput);
        return;
      }

      setIsLoading(true);
      setError(null);
      setConnectionError(null);
      setLastFailedMessage(null);

      const userMessage: MessageWithAttachments = {
        id: Date.now().toString(),
        role: "user",
        content: currentInput,
        createdAt: new Date(),
        attachments: [...attachments]
      };

      setMessages((prev) => [...prev, userMessage]);

      const currentAttachments = [...attachments];
      setAttachmentsWithStorage([]);
      setInput("");
      removeStoredValue("input");
      removeStoredValue("attachments");

      let currentChatId = chatId;
      let shouldUpdateUrl = false;

      if (!currentChatId) {
        try {
          setLoadingChatId("creating");
          const result = await createChatWithTitle({
            currentInput,
            apiKey,
            modelUUId: selectedModelDetails?.uuid || "",
            openRouter: selectedModelDetails?.provider === Provider.OpenRouter ? true : useOpenRouter,
            attachments: currentAttachments.map((a) => ({ id: a.id }))
          });
          if (result.success && result.chat) {
            currentChatId = result.chat.id;
            setChatId(currentChatId);
            shouldUpdateUrl = true;
            addChat(result.chat);
          } else {
            throw new Error("Failed to create chat");
          }
        } catch (error) {
          console.error("Error creating chat:", error);
          setIsLoading(false);
          setLoadingChatId(null);

          setMessages((prev) => prev.slice(0, -1));
          setInput(currentInput);
          setAttachmentsWithStorage(currentAttachments);
          setLastFailedMessage(currentInput);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to create chat. Please try again."
          });
          return;
        } finally {
          setLoadingChatId(null);
        }
      }

      if (currentChatId && messages.length > 1) {
        try {
          await saveUserMessage(
            currentChatId,
            currentInput,
            currentAttachments.map((a) => ({ id: a.id }))
          );
        } catch (error) {
          console.error("Error saving user message:", error);
        }
      }

      if (shouldUpdateUrl && currentChatId) {
        window.history.pushState({}, "", `/${currentChatId}`);
      }

      const assistantMessageId = (Date.now() + 1).toString();
      let assistantMessage = "";

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((msg) => ({
              role: msg.role,
              content: msg.content
            })),
            model: selectedModelDetails?.uuid,
            provider: selectedModelDetails?.provider,
            apiKey,
            chatId: currentChatId,
            userId: session?.user?.id,
            webSearch,
            reasoning,
            attachments: currentAttachments.map((attachment) => attachment.id),
            openRouter: selectedModelDetails?.provider === Provider.OpenRouter ? true : useOpenRouter
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
        }

        if (messages.filter((m) => m.role === "user").length === 0) {
          setMessages((prev) => [...prev, userMessage]);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();

        setMessages((prev) => [
          ...prev,
          {
            id: assistantMessageId,
            role: "assistant",
            content: "",
            createdAt: new Date()
          }
        ]);

        if (currentChatId) {
          setLoadingChatId(currentChatId);
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === "text") {
                  assistantMessage += data.data;

                  setMessages((prev) =>
                    prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, content: assistantMessage } : msg))
                  );
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
            setShowWarning(true);
            setStoredValue(STORAGE_KEYS.SHOW_WARNING, true);
          }
        }
      } catch (error) {
        console.error("Chat error:", error);
        setError(error as Error);
        setLastFailedMessage(currentInput);

        setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));

        if (error instanceof TypeError && error.message.includes("fetch")) {
          setConnectionError("Network error. Please check your connection and try again.");
        }

        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "An error occurred while sending your message"
        });
      } finally {
        setIsLoading(false);
        setLoadingChatId(null);
      }
    },
    [
      apiKey,
      attachments,
      chatId,
      hasAnyKeys,
      input,
      isLoading,
      messageCount,
      messages,
      openModal,
      reasoning,
      addChat,
      selectedModelDetails?.provider,
      selectedModelDetails?.uuid,
      session,
      setAttachmentsWithStorage,
      setInput,
      toast,
      useOpenRouter,
      webSearch
    ]
  );

  useEffect(() => {
    if (haveOnlyOpenRouterKey) {
      setUseOpenRouter(true);
    }
  }, [haveOnlyOpenRouterKey]);

  useEffect(() => {
    if (selectedModelDetails && !useOpenRouter && keys) {
      const provider = selectedModelDetails.provider;
      const hasKey = keys[provider as keyof typeof keys];
      if (!hasKey) {
        setUseOpenRouter(true);
      }
    }
  }, [keys, selectedModelDetails, useOpenRouter]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setMessageCount(0);
    setError(null);
    setMicError(null);
    setConnectionError(null);
    setLastFailedMessage(null);
    prevMessageLengthRef.current = 0;
    setChatId(null);
    setAttachmentsWithStorage([]);

    removeStoredValue(STORAGE_KEYS.MESSAGE_COUNT);
    removeStoredValue(STORAGE_KEYS.SHOW_WARNING);
    removeStoredValue("attachments");
    removeStoredValue("input");

    router.push("/");
  }, [router, setAttachmentsWithStorage]);

  const resetChat = useCallback(() => {
    setMessages([]);
    setMessageCount(0);
    setError(null);
    setMicError(null);
    setConnectionError(null);
    setLastFailedMessage(null);
    prevMessageLengthRef.current = 0;
    setChatId(null);
    setAttachmentsWithStorage([]);
  }, [setAttachmentsWithStorage]);

  useEffect(() => {
    const handleRouteChange = () => {
      resetChat();
    };

    window.addEventListener("popstate", handleRouteChange);

    window.addEventListener("hashchange", handleRouteChange);

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args: Parameters<typeof originalPushState>) {
      originalPushState.apply(this, args);
      handleRouteChange();
    };

    window.history.replaceState = function (...args: Parameters<typeof originalReplaceState>) {
      originalReplaceState.apply(this, args);
      handleRouteChange();
    };

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
      window.removeEventListener("hashchange", handleRouteChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [resetChat]);

  const contextValue: ChatContextType = {
    messages,
    input,
    setInput,
    isLoading,
    handleSubmit,
    error,
    inputRef,
    messageCount,
    setMessageCount,
    showWarning,
    setShowWarning,
    clearChat,
    chatId,
    setChatId,
    setMessages,
    resetChat,
    micError,
    setMicError,
    webSearch,
    setWebSearch,
    reasoning,
    setReasoning,
    attachments: status === "authenticated" ? attachments : [],
    setAttachments: setAttachmentsWithStorage,
    retryLastMessage,
    connectionError,
    setConnectionError,
    loadingChatId,
    setLoadingChatId,
    useOpenRouter,
    setUseOpenRouter
  };

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
