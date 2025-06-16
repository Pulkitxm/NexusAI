"use client";

import { useChat as useChatAI } from "@ai-sdk/react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type SetStateAction,
  type Dispatch,
  type FormEventHandler,
  type RefObject,
  type ReactNode,
  type FormEvent
} from "react";

import { createChatWithTitle, saveUserMessage } from "@/actions/chat";
import { useToast } from "@/hooks/use-toast";
import { MESSAGE_LIMIT } from "@/lib/data";
import { debugLog } from "@/lib/debug";
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

  error: Error | undefined;
  micError: string | null;
  setMicError: Dispatch<SetStateAction<string | null>>;
  connectionError: string | null;
  setConnectionError: Dispatch<SetStateAction<string | null>>;

  inputRef: RefObject<HTMLTextAreaElement | null>;
  messageCount: number;
  setMessageCount: Dispatch<SetStateAction<number>>;
  showWarning: boolean;
  setShowWarning: Dispatch<SetStateAction<boolean>>;

  chatId: string | null;
  setChatId: (id: string | null) => void;
  setMessages: (messages: MessageWithAttachments[]) => void;
  clearChat: () => void;
  resetChat: () => void;
  loadingChatId: string | null;
  setLoadingChatId: Dispatch<SetStateAction<string | null>>;

  webSearch: boolean | null;
  setWebSearch: (enabled: boolean | null) => void;
  reasoning: Reasoning | null;
  setReasoning: (level: Reasoning | null) => void;
  attachments: Attachment[];
  setAttachments: Dispatch<SetStateAction<Attachment[]>>;

  retryLastMessage: () => void;

  useOpenRouter: boolean;
  setUseOpenRouter: Dispatch<SetStateAction<boolean>>;
}

