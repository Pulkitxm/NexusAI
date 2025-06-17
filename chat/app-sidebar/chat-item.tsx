"use client";

import { MessageSquare, Loader2, EllipsisVertical, Pencil, Share2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useRef, useCallback, useEffect } from "react";

import { useSidebar } from "@/providers/use-sidebar";

import { DropdownMenu } from "./dropdown-menu";

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
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateChatTitle, openDeleteModal, setLoadingChatId, openShareModal } = useSidebar();

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

  const dropdownItems = [
    {
      icon: Pencil,
      label: "Rename Chat",
      onClick: () => setIsRenaming(true)
    },
    {
      icon: Share2,
      label: "Share Chat",
      onClick: () => openShareModal(chat.id)
    },
    {
      icon: Trash2,
      label: "Delete Chat",
      onClick: () => openDeleteModal(chat.id),
      destructive: true
    }
  ];

  return (
    <div className="relative">
      <Link href={`/${chat.id}`} onDoubleClick={handleDoubleClick}>
        <div
          className={`group flex h-auto w-full cursor-pointer items-center justify-start rounded-md p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
            isActive ? "bg-gray-100 dark:bg-gray-800" : ""
          }`}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex-shrink-0">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
              ) : (
                <MessageSquare className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              )}
            </div>
            <div className="my-0.5 min-w-0 flex-1 py-1 text-left">
              <div className="mb-1 flex items-center justify-between">
                {isRenaming ? (
                  <form onSubmit={handleSubmit} className="flex-1">
                    <input
                      ref={inputRef}
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onBlur={handleRename}
                      className="h-6 w-full rounded border-2 border-black px-2 text-sm dark:border-white dark:bg-gray-800 dark:text-white"
                      onKeyDown={(e) => e.key === "Escape" && handleEscape()}
                    />
                  </form>
                ) : (
                  <span className="truncate pr-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {isGeneratingTitle ? (
                      <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Generating title...
                      </span>
                    ) : (
                      chat.title
                    )}
                  </span>
                )}
                <button
                  className="h-5 w-5 cursor-pointer p-0 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDropdown(!showDropdown);
                  }}
                >
                  <EllipsisVertical className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {showDropdown && (
        <DropdownMenu
          items={dropdownItems}
          onClose={() => setShowDropdown(false)}
          className="absolute top-8 right-2 z-10"
        />
      )}
    </div>
  );
}
