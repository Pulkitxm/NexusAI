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
import { toast } from "sonner";

import { createChatWithTitle, saveUserMessage } from "@/actions/chat";
import { MESSAGE_LIMIT } from "@/data";
import { getAvailableModels } from "@/data/models";
import { useKeys } from "@/providers/use-keys";
import { useSettingsModal } from "@/providers/use-settings";
import { Provider, type Reasoning } from "@/types/provider";

import { useModel } from "./use-model";
import { useSidebar } from "./use-sidebar";

import type { Attachment } from "@/types/chat";

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
  inputRef: RefObject<HTMLTextAreaElement | null>;
  messageCount: number;
  setMessageCount: Dispatch<SetStateAction<number>>;
  showWarning: boolean;
  setShowWarning: Dispatch<SetStateAction<boolean>>;
  chatId: string | null;
  setChatId: (id: string | null) => void;
  setMessages: (messages: MessageWithAttachments[]) => void;
  clearChat: () => void;
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

const ChatContext = createContext<ChatContextType | undefined>(undefined);

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
  const { openModal } = useSettingsModal();
  const { addChat } = useSidebar();
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();

  const [chatId, setChatId] = useState<string | null>(initialChatId || (params?.id as string) || null);
  const [input, setInputState] = useState("");
  const [messageCount, setMessageCount] = useState(0);
  const [showWarning, setShowWarning] = useState(true);
  const [loadingChatId, setLoadingChatId] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [webSearch, setWebSearch] = useState<boolean | null>(null);
  const [reasoning, setReasoning] = useState<Reasoning | null>(null);
  const [useOpenRouter, setUseOpenRouter] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const inputRef = useRef<HTMLTextAreaElement>(null);

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
      toast.error(error.message || "An error occurred while sending your message");
    },
    [input]
  );

  const {
    messages,
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
        if (newCount >= MESSAGE_LIMIT - 2) {
          setShowWarning(true);
        }
      }
    }
  });

  const setInput = useCallback(
    (value: string | ((prev: string) => string)) => {
      if (typeof value === "function") {
        setInputState((prev) => {
          const newInput = value(prev);
          setAIInput(newInput);
          return newInput;
        });
      } else {
        setInputState(value);
        setAIInput(value);
      }
    },
    [setAIInput]
  );

  const retryLastMessage = useCallback(() => {
    if (lastFailedMessage) {
      setInput(lastFailedMessage);
      setLastFailedMessage(null);
    }
  }, [lastFailedMessage, setInput]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setMessageCount(0);
    setLastFailedMessage(null);
    setChatId(null);
    setAttachments([]);
    router.push("/");
  }, [router, setMessages]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (isLoading) return;

      if (!hasAnyKeys || !apiKey) {
        toast.error(
          <>
            Please{" "}
            <span className="cursor-pointer font-bold underline" onClick={openModal}>
              add an API key
            </span>{" "}
            to continue chatting.
          </>
        );
        return;
      }

      if (!session && messageCount >= MESSAGE_LIMIT) {
        toast.error(
          "Please sign in to continue chatting. You've reached the limit of 10 messages for non-logged-in users."
        );
        return;
      }

      const currentInput = input.trim();
      if (!currentInput) return;

      setLastFailedMessage(null);

      let currentChatId = chatId;
      let shouldUpdateUrl = false;

      try {
        if (!currentChatId) {
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
        }

        if (currentChatId && messages.length > 0) {
          const result = await saveUserMessage(currentChatId, currentInput);
          if (!result.success) {
            console.error("Failed to save user message:", result.error);
          }
        }

        if (shouldUpdateUrl && currentChatId) {
          window.history.pushState({}, "", `/${currentChatId}`);
        }

        setAttachments([]);

        originalHandleSubmit(e, {
          body: {
            chatId: currentChatId
          }
        });
      } catch (error) {
        console.error("Error in handleSubmit:", error);
        setLastFailedMessage(currentInput);
        toast.error(error instanceof Error ? error.message : "Failed to process your message. Please try again.");
      } finally {
        setLoadingChatId(null);
      }
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

  const contextValue: ChatContextType = {
    messages: messages as MessageWithAttachments[],
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
    chatId,
    setChatId,
    setMessages,
    clearChat,
    loadingChatId,
    setLoadingChatId,
    webSearch,
    setWebSearch,
    reasoning,
    setReasoning,
    attachments,
    setAttachments,
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
