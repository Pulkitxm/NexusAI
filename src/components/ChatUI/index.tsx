"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "ai/react";
import { useModel } from "@/providers/model-provider";
import { useKeys } from "@/providers/key-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle } from "lucide-react";
import { getAvailableModels } from "@/lib/models";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { EmptyState } from "./EmptyState";
import { KeyboardShortcutsDialog } from "./KeyboardShortcutsDialog";
import { useToast } from "@/hooks/use-toast";

interface ErrorDetails {
  message: string;
  code: string;
  status: number;
  details?: unknown;
}

export default function ChatUI() {
  const { selectedModel } = useModel();
  const { keys } = useKeys();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<ErrorDetails | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [regeneratingMessageId, setRegeneratingMessageId] = useState<
    string | null
  >(null);
  const { toast } = useToast();

  const availableModels = getAvailableModels(keys);
  const selectedModelDetails = availableModels.find(
    (m) => m.id === selectedModel,
  );
  const apiKey = keys[selectedModelDetails?.requiresKey as keyof typeof keys];

  const onError = useCallback((error: Error) => {
    console.error("Chat error:", error);
    setError({
      message: error.message,
      code: "CHAT_ERROR",
      status: 500,
    });
    setIsTyping(false);
  }, []);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    reload,
  } = useChat({
    api: "/api/chat",
    body: {
      model: selectedModel,
      provider: selectedModelDetails?.provider,
      apiKey: apiKey,
      webSearch: webSearchEnabled,
    },
    onError,
    onFinish: () => {
      setError(null);
      setIsTyping(false);
    },
    onResponse: () => {
      setIsTyping(true);
    },
  });

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current && isAtBottom) {
      const viewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [isAtBottom]);

  const handleScroll = useCallback(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (viewport) {
        const { scrollTop, scrollHeight, clientHeight } = viewport;
        const threshold = 100;
        const newIsAtBottom =
          scrollHeight - scrollTop - clientHeight < threshold;
        setIsAtBottom(newIsAtBottom);
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    );
    if (viewport) {
      viewport.addEventListener("scroll", handleScroll, { passive: true });
      return () => viewport.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      }

      if (
        e.key === "/" &&
        !editingMessageId &&
        !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || "")
      ) {
        e.preventDefault();
      }

      if (e.key === "Escape") {
        if (editingMessageId) {
          setEditingMessageId(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingMessageId]);

  const copyConversation = useCallback(() => {
    const conversationText = messages
      .map((m) => `${m.role === "user" ? "You" : "Assistant"}: ${m.content}`)
      .join("\n\n");

    navigator.clipboard
      .writeText(conversationText)
      .then(() => toast({ description: "Conversation copied to clipboard" }))
      .catch(() =>
        toast({
          variant: "destructive",
          description: "Failed to copy conversation",
        }),
      );
  }, [messages, toast]);

  const handleEditMessage = useCallback(
    async (messageId: string, newContent: string) => {
      const messageIndex = messages.findIndex((m) => m.id === messageId);
      if (messageIndex === -1) return;

      const updatedMessages = messages.slice(0, messageIndex).concat([
        {
          ...messages[messageIndex],
          content: newContent,
        },
      ]);

      setMessages(updatedMessages);
      setEditingMessageId(null);

      try {
        await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: updatedMessages,
            model: selectedModel,
            provider: selectedModelDetails?.provider,
            apiKey: apiKey,
            webSearch: webSearchEnabled,
          }),
        });

        reload();
      } catch (error) {
        console.error("Error editing message:", error);
        setError({
          message: "Failed to edit message",
          code: "EDIT_ERROR",
          status: 500,
        });
      }
    },
    [
      messages,
      setMessages,
      selectedModel,
      selectedModelDetails,
      apiKey,
      webSearchEnabled,
      reload,
    ],
  );

  const formatErrorMessage = useCallback((error: ErrorDetails) => {
    const messages: Record<string, string> = {
      MISSING_FIELDS: "Please ensure all required fields are provided.",
      MODEL_NOT_FOUND: "The selected AI model is not available.",
      PROVIDER_NOT_SUPPORTED: "The selected AI provider is not supported.",
      PROVIDER_INIT_ERROR:
        "Failed to initialize the AI service. Please check your API key.",
      AI_RESPONSE_ERROR: "The AI model encountered an error. Please try again.",
      STREAM_TRANSFORM_ERROR:
        "Error processing the AI response. Please try again.",
      STREAM_ERROR: "Failed to establish connection with the AI service.",
      GENERATION_ERROR: "Failed to generate response. Please try again.",
      UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
    };

    return {
      title: messages[error.code] || "Error",
      description: error.message,
      details: error.details,
    };
  }, []);

  const handleError = useCallback(
    (error: unknown) => {
      let errorDetails: ErrorDetails;

      if (
        error instanceof Error &&
        error.cause &&
        typeof error.cause === "object" &&
        "code" in error.cause
      ) {
        errorDetails = error.cause as ErrorDetails;
      } else {
        errorDetails = {
          message:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
          code: "UNKNOWN_ERROR",
          status: 500,
        };
      }

      const formattedError = formatErrorMessage(errorDetails);
      setError(errorDetails);

      toast({
        variant: "destructive",
        title: formattedError.title,
        description: formattedError.description,
      });
    },
    [formatErrorMessage, toast],
  );

  const handleReloadMessage = useCallback(
    async (messageId: string, modelId?: string) => {
      const messageIndex = messages.findIndex((m) => m.id === messageId);
      if (messageIndex === -1) return;

      setRegeneratingMessageId(messageId);
      setIsTyping(true);
      setError(null);

      let currentMessageId = "";
      let currentMessage = "";

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: messages.slice(0, messageIndex + 1),
            model: modelId || selectedModel,
            provider: availableModels.find(
              (m) => m.id === (modelId || selectedModel),
            )?.provider,
            apiKey:
              keys[
                availableModels.find((m) => m.id === (modelId || selectedModel))
                  ?.requiresKey as keyof typeof keys
              ],
            webSearch: webSearchEnabled,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message || "Failed to regenerate message",
            {
              cause: errorData.error,
            },
          );
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line) continue;

            if (line.startsWith("f:")) {
              try {
                const data = JSON.parse(line.slice(2));
                currentMessageId = data.messageId;
              } catch (e) {
                console.error("Error parsing messageId:", e);
              }
              continue;
            }

            if (line.startsWith("0:")) {
              try {
                const content = JSON.parse(line.slice(2));
                currentMessage += content;
                setMessages([
                  ...messages.slice(0, messageIndex + 1),
                  {
                    id: currentMessageId || Date.now().toString(),
                    role: "assistant",
                    content: currentMessage,
                  },
                ]);
              } catch (e) {
                console.error("Error parsing content chunk:", e);
                throw new Error("Failed to parse response chunk");
              }
              continue;
            }

            if (line.startsWith("error:")) {
              try {
                const errorData = JSON.parse(line.slice(6));
                throw new Error(errorData.error.message, {
                  cause: errorData.error,
                });
              } catch (e) {
                if (e instanceof Error && e.cause) {
                  throw e;
                }
                throw new Error("Failed to process error response", {
                  cause: {
                    message: "Invalid error format received from server",
                    code: "PARSE_ERROR",
                    status: 500,
                  },
                });
              }
            }

            if (line.startsWith("e:") || line.startsWith("d:")) {
              break;
            }
          }
        }

        toast({ description: "Message regenerated successfully" });
      } catch (error) {
        console.error("Error regenerating message:", error);
        handleError(error);

        if (currentMessage) {
          setMessages([
            ...messages.slice(0, messageIndex + 1),
            {
              id: currentMessageId || Date.now().toString(),
              role: "assistant",
              content: currentMessage,
            },
          ]);
        }
      } finally {
        setRegeneratingMessageId(null);
        setIsTyping(false);
      }
    },
    [
      messages,
      setMessages,
      selectedModel,
      availableModels,
      keys,
      webSearchEnabled,
      toast,
      handleError,
    ],
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <ScrollArea
        className="h-full px-2 sm:px-4 overflow-y-auto"
        ref={scrollAreaRef}
      >
        <div className="max-w-3xl mx-auto py-4 sm:py-6">
          {error && (
            <Alert
              className="mb-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
              variant="destructive"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex flex-col gap-1">
                <span className="font-medium">
                  {formatErrorMessage(error).title}
                </span>
                <span>{error.message}</span>
                {error.code && (
                  <span className="text-xs opacity-75">
                    Error code: {error.code}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {messages.length === 0 ? (
            <EmptyState selectedModelDetails={selectedModelDetails} />
          ) : (
            <ChatMessages
              messages={messages}
              isLoading={isLoading}
              isTyping={isTyping}
              editingMessageId={editingMessageId}
              onEditMessage={handleEditMessage}
              onStartEdit={setEditingMessageId}
              onCancelEdit={() => setEditingMessageId(null)}
              onReloadMessage={handleReloadMessage}
              availableModels={availableModels}
              selectedModel={selectedModel}
              regeneratingMessageId={regeneratingMessageId}
            />
          )}
        </div>
      </ScrollArea>
      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        selectedModelDetails={selectedModelDetails}
        messages={messages}
        copyConversation={copyConversation}
        webSearchEnabled={webSearchEnabled}
        onWebSearchToggle={setWebSearchEnabled}
      />

      <KeyboardShortcutsDialog
        open={showShortcuts}
        onOpenChange={setShowShortcuts}
      />
    </div>
  );
}
