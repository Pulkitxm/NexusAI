"use client";

import { Upload } from "lucide-react";
import { useSession } from "next-auth/react";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
  useCallback,
  JSX,
  DetailedHTMLProps,
  ButtonHTMLAttributes
} from "react";
import { toast } from "sonner";

import { addFiles, deleteFile } from "@/actions/file";
import { getAvailableModels } from "@/data/models";
import { codeExtensions } from "@/lib/extensions";
import { useUploadThing } from "@/lib/uploadthing/client";
import { Attachment } from "@/types/chat";

import { useKeys } from "./use-keys";
import { useModel } from "./use-model";

interface UploadAttachmentContextType {
  openFileDialog: () => void;
  deleteAttachment: (fileName: string) => Promise<void>;
  deletingFiles: string[];
  isUploadSupported: boolean;
  UploadButton: (props: DetailedHTMLProps<ButtonHTMLAttributes<HTMLDivElement>, HTMLDivElement>) => JSX.Element;
}

interface UploadState {
  progress: number;
  error: string | null;
  isUploading: boolean;
}

const MAX_ATTACHMENTS = 1;

export function validateAndFilterFiles(files: File[]): File[] {
  return files.filter((file) => {
    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;

    const isCodeFile = codeExtensions.includes(extension);
    const isConfigFile = [".js", ".jsx", ".ts", ".tsx", ".json", ".config.js", ".config.ts", ".config.json"].includes(
      extension
    );
    const isTextFile =
      file.type.startsWith("text/") || file.type === "application/json" || file.type === "application/javascript";
    const isImage = file.type.startsWith("image/") && (file.type === "image/jpeg" || file.type === "image/png");
    const isPDF = file.type === "application/pdf";
    return isCodeFile || isConfigFile || isTextFile || isImage || isPDF;
  });
}

const UploadAttachmentContext = createContext<UploadAttachmentContextType | undefined>(undefined);

