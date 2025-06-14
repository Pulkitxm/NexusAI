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
  FormEvent
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

export interface MessageWithAttachments extends UIMessage {
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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [chatId, setChatId] = useState<string | null>(initialChatId || (params?.id as string) || null);
  const [attachments, setAttachments] = useState<Attachment[]>(isValid.success ? localAttachments : []);
  const [messagesWithAttachments, setMessagesWithAttachments] = useState<MessageWithAttachments[]>(initialMessages);

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
    setInput: originalSetInput
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

  const setInput = useCallback(
    (value: string | ((prev: string) => string)) => {
      if (typeof value === "function") {
        originalSetInput((prev) => {
          const newInput = value(prev);
          setStoredValue("input", newInput);
          return newInput;
        });
      } else {
        originalSetInput(value);
        setStoredValue("input", value);
      }
    },
    [originalSetInput]
  );

  const setAttachmentsWithStorage = useCallback((value: SetStateAction<Attachment[]>) => {
    setAttachments((prev) => {
      const newAttachments = typeof value === "function" ? value(prev) : value;
      setStoredValue("attachments", newAttachments);
      return newAttachments;
    });
  }, []);

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

  useEffect(() => {
    setMessagesWithAttachments((prev) => {
      const contentMap = new Map<string, MessageWithAttachments>();
      const messageMap = new Map<string, MessageWithAttachments>();

      prev.forEach((msg) => {
        const contentKey = `${msg.role}:${msg.content}:${msg.createdAt?.getTime() || 0}`;
        contentMap.set(contentKey, msg);
        messageMap.set(msg.id, msg);
      });

      messages.forEach((message) => {
        const contentKey = `${message.role}:${message.content}:${message.createdAt?.getTime() || 0}`;

        const existingByContent = Array.from(contentMap.values()).find(
          (existing) =>
            existing.role === message.role &&
            existing.content === message.content &&
            Math.abs((existing.createdAt?.getTime() || 0) - (message.createdAt?.getTime() || 0)) < 2000
        );

        if (existingByContent && existingByContent.id !== message.id) {
          const shouldKeepExisting =
            (existingByContent.attachments?.length || 0) > 0 || existingByContent.id.length > message.id.length;

          if (!shouldKeepExisting) {
            messageMap.delete(existingByContent.id);
            contentMap.delete(
              `${existingByContent.role}:${existingByContent.content}:${existingByContent.createdAt?.getTime() || 0}`
            );
            messageMap.set(message.id, {
              ...message,
              attachments: message.role === "user" ? attachments : []
            });
            contentMap.set(contentKey, messageMap.get(message.id)!);
          }
        } else {
          const existingMessage = messageMap.get(message.id);
          if (existingMessage) {
            const updatedMessage = {
              ...existingMessage,
              ...message,
              attachments: existingMessage.attachments || (message.role === "user" ? attachments : [])
            };
            messageMap.set(message.id, updatedMessage);
            contentMap.set(contentKey, updatedMessage);
          } else {
            const newMessage = {
              ...message,
              attachments: message.role === "user" ? attachments : []
            };
            messageMap.set(message.id, newMessage);
            contentMap.set(contentKey, newMessage);
          }
        }
      });

      const result = Array.from(messageMap.values()).sort((a, b) => {
        const aTime = a.createdAt?.getTime() || 0;
        const bTime = b.createdAt?.getTime() || 0;
        if (aTime !== bTime) return aTime - bTime;

        const aIndex = messages.findIndex((m) => m.id === a.id);
        const bIndex = messages.findIndex((m) => m.id === b.id);
        return aIndex - bIndex;
      });

      return result;
    });
  }, [messages, attachments]);

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
          const result = await saveUserMessage(
            currentChatId,
            currentInput,
            attachments.map((a) => ({ id: a.id }))
          );
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

      setAttachmentsWithStorage([]);
      setInput("");
      removeStoredValue("input");
      removeStoredValue("attachments");
      originalHandleSubmit(e);
    },
    [
      attachments,
      chatId,
      hasAnyKeys,
      input,
      messageCount,
      openModal,
      originalHandleSubmit,
      session,
      toast,
      setAttachmentsWithStorage,
      setInput
    ]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setMessagesWithAttachments([]);
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
  }, [setMessages, router, setAttachmentsWithStorage]);

  const resetChat = useCallback(() => {
    setMessages([]);
    setMessagesWithAttachments([]);
    setMessageCount(0);
    setError(null);
    setMicError(null);
    prevMessageLengthRef.current = 0;
    setChatId(null);
    setAttachmentsWithStorage([]);
  }, [setMessages, setAttachmentsWithStorage]);

  const contextValue: ChatContextType = {
    messages: messagesWithAttachments,
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
    setMessages: setMessagesWithAttachments,
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
