"use client";

import { Trash2, Loader2, AlertTriangle, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { deleteChat } from "@/actions/chat";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { debugError } from "@/lib/utils";
import { useSidebar } from "@/providers/use-sidebar";

export function DeleteChatModal() {
  const router = useRouter();
  const { deleteModelForChatID, openDeleteModal, chats } = useSidebar();
  const currentChat = chats.find((chat) => chat.id === deleteModelForChatID);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!deleteModelForChatID) return;
    setIsLoading(true);
    try {
      const result = await deleteChat({ chatId: deleteModelForChatID });
      if (result.success) {
        toast("Chat deleted successfully");
        openDeleteModal(null);
        router.push("/");
      } else {
        throw new Error(result.error || "Failed to delete chat");
      }
    } catch (error) {
      debugError("Failed to delete chat", error);
      toast("Failed to delete chat");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={!!deleteModelForChatID} onOpenChange={() => openDeleteModal(null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Delete Chat
          </DialogTitle>
          <DialogDescription className="space-y-4">
            <p>Are you sure you want to delete this chat? This action cannot be undone.</p>
            {currentChat?.title && (
              <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
                <CardContent className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-orange-900 dark:text-orange-100">
                      {currentChat.title}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-end space-x-2">
            <Button variant="outline" onClick={() => openDeleteModal(null)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-500 text-sm text-white hover:bg-red-600 dark:bg-red-600 dark:text-white dark:hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Chat
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
