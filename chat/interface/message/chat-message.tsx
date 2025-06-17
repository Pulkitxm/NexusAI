"use client";

import { Copy, Check, Volume2, FileText, ImageIcon, Download, Eye, EyeOff, Code, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { useState, useCallback, useEffect, memo } from "react";

import { MemoizedMarkdown } from "@/components/markdown/markdown-rendered";
import { Button } from "@/components/ui/button";
import { cn, formatBytes } from "@/lib/utils";

import { UserMessage } from "./user-message";

import type { Attachment, MessageWithAttachments } from "@/types/chat";

interface ChatMessageProps {
  message: MessageWithAttachments;
  isStreaming: boolean;
}

const getFileIcon = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || "")) {
    return ImageIcon;
  }
  if (["js", "jsx", "ts", "tsx", "py", "java", "cpp", "c", "html", "css", "json", "xml"].includes(extension || "")) {
    return Code;
  }
  if (["csv", "xlsx", "xls"].includes(extension || "")) {
    return FileSpreadsheet;
  }
  if (["pdf", "doc", "docx", "txt", "md"].includes(extension || "")) {
    return FileText;
  }
  return FileText;
};

const isImageFile = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || "");
};

const isPreviewableTextFile = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return [
    "txt",
    "md",
    "json",
    "xml",
    "csv",
    "js",
    "jsx",
    "ts",
    "tsx",
    "py",
    "java",
    "cpp",
    "c",
    "html",
    "css",
    "sql",
    "yaml",
    "yml"
  ].includes(extension || "");
};

const getLanguageFromExtension = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    java: "java",
    cpp: "cpp",
    c: "c",
    html: "html",
    css: "css",
    json: "json",
    xml: "xml",
    sql: "sql",
    yaml: "yaml",
    yml: "yaml",
    md: "markdown",
    txt: "text",
    csv: "csv"
  };
  return languageMap[extension || ""] || "text";
};

interface FilePreviewProps {
  attachment: Attachment;
  isUser: boolean;
}

