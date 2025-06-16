"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseSmoothAutoScrollOptions {
  threshold?: number;
  smoothScrollDuration?: number;
  streamingScrollInterval?: number;
}

export function useSmoothAutoScroll({
  threshold = 100,
  smoothScrollDuration = 300,
  streamingScrollInterval = 50
}: UseSmoothAutoScrollOptions = {}) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const streamingIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastScrollTop = useRef(0);
  const isScrollingToBottom = useRef(false);

  const isNearBottom = useCallback(() => {
    const element = scrollAreaRef.current;
    if (!element) return false;

    const { scrollTop, scrollHeight, clientHeight } = element;
    return scrollHeight - scrollTop - clientHeight < threshold;
  }, [threshold]);

  const scrollToBottom = useCallback(
    (smooth = true) => {
      const element = scrollAreaRef.current;
      if (!element) return;

      isScrollingToBottom.current = true;

      if (smooth) {
        element.scrollTo({
          top: element.scrollHeight,
          behavior: "smooth"
        });

        setTimeout(() => {
          isScrollingToBottom.current = false;
        }, smoothScrollDuration);
      } else {
        element.scrollTop = element.scrollHeight;
        isScrollingToBottom.current = false;
      }
    },
    [smoothScrollDuration]
  );

  const forceScrollToBottom = useCallback(() => {
    scrollToBottom(false);
  }, [scrollToBottom]);

  const handleScroll = useCallback(() => {
    const element = scrollAreaRef.current;
    if (!element || isScrollingToBottom.current) return;

    const { scrollTop, scrollHeight, clientHeight } = element;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 5;
    const scrollDirection = scrollTop > lastScrollTop.current ? "down" : "up";

    lastScrollTop.current = scrollTop;

    if (scrollDirection === "up" && !isAtBottom) {
      setIsAutoScrollEnabled(false);
      setIsUserScrolling(true);
    } else if (isAtBottom) {
      setIsAutoScrollEnabled(true);
      setIsUserScrolling(false);
    }

    setShowScrollButton(!isNearBottom());

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 1000);
  }, [isNearBottom]);

  const startStreamingScroll = useCallback(() => {
    if (!isAutoScrollEnabled) return;

    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
    }

    streamingIntervalRef.current = setInterval(() => {
      if (isAutoScrollEnabled && !isUserScrolling) {
        const element = scrollAreaRef.current;
        if (element) {
          element.scrollTop = element.scrollHeight;
        }
      }
    }, streamingScrollInterval);
  }, [isAutoScrollEnabled, isUserScrolling, streamingScrollInterval]);

  const stopStreamingScroll = useCallback(() => {
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    const element = scrollAreaRef.current;
    if (!element) return;

    element.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      element.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }
    };
  }, [handleScroll]);

  return {
    scrollAreaRef,
    showScrollButton,
    isAutoScrollEnabled,
    isUserScrolling,
    scrollToBottom,
    forceScrollToBottom,
    startStreamingScroll,
    stopStreamingScroll,
    isNearBottom
  };
}
