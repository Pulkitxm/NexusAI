"use client";

import { useState, useEffect, useRef } from "react";

import { ChatItem } from "./chat-item";

import type { Chat } from "@/types/chat";

const ITEM_HEIGHT = 68;
const OVERSCAN_COUNT = 5;

interface VirtualizedChatListProps {
  chats: Chat[];
  loadingChatId: string | null;
  chatLoadingId: string | null;
  generatingTitleForChat: string | null;
}

export function VirtualizedChatList({
  chats,
  loadingChatId,
  chatLoadingId,
  generatingTitleForChat
}: VirtualizedChatListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({
    startIndex: 0,
    endIndex: 0
  });

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, clientHeight } = container;

      const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN_COUNT);
      const endIndex = Math.min(chats.length, Math.ceil((scrollTop + clientHeight) / ITEM_HEIGHT) + OVERSCAN_COUNT);

      setVisibleRange({ startIndex, endIndex });
    };

    handleScroll();

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [chats.length]);

  const visibleItems = chats.slice(visibleRange.startIndex, visibleRange.endIndex);

  return (
    <div
      ref={scrollContainerRef}
      style={{
        height: `${chats.length * ITEM_HEIGHT}px`,
        position: "relative"
      }}
    >
      {visibleItems.map((chat, index) => {
        const actualIndex = visibleRange.startIndex + index;
        return (
          <div
            key={chat.id}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${ITEM_HEIGHT}px`,
              transform: `translateY(${actualIndex * ITEM_HEIGHT}px)`
            }}
          >
            <ChatItem
              chat={chat}
              isLoading={loadingChatId === chat.id || chatLoadingId === chat.id}
              isGeneratingTitle={generatingTitleForChat === chat.id}
            />
          </div>
        );
      })}
    </div>
  );
}
