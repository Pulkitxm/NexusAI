"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
  Dispatch,
  SetStateAction
} from "react";

import { DeleteChatModal } from "@/chat/modals/delete-modal";
import { RenameChatModal } from "@/chat/modals/rename-modal";
import { ShareModal } from "@/chat/modals/share-modal";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useChats, useDeleteChat, useUpdateChatTitle } from "@/hooks/use-chat-cache";
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
  setChats: Dispatch<SetStateAction<Chat[]>>;
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
  deleteModelForChatID: string | null;
  openDeleteModal: (chatId: string | null) => void;
  renameModelForChatID: string | null;
  openRenameModal: (chatId: string | null) => void;
};

const SidebarContext = createContext<SidebarContext | undefined>(undefined);

function getStoredSidebarState(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
  return stored ? JSON.parse(stored) : true;
}

function setSidebarState(open: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(open));
}

interface SidebarProviderProps {
  children: ReactNode;
  defaultOpen?: boolean;
}

export function SidebarProvider({ children, defaultOpen }: SidebarProviderProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [open, setOpenState] = useState(() => defaultOpen ?? getStoredSidebarState());
  const [openMobile, setOpenMobile] = useState(false);
  const [loadingChatId, setLoadingChatId] = useState<string | null>(null);
  const [generatingTitleForChat, setGeneratingTitleForChat] = useState<string | null>(null);
  const [shareModelForChatID, setShareModelForChatID] = useState<string | null>(null);
  const [deleteModelForChatID, setDeleteModelForChatID] = useState<string | null>(null);
  const [renameModelForChatID, setRenameModelForChatID] = useState<string | null>(null);

  // Use cached hooks
  const { data: chats = [], isLoading: loading, refetch: refreshChats } = useChats();
  const deleteChatMutation = useDeleteChat();
  const updateChatTitleMutation = useUpdateChatTitle();

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

  const handleDeleteChat = useCallback(
    async (chatId: string) => {
      setLoadingChatId(chatId);
      try {
        await deleteChatMutation.mutateAsync({ chatId });
        router.push("/");
      } catch (error) {
        console.error("Error deleting chat:", error);
      } finally {
        setLoadingChatId(null);
      }
    },
    [deleteChatMutation, router]
  );

  const addChat = useCallback((chat: Chat) => {
    // This will be handled by the cache automatically when a new chat is created
  }, []);

  const updateChatTitle = useCallback(
    async (chatId: string, title: string) => {
      setLoadingChatId(chatId);
      try {
        await updateChatTitleMutation.mutateAsync({ chatId, title });
      } catch (error) {
        console.error("Error updating chat title:", error);
      } finally {
        setLoadingChatId(null);
      }
    },
    [updateChatTitleMutation]
  );

  const openShareModal = useCallback((chatId: string | null) => {
    setShareModelForChatID(chatId);
  }, []);

  const openDeleteModal = useCallback((chatId: string | null) => {
    setDeleteModelForChatID(chatId);
  }, []);

  const openRenameModal = useCallback((chatId: string | null) => {
    setRenameModelForChatID(chatId);
  }, []);

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
      setChats: () => {}, // No-op since we're using cached data
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
      openShareModal,
      deleteModelForChatID,
      openDeleteModal,
      renameModelForChatID,
      openRenameModal
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
      openShareModal,
      deleteModelForChatID,
      openDeleteModal,
      renameModelForChatID,
      openRenameModal
    ]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
      <ShareModal />
      <DeleteChatModal />
      <RenameChatModal />
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
