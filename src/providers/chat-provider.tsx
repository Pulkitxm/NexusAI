"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { useChat as useChatAI } from "ai/react";
import { useModel } from "./model-provider";
import { useKeys } from "./key-provider";
import { getAvailableModels } from "@/lib/models";
import { useToast } from "@/hooks/use-toast";
import { UIMessage } from "ai";
import { useSession } from "next-auth/react";
import { MESSAGE_LIMIT } from "@/lib/data";
import { getStoredValue, removeStoredValue, setStoredValue } from "@/lib/utils";

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
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const STORAGE_KEYS = {
  MESSAGE_COUNT: "chat_message_count",
  SHOW_WARNING: "chat_show_warning",
  MESSAGES: "chat_messages",
} as const;



export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { selectedModel } = useModel();
  const { keys } = useKeys();
  const { toast } = useToast();
  const [error, setError] = useState<Error | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { data: session } = useSession();

  const [messageCount, setMessageCount] = useState(() => getStoredValue(STORAGE_KEYS.MESSAGE_COUNT, 0));
  const [showWarning, setShowWarning] = useState(() => getStoredValue(STORAGE_KEYS.SHOW_WARNING, true));

  const prevMessageLengthRef = useRef(0);

  const availableModels = getAvailableModels(keys);
  const selectedModelDetails = availableModels.find((m) => m.id === selectedModel);
  const apiKey = keys[selectedModelDetails?.requiresKey as keyof typeof keys];

  const onError = useCallback(
    (error: Error) => {
      console.error("Chat error:", error);
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
  } = useChatAI({
    api: "/api/chat",
    body: {
      model: selectedModel,
      provider: selectedModelDetails?.provider,
      apiKey: apiKey,
    },
    onError,
  });

  useEffect(() => {
    const userMessages = messages.filter((msg) => msg.role === "user");
    const currentUserMessageCount = userMessages.length;

    if (currentUserMessageCount > prevMessageLengthRef.current) {
      const newUserMessages = currentUserMessageCount - prevMessageLengthRef.current;
      if (!session) {
        setMessageCount((prev) => prev + newUserMessages);
      }
      prevMessageLengthRef.current = currentUserMessageCount;
    }
  }, [messages, session]);

  useEffect(() => {
    const userMessages = messages.filter((msg) => msg.role === "user");
    prevMessageLengthRef.current = userMessages.length;
  }, [messages]);

  useEffect(() => {
    setStoredValue(STORAGE_KEYS.MESSAGE_COUNT, messageCount);
  }, [messageCount]);

  useEffect(() => {
    setStoredValue(STORAGE_KEYS.SHOW_WARNING, showWarning);
  }, [showWarning]);

  useEffect(() => {
    if (session) {
      setMessageCount(0);
    }
  }, [session]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      if (!session && messageCount >= MESSAGE_LIMIT) {
        e.preventDefault();
        toast({
          variant: "destructive",
          title: "Message Limit Reached",
          description:
            "Please sign in to continue chatting. You've reached the limit of 10 messages for non-logged-in users.",
        });
        return;
      }

      originalHandleSubmit(e);
    },
    [session, messageCount, originalHandleSubmit, toast]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setMessageCount(0);
    setError(null);
    prevMessageLengthRef.current = 0;

    removeStoredValue(STORAGE_KEYS.MESSAGES);
    removeStoredValue(STORAGE_KEYS.MESSAGE_COUNT);
  }, [setMessages]);

  const setInput = useCallback(
    (input: string) => {
      handleInputChange({
        target: { value: input },
      } as React.ChangeEvent<HTMLInputElement>);
    },
    [handleInputChange]
  );

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
