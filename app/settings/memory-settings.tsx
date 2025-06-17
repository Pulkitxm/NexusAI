"use client";

import { formatDistanceToNow } from "date-fns";
import { RefreshCw, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { getGlobalMemories, deleteGlobalMemory } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Memory {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export function MemorySettingsTab() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadMemories = async () => {
    try {
      const data = await getGlobalMemories();
      setMemories(data);
    } catch (error) {
      console.error("Failed to load memories:", error);
      toast.error("Failed to load memories.");
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadMemories().finally(() => setIsLoading(false));
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadMemories();
    toast.success("Memories refreshed.");
    setIsRefreshing(false);
  };

  const handleMemoryDelete = async (memoryId: string, content: string) => {
    setDeletingId(memoryId);
    try {
      await deleteGlobalMemory(memoryId);
      setMemories((prev) => prev.filter((mem) => mem.id !== memoryId));
      toast.success(`Memory "${content.substring(0, 30)}..." deleted successfully.`);
    } catch (error) {
      console.error("Failed to delete memory:", error);
      toast.error("Failed to delete memory.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">Here are the global memories saved from your conversations.</p>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Content</TableHead>
              <TableHead>Last Updated</TableHead>
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
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-8 w-20" />
                  </TableCell>
                </TableRow>
              ))
            ) : memories?.length > 0 ? (
              memories.map((memory) => (
                <TableRow key={memory.id}>
                  <TableCell className="max-w-md truncate font-medium">{memory.content}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(memory.updatedAt), {
                      addSuffix: true
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-400"
                      disabled={deletingId === memory.id}
                      onClick={() => handleMemoryDelete(memory.id, memory.content)}
                    >
                      {deletingId === memory.id ? "Deleting..." : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground py-10 text-center">
                  No memories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
