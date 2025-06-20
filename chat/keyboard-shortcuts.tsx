"use client";

import { Keyboard } from "lucide-react";
import React from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { keyboardShortcuts } from "@/data/keyboard-shortcuts";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const KeyboardShortcutItem = ({ keys, description }: { keys: string[]; description: string }) => (
  <div className="mb-2 flex items-center justify-between text-sm">
    <span className="text-slate-700 dark:text-slate-300">{description}</span>
    <div className="flex gap-1">
      {keys.map((key, index) => (
        <React.Fragment key={key}>
          <kbd className="rounded border border-slate-200 bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400">
            {key}
          </kbd>
          {index < keys.length - 1 && <span className="mx-1 text-slate-400">+</span>}
        </React.Fragment>
      ))}
    </div>
  </div>
);

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  const navigationShortcuts = keyboardShortcuts.filter((shortcut) => shortcut.category === "navigation");
  const messagingShortcuts = keyboardShortcuts.filter((shortcut) => shortcut.category === "messaging");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-auto border-slate-200 bg-white sm:max-w-md dark:border-slate-700 dark:bg-slate-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Keyboard className="h-4 w-4" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Use these keyboard shortcuts to navigate the chat interface more efficiently.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200">Navigation</h3>
            <div className="space-y-1.5">
              {navigationShortcuts.map((shortcut) => (
                <KeyboardShortcutItem
                  key={shortcut.keys.join("+")}
                  keys={shortcut.keys}
                  description={shortcut.description}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200">Messaging</h3>
            <div className="space-y-1.5">
              {messagingShortcuts.map((shortcut) => (
                <KeyboardShortcutItem
                  key={shortcut.keys.join("+")}
                  keys={shortcut.keys}
                  description={shortcut.description}
                />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
