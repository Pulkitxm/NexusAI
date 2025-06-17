"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";

import { useKeys } from "@/providers/use-keys";
import { useSidebar } from "@/providers/use-sidebar";

import { SidebarChatList } from "./sidebar-chat-list";
import { SidebarFooterSection } from "./sidebar-footer-section";
import { SidebarHeader } from "./sidebar-header";

import type { Chat } from "@/types/chat";

const VIRTUALIZATION_THRESHOLD = 15;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isMobile;
}

export function AppSidebar() {
  const { open, setOpen, chats, loading } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const { data: session, status } = useSession();
  const { hasAnyKeys } = useKeys();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

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

  const desktopVariants: Variants = {
    open: {
      width: 256,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    closed: {
      width: 0,
      opacity: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };

  const mobileVariants: Variants = {
    open: {
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    closed: {
      x: "-100%",
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };

  const backdropVariants: Variants = {
    open: {
      opacity: 1,
      transition: { duration: 0.2 }
    },
    closed: {
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const handleBackdropClick = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  if (!isMobile) {
    return (
      <motion.div
        initial={hasMounted ? "closed" : false}
        animate={open ? "open" : "closed"}
        variants={desktopVariants}
        className="flex h-full flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
        style={{ overflow: "hidden" }}
      >
        <motion.div
          initial={hasMounted ? { opacity: 0 } : false}
          animate={{ opacity: open ? 1 : 0 }}
          transition={{ delay: open ? 0.1 : 0, duration: 0.2 }}
          className="flex h-full w-64 flex-col"
        >
          <div className="border-b border-gray-200/50 p-3 dark:border-gray-800/50">
            <SidebarHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} hasAnyKeys={hasAnyKeys} />
          </div>
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto bg-white px-2 dark:bg-gray-900">
            <SidebarChatList
              loading={loading}
              filteredChats={filteredChats}
              useVirtualization={filteredChats.length >= VIRTUALIZATION_THRESHOLD}
            />
          </div>
          <div className="border-t border-gray-200/50 p-3 dark:border-gray-800/50">
            <SidebarFooterSection session={session} status={status} />
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={hasMounted ? "closed" : false}
            animate="open"
            exit="closed"
            variants={backdropVariants}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={handleBackdropClick}
          />
          <motion.div
            initial={hasMounted ? "closed" : false}
            animate="open"
            exit="closed"
            variants={mobileVariants}
            className="fixed top-0 left-0 z-50 flex h-full w-80 flex-col border-r border-gray-200 bg-white shadow-xl md:hidden dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="border-b border-gray-200/50 p-3 dark:border-gray-800/50">
              <SidebarHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} hasAnyKeys={hasAnyKeys} />
            </div>
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto bg-white px-2 dark:bg-gray-900">
              <SidebarChatList
                loading={loading}
                filteredChats={filteredChats}
                useVirtualization={filteredChats.length >= VIRTUALIZATION_THRESHOLD}
              />
            </div>
            <div className="border-t border-gray-200/50 p-3 dark:border-gray-800/50">
              <SidebarFooterSection session={session} status={status} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
