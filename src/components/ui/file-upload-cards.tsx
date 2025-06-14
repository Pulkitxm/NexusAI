"use client";

import { X, FileText, ImageIcon, File, Loader2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChat } from "@/providers/chat-provider";
import { useUploadAttachment } from "@/providers/upload-attachment-provider";

interface FileUploadCardsProps {
  className?: string;
}

export function FileUploadCards({ className }: FileUploadCardsProps) {
  const { attachments } = useChat();
  const { deleteAttachment, deletingFiles } = useUploadAttachment();

  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split(".").pop();
    if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"].includes(extension || "")) return ImageIcon;
    if (["pdf", "doc", "docx", "txt", "rtf", "odt"].includes(extension || "")) return FileText;
    return File;
  };

  if (!attachments?.length) return null;

  return (
    <div className={cn("mx-auto max-w-4xl px-4", className)}>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {attachments.map((attachment) => {
          const Icon = getFileIcon(attachment.name);
          const isDeleting = deletingFiles.includes(attachment.id);
          const isUploading = !attachment.uploaded;

          return (
            <div
              key={attachment.id}
              className={cn(
                "group relative flex min-w-[240px] max-w-[280px] flex-shrink-0",
                "items-center gap-3 rounded-lg border p-3",
                "bg-white shadow-sm transition-all duration-200",
                "dark:border-slate-700 dark:bg-slate-900",
                attachment.uploaded && "hover:bg-zinc-50 hover:shadow-md dark:hover:bg-slate-800",
                isDeleting && "opacity-50"
              )}
            >
              {attachment.uploaded && !isDeleting && (
                <Link
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 z-0"
                />
              )}

              <div className="z-10 text-zinc-500 dark:text-slate-400">
                <Icon className="h-4 w-4 flex-shrink-0" />
              </div>

              <div className="min-w-0 flex-1">
                <div
                  className={cn(
                    "truncate text-sm font-medium",
                    attachment.uploaded ? "text-zinc-900 dark:text-slate-100" : "text-zinc-700 dark:text-slate-300"
                  )}
                  title={attachment.name}
                >
                  {attachment.name}
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isDeleting || isUploading}
                className={cn(
                  "z-20 h-7 w-7 flex-shrink-0 rounded-full p-0",
                  "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600",
                  "dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200",
                  "transition-colors",
                  "opacity-0 group-hover:opacity-100",
                  (isDeleting || isUploading) && "opacity-100"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  deleteAttachment(attachment.id);
                }}
                aria-label={`Remove ${attachment.name}`}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
