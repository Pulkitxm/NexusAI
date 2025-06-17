"use client";

import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef } from "react";

import { useFont } from "@/providers/use-font";
import { useKeyboardShortcuts } from "@/providers/use-keyboardshortcuts";
import { useModel } from "@/providers/use-model";
import { useSettingsModal } from "@/providers/use-settings";

type ShortcutConfig = {
  key: string;
  action: () => void;
  description: string;
};

export default function Syncer() {
  const { data: session } = useSession();
  const { setTheme } = useTheme();
  const { setCurrentFont } = useFont();
  const { toggleModal: toggleSettingsModal } = useSettingsModal();
  const { toggleModal: toggleKeyboardShortcuts } = useKeyboardShortcuts();
  const { toggleModal: toggleModelModal } = useModel();

  // Use ref to track if theme has been synced to avoid unnecessary state
  const hasThemeSynced = useRef(false);

  // Sync user settings (theme and font) when session loads
  useEffect(() => {
    if (!session?.user?.settings) return;

    const { theme, customFont } = session.user.settings;

    // Sync theme only once and only if it's a valid theme
    if (!hasThemeSynced.current && theme && (theme === "light" || theme === "dark")) {
      setTheme(theme);
      hasThemeSynced.current = true;
    }

    // Sync custom font if available
    if (customFont) {
      setCurrentFont(customFont);
    }
  }, [session, setCurrentFont, setTheme]);

  // Memoize keyboard shortcut handler to prevent recreation on every render
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const modifierPressed = event.metaKey || event.ctrlKey;
      if (!modifierPressed) return;

      const shortcuts: ShortcutConfig[] = [
        {
          key: "/",
          action: toggleKeyboardShortcuts,
          description: "Keyboard Shortcuts"
        },
        {
          key: ",",
          action: toggleSettingsModal,
          description: "Settings"
        },
        {
          key: "m",
          action: toggleModelModal,
          description: "Model Selection"
        }
      ];

      const matchedShortcut = shortcuts.find((shortcut) => shortcut.key === event.key);

      if (matchedShortcut) {
        event.preventDefault();
        matchedShortcut.action();
      }
    },
    [toggleKeyboardShortcuts, toggleSettingsModal, toggleModelModal]
  );

  // Set up keyboard shortcuts
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return null;
}
