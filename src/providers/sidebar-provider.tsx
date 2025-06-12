"use client";

import { deleteChat, getUserChats } from "@/actions/chat";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Chat } from "@/types/chat";
import {
  ComponentProps,
  createContext,
  CSSProperties,
  Dispatch,
  forwardRef,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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
  setChats: Dispatch<SetStateAction<Chat[]>>;
  loading: boolean;
  deleteChat: (chatId: string) => void;
  refreshChats: () => void;
};

export const SidebarContext = createContext<SidebarContext | null>(null);

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
  } catch {
    return true;
  }
};

const setSidebarState = (open: boolean): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(open));
  } catch {}
};

export const SidebarProvider = forwardRef<
  HTMLDivElement,
  ComponentProps<"div"> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(({ defaultOpen, open: openProp, onOpenChange: setOpenProp, className, style, children, ...props }, ref) => {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);

  const loadingRef = useRef(false);
  const mountedRef = useRef(true);

  const [_open, _setOpen] = useState(() => {
    if (defaultOpen !== undefined) return defaultOpen;
    return getStoredSidebarState();
  });

  const open = openProp ?? _open;
  const setOpen = useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;

      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      if (!isMobile) {
        setSidebarState(openState);
      }
    },
    [setOpenProp, open, isMobile]
  );

  const toggleSidebar = useCallback(() => {
    return isMobile ? setOpenMobile((prev) => !prev) : setOpen((prev) => !prev);
  }, [isMobile, setOpen]);

  const loadChats = useCallback(async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const userChats = await getUserChats();

      if (!mountedRef.current) return;

      if (!userChats.success) {
        console.error("Error loading chats:", userChats.error);
        return;
      }

      const mappedChats = userChats.chats?.map((chat) => ({
        id: chat.id,
        title: chat.title || `Chat ${chat.id}`,
        updatedAt: chat.updatedAt,
      }));

      setChats(mappedChats || []);
    } catch (error) {
      if (mountedRef.current) {
        console.error("Error loading chats:", error);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      loadingRef.current = false;
    }
  }, []);

  const refreshChats = useCallback(() => {
    loadChats();
  }, [loadChats]);

  const handleDeleteChat = useCallback(async (chatId: string) => {
    try {
      const res = await deleteChat(chatId);
      if (!res.success) {
        console.error("Error deleting chat:", res.error);
        return;
      }

      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  }, []);

  useEffect(() => {
    if (open && chats.length === 0 && !loadingRef.current) {
      loadChats();
    }
  }, [open, chats.length, loadChats]);

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

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

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
      setChats,
      loading,
      deleteChat: handleDeleteChat,
      refreshChats,
    }),
    [open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar, chats, loading, handleDeleteChat, refreshChats]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as CSSProperties
          }
          className={cn("group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar", className)}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
});

SidebarProvider.displayName = "SidebarProvider";
