"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { SUGGESTED_PROMPTS } from "@/lib/data";
import { useChat } from "@/providers/chat-provider";

import { Button } from "../ui/button";

import { ChatInput } from "./ChatInput";
import { KeyboardShortcutsDialog } from "./KeyboardShortcutsDialog";
import { LoadingMessage } from "./LoadingMessage";
import { MessageBubble } from "./MessageBubble";
import { ScrollToBottomButton } from "./ScrollToBottom";

export default function ChatUI({ id, share }: { id?: string; share?: boolean }) {
  const { data: session } = useSession();
  const { messages, isLoading, input, setInput, inputRef, attachments } = useChat();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const { scrollAreaRef, showScrollButton, isAutoScrollEnabled, scrollToBottom, forceScrollToBottom } = useAutoScroll();
  const prevMessagesLength = useRef(messages.length);
  const prevIsLoading = useRef(isLoading);
  const [promptSection, setPromptSection] = useState<(typeof SUGGESTED_PROMPTS)[number]["section"]>(
    SUGGESTED_PROMPTS[0].section
  );
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (messages.length > prevMessagesLength.current && isAutoScrollEnabled) {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        scrollToBottom(true);
        scrollTimeoutRef.current = null;
      }, 50);
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length, isAutoScrollEnabled, scrollToBottom]);

  useEffect(() => {
    forceScrollToBottom();
  }, [forceScrollToBottom]);

  useEffect(() => {
    if (isLoading && !prevIsLoading.current) {
      forceScrollToBottom();
    }
    prevIsLoading.current = isLoading;
  }, [isLoading, forceScrollToBottom]);

  useEffect(() => {
    const scrollInterval: NodeJS.Timeout | null = null;

    if (isLoading && isAutoScrollEnabled) {
      const smoothScroll = () => {
        scrollToBottom(false);
        if (isLoading && isAutoScrollEnabled) {
          requestAnimationFrame(smoothScroll);
        }
      };

      requestAnimationFrame(smoothScroll);
    }

    return () => {
      if (scrollInterval) clearInterval(scrollInterval);
    };
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

  const hide = input || id;
  const isChatEmpty = messages.length === 0 && !isLoading && attachments.length === 0;

  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <ScrollArea ref={scrollAreaRef} className="mb-20 flex-1 px-4">
        <div className="mx-auto max-w-4xl py-6">
          {isChatEmpty ? (
            <div className="flex h-full min-h-[60vh] items-center justify-center">
              <motion.div
                initial={{ opacity: 0, display: "none", pointerEvents: "none" }}
                animate={{
                  opacity: !hide ? 1 : 0,
                  display: !hide ? "block" : "none",
                  pointerEvents: !hide ? "auto" : "none"
                }}
                transition={{ duration: 0.1, ease: "easeInOut" }}
                exit={{ opacity: 0, display: "none", pointerEvents: "none" }}
                className="space-y-4 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="mb-2 text-xl font-semibold text-slate-800 dark:text-slate-200">
                    How can I help you
                    {session?.user?.name ? `, ${session.user.name}?` : "today?"}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Ask me anything, and I&apos;ll help you out. Press ⌘/ for keyboard shortcuts.
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="flex flex-wrap gap-2 md:col-span-2">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                      <Button
                        key={prompt.section}
                        variant={promptSection === prompt.section ? "default" : "link"}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-purple-500 transition-all dark:text-purple-400 ${
                          promptSection === prompt.section
                            ? "bg-purple-500 text-white hover:bg-purple-500 dark:bg-purple-400 dark:text-black dark:hover:bg-purple-400"
                            : ""
                        }`}
                        onClick={() => setPromptSection(prompt.section)}
                      >
                        <prompt.icon className="h-4 w-4" />
                        {prompt.section}
                      </Button>
                    ))}
                  </div>

                  <div className="flex max-h-[calc(100vh-24rem)] flex-col gap-2 overflow-y-auto">
                    {SUGGESTED_PROMPTS.find((prompt) => prompt.section === promptSection)?.prompts.map((prompt) => (
                      <Button
                        key={prompt}
                        variant="ghost"
                        className="h-auto rounded-lg px-4 py-3 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
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

      {!share && (
        <>
          <ScrollToBottomButton show={showScrollButton} onClick={() => scrollToBottom(true)} />{" "}
          <ChatInput onShowShortcuts={() => setShowShortcuts(true)} />
        </>
      )}
      <KeyboardShortcutsDialog open={showShortcuts} onOpenChange={setShowShortcuts} />
    </div>
  );
}