const STORAGE_KEYS = {
  MESSAGE_COUNT: "chat_message_count",
  SHOW_WARNING: "chat_show_warning",
  INPUT: "input",
  ATTACHMENTS: "attachments"
} as const;

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const getInitialAttachments = (): Attachment[] => {
  const localAttachments = getStoredValue<Attachment[]>(STORAGE_KEYS.ATTACHMENTS, []);
  const isValid = validateAttachment.safeParse(localAttachments);
  return isValid.success ? localAttachments : [];
};

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
  const { addChat } = useSidebar();
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();

  const [chatId, setChatId] = useState<string | null>(initialChatId || (params?.id as string) || null);
  const [input, setInputState] = useState(() => getStoredValue(STORAGE_KEYS.INPUT, ""));

  const [messageCount, setMessageCount] = useState(() => getStoredValue(STORAGE_KEYS.MESSAGE_COUNT, 0));
  const [showWarning, setShowWarning] = useState(() => getStoredValue(STORAGE_KEYS.SHOW_WARNING, true));
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [loadingChatId, setLoadingChatId] = useState<string | null>(null);

  const [micError, setMicError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);

  const [webSearch, setWebSearch] = useState<boolean | null>(null);
  const [reasoning, setReasoning] = useState<Reasoning | null>(null);
  const [useOpenRouter, setUseOpenRouter] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>(getInitialAttachments());

  const availableModels = getAvailableModels(keys);
  const selectedModelDetails = availableModels.find((m) => m.id === selectedModel);
  const apiKey =
    useOpenRouter && keys.openrouter
      ? keys.openrouter
      : keys[selectedModelDetails?.provider.toString() as keyof typeof keys];

  const onError = useCallback(
    (error: Error) => {
      console.error("Chat error:", error);
      setLastFailedMessage(input);

      if (error instanceof TypeError && error.message.includes("fetch")) {
        setConnectionError("Network error. Please check your connection and try again.");
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred while sending your message"
      });
    },
    [input, toast]
  );

  const {
    messages,
    input: aiInput,
    handleSubmit: originalHandleSubmit,
    isLoading,
    setMessages,
    setInput: setAIInput,
    error
  } = useChatAI({
    api: "/api/chat",
    body: {
      model: selectedModelDetails?.uuid,
      provider: selectedModelDetails?.provider,
      apiKey,
      chatId,
      userId: session?.user?.id,
      webSearch,
      reasoning,
      attachments: attachments.map((attachment) => attachment.id),
      openRouter: selectedModelDetails?.provider === Provider.OpenRouter ? true : useOpenRouter
    },
    initialMessages: initialMessages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content
    })),
    onError,
    onFinish: () => {
      if (!session) {
        const newCount = messageCount + 1;
        setMessageCount(newCount);
        setStoredValue(STORAGE_KEYS.MESSAGE_COUNT, newCount);

        if (newCount >= MESSAGE_LIMIT - 2) {
          setShowWarning(true);
          setStoredValue(STORAGE_KEYS.SHOW_WARNING, true);
        }
      }
    }
  });

  const setInput = useCallback(
    (value: string | ((prev: string) => string)) => {
      if (typeof value === "function") {
        setInputState((prev) => {
          const newInput = value(prev);
          setStoredValue(STORAGE_KEYS.INPUT, newInput);
          setAIInput(newInput);
          return newInput;
        });
      } else {
        setInputState(value);
        setStoredValue(STORAGE_KEYS.INPUT, value);
        setAIInput(value);
      }
    },
    [setAIInput]
  );

  useEffect(() => {
    if (aiInput !== input) {
      setInputState(aiInput);
      setStoredValue(STORAGE_KEYS.INPUT, aiInput);
    }
  }, [aiInput, input]);

  const setAttachmentsWithStorage = useCallback((value: SetStateAction<Attachment[]>) => {
    setAttachments((prev) => {
      const newAttachments = typeof value === "function" ? value(prev) : value;
      setStoredValue(STORAGE_KEYS.ATTACHMENTS, newAttachments);
      return newAttachments;
    });
  }, []);

  const retryLastMessage = useCallback(() => {
    if (lastFailedMessage) {
      setInput(lastFailedMessage);
      setLastFailedMessage(null);
      setConnectionError(null);
    }
  }, [lastFailedMessage, setInput]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setMessageCount(0);
    setMicError(null);
    setConnectionError(null);
    setLastFailedMessage(null);
    setChatId(null);
    setAttachmentsWithStorage([]);

    removeStoredValue(STORAGE_KEYS.MESSAGE_COUNT);
    removeStoredValue(STORAGE_KEYS.SHOW_WARNING);
    removeStoredValue(STORAGE_KEYS.ATTACHMENTS);
    removeStoredValue(STORAGE_KEYS.INPUT);

    router.push("/");
  }, [router, setMessages, setAttachmentsWithStorage]);

  const resetChat = useCallback(() => {
    setMessages([]);
    setMessageCount(0);
    setMicError(null);
    setConnectionError(null);
    setLastFailedMessage(null);
    setChatId(null);
    setAttachmentsWithStorage([]);
  }, [setMessages, setAttachmentsWithStorage]);

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

      debugLog("Submitting message", { input: currentInput, chatId });

      setConnectionError(null);
      setLastFailedMessage(null);

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
            attachments: attachments.map((a) => ({ id: a.id }))
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

      if (currentChatId && messages.length > 0) {
        try {
          debugLog("Saving user message", {
            chatId: currentChatId,
            content: currentInput
          });
          const result = await saveUserMessage(currentChatId, currentInput);
          if (!result.success) {
            console.error("Failed to save user message:", result.error);
          } else {
            debugLog("User message saved", { messageId: result.message?.id });
          }
        } catch (error) {
          console.error("Error saving user message:", error);
        }
      }

      if (shouldUpdateUrl && currentChatId) {
        window.history.pushState({}, "", `/${currentChatId}`);
      }

      setAttachmentsWithStorage([]);
      removeStoredValue(STORAGE_KEYS.ATTACHMENTS);
      debugLog("Submitting to AI");

      originalHandleSubmit(e, {
        body: {
          chatId: currentChatId
        }
      });
    },
    [
      addChat,
      apiKey,
      attachments,
      chatId,
      hasAnyKeys,
      input,
      isLoading,
      messageCount,
      messages.length,
      openModal,
      originalHandleSubmit,
      selectedModelDetails?.provider,
      selectedModelDetails?.uuid,
      session,
      setAttachmentsWithStorage,
      toast,
      useOpenRouter
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
    messages: messages as MessageWithAttachments[],
    input,
    setInput,
    isLoading,
    handleSubmit,

    error,
    micError,
    setMicError,
    connectionError,
    setConnectionError,

    inputRef,
    messageCount,
    setMessageCount,
    showWarning,
    setShowWarning,

    chatId,
    setChatId,
    setMessages,
    clearChat,
    resetChat,
    loadingChatId,
    setLoadingChatId,

    webSearch,
    setWebSearch,
    reasoning,
    setReasoning,
    attachments: status === "authenticated" ? attachments : [],
    setAttachments: setAttachmentsWithStorage,

    retryLastMessage,

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
