"use client";

import { formatDistanceToNow } from "date-fns";
import { RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";
import { Session } from "next-auth";
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { deleteFile, getFiles } from "@/actions/file";
import { getGlobalMemories, deleteGlobalMemory } from "@/actions/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatBytes } from "@/lib/utils";
import { useFont } from "@/providers/use-font";

export const settingsFormSchema = z.object({
  jobTitle: z.string().optional(),
  occupation: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  company: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  customFont: z.string().optional(),
  theme: z.enum(["light", "dark"])
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

interface FileData {
  id: string;
  url: string;
  fileName: string;
  size: number;
  uploadedAt: Date;
}

interface Memory {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const FONT_OPTIONS = [
  { value: "inter", label: "Inter", className: "font-inter" },
  { value: "roboto", label: "Roboto", className: "font-roboto" },
  { value: "open-sans", label: "Open Sans", className: "font-open-sans" },
  { value: "lato", label: "Lato", className: "font-lato" },
  { value: "poppins", label: "Poppins", className: "font-poppins" }
];

type SettingsSection = "account" | "customization" | "memory" | "attachments";

interface SettingsFormProps {
  form: UseFormReturn<SettingsFormValues>;
  section: SettingsSection;
  session?: Session;
  onSubmit?: (data: SettingsFormValues) => Promise<void>;
  isSaving?: boolean;
}

export function SettingsForm({ form, section, session, onSubmit, isSaving = false }: SettingsFormProps) {
  const { setCurrentFont } = useFont();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [files, setFiles] = useState<FileData[]>([]);
  const [isLoading, setIsLoading] = useState(section === "memory" || section === "attachments");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (section === "memory") {
      loadMemories();
    } else if (section === "attachments") {
      loadFiles();
    }
  }, [section]);

  const loadMemories = async () => {
    setIsLoading(true);
    try {
      const data = await getGlobalMemories();
      setMemories(data);
    } catch (error) {
      console.error("Failed to load memories:", error);
      toast.error("Failed to load memories.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadFiles = async () => {
    setIsLoading(true);
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (section === "memory") {
      await loadMemories();
      toast.success("Memories refreshed.");
    } else if (section === "attachments") {
      await loadFiles();
      toast.success("Files refreshed.");
    }
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

  const handleFileDelete = async (fileId: string, fileName: string) => {
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

  // Render the appropriate form section based on the section prop
  const renderFormSection = () => {
    switch (section) {
      case "account":
        return renderAccountSection();
      case "customization":
        return renderCustomizationSection();
      case "memory":
        return renderMemorySection();
      case "attachments":
        return renderAttachmentsSection();
      default:
        return null;
    }
  };

  const renderAccountSection = () => {
    if (!session) return null;

    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={session?.user?.avatar || "/placeholder.svg"} alt={session?.user?.name || ""} />
            <AvatarFallback>{session?.user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{session?.user?.name}</h3>
            <p className="text-muted-foreground text-sm">{session?.user?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="jobTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Software Engineer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="occupation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Occupation</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Developer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Acme Inc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. San Francisco, CA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea placeholder="Tell us a little about yourself" className="min-h-[100px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    );
  };

  const renderCustomizationSection = () => {
    return (
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Theme</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Choose your preferred color scheme.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="customFont"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Application Font</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  setCurrentFont(value);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a font" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem key={font.value} value={font.value} className={font.className}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Choose your preferred font for the application.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  };

  const renderMemorySection = () => {
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
              ) : memories.length > 0 ? (
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
  };

  const renderAttachmentsSection = () => {
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
                        onClick={() => handleFileDelete(file.id, file.fileName)}
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
  };

  // Render the form with the appropriate section
  return (
    <>
      {renderFormSection()}
      {(section === "account" || section === "customization") && onSubmit && (
        <div className="border-border mt-6 flex justify-end border-t pt-6">
          <Button type="submit" disabled={isSaving} className="bg-purple-600 text-white hover:bg-purple-700">
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
    </>
  );
}
