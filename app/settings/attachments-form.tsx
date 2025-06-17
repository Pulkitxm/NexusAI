"use client";

import { formatDistanceToNow } from "date-fns";
import { RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { deleteFile, getFiles } from "@/actions/file";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatBytes } from "@/lib/utils";

interface FileData {
  id: string;
  url: string;
  fileName: string;
  size: number;
  uploadedAt: Date;
}

export function AttachmentsSettingsTab() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadFiles = async () => {
    try {
      const data = await getFiles();
      setFiles(
        data.map((file) => ({
          id: file.id,
          url: file.url,
          fileName: file.name,
          size: file.size,
          uploadedAt: file.createdAt
        }))
      );
    } catch (error) {
      console.error("Failed to load files:", error);
      toast.error("Failed to load files.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadFiles();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadFiles();
    toast.success("Files refreshed.");
    setIsRefreshing(false);
  };

  const handleDelete = async (fileId: string, fileName: string) => {
    setDeletingId(fileId);
    try {
      await deleteFile(fileId);
      setFiles((prev) => prev.filter((file) => file.id !== fileId));
      toast.success(`File "${fileName}" deleted successfully.`);
    } catch (error) {
      console.error("Failed to delete file:", error);
      toast.error("Failed to delete file.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">Here are the files uploaded to your account.</p>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-8 w-20" />
                  </TableCell>
                </TableRow>
              ))
            ) : files.length > 0 ? (
              files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="max-w-md truncate font-medium">
                    <Link
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-purple-500 hover:underline dark:hover:text-purple-400"
                    >
                      {file.fileName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatBytes(file.size)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(file.uploadedAt), {
                      addSuffix: true
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-400"
                      disabled={deletingId === file.id}
                      onClick={() => handleDelete(file.id, file.fileName)}
                    >
                      {deletingId === file.id ? "Deleting..." : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground py-10 text-center">
                  No files found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
