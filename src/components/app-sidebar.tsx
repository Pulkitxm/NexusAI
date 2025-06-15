"use client";

import { Search, Plus, MessageSquare, Settings, Trash2, Key, User, LogIn, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useChat } from "@/providers/chat-provider";
import { useKeys } from "@/providers/key-provider";
import { useSettingsModal } from "@/providers/settings-modal-provider";
import { useSidebar } from "@/providers/sidebar-provider";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger
} from "./sidebar";

import type { Chat } from "@/types/chat";

const ITEM_HEIGHT = 68;
const OVERSCAN_COUNT = 5;
const VIRTUALIZATION_THRESHOLD = 15;

export function AppSidebar() {
  const { chats, deleteChat, loading, loadingChatId, generatingTitleForChat } = useSidebar();
  const { loadingChatId: chatLoadingId } = useChat();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);

  const { data: session, status } = useSession();
  const { openModal } = useSettingsModal();

  const user = session?.user;
  const { hasAnyKeys } = useKeys();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({
    startIndex: 0,
    endIndex: 0
  });

  useEffect(() => {
    const sorted = chats.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    const filtered =
      searchQuery.trim() === ""
        ? sorted
        : sorted.filter(
            (chat) =>
              chat.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              new Date(chat.updatedAt).toLocaleDateString().includes(searchQuery.toLowerCase())
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

  const Wrapper = status === "authenticated" ? Link : "div";

  const renderChatList = () => {
    if (filteredChats.length < VIRTUALIZATION_THRESHOLD) {
      return filteredChats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          deleteChat={deleteChat}
          isLoading={loadingChatId === chat.id || chatLoadingId === chat.id}
          isGeneratingTitle={generatingTitleForChat === chat.id}
        />
      ));
    }

    const visibleItems = filteredChats.slice(visibleRange.startIndex, visibleRange.endIndex);

    return (
      <div
        style={{
          height: `${filteredChats.length * ITEM_HEIGHT}px`,
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
                deleteChat={deleteChat}
                isLoading={loadingChatId === chat.id || chatLoadingId === chat.id}
                isGeneratingTitle={generatingTitleForChat === chat.id}
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <Sidebar className="border-r border-border bg-background">
        <SidebarHeader className="border-b border-border/50 p-3">
          <div className="mb-3 flex items-center justify-between">
            <Link href={"/"} className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-purple-500 to-purple-600">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h2 className="bg-gradient-to-r from-purple-600 to-purple-600 bg-clip-text text-base font-semibold text-transparent">
                Nexus AI
              </h2>
            </Link>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <SidebarTrigger />
            </div>
          </div>

          <Link href="/new">
            <Button className="mb-3 h-9 w-full border-0 bg-gradient-to-r from-purple-500 to-purple-600 text-sm text-white hover:from-purple-600 hover:to-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              New Chat
            </Button>
          </Link>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 text-sm"
            />
          </div>

          {!hasAnyKeys && (
            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-2.5 dark:border-amber-800/50 dark:bg-amber-950/50">
              <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
                <Key className="h-3.5 w-3.5" />
                <span>
                  Please{" "}
                  <span className="cursor-pointer underline" onClick={() => openModal()}>
                    Add API keys
                  </span>{" "}
                  to start chatting
                </span>
              </div>
            </div>
          )}
        </SidebarHeader>

        <SidebarContent ref={scrollContainerRef} className="bg-background px-2">
          <SidebarMenu>
            {loading ? (
              <div className="space-y-2 px-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg p-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <MessageSquare className="mx-auto mb-2 h-8 w-8 opacity-30" />
                <p className="text-sm font-medium">No conversations yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Start a new chat to begin</p>
              </div>
            ) : (
              renderChatList()
            )}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t border-border/50 p-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={openModal} className="h-9 hover:bg-accent/50">
                <Settings className="h-4 w-4" />
                <span className="text-sm">Manage API Keys</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <Wrapper href={status === "authenticated" ? "/settings" : ""}>
              <SidebarMenuItem>
                {status === "loading" ? (
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ) : status === "authenticated" ? (
                  <SidebarMenuButton className="flex items-center gap-2 px-2 py-1.5">
                    {user?.avatar ? (
                      <img
                        src={user.avatar || "/placeholder.svg?height=20&width=20"}
                        className="h-5 w-5 rounded-full"
                        alt={user.name || "User"}
                      />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <span className="truncate text-sm">{user?.name}</span>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton className="px-2 py-1.5 hover:bg-accent" onClick={() => signIn("google")}>
                    <LogIn className="h-4 w-4" />
                    <span className="text-sm">Login</span>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </Wrapper>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}

function ChatItem({
  chat,
  deleteChat,
  isLoading,
  isGeneratingTitle
}: {
  chat: Chat;
  deleteChat: (id: string) => void;
  isLoading: boolean;
  isGeneratingTitle: boolean;
}) {
  const params = useParams();
  const isActive = params?.id === chat.id;

  return (
    <SidebarMenuItem>
      <Link href={`/${chat.id}`}>
        <SidebarMenuButton className="group h-auto w-full justify-start rounded-md p-2 transition-colors hover:bg-accent/50 data-[active=true]:bg-accent">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex-shrink-0">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
              ) : (
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="mb-1 flex items-center justify-between">
                <span className="truncate pr-2 text-sm font-medium">
                  {isGeneratingTitle ? (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Generating title...
                    </span>
                  ) : (
                    chat.title
                  )}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Chat
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-xs text-muted-foreground">{new Date(chat.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
}
