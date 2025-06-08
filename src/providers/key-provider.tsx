"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import type { ApiKeys } from "@/types/keys";

interface KeyContextType {
  keys: ApiKeys;
  updateKeys: (keys: Partial<ApiKeys>) => void;
  hasAnyKeys: boolean;
}

const KeyContext = createContext<KeyContextType | undefined>(undefined);

export function KeyProvider({ children }: { children: React.ReactNode }) {
  const [keys, setKeys] = useState<ApiKeys>({});

  useEffect(() => {
    const savedKeys = localStorage.getItem("nexus-api-keys");
    if (savedKeys) {
      setKeys(JSON.parse(savedKeys));
    }
  }, []);

  const updateKeys = (newKeys: Partial<ApiKeys>) => {
    const updatedKeys = { ...keys, ...newKeys };
    setKeys(updatedKeys);
    localStorage.setItem("nexus-api-keys", JSON.stringify(updatedKeys));
  };

  const hasAnyKeys = Object.values(keys).some(
    (key) => key && key.trim() !== "",
  );

  return (
    <KeyContext.Provider value={{ keys, updateKeys, hasAnyKeys }}>
      {children}
    </KeyContext.Provider>
  );
}

export const useKeys = () => {
  const context = useContext(KeyContext);
  if (context === undefined) {
    throw new Error("useKeys must be used within a KeyProvider");
  }
  return context;
};
