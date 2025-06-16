"use client";

import {
  Search,
  Plus,
  MessageSquare,
  Settings,
  Trash2,
  Key,
  User,
  LogIn,
  Loader2,
  EllipsisVertical,
  Pencil,
  Share2
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect, useRef, useCallback } from "react";

import LogoIcon from "@/assets/logo.png";
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
import { cn } from "@/lib/utils";
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
  const { chats, loading, loadingChatId, generatingTitleForChat } = useSidebar();
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

  const renderChatList = () => {
    if (filteredChats.length === 0) {
      return (
        <div className="py-8 text-center text-muted-foreground">
          <MessageSquare className="mx-auto mb-2 h-8 w-8 opacity-30" />
          <p className="text-sm font-medium">No conversations yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Start a new chat to begin</p>
        </div>
      );
    }

    const groupedChats = groupChatsByTimePeriod(filteredChats);
    const totalChats = filteredChats.length;

    if (totalChats < VIRTUALIZATION_THRESHOLD) {
      return (
        <div className="space-y-4">
          {groupedChats.today.length > 0 && (
            <div className="space-y-1">
              <h3 className="px-2 text-xs font-medium text-muted-foreground">Today</h3>
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
              <h3 className="px-2 text-xs font-medium text-muted-foreground">Last 7 days</h3>
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
              <h3 className="px-2 text-xs font-medium text-muted-foreground">Last 30 days</h3>
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
              <h3 className="px-2 text-xs font-medium text-muted-foreground">Older</h3>
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

    const visibleItems = filteredChats.slice(visibleRange.startIndex, visibleRange.endIndex);

    return (
      <div
        style={{
          height: `${totalChats * ITEM_HEIGHT}px`,
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
  };

  const AuthOption = (
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
  );

  return (
    <>
      <Sidebar className="border-r border-border bg-background">
        <SidebarHeader className="border-b border-border/50 p-3">
          <div className="mb-3 flex items-center justify-between">
            <Link href={"/"} className="flex items-center gap-2">
              <img
                src={LogoIcon.src}
                alt="Logo"
                className="pointer-events-none h-8 w-8 object-contain"
                draggable={false}
              />
              <h2 className="bg-gradient-to-r from-purple-600 to-purple-600 bg-clip-text text-base font-semibold text-transparent">
                Nexus AI
              </h2>
            </Link>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <SidebarTrigger />
            </div>
          </div>

          <Link href="/">
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

            {status === "authenticated" ? <Link href={"/settings"}>{AuthOption}</Link> : AuthOption}
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}

function ChatItem({
  chat,
  isLoading,
  isGeneratingTitle
}: {
  chat: Chat;
  isLoading: boolean;
  isGeneratingTitle: boolean;
}) {
  const params = useParams();
  const isActive = params?.id === chat.id;
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(chat.title || "");
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateChatTitle, deleteChat, setLoadingChatId, openShareModal } = useSidebar();
  const handleRename = useCallback(async () => {
    setIsRenaming(false);
    if (newTitle.trim() === chat.title) return;

    try {
      setLoadingChatId(chat.id);
      await updateChatTitle(chat.id, newTitle.trim());
    } catch (error) {
      console.error("Error updating chat title:", error);
    } finally {
      setLoadingChatId(null);
    }
  }, [chat.id, chat.title, newTitle, setLoadingChatId, updateChatTitle]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setIsRenaming(true);
  }, []);

  const handleEscape = useCallback(() => {
    setIsRenaming(false);
    setNewTitle(chat.title || "");
  }, [chat.title]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleRename();
    },
    [handleRename]
  );

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  return (
    <SidebarMenuItem>
      <Link href={`/${chat.id}`} onDoubleClick={handleDoubleClick}>
        <SidebarMenuButton
          className={cn(
            "group h-auto w-full justify-start rounded-md p-2 transition-colors hover:bg-accent/50",
            isActive && "bg-accent"
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex-shrink-0">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
              ) : (
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="my-0.5 min-w-0 flex-1 py-1 text-left">
              <div className="mb-1 flex items-center justify-between">
                {isRenaming ? (
                  <form onSubmit={handleSubmit} className="flex-1">
                    <Input
                      ref={inputRef}
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onBlur={handleRename}
                      className="h-6 border-2 border-black text-sm dark:border-white"
                      onKeyDown={(e) => e.key === "Escape" && handleEscape()}
                    />
                  </form>
                ) : (
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
                )}
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
                      <EllipsisVertical className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setIsRenaming(true)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Rename Chat
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openShareModal(chat.id)}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Chat
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deleteChat(chat.id)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Chat
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
}
