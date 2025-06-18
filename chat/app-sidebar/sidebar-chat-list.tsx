"use client";

import { useSidebar } from "@/providers/use-sidebar";

import { ChatItem } from "./chat-item";
import { ChatListSkeleton } from "./chat-list-skeleton";
import { EmptyState } from "./empty-state";
import { VirtualizedChatList } from "./virtualized-chat-list";

import type { Chat } from "@/types/chat";

interface SidebarChatListProps {
  loading: boolean;
  filteredChats: Chat[];
  useVirtualization: boolean;
}

export function SidebarChatList({ loading, filteredChats, useVirtualization }: SidebarChatListProps) {
  const { loadingChatId, generatingTitleForChat } = useSidebar();
  const chatLoadingId = null;

  const groupChatsByTimePeriod = (chats: Chat[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setDate(lastMonth.getDate() - 30);

    const groups = {
      today: [] as Chat[],
      lastWeek: [] as Chat[],
      lastMonth: [] as Chat[],
      older: [] as Chat[]
    };

    chats.forEach((chat) => {
      const chatDate = new Date(chat.updatedAt);
      if (chatDate >= today) {
        groups.today.push(chat);
      } else if (chatDate >= lastWeek) {
        groups.lastWeek.push(chat);
      } else if (chatDate >= lastMonth) {
        groups.lastMonth.push(chat);
      } else {
        groups.older.push(chat);
      }
    });

    return groups;
  };

  if (loading) {
    return <ChatListSkeleton />;
  }

  if (filteredChats.length === 0) {
    return <EmptyState />;
  }

  if (useVirtualization) {
    return (
      <VirtualizedChatList
        chats={filteredChats}
        loadingChatId={loadingChatId}
        chatLoadingId={chatLoadingId}
        generatingTitleForChat={generatingTitleForChat}
      />
    );
  }

  const groupedChats = groupChatsByTimePeriod(filteredChats);

  return (
    <div className="mt-2 space-y-4">
      {groupedChats.today.length > 0 && (
        <div className="space-y-1">
          <h3 className="px-2 text-xs font-medium text-gray-500 dark:text-gray-400">Today</h3>
          {groupedChats.today.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isLoading={loadingChatId === chat.id || chatLoadingId === chat.id}
              isGeneratingTitle={generatingTitleForChat === chat.id}
            />
          ))}
        </div>
      )}
      {groupedChats.lastWeek.length > 0 && (
        <div className="space-y-1">
          <h3 className="px-2 text-xs font-medium text-gray-500 dark:text-gray-400">Last 7 days</h3>
          {groupedChats.lastWeek.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isLoading={loadingChatId === chat.id || chatLoadingId === chat.id}
              isGeneratingTitle={generatingTitleForChat === chat.id}
            />
          ))}
        </div>
      )}
      {groupedChats.lastMonth.length > 0 && (
        <div className="space-y-1">
          <h3 className="px-2 text-xs font-medium text-gray-500 dark:text-gray-400">Last 30 days</h3>
          {groupedChats.lastMonth.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isLoading={loadingChatId === chat.id || chatLoadingId === chat.id}
              isGeneratingTitle={generatingTitleForChat === chat.id}
            />
          ))}
        </div>
      )}
      {groupedChats.older.length > 0 && (
        <div className="space-y-1">
          <h3 className="px-2 text-xs font-medium text-gray-500 dark:text-gray-400">Older</h3>
          {groupedChats.older.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isLoading={loadingChatId === chat.id || chatLoadingId === chat.id}
              isGeneratingTitle={generatingTitleForChat === chat.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
