"use client";

import { createContext, useContext, useCallback, useMemo, useState } from "react";

import { getStoredValue, setStoredValue } from "@/lib/utils";

import type { ApiKeys } from "@/types/keys";
import type React from "react";

interface KeyContextType {
  keys: ApiKeys;
  updateKeys: (keys: Partial<ApiKeys>) => void;
  hasAnyKeys: boolean;
}

const KeyContext = createContext<KeyContextType | undefined>(undefined);

const getInitialKeys = (): ApiKeys => {
  if (typeof window === "undefined") return {};
  return getStoredValue("nexus-api-keys", {} as ApiKeys) || {};
};

export function KeyProvider({ children }: { children: React.ReactNode }) {
  const [keys, setKeys] = useState<ApiKeys>(getInitialKeys);

  const updateKeys = useCallback((newKeys: Partial<ApiKeys>) => {
    setKeys((prevKeys) => {
      const updatedKeys = { ...prevKeys, ...newKeys };
      setStoredValue("nexus-api-keys", updatedKeys);
      return updatedKeys;
    });
  }, []);

  const hasAnyKeys = useMemo(() => Object.values(keys).some((key) => key && key.trim() !== ""), [keys]);

  const contextValue = useMemo(() => ({ keys, updateKeys, hasAnyKeys }), [keys, updateKeys, hasAnyKeys]);

  return <KeyContext.Provider value={contextValue}>{children}</KeyContext.Provider>;
}

export const useKeys = () => {
  const context = useContext(KeyContext);
  if (context === undefined) {
    throw new Error("useKeys must be used within a KeyProvider");
  }
  return context;
};
