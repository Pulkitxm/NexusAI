"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { SUGGESTED_PROMPTS } from "@/data/suggested-prompts";
import { useChat } from "@/providers/use-chat";

import { MessageInput } from "./message-input";
import { MessageList } from "./message-list";

export function ChatInterface() {
  const { data: session } = useSession();
  const {
    messages,
    handleInputChange,
    isLoading,
    isStreaming,
    isLoadingMessages,
    inputRef,
    chatConfig,
    isRedirecting,
    chatId
  } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [promptSection, setPromptSection] = useState<(typeof SUGGESTED_PROMPTS)[number]["section"]>(
    SUGGESTED_PROMPTS[0].section
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isStreaming]);

  const isInitialState = !chatId && messages.length === 0 && !isLoading && !isLoadingMessages && !isRedirecting;
  const showErrorState = chatConfig.error;

  if (showErrorState) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex items-center gap-2 text-red-500">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{chatConfig.error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex size-full flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="flex-1 overflow-x-hidden overflow-y-auto px-4">
        <div className="mx-auto max-w-3xl overflow-y-auto py-6">
          {isInitialState ? (
            <div className="flex h-full min-h-[60vh] items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
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
                          handleInputChange({ target: { value: prompt } } as React.ChangeEvent<HTMLTextAreaElement>);
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
            <MessageList
              messages={messages}
              isStreaming={isStreaming}
              isLoadingMessages={isLoadingMessages}
              isRedirecting={isRedirecting}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <MessageInput />
    </div>
  );
}
