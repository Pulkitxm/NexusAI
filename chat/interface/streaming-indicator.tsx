"use client";

import { useEffect, useState, useRef } from "react";

interface StreamingIndicatorProps {
  content: string;
  isStreaming: boolean;
  isUser: boolean;
  children: (animatedContent: string) => React.ReactNode;
}

export function StreamingIndicator({ content, isStreaming, isUser, children }: StreamingIndicatorProps) {
  const [animatedContent, setAnimatedContent] = useState("");
  const previousContentRef = useRef("");
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isUser) {
      setAnimatedContent(content);
      return;
    }

    const currentContent = content;
    const previousContent = previousContentRef.current;

    if (currentContent.length < previousContent.length) {
      setAnimatedContent(currentContent);
      previousContentRef.current = currentContent;
      return;
    }

    if (currentContent.length > previousContent.length && isStreaming) {
      const newContent = currentContent.slice(previousContent.length);
      let currentIndex = 0;
      let lastTimestamp = 0;

      const animateNewContent = (timestamp: number) => {
        if (!lastTimestamp) lastTimestamp = timestamp;

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

      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(animateNewContent);
    } else if (!isStreaming) {
      setAnimatedContent(currentContent);
    }

    previousContentRef.current = currentContent;

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [content, isUser, isStreaming]);

  const displayContent = isUser ? content : animatedContent;

  return <>{children(displayContent)}</>;
}
