"use client";

import {
  type ComponentProps,
  createContext,
  type Dispatch,
  forwardRef,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  useRef
} from "react";

import { deleteChat, getUserChats, updateChatTitle as updateChatTitleAction } from "@/actions/chat";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useDebounce } from "@/hooks/use-debounce";
import { useIsMobile } from "@/hooks/use-mobile";

import type { Chat } from "@/types/chat";
import type React from "react";

export const SIDEBAR_STORAGE_KEY = "sidebar:state";
export const SIDEBAR_WIDTH = "16rem";
export const SIDEBAR_WIDTH_MOBILE = "18rem";
export const SIDEBAR_WIDTH_ICON = "3rem";
export const SIDEBAR_KEYBOARD_SHORTCUT = "b";

export type SidebarContext = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  openMobile: boolean;
  setOpenMobile: Dispatch<SetStateAction<boolean>>;
  isMobile: boolean;
  toggleSidebar: () => void;
  chats: Chat[];
  loading: boolean;
  error: string | null;
  deleteChat: (chatId: string) => void;
  refreshChats: () => void;
  loadingChatId: string | null;
  setLoadingChatId: Dispatch<SetStateAction<string | null>>;
  addChat: (chat: Chat) => void;
  updateChatTitle: (chatId: string, title: string) => void;
  generatingTitleForChat: string | null;
  setGeneratingTitleForChat: (chatId: string | null) => void;
};

const SidebarContext = createContext<SidebarContext | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

const getStoredSidebarState = (): boolean => {
  if (typeof window === "undefined") return true;
  try {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return stored ? JSON.parse(stored) : true;
  } catch (e) {
    console.error("Failed to parse sidebar state from localStorage", e);
    return true;
  }
};

const setSidebarState = (open: boolean): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(open));
  } catch (e) {
    console.error("Failed to save sidebar state to localStorage", e);
  }
};

export const SidebarProvider = forwardRef<
  HTMLDivElement,
  ComponentProps<"div"> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: ReactNode;
  }
>(({ defaultOpen, open: openProp, onOpenChange: setOpenProp, style, children, ...props }, ref) => {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [loadingChatId, setLoadingChatId] = useState<string | null>(null);
  const [generatingTitleForChat, setGeneratingTitleForChatState] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [_open, _setOpen] = useState(() => {
    if (defaultOpen !== undefined) return defaultOpen;
    return getStoredSidebarState();
  });

  const open = openProp ?? _open;

  const setOpen = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const newOpenState = typeof value === "function" ? value(open) : value;

      if (setOpenProp) {
        setOpenProp(newOpenState);
      } else {
        _setOpen(newOpenState);
      }

      if (!isMobile) {
        setSidebarState(newOpenState);
      }
    },
    [open, setOpenProp, isMobile]
  );

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setOpenMobile((prev) => !prev);
    } else {
      setOpen((prev) => !prev);
    }
  }, [isMobile, setOpen]);

  const loadChats = useCallback(async () => {
    if (loadingRef.current) return;

    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const userChats = await getUserChats();

      if (!userChats.success) {
        console.error("Error loading chats:", userChats.error);
        setError(userChats.error || "Failed to load chats.");
        return;
      }

      const mappedChats = userChats.chats?.map((chat) => ({
        id: chat.id,
        title: chat.title || `Chat ${chat.id}`,
        updatedAt: chat.updatedAt
      }));

      setChats(mappedChats || []);
      setInitialized(true);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      console.error("Error loading chats:", error);
      setError((error as Error).message || "An unknown error occurred.");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  const debouncedLoadChats = useDebounce(loadChats, 300);

  const refreshChats = useCallback(() => {
    debouncedLoadChats();
  }, [debouncedLoadChats]);

  const handleDeleteChat = useCallback(async (chatId: string) => {
    setLoadingChatId(chatId);
    try {
      const res = await deleteChat(chatId);
      if (!res.success) {
        console.error("Error deleting chat:", res.error);
        return;
      }
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    } catch (error) {
      console.error("Error deleting chat:", error);
    } finally {
      setLoadingChatId(null);
    }
  }, []);

  const addChat = useCallback((chat: Chat) => {
    setChats((prev) => [chat, ...prev]);
  }, []);

  const updateChatTitle = useCallback(async (chatId: string, title: string) => {
    setLoadingChatId(chatId);
    try {
      await updateChatTitleAction(chatId, title);
      setChats((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, title, updatedAt: new Date() } : chat)));
    } catch (error) {
      console.error("Error updating chat title:", error);
    } finally {
      setLoadingChatId(null);
    }
  }, []);

  useEffect(() => {
    if (open && !initialized) {
      loadChats();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [open, initialized, loadChats]);

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
      error,
      deleteChat: handleDeleteChat,
      refreshChats,
      loadingChatId,
      setLoadingChatId,
      addChat,
      updateChatTitle,
      generatingTitleForChat,
      setGeneratingTitleForChat: setGeneratingTitleForChatState
    }),
    [
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
      chats,
      loading,
      error,
      handleDeleteChat,
      refreshChats,
      loadingChatId,
      setLoadingChatId,
      addChat,
      updateChatTitle,
      generatingTitleForChat,
      setGeneratingTitleForChatState
    ]
  );

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const tooltipStyle: React.CSSProperties = {
    "--sidebar-width": SIDEBAR_WIDTH,
    "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
    ...style
  } as React.CSSProperties;

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div style={tooltipStyle} ref={ref} {...props}>
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
});

SidebarProvider.displayName = "SidebarProvider";
