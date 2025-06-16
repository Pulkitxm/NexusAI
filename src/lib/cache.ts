"use client";

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  expiresAt: number;
};

class ChatCache {
  private static instance: ChatCache;
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private DEFAULT_TTL_MS = 5 * 60 * 1000;
  private SIDEBAR_CHATS_TTL_MS = 30 * 60 * 1000;
  private CHAT_MESSAGES_TTL_MS = 60 * 60 * 1000;

  private constructor() {
    this.loadFromLocalStorage();
  }

  public static getInstance(): ChatCache {
    if (!ChatCache.instance) {
      ChatCache.instance = new ChatCache();
    }
    return ChatCache.instance;
  }

  private isLocalStorageAvailable(): boolean {
    try {
      const testKey = "__test_storage__";
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  private loadFromLocalStorage(): void {
    if (!this.isLocalStorageAvailable()) return;

    try {
      const sidebarChatsKey = "cache_sidebar_chats";
      const sidebarChatsJson = localStorage.getItem(sidebarChatsKey);
      if (sidebarChatsJson) {
        const entry = JSON.parse(sidebarChatsJson) as CacheEntry<unknown>;
        if (Date.now() <= entry.expiresAt) {
          this.cache.set("user_chats", entry);
        } else {
          localStorage.removeItem(sidebarChatsKey);
        }
      }

      const chatMessagesPrefix = "cache_chat_messages_";
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(chatMessagesPrefix)) {
          const chatId = key.replace(chatMessagesPrefix, "");
          const chatMessagesJson = localStorage.getItem(key);
          if (chatMessagesJson) {
            const entry = JSON.parse(chatMessagesJson) as CacheEntry<unknown>;
            if (Date.now() <= entry.expiresAt) {
              this.cache.set(`chat_messages_${chatId}`, entry);
            } else {
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading cache from localStorage:", error);

      this.clearLocalStorage();
    }
  }

  private saveToLocalStorage(key: string, entry: CacheEntry<unknown>): void {
    if (!this.isLocalStorageAvailable()) return;

    try {
      if (key === "user_chats") {
        localStorage.setItem("cache_sidebar_chats", JSON.stringify(entry));
      } else if (key.startsWith("chat_messages_")) {
        const chatId = key.replace("chat_messages_", "");
        localStorage.setItem(`cache_chat_messages_${chatId}`, JSON.stringify(entry));
      }
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }

  private clearLocalStorage(): void {
    if (!this.isLocalStorageAvailable()) return;

    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("cache_") || key === "cache_sidebar_chats")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error("Error clearing localStorage cache:", error);
    }
  }

  set<T>(key: string, value: T, ttlMs?: number): void {
    let effectiveTtl = ttlMs;
    if (!effectiveTtl) {
      if (key === "user_chats") {
        effectiveTtl = this.SIDEBAR_CHATS_TTL_MS;
      } else if (key.startsWith("chat_messages_")) {
        effectiveTtl = this.CHAT_MESSAGES_TTL_MS;
      } else {
        effectiveTtl = this.DEFAULT_TTL_MS;
      }
    }

    const now = Date.now();
    const entry: CacheEntry<unknown> = {
      data: value,
      timestamp: now,
      expiresAt: now + effectiveTtl
    };

    this.cache.set(key, entry);

    if (key === "user_chats" || key.startsWith("chat_messages_")) {
      this.saveToLocalStorage(key, entry);
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    const now = Date.now();

    if (!entry) {
      return null;
    }

    if (now > entry.expiresAt) {
      this.cache.delete(key);

      if (key === "user_chats") {
        localStorage.removeItem("cache_sidebar_chats");
      } else if (key.startsWith("chat_messages_")) {
        const chatId = key.replace("chat_messages_", "");
        localStorage.removeItem(`cache_chat_messages_${chatId}`);
      }

      return null;
    }

    return entry.data as T;
  }

  invalidate(key: string): void {
    this.cache.delete(key);

    if (key === "user_chats") {
      localStorage.removeItem("cache_sidebar_chats");
    } else if (key.startsWith("chat_messages_")) {
      const chatId = key.replace("chat_messages_", "");
      localStorage.removeItem(`cache_chat_messages_${chatId}`);
    }
  }

  invalidateByPrefix(prefix: string): void {
    const keysToInvalidate: string[] = [];

    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        keysToInvalidate.push(key);
      }
    }

    keysToInvalidate.forEach((key) => this.cache.delete(key));

    if (prefix === "user_chats") {
      localStorage.removeItem("cache_sidebar_chats");
    } else if (prefix.startsWith("chat_messages_")) {
      const chatId = prefix.replace("chat_messages_", "");
      localStorage.removeItem(`cache_chat_messages_${chatId}`);
    }
  }

  clear(): void {
    this.cache.clear();
    this.clearLocalStorage();
  }

  getSidebarChatsTTL(): number {
    return this.SIDEBAR_CHATS_TTL_MS;
  }

  getChatMessagesTTL(): number {
    return this.CHAT_MESSAGES_TTL_MS;
  }
}

export const chatCache = ChatCache.getInstance();
