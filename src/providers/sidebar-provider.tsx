"use client";

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
  useReducer,
  useRef,
  useState
} from "react";

import { deleteChat, getUserChats } from "@/actions/chat";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { Chat } from "@/types/chat";

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

type ChatState = {
  chats: Chat[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
};

type ChatAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: Chat[] }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "DELETE_CHAT"; payload: string }
  | { type: "SET_CHATS"; payload: Chat[] };

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        chats: action.payload,
        error: null,
        initialized: true
      };
    case "FETCH_ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
        initialized: true
      };
    case "DELETE_CHAT":
      return {
        ...state,
        chats: state.chats.filter((chat) => chat.id !== action.payload)
      };
    case "SET_CHATS":
      return { ...state, chats: action.payload };
    default:
      return state;
  }
};

export const SidebarProvider = forwardRef<
  HTMLDivElement,
  ComponentProps<"div"> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(({ defaultOpen, open: openProp, onOpenChange: setOpenProp, style, children, ...props }, ref) => {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = useState(false);
  const loadingRef = useRef(false);

  const [chatState, dispatch] = useReducer(chatReducer, {
    chats: [],
    loading: false,
    error: null,
    initialized: false
  });

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
    loadingRef.current = true;

    dispatch({ type: "FETCH_START" });

    try {
      const userChats = await getUserChats();

      if (!userChats.success) {
        console.error("Error loading chats:", userChats.error);
        dispatch({
          type: "FETCH_ERROR",
          payload: userChats.error || "Failed to load chats."
        });
        return;
      }

      const mappedChats = userChats.chats?.map((chat) => ({
        id: chat.id,
        title: chat.title || `Chat ${chat.id}`,
        updatedAt: chat.updatedAt
      }));

      dispatch({ type: "FETCH_SUCCESS", payload: mappedChats || [] });
    } catch (error) {
      console.error("Error loading chats:", error);
      dispatch({
        type: "FETCH_ERROR",
        payload: (error as Error).message || "An unknown error occurred."
      });
    } finally {
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
      dispatch({ type: "DELETE_CHAT", payload: chatId });
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  }, []);

  useEffect(() => {
    if (open && !chatState.initialized && !loadingRef.current) {
      loadChats();
    }
  }, [open, chatState.initialized, loadChats]);

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
      chats: chatState.chats,
      loading: chatState.loading,
      error: chatState.error,
      deleteChat: handleDeleteChat,
      refreshChats
    }),
    [
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
      chatState.chats,
      chatState.loading,
      chatState.error,
      handleDeleteChat,
      refreshChats
    ]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style
            } as CSSProperties
          }
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
