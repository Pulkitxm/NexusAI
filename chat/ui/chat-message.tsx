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
  const [isAnimating, setIsAnimating] = useState(false);
  const previousContentRef = useRef("");
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle streaming animation for assistant messages
  useEffect(() => {
    if (isUser) {
      setAnimatedContent(message.content);
      setIsAnimating(false);
      return;
    }

    const currentContent = message.content;
    const previousContent = previousContentRef.current;

    // If content is shorter than before, it means we're starting fresh
    if (currentContent.length < previousContent.length) {
      setAnimatedContent(currentContent);
      setIsAnimating(false);
      previousContentRef.current = currentContent;
      return;
    }

    // If we have new content to animate
    if (currentContent.length > previousContent.length && isStreaming) {
      const newContent = currentContent.slice(previousContent.length);
      let currentIndex = 0;

      const animateNewContent = () => {
        if (currentIndex < newContent.length) {
          setAnimatedContent(previousContent + newContent.slice(0, currentIndex + 1));
          currentIndex++;

          // Adjust speed based on character type
          const baseDelay = 15; // Faster base delay for more responsive feel
          const delay = newContent[currentIndex] === " " ? baseDelay / 2 : baseDelay;

          animationTimeoutRef.current = setTimeout(animateNewContent, delay);
        } else {
          setIsAnimating(false);
        }
      };

      // Clear any existing animation
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }

      setIsAnimating(true);
      animateNewContent();
    } else if (!isStreaming) {
      // If not streaming, show full content immediately
      setAnimatedContent(currentContent);
      setIsAnimating(false);
    }

    previousContentRef.current = currentContent;

    // Cleanup timeout on unmount
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [message.content, isUser, isStreaming]);

  // Use animated content for assistant messages, regular content for user messages
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
              )
            }}
          >
            {displayContent}
          </ReactMarkdown>
        </div>

        {/* Cursor for streaming effect */}
        {isAnimating && !isUser && (
          <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-gray-600 dark:bg-gray-400" />
        )}
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
