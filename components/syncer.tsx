"use client";

import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect } from "react";

import { useFont } from "@/providers/use-font";
import { useKeyboardShortcuts } from "@/providers/use-keyboardshortcuts";
import { useModel } from "@/providers/use-model";
import { useSettingsModal } from "@/providers/use-settings";

export default function Syncer() {
  const { data: session } = useSession();
  const { setTheme } = useTheme();
  const { setCurrentFont } = useFont();

  const { toggleModal: toggleSettingsModal, closeModal: closeSettingsModal } = useSettingsModal();
  const { toggleModal: toggleKeyboardShortcuts, closeModal: closeKeyboardShortcuts } = useKeyboardShortcuts();
  const { toggleModal: toggleModelModal, closeModal: closeModelModal } = useModel();

  useEffect(() => {
    if (session?.user?.settings?.theme) {
      setTheme(session.user.settings.theme);
    }
    if (session?.user?.settings?.customFont) {
      setCurrentFont(session.user.settings.customFont);
    }
  }, [session, setCurrentFont, setTheme]);

  useEffect(() => {
    const shortcutMap = [
      {
        key: "/",
        action: toggleKeyboardShortcuts,
        description: "Keyboard Shortcuts",
        close: closeKeyboardShortcuts
      },
      {
        key: ",",
        action: toggleSettingsModal,
        description: "Settings",
        close: closeSettingsModal
      },
      {
        key: "m",
        action: toggleModelModal,
        description: "Model Selection",
        close: closeModelModal
      }
    ];

    const handleKeyDown = (event: KeyboardEvent) => {
      const modifierPressed = event.metaKey || event.ctrlKey;

      if (!modifierPressed) return;

      for (const shortcut of shortcutMap) {
        if (shortcut.key === event.key) {
          event.preventDefault();
          shortcut.action();
        } else {
          shortcut.close();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    closeKeyboardShortcuts,
    closeSettingsModal,
    closeModelModal,
    toggleKeyboardShortcuts,
    toggleSettingsModal,
    toggleModelModal
  ]);

  return null;
}
