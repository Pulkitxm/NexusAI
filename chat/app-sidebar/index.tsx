"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader as SidebarHeaderPrimitive,
  SidebarMenu
} from "@/components/ui/sidebar";
import { useKeys } from "@/providers/use-keys";
import { useSidebar } from "@/providers/use-sidebar";

import { SidebarChatList } from "./sidebar-chat-list";
import { SidebarFooterSection } from "./sidebar-footer-section";
import { SidebarHeader } from "./sidebar-header";

import type { Chat } from "@/types/chat";

const VIRTUALIZATION_THRESHOLD = 15;

export function AppSidebar() {
  const { chats, loading } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const { data: session, status } = useSession();
  const { hasAnyKeys } = useKeys();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  return (
    <Sidebar className="border-border bg-background border-r">
      <SidebarHeaderPrimitive className="border-border/50 border-b p-3">
        <SidebarHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} hasAnyKeys={hasAnyKeys} />
      </SidebarHeaderPrimitive>

      <SidebarContent ref={scrollContainerRef} className="bg-background px-2">
        <SidebarMenu>
          <SidebarChatList
            loading={loading}
            filteredChats={filteredChats}
            useVirtualization={filteredChats.length >= VIRTUALIZATION_THRESHOLD}
          />
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-border/50 border-t p-3">
        <SidebarFooterSection session={session} status={status} />
      </SidebarFooter>
    </Sidebar>
  );
}
