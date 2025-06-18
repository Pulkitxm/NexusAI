"use client";

import { Trash2, Loader2, AlertTriangle, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { debugError } from "@/lib/utils";
import { useSidebar } from "@/providers/use-sidebar";

export function DeleteChatModal() {
  const router = useRouter();
  const { deleteModelForChatID, openDeleteModal, chats, deleteChat } = useSidebar();
  const currentChat = chats.find((chat) => chat.id === deleteModelForChatID);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!deleteModelForChatID) return;
    setIsLoading(true);
    try {
      await deleteChat(deleteModelForChatID);
      openDeleteModal(null);
      toast("Chat deleted successfully");
      router.push("/?new=true");
    } catch (error) {
      debugError("Failed to delete chat", error);
      toast("Failed to delete chat");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={!!deleteModelForChatID} onOpenChange={() => openDeleteModal(null)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Chat
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this chat? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {currentChat && (
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <MessageSquare className="h-5 w-5 text-gray-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{currentChat.title}</p>
                  <p className="text-sm text-gray-500">
                    Last updated: {new Date(currentChat.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => openDeleteModal(null)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
