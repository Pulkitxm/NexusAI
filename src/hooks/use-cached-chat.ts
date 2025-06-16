"use client";

import { useCallback, useEffect, useState } from "react";

import { getChatMessages, getChatWithMessages, getUserChats } from "@/actions/chat";
import { chatCache } from "@/lib/cache";
import { debugLog } from "@/lib/debug";

const CACHE_KEYS = {
  CHAT_MESSAGES: "chat_messages_",
  CHAT_WITH_MESSAGES: "chat_with_messages_",
  USER_CHATS: "user_chats"
};

export function useCachedChatMessages(chatId: string | null, share = false) {
  const [messages, setMessages] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(
    async (force = false) => {
      if (!chatId) {
        setMessages([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      const cacheKey = `${CACHE_KEYS.CHAT_MESSAGES}${chatId}${share ? "_shared" : ""}`;

      if (!force) {
        const cachedData = chatCache.get<Record<string, unknown>[]>(cacheKey);
        if (cachedData) {
          debugLog("Using cached chat messages", { chatId });
          setMessages(cachedData);
          setIsLoading(false);
          return;
        }
      }

      try {
        const result = await getChatMessages(chatId, share);

        if (result.success && result.messages) {
          chatCache.set(cacheKey, result.messages);
          setMessages(result.messages);
        } else {
          setError(result.error || "Failed to fetch messages");
          setMessages([]);
        }
      } catch (err) {
        console.error("Error fetching chat messages:", err);
        setError("An error occurred while fetching messages");
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    },
    [chatId, share]
  );

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const invalidateCache = useCallback(() => {
    if (chatId) {
      chatCache.invalidate(`${CACHE_KEYS.CHAT_MESSAGES}${chatId}${share ? "_shared" : ""}`);
    }
  }, [chatId, share]);

  return {
    messages,
    isLoading,
    error,
    refetch: () => fetchMessages(true),
    invalidateCache
  };
}

export function useCachedChatWithMessages(chatId: string | null) {
  const [chat, setChat] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChat = useCallback(
    async (force = false) => {
      if (!chatId) {
        setChat(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      const cacheKey = `${CACHE_KEYS.CHAT_WITH_MESSAGES}${chatId}`;

      if (!force) {
        const cachedData = chatCache.get<Record<string, unknown>>(cacheKey);
        if (cachedData) {
          debugLog("Using cached chat with messages", { chatId });
          setChat(cachedData);
          setIsLoading(false);
          return;
        }
      }

      try {
        const result = await getChatWithMessages(chatId);

        if (result.success && result.chat) {
          chatCache.set(cacheKey, result.chat);
          setChat(result.chat);
        } else {
          setError(result.error || "Failed to fetch chat");
          setChat(null);
        }
      } catch (err) {
        console.error("Error fetching chat with messages:", err);
        setError("An error occurred while fetching chat");
        setChat(null);
      } finally {
        setIsLoading(false);
      }
    },
    [chatId]
  );

  useEffect(() => {
    fetchChat();
  }, [fetchChat]);

  const invalidateCache = useCallback(() => {
    if (chatId) {
      chatCache.invalidate(`${CACHE_KEYS.CHAT_WITH_MESSAGES}${chatId}`);
    }
  }, [chatId]);

  return {
    chat,
    isLoading,
    error,
    refetch: () => fetchChat(true),
    invalidateCache
  };
}

export function useCachedUserChats() {
  const [chats, setChats] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = useCallback(async (force = false) => {
    setIsLoading(true);
    setError(null);

    const cacheKey = CACHE_KEYS.USER_CHATS;

    if (!force) {
      const cachedData = chatCache.get<Record<string, unknown>[]>(cacheKey);
      if (cachedData) {
        debugLog("Using cached user chats");
        setChats(cachedData);
        setIsLoading(false);
        return;
      }
    }

    try {
      const result = await getUserChats();

      if (result.success && result.chats) {
        chatCache.set(cacheKey, result.chats, chatCache.getSidebarChatsTTL());
        setChats(result.chats);
      } else {
        setError(result.error || "Failed to fetch chats");
        setChats([]);
      }
    } catch (err) {
      console.error("Error fetching user chats:", err);
      setError("An error occurred while fetching chats");
      setChats([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const invalidateCache = useCallback(() => {
    chatCache.invalidate(CACHE_KEYS.USER_CHATS);
  }, []);

  return {
    chats,
    isLoading,
    error,
    refetch: () => fetchChats(true),
    invalidateCache
  };
}
