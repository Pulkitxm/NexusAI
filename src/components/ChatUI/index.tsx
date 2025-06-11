"use client";

import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/providers/chat-provider";
import { KeyboardShortcutsDialog } from "./KeyboardShortcutsDialog";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { MessageBubble } from "./MessageBubble";
import { LoadingMessage } from "./LoadingMessage";
import { ScrollToBottomButton } from "./ScrollToBottom";
import { ChatInput } from "./ChatInput";
import { motion } from "framer-motion";
import { SUGGESTED_PROMPTS } from "@/lib/data";
import { Button } from "../ui/button";
import { useSession } from "next-auth/react";

export default function ChatUI() {
  const { data: session } = useSession();
  const { messages, isLoading, input, setInput, inputRef } = useChat();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const { scrollAreaRef, showScrollButton, isAutoScrollEnabled, scrollToBottom, forceScrollToBottom } = useAutoScroll();
  const prevMessagesLength = useRef(messages.length);
  const prevIsLoading = useRef(isLoading);
  const [promptSection, setPromptSection] = useState<(typeof SUGGESTED_PROMPTS)[number]["section"]>(
    SUGGESTED_PROMPTS[0].section
  );

  useEffect(() => {
    if (messages.length > prevMessagesLength.current && isAutoScrollEnabled) {
      setTimeout(() => scrollToBottom(true), 100);
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length, isAutoScrollEnabled, scrollToBottom]);

  useEffect(() => {
    forceScrollToBottom();
  }, []);

  useEffect(() => {
    if (isLoading && !prevIsLoading.current) {
      setTimeout(() => {
        forceScrollToBottom();

        setTimeout(() => scrollToBottom(true), 50);
      }, 10);
    }
    prevIsLoading.current = isLoading;
  }, [isLoading, forceScrollToBottom, scrollToBottom]);

  useEffect(() => {
    if (isLoading && isAutoScrollEnabled) {
      const interval = setInterval(() => {
        scrollToBottom(false);
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isLoading, isAutoScrollEnabled, scrollToBottom]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "ArrowDown") {
        e.preventDefault();
        scrollToBottom(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scrollToBottom]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
        <div className="max-w-4xl mx-auto py-6">
          {messages.length === 0 && !isLoading ? (
            <div className="flex items-center justify-center h-full min-h-[60vh]">
              <motion.div
                initial={{ opacity: 0, display: "none", pointerEvents: "none" }}
                animate={{
                  opacity: !input ? 1 : 0,
                  display: !input ? "block" : "none",
                  pointerEvents: !input ? "auto" : "none",
                }}
                transition={{ duration: 0.1, ease: "easeInOut" }}
                exit={{ opacity: 0, display: "none", pointerEvents: "none" }}
                className="text-center space-y-4"
              >
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    How can I help you{session?.user?.name ? `, ${session.user.name}?` : "today?"}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Ask me anything, and I'll help you out. Press ⌘/ for keyboard shortcuts.
                  </p>
                </div>
                <div className="flex flex-col gap-2 justify-center items-center">
                  <div className="flex flex-wrap gap-2 md:col-span-2">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                      <Button
                        key={prompt.section}
                        variant={promptSection === prompt.section ? "default" : "link"}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
                        onClick={() => setPromptSection(prompt.section)}
                      >
                        <prompt.icon className="w-4 h-4" />
                        {prompt.section}
                      </Button>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2 max-h-[calc(100vh-24rem)] overflow-y-auto">
                    {SUGGESTED_PROMPTS.find((prompt) => prompt.section === promptSection)?.prompts.map((prompt) => (
                      <Button
                        key={prompt}
                        variant="ghost"
                        className="h-auto px-4 py-3 rounded-lg text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => {
                          setInput(prompt);
                          inputRef.current?.focus();
                        }}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isStreaming={isLoading && message.id === messages[messages.length - 1]?.id}
                />
              ))}

              {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === "user" && <LoadingMessage />}
            </div>
          )}
        </div>
      </ScrollArea>

      <ScrollToBottomButton show={showScrollButton} onClick={() => scrollToBottom(true)} />

      <ChatInput onShowShortcuts={() => setShowShortcuts(true)} />

      <KeyboardShortcutsDialog open={showShortcuts} onOpenChange={setShowShortcuts} />
    </div>
  );
}
