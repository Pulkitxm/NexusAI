"use client";

import { X, FileText, ImageIcon, File, Loader2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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

  const formatFileName = (fileName: string, maxLength: number = 20) => {
    if (fileName.length <= maxLength) return fileName;
    const extension = fileName.split(".").pop();
    const nameWithoutExt = fileName.slice(0, -(extension?.length || 0) - 1);
    const truncatedName = nameWithoutExt.slice(0, maxLength - (extension?.length || 0) - 4);
    return `${truncatedName}...${extension ? `.${extension}` : ""}`;
  };

  const handleDelete = async (fileId: string) => {
    await deleteAttachment(fileId);
  };

  if (!attachments?.length) return null;

  return (
    <div className={cn("mx-auto max-w-4xl px-4", className)}>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {attachments.map((attachment, index) => {
          const Icon = getFileIcon(attachment.fileName);
          const isDeleting = deletingFiles.includes(attachment.url);

          return (
            <div
              key={`${attachment.fileName}-${index}`}
              className={cn(
                "relative flex min-w-[240px] max-w-[280px] flex-shrink-0",
                "items-center gap-3 rounded-lg border p-3",
                "bg-white shadow-sm transition-all duration-200",
                "dark:border-slate-700 dark:bg-slate-900",
                attachment.uploaded && "hover:bg-zinc-50 hover:shadow-md dark:hover:bg-slate-800"
              )}
            >
              {attachment.uploaded && (
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
                  title={attachment.fileName}
                >
                  {formatFileName(attachment.fileName)}
                </div>

                {!attachment.uploaded && (
                  <div className="mt-2 flex items-center gap-2">
                    <Progress value={attachment.uploadProgress || 0} className="h-1.5 flex-1" />
                    <span className="min-w-[2.5rem] text-right font-mono text-xs text-zinc-500 dark:text-slate-400">
                      {Math.round(attachment.uploadProgress || 0)}%
                    </span>
                  </div>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isDeleting}
                className={cn(
                  "z-20 h-7 w-7 flex-shrink-0 rounded-full p-0",
                  "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600",
                  "dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200",
                  "transition-colors"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDelete(attachment.id);
                }}
                aria-label={`Remove ${attachment.fileName}`}
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
