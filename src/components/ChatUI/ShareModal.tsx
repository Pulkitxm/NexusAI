"use client";

import { Check, Copy, Share2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { shareChat } from "@/actions/chat";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { debugError } from "@/lib/debug";

import { useSidebar } from "../sidebar";

export function ShareModal() {
  const { shareModelForChatID, openShareModal } = useSidebar();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);

  const handleShare = async () => {
    if (!shareModelForChatID) return;
    setIsLoading(true);
    try {
      const result = await shareChat(shareModelForChatID);
      console.log("result", result);
      if (result.success) {
        const baseUrl = window.location.origin;
        setShareLink(`${baseUrl}/share/${shareModelForChatID}`);
        toast({
          title: "Chat shared successfully",
          description: "The share link has been generated."
        });
      } else {
        throw new Error(result.error || "Failed to share chat");
      }
    } catch (error) {
      debugError("Failed to share chat", error);
      toast({
        variant: "destructive",
        title: "Failed to share chat",
        description: "Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast({
        title: "Link copied",
        description: "The share link has been copied to your clipboard."
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      debugError("Failed to copy", error);
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Please try copying the link manually."
      });
    }
  };

  useEffect(() => {
    setShareLink(null);
  }, [shareModelForChatID]);

  return (
    <Dialog open={!!shareModelForChatID} onOpenChange={() => openShareModal(null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share Chat
          </DialogTitle>
          <DialogDescription>Share this chat with others by sending them the link below.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {!shareLink && (
            <Button
              onClick={handleShare}
              disabled={isLoading}
              className="w-full bg-purple-500 text-sm text-white hover:bg-purple-600 dark:bg-purple-600 dark:text-white dark:hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  <Share2 className="mr-2 h-4 w-4" />
                  Generate Share Link
                </>
              )}
            </Button>
          )}
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                <input
                  readOnly
                  value={isLoading ? "Generating share link..." : shareLink || ""}
                  className="flex-1 bg-transparent outline-none"
                  placeholder="Click the button above to generate a share link"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleCopy}
                  disabled={!shareLink || isLoading}
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
