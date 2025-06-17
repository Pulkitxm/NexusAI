"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { KeyboardShortcutsDialog } from "@/chat/keyboard-shortcuts";

interface KeyContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
}

const KeyboardShortcutsContext = createContext<KeyContextType | undefined>(undefined);

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <KeyboardShortcutsContext.Provider
      value={{
        isOpen: open,
        openModal: () => setOpen(true),
        closeModal: () => setOpen(false),
        toggleModal: () => setOpen((prev) => !prev)
      }}
    >
      {children}
      <KeyboardShortcutsDialog open={open} onOpenChange={setOpen} />
    </KeyboardShortcutsContext.Provider>
  );
}

export const useKeyboardShortcuts = () => {
  const context = useContext(KeyboardShortcutsContext);
  if (context === undefined) {
    throw new Error("useKeyboardShortcuts must be used within a KeyboardShortcutsProvider");
  }
  return context;
};
