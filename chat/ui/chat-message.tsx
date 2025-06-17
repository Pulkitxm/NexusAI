"use client";

import { Bot, User } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";

import { Avatar } from "@/components/ui/avatar";

import type { MessageWithAttachments } from "@/types/chat";

interface ChatMessageProps {
  message: MessageWithAttachments;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
  const isUser = message.role === "USER";
  const [animatedContent, setAnimatedContent] = useState("");
  const previousContentRef = useRef("");
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Handle streaming animation for assistant messages
  useEffect(() => {
    if (isUser) {
      setAnimatedContent(message.content);
      return;
    }

    const currentContent = message.content;
    const previousContent = previousContentRef.current;

    // If content is shorter than before, it means we're starting fresh
    if (currentContent.length < previousContent.length) {
      setAnimatedContent(currentContent);
      previousContentRef.current = currentContent;
      return;
    }

    // If we have new content to animate
    if (currentContent.length > previousContent.length && isStreaming) {
      const newContent = currentContent.slice(previousContent.length);
      let currentIndex = 0;
      let lastTimestamp = 0;

      const animateNewContent = (timestamp: number) => {
        if (!lastTimestamp) lastTimestamp = timestamp;

        // Smoother animation with consistent timing (every 15ms for better readability)
        if (timestamp - lastTimestamp >= 15) {
          if (currentIndex < newContent.length) {
            setAnimatedContent(previousContent + newContent.slice(0, currentIndex + 1));
            currentIndex++;
            lastTimestamp = timestamp;
          }
        }

        if (currentIndex < newContent.length) {
          animationFrameRef.current = requestAnimationFrame(animateNewContent);
        }
      };

      // Clear any existing animation
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(animateNewContent);
    } else if (!isStreaming) {
      // If not streaming, show full content immediately
      setAnimatedContent(currentContent);
    }

    previousContentRef.current = currentContent;

    // Cleanup on unmount
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [message.content, isUser, isStreaming]);

  // Remove the HTML injection approach
  const displayContent = isUser ? message.content : animatedContent;

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </Avatar>
      )}

      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
        }`}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <div className="inline">
            <ReactMarkdown
              components={{
                // Override code blocks to have proper styling
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || "");
                  return match ? (
                    <pre className="rounded-md bg-gray-800 p-3 text-sm text-gray-100">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  ) : (
                    <code
                      className={`rounded bg-gray-200 px-1 py-0.5 text-sm dark:bg-gray-700 ${
                        isUser ? "bg-blue-500 text-white" : ""
                      }`}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                // Override links to have proper styling
                a: ({ children, href, ...props }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`underline hover:no-underline ${
                      isUser ? "text-blue-200" : "text-blue-600 dark:text-blue-400"
                    }`}
                    {...props}
                  >
                    {children}
                  </a>
                ),
                // Override lists to have proper styling
                ul: ({ children, ...props }) => (
                  <ul className="list-disc pl-4" {...props}>
                    {children}
                  </ul>
                ),
                ol: ({ children, ...props }) => (
                  <ol className="list-decimal pl-4" {...props}>
                    {children}
                  </ol>
                ),
                // Override blockquotes
                blockquote: ({ children, ...props }) => (
                  <blockquote
                    className={`border-l-4 pl-4 italic ${
                      isUser ? "border-blue-400 text-blue-100" : "border-gray-400 text-gray-600 dark:text-gray-400"
                    }`}
                    {...props}
                  >
                    {children}
                  </blockquote>
                ),
                // Override paragraphs to be inline when streaming
                p: ({ children, ...props }) => <span {...props}>{children}</span>
              }}
            >
              {displayContent}
            </ReactMarkdown>

            {/* Inline heartbeat dot as a separate React element */}
            {!isUser && isStreaming && (
              <span className="ml-1 inline-block animate-pulse text-blue-500 dark:text-blue-400">●</span>
            )}
          </div>
        </div>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
            <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </div>
        </Avatar>
      )}
    </div>
  );
}
