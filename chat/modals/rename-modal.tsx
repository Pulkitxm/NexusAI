"use client";

import { Edit3, Loader2, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { debugError } from "@/lib/utils";
import { useSidebar } from "@/providers/use-sidebar";

export function RenameChatModal() {
  const { renameModelForChatID, openRenameModal, chats, updateChatTitle } = useSidebar();
  const [isLoading, setIsLoading] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    if (renameModelForChatID) {
      const currentChat = chats.find((chat) => chat.id === renameModelForChatID);
      setNewTitle(currentChat?.title || "");
    }
  }, [renameModelForChatID, chats]);

  const handleRename = async () => {
    if (!renameModelForChatID || !newTitle.trim()) return;

    const currentChat = chats.find((chat) => chat.id === renameModelForChatID);
    if (newTitle.trim() === currentChat?.title) {
      openRenameModal(null);
      return;
    }

    setIsLoading(true);
    try {
      await updateChatTitle(renameModelForChatID, newTitle.trim());
      toast("Chat renamed successfully");
      openRenameModal(null);
    } catch (error) {
      debugError("Failed to rename chat", error);
      toast("Failed to rename chat");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleRename();
    } else if (e.key === "Escape") {
      e.preventDefault();
      openRenameModal(null);
    }
  };

  return (
    <Dialog open={!!renameModelForChatID} onOpenChange={() => openRenameModal(null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            Rename Chat
          </DialogTitle>
          <DialogDescription>Enter a new name for this chat.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter chat title..."
            disabled={isLoading}
            autoFocus
          />
          <div className="flex items-center justify-end space-x-2">
            <Button variant="outline" onClick={() => openRenameModal(null)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={isLoading || !newTitle.trim()}
              className="bg-purple-500 text-sm text-white hover:bg-purple-600 dark:bg-purple-600 dark:text-white dark:hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Renaming...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
