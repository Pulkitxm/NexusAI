"use client";

import type React from "react";
import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { useChat as useChatAI } from "ai/react";
import { useModel } from "./model-provider";
import { useKeys } from "./key-provider";
import { getAvailableModels } from "@/lib/models";
import { useToast } from "@/hooks/use-toast";
import type { UIMessage } from "ai";
import { useSession } from "next-auth/react";
import { MESSAGE_LIMIT } from "@/lib/data";
import { getStoredValue, removeStoredValue, setStoredValue } from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";
import { createChat, saveUserMessage } from "@/actions/chat";
import { debugLog } from "@/lib/debug";

interface ChatContextType {
  messages: UIMessage[];
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;

  handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: React.FormEventHandler;
  error: Error | null;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  messageCount: number;
  setMessageCount: React.Dispatch<React.SetStateAction<number>>;
  showWarning: boolean;
  setShowWarning: React.Dispatch<React.SetStateAction<boolean>>;
  clearChat: () => void;
  chatId: string | null;
  setChatId: (id: string | null) => void;
  setMessages: (messages: UIMessage[]) => void;
  resetChat: () => void;
  micError: string | null;
  setMicError: React.Dispatch<React.SetStateAction<string | null>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const STORAGE_KEYS = {
  MESSAGE_COUNT: "chat_message_count",
  SHOW_WARNING: "chat_show_warning",
} as const;

export function ChatProvider({
  children,
  initialMessages = [],
  initialChatId = null,
}: {
  children: React.ReactNode;
  initialMessages?: UIMessage[];
  initialChatId?: string | null;
}) {
  const { selectedModel } = useModel();
  const { keys } = useKeys();
  const { toast } = useToast();
  const [error, setError] = useState<Error | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const [chatId, setChatId] = useState<string | null>(initialChatId || (params?.id as string) || null);

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
        description: error.message,
      });
    },
    [toast]
  );

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
    setMessages,
    setInput: setAIInput,
  } = useChatAI({
    api: "/api/chat",
    body: {
      model: selectedModel,
      provider: selectedModelDetails?.provider,
      apiKey: apiKey,
      chatId,
      userId: session?.user?.id,
    },
    initialMessages,
    onError,
    onFinish: (message) => {
      debugLog("Chat finished", {
        messageId: message.id,
        role: message.role,
        contentLength: message.content.length,
      });
    },
  });

  const setInput = useCallback(
    (value: string) => {
      setAIInput(value);
    },
    [setAIInput]
  );

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
    setStoredValue(STORAGE_KEYS.SHOW_WARNING, showWarning);
  }, [showWarning]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!session && messageCount >= MESSAGE_LIMIT) {
        toast({
          variant: "destructive",
          title: "Message Limit Reached",
          description:
            "Please sign in to continue chatting. You've reached the limit of 10 messages for non-logged-in users.",
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
              description: "Failed to create chat. Please try again.",
            });
            return;
          }
        } catch (error) {
          console.error("Error creating chat:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to create chat. Please try again.",
          });
          return;
        }
      }

      if (currentChatId) {
        try {
          debugLog("Saving user message", {
            chatId: currentChatId,
            content: currentInput,
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

      originalHandleSubmit(e);
    },
    [session, messageCount, originalHandleSubmit, toast, chatId, input]
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

  return (
    <ChatContext.Provider
      value={{
        messages,
        input,
        setInput,
        isLoading,
        handleInputChange,
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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}