export function UploadAttachmentProvider({ children }: { children: ReactNode }) {
  const { keys } = useKeys();
  const { status } = useSession();
  const { selectedModel } = useModel();
  const availableModels = getAvailableModels(keys);
  const [open, setOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [deletingFiles, setDeletingFiles] = useState<string[]>([]);
  const [uploadStates, setUploadStates] = useState<Record<string, UploadState>>({});
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedModelDetails = availableModels.find((m) => m.id === selectedModel);

  const isUploadSupported = selectedModelDetails?.capabilities?.attachment ?? false;

  const { startUpload } = useUploadThing("attachment", {
    onUploadProgress: (progress) => {
      setUploadStates((prev) => {
        const newStates = { ...prev };
        Object.keys(newStates).forEach((key) => {
          if (newStates[key].isUploading) {
            newStates[key] = { ...newStates[key], progress };
          }
        });
        return newStates;
      });

      setAttachments((prev: Attachment[]) =>
        prev.map((attachment) => {
          if (!attachment.uploaded && uploadStates[attachment.id]?.isUploading) {
            return { ...attachment, uploadProgress: progress };
          }
          return attachment;
        })
      );
    },
    onClientUploadComplete: async (res) => {
      if (!res) return;

      setUploadStates((prev) => {
        const newStates = { ...prev };
        res.forEach((file) => {
          const attachment = attachments.find((a) => a.name === file.name);
          if (attachment && newStates[attachment.id]) {
            newStates[attachment.id] = {
              progress: 100,
              error: null,
              isUploading: false
            };
          }
        });
        return newStates;
      });

      setAttachments((prev: Attachment[]) =>
        prev.map((attachment) => {
          const matchingFile = res.find((file) => file.name === attachment.name);
          if (matchingFile) {
            return {
              ...attachment,
              uploaded: false,
              uploadProgress: 0,
              uploadThingKey: matchingFile.key,
              url: matchingFile.url
            };
          }
          return attachment;
        })
      );

      try {
        const dbFiles = await addFiles(
          res.map((file) => ({
            name: file.name,
            url: file.url,
            size: file.size,
            uploaded: true,
            uploadProgress: 100,
            id: file.fileHash,
            uploadThingKey: file.key
          }))
        );

        setAttachments((prev: Attachment[]) =>
          prev.map((attachment) => {
            const dbFile = dbFiles.find((file) => file.uploadThingKey === attachment.uploadThingKey);
            return dbFile ? { ...attachment, id: dbFile.id, uploaded: true, uploadProgress: 100 } : attachment;
          })
        );
      } catch (error) {
        console.error("Failed to save files to database:", error);
        toast.error("There was an error saving your files. Please try again.");
      }
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);

      setUploadStates((prev) => {
        const newStates = { ...prev };
        Object.keys(newStates).forEach((key) => {
          if (newStates[key].isUploading) {
            newStates[key] = {
              progress: 0,
              error: "Upload failed",
              isUploading: false
            };
          }
        });
        return newStates;
      });

      setAttachments((prev: Attachment[]) => prev.filter((attachment) => attachment.uploaded));
      toast("There was an error uploading your files. Please try again.");
    }
  });

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (files.length > MAX_ATTACHMENTS) {
        toast("You can only upload up to 5 files at a time");
        return;
      }

      const newAttachments: Attachment[] = files.map((file) => ({
        file,
        name: file.name,
        url: "",
        uploaded: false,
        uploadProgress: 0,
        id: crypto.randomUUID(),
        size: file.size,
        uploadThingKey: ""
      }));

      const newUploadStates: Record<string, UploadState> = {};
      newAttachments.forEach((attachment) => {
        newUploadStates[attachment.id] = {
          progress: 0,
          error: null,
          isUploading: true
        };
      });
      setUploadStates((prev) => ({ ...prev, ...newUploadStates }));

      setAttachments((prev: Attachment[]) => [...prev, ...newAttachments]);

      try {
        await startUpload(files);
      } catch (error) {
        console.error("Failed to start upload:", error);
        toast("Failed to start upload. Please try again.");
      }
    },
    [startUpload, setAttachments]
  );

  const deleteAttachment = useCallback(
    async (fileId: string) => {
      setDeletingFiles((prev) => [...prev, fileId]);

      try {
        const file = attachments.find((attachment) => attachment.id === fileId);
        if (!file) return;

        await deleteFile(file.id);
        setAttachments((prev) => prev.filter((attachment) => attachment.id !== fileId));

        setUploadStates((prev) => {
          const newStates = { ...prev };
          delete newStates[fileId];
          return newStates;
        });
      } catch (err) {
        console.error("Delete error:", err);
      } finally {
        setDeletingFiles((prev) => prev.filter((id) => id !== fileId));
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
        return toast.error("You must be signed in to upload files");
      }

      const files = Array.from(e.dataTransfer?.files || []);
      const allowed = validateAndFilterFiles(files);

      if (allowed.length === 0) {
        return toast.error("No valid files found");
      }

      const processedFiles = await Promise.all(
        allowed.map(async (file) => {
          if (
            file.type.startsWith("text/") ||
            file.type === "application/json" ||
            file.type === "application/javascript"
          ) {
            const content = await file.text();
            return new File([content], file.name, { type: "text/plain" });
          }
          return file;
        })
      );

      if (processedFiles.length > MAX_ATTACHMENTS - attachments.length) {
        toast.error(`Upload max ${MAX_ATTACHMENTS - attachments.length} code files`);
      }

      await handleFiles(processedFiles.slice(0, MAX_ATTACHMENTS - attachments.length));
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
  }, [handleFiles, status, attachments]);

  const handleClose = () => {
    setOpen(false);
    setIsDragOver(false);
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (status !== "authenticated") {
      return toast.error("You must be signed in to upload files");
    }

    const allowed = validateAndFilterFiles(files);

    if (allowed.length === 0) {
      return toast.error("No valid files found");
    }

    const processedFiles = await Promise.all(
      allowed.map(async (file) => {
        if (
          file.type.startsWith("text/") ||
          file.type === "application/json" ||
          file.type === "application/javascript"
        ) {
          const content = await file.text();
          return new File([content], file.name, { type: "text/plain" });
        }
        return file;
      })
    );

    if (processedFiles.length > MAX_ATTACHMENTS - attachments.length) {
      toast.error(`Upload max ${MAX_ATTACHMENTS - attachments.length} files`);
    }

    await handleFiles(processedFiles.slice(0, MAX_ATTACHMENTS - attachments.length));

    e.target.value = "";
  };

  const UploadButton = (
    props: DetailedHTMLProps<ButtonHTMLAttributes<HTMLDivElement>, HTMLDivElement>
  ): JSX.Element => {
    return (
      <>
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          multiple
          accept=".js,.jsx,.ts,.tsx,.json,.py,.html,.css,.md,.txt,.jpg,.jpeg,.png,.pdf"
          onChange={handleFileInputChange}
        />
        <div
          onClick={() => {
            inputRef.current?.click();
          }}
          {...props}
        >
          {props.children}
        </div>
      </>
    );
  };

  return (
    <UploadAttachmentContext.Provider
      value={{ openFileDialog, deleteAttachment, deletingFiles, isUploadSupported, UploadButton }}
    >
      {children}
      {open && isUploadSupported && (
        <>
          <div
            className={`bg-opacity-90 fixed inset-0 z-50 flex items-center justify-center bg-purple-600 transition-opacity duration-300 ${
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
        </>
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
