"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface StorageContextType {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export function StorageProvider({ children }: { children: ReactNode }) {
  const getItem = (key: string): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return null;
    }
  };

  const setItem = (key: string, value: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  };

  const removeItem = (key: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  };

  return <StorageContext.Provider value={{ getItem, setItem, removeItem }}>{children}</StorageContext.Provider>;
}

function useStorage() {
  const context = useContext(StorageContext);
  if (context === undefined) {
    throw new Error("useStorage must be used within a StorageProvider");
  }
  return context;
}

export function useStoredValue<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const { getItem, setItem } = useStorage();

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error parsing stored value for key "${key}":`, error);
      return defaultValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error storing value for key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

export function setStoredValue<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error storing value for key "${key}":`, error);
  }
}

export function getStoredValue<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error parsing stored value for key "${key}":`, error);
    return defaultValue;
  }
}

export function removeStoredValue(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing stored value for key "${key}":`, error);
  }
}
