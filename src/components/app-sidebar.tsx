"use client";

import type React from "react";

import { useState, useEffect, Fragment, useRef } from "react";
import { Search, Plus, MessageSquare, Settings, Trash2, Key, User, LogIn } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useKeys } from "@/providers/key-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { signIn, useSession } from "next-auth/react";
import { useSettingsModal } from "@/providers/settings-modal-provider";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";
import type { Chat } from "@/types/chat";

const ITEM_HEIGHT = 68;
const OVERSCAN_COUNT = 5;
const VIRTUALIZATION_THRESHOLD = 15;

export function AppSidebar() {
  const { chats, deleteChat, loading } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);

  const { data: session, status } = useSession();
  const { openModal } = useSettingsModal();

  const user = session?.user;
  const { hasAnyKeys } = useKeys();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({
    startIndex: 0,
    endIndex: 0,
  });

  useEffect(() => {
    const sorted = chats.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    const filtered =
      searchQuery.trim() === ""
        ? sorted
        : sorted.filter(
            (chat) =>
              chat.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              chat.updatedAt.toLocaleDateString().includes(searchQuery.toLowerCase())
          );
    setFilteredChats(filtered);
  }, [searchQuery, chats]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || filteredChats.length < VIRTUALIZATION_THRESHOLD) return;

    const handleScroll = () => {
      const { scrollTop, clientHeight } = container;

      const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN_COUNT);
      const endIndex = Math.min(
        filteredChats.length,
        Math.ceil((scrollTop + clientHeight) / ITEM_HEIGHT) + OVERSCAN_COUNT
      );

      setVisibleRange({ startIndex, endIndex });
    };

    handleScroll();

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [filteredChats.length]);

  const Wrapper = status === "authenticated" ? Link : Fragment;

  const renderChatList = () => {
    if (filteredChats.length < VIRTUALIZATION_THRESHOLD) {
      return filteredChats.map((chat) => <ChatItem key={chat.id} chat={chat} deleteChat={deleteChat} />);
    }

    const visibleItems = filteredChats.slice(visibleRange.startIndex, visibleRange.endIndex);

    return (
      <div
        style={{
          height: `${filteredChats.length * ITEM_HEIGHT}px`,
          position: "relative",
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
                transform: `translateY(${actualIndex * ITEM_HEIGHT}px)`,
              }}
            >
              <ChatItem chat={chat} deleteChat={deleteChat} />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <Sidebar className="border-r border-border bg-background">
        <SidebarHeader className="p-3 border-b border-border/50">
          <div className="flex items-center justify-between mb-3">
            <Link href={"/"} className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h2 className="text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Nexus AI
              </h2>
            </Link>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <SidebarTrigger />
            </div>
          </div>

          <Link href="/new">
            <Button className="w-full mb-3 h-9 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 text-sm">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </Link>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          {!hasAnyKeys && (
            <div className="mt-3 p-2.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/50 rounded-md">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-xs">
                <Key className="w-3.5 h-3.5" />
                <span>Add API keys to start chatting</span>
              </div>
            </div>
          )}
        </SidebarHeader>

        <SidebarContent ref={scrollContainerRef} className="px-2 bg-background">
          <SidebarMenu>
            {loading ? (
              <div className="space-y-2 px-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No conversations yet</p>
                <p className="text-xs text-muted-foreground mt-1">Start a new chat to begin</p>
              </div>
            ) : (
              renderChatList()
            )}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-3 border-t border-border/50">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={openModal} className="hover:bg-accent/50 h-9">
                <Settings className="w-4 h-4" />
                <span className="text-sm">Manage API Keys</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {
              <Wrapper href={"/settings"}>
                <SidebarMenuItem>
                  {status === "loading" ? (
                    <div className="flex items-center gap-2 px-2 py-1.5">
                      <Skeleton className="w-5 h-5 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ) : status === "authenticated" ? (
                    <SidebarMenuButton className="flex items-center gap-2 px-2 py-1.5">
                      {user?.avatar ? (
                        <img src={user.avatar || "/placeholder.svg"} className="w-5 h-5 rounded-full" alt={user.name} />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                      <span className="truncate text-sm">{user?.name}</span>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton className="hover:bg-accent px-2 py-1.5" onClick={() => signIn("google")}>
                      <LogIn className="w-4 h-4" />
                      <span className="text-sm">Login</span>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              </Wrapper>
            }
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}

function ChatItem({ chat, deleteChat }: { chat: Chat; deleteChat: (id: string) => void }) {
  return (
    <SidebarMenuItem>
      <Link href={`/${chat.id}`}>
        <SidebarMenuButton className="w-full justify-start p-2 h-auto hover:bg-accent/50 rounded-md transition-colors group">
          <div className="flex-1 text-left min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm truncate pr-2">{chat.title}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => deleteChat(chat.id)} className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Chat
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-xs text-muted-foreground">{chat.updatedAt.toLocaleDateString()}</p>
          </div>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
}
