"use client";

import { createContext, useContext, useCallback, useMemo, useState } from "react";

import { getStoredValue, setStoredValue } from "@/lib/utils";
import { Provider } from "@/types/provider";

import type { ApiKeys } from "@/types/chat";
import type React from "react";

interface KeyContextType {
  keys: ApiKeys;
  updateKeys: (keys: Partial<ApiKeys>) => void;
  hasAnyKeys: boolean;
  haveOnlyOpenRouterKey: boolean;
  canUseOpenRouter: boolean;
}

const KeyContext = createContext<KeyContextType | undefined>(undefined);

const getInitialKeys = (): ApiKeys => {
  if (typeof window === "undefined") return {};
  const emptyRecord: ApiKeys = {};
  const initialKeys = getStoredValue("nexus-api-keys", emptyRecord) || {};
  return initialKeys;
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

  const haveOnlyOpenRouterKey = useMemo(() => {
    if (!hasAnyKeys || !keys.openrouter) return false;

    for (const key in keys) {
      if (key !== Provider.OpenRouter && keys[key as keyof ApiKeys]) {
        return false;
      }
    }

    return true;
  }, [hasAnyKeys, keys]);

  const contextValue = useMemo(
    () => ({ keys, updateKeys, hasAnyKeys, haveOnlyOpenRouterKey, canUseOpenRouter: !!keys.openrouter }),
    [keys, updateKeys, hasAnyKeys, haveOnlyOpenRouterKey]
  );

  return <KeyContext.Provider value={contextValue}>{children}</KeyContext.Provider>;
}

export const useKeys = () => {
  const context = useContext(KeyContext);
  if (context === undefined) {
    throw new Error("useKeys must be used within a KeyProvider");
  }
  return context;
};
