"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from "react";

import { deleteChat, getChats, updateChatTitle as updateChatTitleAction } from "@/actions/chat";
import { ShareModal } from "@/chat/share-modal";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

import type { Chat } from "@/types/chat";

const SIDEBAR_STORAGE_KEY = "sidebar:state";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContext = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
  chats: Chat[];
  loading: boolean;
  deleteChat: (chatId: string) => void;
  refreshChats: () => void;
  loadingChatId: string | null;
  setLoadingChatId: (chatId: string | null) => void;
  addChat: (chat: Chat) => void;
  updateChatTitle: (chatId: string, title: string) => Promise<void>;
  generatingTitleForChat: string | null;
  setGeneratingTitleForChat: (chatId: string | null) => void;
  shareModelForChatID: string | null;
  openShareModal: (chatId: string | null) => void;
};

const SidebarContext = createContext<SidebarContext | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

const getStoredSidebarState = (): boolean => {
  if (typeof window === "undefined") return true;
  try {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return stored ? JSON.parse(stored) : true;
  } catch {
    return true;
  }
};

const setSidebarState = (open: boolean): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(open));
  } catch {
    // Ignore storage errors
  }
};

interface SidebarProviderProps {
  children: ReactNode;
  defaultOpen?: boolean;
}

export function SidebarProvider({ children, defaultOpen }: SidebarProviderProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [open, setOpenState] = useState(() => defaultOpen ?? getStoredSidebarState());
  const [openMobile, setOpenMobile] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingChatId, setLoadingChatId] = useState<string | null>(null);
  const [generatingTitleForChat, setGeneratingTitleForChat] = useState<string | null>(null);
  const [shareModelForChatID, setShareModelForChatID] = useState<string | null>(null);

  const setOpen = useCallback(
    (newOpen: boolean) => {
      setOpenState(newOpen);
      if (!isMobile) {
        setSidebarState(newOpen);
      }
    },
    [isMobile]
  );

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setOpenMobile((prev) => !prev);
    } else {
      setOpen(!open);
    }
  }, [isMobile, open, setOpen]);

  const fetchChats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getChats();
      if (!response.success) throw new Error(response.error);
      const mappedChats = response.chats?.map((chat) => ({
        id: chat.id,
        title: chat.title || `Chat ${chat.id}`,
        updatedAt: chat.updatedAt
      }));
      setChats(mappedChats || []);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshChats = useCallback(() => {
    fetchChats();
  }, [fetchChats]);

  const handleDeleteChat = useCallback(
    async (chatId: string) => {
      setLoadingChatId(chatId);
      try {
        const res = await deleteChat({ chatId });
        if (res.success) {
          setChats((prev) => prev.filter((chat) => chat.id !== chatId));
          router.push("/");
        }
      } finally {
        setLoadingChatId(null);
      }
    },
    [router]
  );

  const addChat = useCallback((chat: Chat) => {
    setChats((prev) => [chat, ...prev]);
  }, []);

  const updateChatTitle = useCallback(async (chatId: string, title: string) => {
    setLoadingChatId(chatId);
    try {
      await updateChatTitleAction({ chatId, title });
      setChats((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, title, updatedAt: new Date() } : chat)));
    } finally {
      setLoadingChatId(null);
    }
  }, []);

  const openShareModal = useCallback((chatId: string | null) => {
    setShareModelForChatID(chatId);
  }, []);

  useEffect(() => {
    if (open) {
      fetchChats();
    }
  }, [open, fetchChats]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const contextValue = useMemo<SidebarContext>(
    () => ({
      state: open ? "expanded" : "collapsed",
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
      chats,
      loading,
      deleteChat: handleDeleteChat,
      refreshChats,
      loadingChatId,
      setLoadingChatId,
      addChat,
      updateChatTitle,
      generatingTitleForChat,
      setGeneratingTitleForChat,
      shareModelForChatID,
      openShareModal
    }),
    [
      open,
      setOpen,
      isMobile,
      openMobile,
      toggleSidebar,
      chats,
      loading,
      handleDeleteChat,
      refreshChats,
      loadingChatId,
      addChat,
      updateChatTitle,
      generatingTitleForChat,
      shareModelForChatID,
      openShareModal
    ]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
      <ShareModal />
    </SidebarContext.Provider>
  );
}