const FilePreview = memo(({ attachment, isUser }: FilePreviewProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const fetchPreview = useCallback(async () => {
    if (!isPreviewableTextFile(attachment.name) || previewContent) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(attachment.url);
      if (!response.ok) throw new Error("Failed to fetch file");

      const text = await response.text();
      setPreviewContent(text.slice(0, 1000) + (text.length > 1000 ? "\n..." : ""));
    } catch (err) {
      setError("Failed to load preview");
      console.error("Preview fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [attachment.url, attachment.name, previewContent]);

  useEffect(() => {
    if (isExpanded && isPreviewableTextFile(attachment.name)) {
      fetchPreview();
    }
  }, [isExpanded, fetchPreview, attachment.name]);

  const FileIconComponent = getFileIcon(attachment.name);
  const canPreview = isPreviewableTextFile(attachment.name);
  const language = getLanguageFromExtension(attachment.name);

  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200/60 bg-white/80 shadow-sm backdrop-blur-sm transition-all duration-200",
        "dark:border-slate-700/60 dark:bg-slate-800/80",
        isUser ? "bg-white/90 dark:bg-slate-700/90" : ""
      )}
    >
      {/* File Header */}
      <div className="flex items-center gap-3 p-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            isUser
              ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
              : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
          )}
        >
          <FileIconComponent className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{attachment.name}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {formatBytes(attachment.size)} • {language.toUpperCase()}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {canPreview && (
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-8 w-8 p-0">
              {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          )}
          <Link href={attachment.url} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Download className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* File Preview */}
      {isExpanded && canPreview && (
        <div className="border-t border-slate-200/60 dark:border-slate-700/60">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"></div>
                Loading preview...
              </div>
            </div>
          ) : error ? (
            <div className="p-4 text-sm text-red-500">{error}</div>
          ) : (
            <div className="max-h-64 overflow-auto">
              <pre
                className={cn(
                  "p-4 font-mono text-xs leading-relaxed",
                  "text-slate-700 dark:text-slate-300",
                  "break-words whitespace-pre-wrap"
                )}
              >
                <code className={`language-${language}`}>{previewContent}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

FilePreview.displayName = "FilePreview";

export const ChatMessage = memo(({ message, isStreaming }: ChatMessageProps) => {
  const isUser = message.role.toLowerCase() === "user";
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const copyMessage = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  }, [message.content]);

  const speakMessage = useCallback(() => {
    if ("speechSynthesis" in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(message.content);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  }, [message.content, isSpeaking]);

  const handleImageError = useCallback((attachmentId: string) => {
    setImageErrors((prev) => new Set(prev).add(attachmentId));
  }, []);

  const imageAttachments =
    message.attachments?.filter((att) => isImageFile(att.name) && !imageErrors.has(att.id)) || [];
  const fileAttachments = message.attachments?.filter((att) => !isImageFile(att.name) || imageErrors.has(att.id)) || [];

  return (
    <div
      className={cn(
        "group mb-6 flex will-change-transform",
        isUser ? "justify-end" : "justify-start",
        "opacity-100 transition-opacity duration-300"
      )}
      style={{
        transform: "translateY(0)"
      }}
    >
      <div className={cn("flex max-w-[85%] min-w-0 flex-col", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "relative rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-200",
            isUser
              ? "rounded-br-md border-purple-400/20 bg-gradient-to-br from-purple-500 to-purple-600 text-white"
              : "rounded-bl-md border-slate-200/60 bg-white/90 text-slate-800 dark:border-slate-700/60 dark:bg-slate-800/90 dark:text-slate-200"
          )}
        >
          <div className="text-sm">
            {isUser ? (
              <UserMessage content={message.content} className="font-medium" />
            ) : (
              <MemoizedMarkdown content={message.content} />
            )}

            {isStreaming && !isUser && (
              <div className="mt-3 flex items-center gap-2 border-t border-slate-200 pt-2 dark:border-slate-700">
                <div className="flex gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-500" />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Assistant is typing...</span>
              </div>
            )}
          </div>
        </div>

        {/* Image Attachments */}
        {imageAttachments.length > 0 && (
          <div className={cn("mt-3 w-full", isUser ? "flex justify-end" : "flex justify-start")}>
            <div
              className={cn(
                "grid w-full max-w-md gap-2",
                imageAttachments.length === 1 ? "grid-cols-1" : "grid-cols-2"
              )}
            >
              {imageAttachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="overflow-hidden rounded-lg border border-slate-200/60 bg-white/80 shadow-sm backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/80"
                >
                  <img
                    src={attachment.url || "/placeholder.svg"}
                    alt={attachment.name}
                    className="h-auto max-h-64 w-full object-contain"
                    onError={() => handleImageError(attachment.id)}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* File Attachments with Preview */}
        {fileAttachments.length > 0 && (
          <div className={cn("mt-3 w-full", isUser ? "flex justify-end" : "flex justify-start")}>
            <div className="grid w-full max-w-md grid-cols-1 gap-2">
              {fileAttachments.map((attachment) => (
                <FilePreview key={attachment.id} attachment={attachment} isUser={isUser} />
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div
          className={cn(
            "mt-2 flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100",
            isUser ? "justify-end" : "justify-start"
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={speakMessage}
            className="h-8 rounded-lg border border-slate-200 bg-white/90 px-3 text-xs shadow-md backdrop-blur-sm hover:shadow-lg dark:border-slate-700 dark:bg-slate-800/90"
          >
            <Volume2 className={cn("h-3 w-3", isSpeaking && "text-purple-500")} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyMessage}
            className="h-8 rounded-lg border border-slate-200 bg-white/90 px-3 text-xs shadow-md backdrop-blur-sm hover:shadow-lg dark:border-slate-700 dark:bg-slate-800/90"
          >
            {copied ? (
              <>
                <Check className="mr-1 h-3 w-3 text-green-600" />
              </>
            ) : (
              <>
                <Copy className="mr-1 h-3 w-3" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
});

ChatMessage.displayName = "ChatMessage";
