"use client";

import { MessageSquare, Loader2, EllipsisVertical, Pencil, Share2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useRef, useCallback, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/providers/use-sidebar";

import type { Chat } from "@/types/chat";
import type React from "react";

interface ChatItemProps {
  chat: Chat;
  isLoading: boolean;
  isGeneratingTitle: boolean;
}

export function ChatItem({ chat, isLoading, isGeneratingTitle }: ChatItemProps) {
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
            "group hover:bg-accent/50 h-auto w-full justify-start rounded-md p-2 transition-colors",
            isActive && "bg-accent"
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex-shrink-0">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
              ) : (
                <MessageSquare className="text-muted-foreground h-4 w-4" />
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
                      <span className="text-muted-foreground flex items-center gap-2">
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
                      <EllipsisVertical className="text-muted-foreground h-3 w-3" />
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
