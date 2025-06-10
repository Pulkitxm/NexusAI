"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "ai/react";
import { useModel } from "@/providers/model-provider";
import { useKeys } from "@/providers/key-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, ArrowUp } from "lucide-react";
import { getAvailableModels } from "@/lib/models";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { EmptyState } from "./EmptyState";
import { KeyboardShortcutsDialog } from "./KeyboardShortcutsDialog";
import { useToast } from "@/hooks/use-toast";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export default function ChatUI() {
  const { selectedModel, setSelectedModel } = useModel();
  const { keys } = useKeys();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const { toast } = useToast();

  const availableModels = getAvailableModels(keys);
  const selectedModelDetails = availableModels.find(
    (m) => m.id === selectedModel,
  );
  const apiKey = keys[selectedModelDetails?.requiresKey as keyof typeof keys];

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
    onError: (error) => {
      console.error("Chat error:", error);
      setError(error.message);
      setIsTyping(false);
    },
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

  const scrollToTop = useCallback(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (viewport) {
        viewport.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    }
  }, []);

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

        setShowScrollTop(scrollTop > 200);
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
        setError("Failed to edit message");
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

  const handleReloadMessage = useCallback(
    async (messageId: string, modelId?: string) => {
      const messageIndex = messages.findIndex((m) => m.id === messageId);
      if (messageIndex === -1) return;

      const messagesUpToSelected = messages.slice(0, messageIndex + 1);

      const updatedMessages =
        messages[messageIndex].role === "assistant"
          ? messagesUpToSelected.slice(0, -1)
          : messagesUpToSelected;

      const targetModel = modelId || selectedModel;
      if (modelId && modelId !== selectedModel) {
        setSelectedModel(modelId);
      }

      setMessages(updatedMessages);

      const targetModelDetails = availableModels.find(
        (m) => m.id === targetModel,
      );
      const targetApiKey =
        keys[targetModelDetails?.requiresKey as keyof typeof keys];

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: updatedMessages,
            model: targetModel,
            provider: targetModelDetails?.provider,
            apiKey: targetApiKey,
            webSearch: webSearchEnabled,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to regenerate message");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        let newMessage = "";
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;

              try {
                const parsed = JSON.parse(data);
                if (parsed.choices?.[0]?.delta?.content) {
                  newMessage += parsed.choices[0].delta.content;

                  setMessages([
                    ...updatedMessages,
                    {
                      id: Date.now().toString(),
                      role: "assistant",
                      content: newMessage,
                    },
                  ]);
                }
              } catch (e) {
                console.error("Error parsing chunk:", e);
              }
            }
          }
        }

        toast({ description: "Message regenerated successfully" });
      } catch (error) {
        console.error("Error regenerating message:", error);
        setError("Failed to regenerate message");
      }
    },
    [
      messages,
      setMessages,
      selectedModel,
      setSelectedModel,
      availableModels,
      keys,
      webSearchEnabled,
      toast,
    ],
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <ChatHeader onShowShortcuts={() => setShowShortcuts(true)} />

      <div className="relative flex-1">
        <ScrollArea className="h-full px-2 sm:px-4" ref={scrollAreaRef}>
          <div className="max-w-3xl mx-auto py-4 sm:py-6">
            {error && (
              <Alert
                className="mb-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
                variant="destructive"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
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
              />
            )}
          </div>
        </ScrollArea>

        {/* Scroll to top button */}
        <Button
          onClick={scrollToTop}
          size="icon"
          className={cn(
            "fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 h-10 w-10 rounded-full shadow-lg transition-all duration-300 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800",
            showScrollTop
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2 pointer-events-none",
          )}
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-4 w-4 text-slate-600 dark:text-slate-400" />
        </Button>
      </div>

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
