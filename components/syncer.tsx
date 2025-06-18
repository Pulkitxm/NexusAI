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

  const hasThemeSynced = useRef(false);

  useEffect(() => {
    if (!session?.user?.settings) return;

    const { theme, customFont } = session.user.settings;

    if (!hasThemeSynced.current && theme && (theme === "light" || theme === "dark")) {
      setTheme(theme);
      hasThemeSynced.current = true;
    }

    if (customFont) {
      setCurrentFont(customFont);
    }
  }, [session, setCurrentFont, setTheme]);

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

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return null;
}
