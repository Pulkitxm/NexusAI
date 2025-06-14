"use client";

import { useChat as useChatAI } from "ai/react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  SetStateAction,
  Dispatch,
  FormEventHandler,
  RefObject,
  ReactNode,
  FormEvent,
  ProviderProps
} from "react";

import { createChat, saveUserMessage } from "@/actions/chat";
import { useToast } from "@/hooks/use-toast";
import { MESSAGE_LIMIT } from "@/lib/data";
import { debugLog } from "@/lib/debug";
import { getAvailableModels } from "@/lib/models";
import { getStoredValue, removeStoredValue, setStoredValue } from "@/lib/utils";
import { Attachment, validateAttachment } from "@/types/chat";

import { useKeys } from "./key-provider";
import { useModel } from "./model-provider";
import { useSettingsModal } from "./settings-modal-provider";

import type { UIMessage } from "ai";

interface ChatContextType {
  messages: UIMessage[];
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
  setMessages: (messages: UIMessage[]) => void;
  resetChat: () => void;
  micError: string | null;
  setMicError: Dispatch<SetStateAction<string | null>>;
  webSearch: boolean | null;
  setWebSearch: (enabled: boolean | null) => void;
  reasoning: "high" | "medium" | "low" | null;
  setReasoning: (level: "high" | "medium" | "low" | null) => void;
  attachments: Attachment[];
  setAttachments: (attachments: Attachment[] | ((prev: Attachment[]) => Attachment[])) => void;
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
  initialMessages?: UIMessage[];
  initialChatId?: string | null;
}) {
  const { selectedModel } = useModel();
  const { keys, hasAnyKeys } = useKeys();
  const { toast } = useToast();
  const { openModal } = useSettingsModal();
  const [error, setError] = useState<Error | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [webSearch, setWebSearch] = useState<boolean | null>(null);
  const [reasoning, setReasoning] = useState<"high" | "medium" | "low" | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [chatId, setChatId] = useState<string | null>(initialChatId || (params?.id as string) || null);
  const [attachments, setAttachments] = useState<Attachment[]>(isValid.success ? localAttachments : []);

  const [messageCount, setMessageCount] = useState(() => getStoredValue(STORAGE_KEYS.MESSAGE_COUNT, 0));
  const [showWarning, setShowWarning] = useState(() => getStoredValue(STORAGE_KEYS.SHOW_WARNING, true));

  const prevMessageLengthRef = useRef(0);

  const availableModels = getAvailableModels(keys);
  const selectedModelDetails = availableModels.find((m) => m.id === selectedModel);
  const apiKey = keys[selectedModelDetails?.requiresKey as keyof typeof keys];

  const onError = useCallback(
    (error: Error) => {
      console.error("AI Chat error:", error);
      setError(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    },
    [toast]
  );

  const {
    messages,
    input,
    handleSubmit: originalHandleSubmit,
    isLoading,
    setMessages,
    setInput
  } = useChatAI({
    api: "/api/chat",
    body: {
      model: selectedModel,
      provider: selectedModelDetails?.provider,
      apiKey,
      chatId,
      userId: session?.user?.id,
      webSearch,
      reasoning,
      attachments: attachments.map((attachment) => attachment.id)
    },
    initialInput: getStoredValue("input", ""),
    initialMessages,
    onError,
    onFinish: (message) => {
      debugLog("Chat finished", {
        messageId: message.id,
        role: message.role,
        contentLength: message.content.length
      });
    }
  });

  useEffect(() => {
    if (!session) {
      const userMessages = messages.filter((msg) => msg.role === "user");
      const currentUserMessageCount = userMessages.length;

      if (currentUserMessageCount > prevMessageLengthRef.current) {
        const newUserMessages = currentUserMessageCount - prevMessageLengthRef.current;
        setMessageCount((prev) => prev + newUserMessages);
        prevMessageLengthRef.current = currentUserMessageCount;
      }
    }
  }, [messages, session]);

  useEffect(() => {
    if (session) {
      setMessageCount(0);

      prevMessageLengthRef.current = messages.filter((msg) => msg.role === "user").length;
    }
  }, [session, messages]);

  useEffect(() => {
    setStoredValue(STORAGE_KEYS.MESSAGE_COUNT, messageCount);
  }, [messageCount]);

  useEffect(() => {
    const supportedReasoning = selectedModelDetails?.capabilities?.reasoning;
    setReasoning(supportedReasoning ? "high" : null);

    const supportedWebSearch = selectedModelDetails?.capabilities?.search;
    setWebSearch(supportedWebSearch ? true : null);
  }, [selectedModel, selectedModelDetails]);

  useEffect(() => {
    setStoredValue(STORAGE_KEYS.SHOW_WARNING, showWarning);
  }, [showWarning]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!hasAnyKeys) {
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

      let currentChatId = chatId;

      if (!currentChatId) {
        try {
          debugLog("Creating new chat");
          const result = await createChat();
          if (result.success && result.chat) {
            currentChatId = result.chat.id;
            setChatId(currentChatId);
            debugLog("Chat created", { chatId: currentChatId });

            window.history.pushState({}, "", `/${currentChatId}`);
          } else {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to create chat. Please try again."
            });
            return;
          }
        } catch (error) {
          console.error("Error creating chat:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to create chat. Please try again."
          });
          return;
        }
      }

      if (currentChatId) {
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

      debugLog("Submitting to AI");

      setAttachments([]);
      originalHandleSubmit(e);
    },
    [session, messageCount, originalHandleSubmit, toast, chatId, input, hasAnyKeys, openModal]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setMessageCount(0);
    setError(null);
    setMicError(null);
    prevMessageLengthRef.current = 0;
    setChatId(null);

    removeStoredValue(STORAGE_KEYS.MESSAGE_COUNT);
    removeStoredValue(STORAGE_KEYS.SHOW_WARNING);

    router.push("/");
  }, [setMessages, router]);

  const resetChat = useCallback(() => {
    setMessages([]);
    setMessageCount(0);
    setError(null);
    setMicError(null);
    prevMessageLengthRef.current = 0;
    setChatId(null);
  }, [setMessages, setMessageCount, setError, setChatId]);

  const contextValues: ProviderProps<ChatContextType | undefined>["value"] = {
    messages,
    input,
    setInput: (value: string | ((prev: string) => string)) => {
      if (typeof value === "function") {
        setInput((prev) => {
          const newInput = value(prev);
          setStoredValue("input", newInput);
          return newInput;
        });
      } else {
        setInput(() => {
          const newInput = value;
          setStoredValue("input", newInput);
          return newInput;
        });
      }
    },
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
    setAttachments: (value: Attachment[] | ((prev: Attachment[]) => Attachment[])) => {
      if (typeof value === "function") {
        setAttachments((prev) => {
          const newAttachments = value(prev);
          setStoredValue("attachments", newAttachments);
          return newAttachments;
        });
      } else {
        setAttachments((prev) => {
          const newAttachments = [...prev, ...value];
          setStoredValue("attachments", newAttachments);
          return newAttachments;
        });
      }
    }
  };

  return <ChatContext.Provider value={contextValues}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
