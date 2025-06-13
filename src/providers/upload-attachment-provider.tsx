"use client";

import { Upload } from "lucide-react";
import { useSession } from "next-auth/react";
import { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from "react";

import { deleteFile } from "@/actions/file";
import { useUploadThing } from "@/lib/uploadthing/client";
import { useChat } from "@/providers/chat-provider";
import { Attachment } from "@/types/chat";

interface UploadAttachmentContextType {
  openFileDialog: () => void;
  deleteAttachment: (fileName: string) => Promise<void>;
  deletingFiles: string[];
}

const UploadAttachmentContext = createContext<UploadAttachmentContextType | undefined>(undefined);

export function UploadAttachmentProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [deletingFiles, setDeletingFiles] = useState<string[]>([]);
  const { attachments, setAttachments } = useChat();
  const inputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing("attachment", {
    onUploadProgress: (progress) => {
      setAttachments((prev: Attachment[]) =>
        prev.map((attachment) => (!attachment.uploaded ? { ...attachment, uploadProgress: progress } : attachment))
      );
    },
    onClientUploadComplete: (res) => {
      if (!res) return;

      console.log(res);

      setAttachments((prev: Attachment[]) => {
        const updatedAttachments = prev.map((attachment) => {
          const uploadedFile = res.find((file) => file.name === attachment.fileName);
          if (uploadedFile) {
            return {
              ...attachment,
              uploaded: true,
              url: uploadedFile.url,
              uploadProgress: 100
            };
          }

          return attachment;
        });
        return updatedAttachments;
      });
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);

      setAttachments((prev: Attachment[]) => prev.filter((attachment) => attachment.uploaded));
    }
  });

  const handleFiles = useCallback(
    async (files: File[]) => {
      const newAttachments: Attachment[] = files.map((file) => ({
        file,
        fileName: file.name,
        url: "",
        uploaded: false,
        uploadProgress: 0
      }));

      setAttachments((prev: Attachment[]) => [...prev, ...newAttachments]);

      await startUpload(files);
    },
    [startUpload, setAttachments]
  );

  const deleteAttachment = useCallback(
    async (fileUrl: string) => {
      setDeletingFiles((prev) => [...prev, fileUrl]);

      try {
        const fileName = attachments.find((attachment) => attachment.url === fileUrl)?.fileName;
        if (!fileName) return;

        await deleteFile(fileName, fileUrl);
        setAttachments((prev) => prev.filter((attachment) => attachment.url !== fileUrl));
      } catch (err) {
        console.error("Delete error:", err);
      } finally {
        setDeletingFiles((prev) => prev.filter((name) => name !== fileUrl));
      }
    },
    [attachments, setAttachments]
  );

  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;

      if (e.dataTransfer?.types.includes("Files")) {
        setOpen(true);
        setIsDragOver(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;

      if (dragCounter === 0) {
        setIsDragOver(false);
        setOpen(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setIsDragOver(false);
      setOpen(false);

      if (status !== "authenticated") {
        return;
      }

      const files = Array.from(e.dataTransfer?.files ?? []);
      const allowedFiles = files.filter((file) => file.type.startsWith("image/") || file.type === "application/pdf");

      if (allowedFiles.length > 0) {
        await handleFiles(allowedFiles);
      }
    };

    document.addEventListener("dragenter", handleDragEnter);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("drop", handleDrop);

    return () => {
      document.removeEventListener("dragenter", handleDragEnter);
      document.removeEventListener("dragleave", handleDragLeave);
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("drop", handleDrop);
    };
  }, [handleFiles, status]);

  const handleClose = () => {
    setOpen(false);
    setIsDragOver(false);
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  return (
    <UploadAttachmentContext.Provider value={{ openFileDialog, deleteAttachment, deletingFiles }}>
      {children}
      {open && status === "authenticated" && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-purple-600 bg-opacity-90 transition-opacity duration-300 ${
            isDragOver ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={!open}
          onClick={handleClose}
        >
          <div className="text-center text-white" onClick={(e) => e.stopPropagation()}>
            <Upload className="mx-auto mb-8 h-24 w-24 animate-bounce" aria-hidden="true" />
            <h2 className="mb-4 text-4xl font-bold">{isDragOver ? "Drop your files here" : "Drag files anywhere"}</h2>
            <p className="mb-6 text-xl">
              {isDragOver ? "Release anywhere to upload your files" : "Or click to browse files"}
            </p>
          </div>
        </div>
      )}
    </UploadAttachmentContext.Provider>
  );
}

export function useUploadAttachment() {
  const context = useContext(UploadAttachmentContext);
  if (context === undefined) {
    throw new Error("useUploadAttachment must be used within a UploadAttachmentProvider");
  }
  return context;
}
