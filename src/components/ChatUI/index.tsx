"use client";

import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { ChatProvider } from "@/providers/chat-provider";
import { EmptyState } from "./EmptyState";
import { KeyboardShortcutsDialog } from "./KeyboardShortcutsDialog";
import { useModel } from "@/providers/model-provider";
import { getAvailableModels } from "@/lib/models";
import { useKeys } from "@/providers/key-provider";

export default function ChatUI() {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const { selectedModel } = useModel();
  const { keys } = useKeys();
  const availableModels = getAvailableModels(keys);
  const selectedModelDetails = availableModels.find((m) => m.id === selectedModel);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <ChatProvider>
      <div className="flex flex-col h-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <ScrollArea className="flex-1 px-4">
          <div className="max-w-3xl mx-auto py-4">
            <EmptyState selectedModelDetails={selectedModelDetails} />
            <ChatMessages />
          </div>
        </ScrollArea>
        <ChatInput />
        <KeyboardShortcutsDialog
          open={showShortcuts}
          onOpenChange={setShowShortcuts}
        />
      </div>
    </ChatProvider>
  );
}
