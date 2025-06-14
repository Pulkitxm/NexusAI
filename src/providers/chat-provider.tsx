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
  type FormEvent
} from "react";

import { createChat, saveUserMessage } from "@/actions/chat";
import { useToast } from "@/hooks/use-toast";
import { MESSAGE_LIMIT } from "@/lib/data";
import { getAvailableModels } from "@/lib/models";
import { getStoredValue, removeStoredValue, setStoredValue } from "@/lib/utils";
import { type Attachment, validateAttachment } from "@/types/chat";

import { useKeys } from "./key-provider";
import { useModel } from "./model-provider";
import { useSettingsModal } from "./settings-modal-provider";

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
  reasoning: "high" | "medium" | "low" | null;
  setReasoning: (level: "high" | "medium" | "low" | null) => void;
  attachments: Attachment[];
  setAttachments: Dispatch<SetStateAction<Attachment[]>>;
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
  const { keys, hasAnyKeys } = useKeys();
  const { toast } = useToast();
  const { openModal } = useSettingsModal();
  const [error, setError] = useState<Error | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [webSearch, setWebSearch] = useState<boolean | null>(null);
  const [reasoning, setReasoning] = useState<"high" | "medium" | "low" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInputState] = useState(() => getStoredValue("input", ""));
  const [messages, setMessages] = useState<MessageWithAttachments[]>(initialMessages);
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

      setIsLoading(true);
      setError(null);

      // Add user message immediately
      const userMessage: MessageWithAttachments = {
        id: Date.now().toString(),
        role: "user",
        content: currentInput,
        createdAt: new Date(),
        attachments: [...attachments]
      };

      setMessages((prev) => [...prev, userMessage]);

      let currentChatId = chatId;

      if (!currentChatId) {
        try {
          const result = await createChat();
          if (result.success && result.chat) {
            currentChatId = result.chat.id;
            setChatId(currentChatId);
            window.history.pushState({}, "", `/${currentChatId}`);
          } else {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to create chat. Please try again."
            });
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error creating chat:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to create chat. Please try again."
          });
          setIsLoading(false);
          return;
        }
      }

      if (currentChatId) {
        try {
          await saveUserMessage(
            currentChatId,
            currentInput,
            attachments.map((a) => ({ id: a.id }))
          );
        } catch (error) {
          console.error("Error saving user message:", error);
        }
      }

      // Clear input and attachments
      setAttachmentsWithStorage([]);
      setInput("");
      removeStoredValue("input");
      removeStoredValue("attachments");

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
            model: selectedModel,
            provider: selectedModelDetails?.provider,
            apiKey,
            chatId: currentChatId,
            userId: session?.user?.id,
            webSearch,
            reasoning,
            attachments: attachments.map((attachment) => attachment.id)
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let assistantMessage = "";
        const assistantMessageId = (Date.now() + 1).toString();

        // Add empty assistant message
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMessageId,
            role: "assistant",
            content: "",
            createdAt: new Date()
          }
        ]);

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
                  // Update the assistant message
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
      } catch (error) {
        console.error("Chat error:", error);
        setError(error as Error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "An error occurred"
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      attachments,
      chatId,
      hasAnyKeys,
      input,
      messageCount,
      openModal,
      session,
      toast,
      setAttachmentsWithStorage,
      setInput,
      selectedModel,
      selectedModelDetails,
      apiKey,
      webSearch,
      reasoning,
      messages
    ]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setMessageCount(0);
    setError(null);
    setMicError(null);
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
    prevMessageLengthRef.current = 0;
    setChatId(null);
    setAttachmentsWithStorage([]);
  }, [setAttachmentsWithStorage]);

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
    setAttachments: setAttachmentsWithStorage
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
