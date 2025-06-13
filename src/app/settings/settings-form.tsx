"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceToNow } from "date-fns";
import { RefreshCw, Trash2 } from "lucide-react";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { updateUserSettings, type UserSettings, getGlobalMemories, deleteGlobalMemory } from "@/lib/actions/user";
import { useFont } from "@/providers/font-provider";

const formSchema = z.object({
  jobTitle: z.string().optional(),
  occupation: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  company: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  customFont: z.string().optional(),
  theme: z.enum(["light", "dark"])
});

type FormValues = z.infer<typeof formSchema>;

const FONT_OPTIONS = [
  { value: "inter", label: "Inter", className: "font-inter" },
  { value: "roboto", label: "Roboto", className: "font-roboto" },
  { value: "open-sans", label: "Open Sans", className: "font-open-sans" },
  { value: "lato", label: "Lato", className: "font-lato" },
  { value: "poppins", label: "Poppins", className: "font-poppins" }
];

function AccountSettingsForm({ form, session }: { form: UseFormReturn<FormValues>; session: Session }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={session?.user?.avatar} alt={session?.user?.name || ""} />
          <AvatarFallback>{session?.user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-semibold">{session?.user?.name}</h3>
          <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
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
}

function CustomizationSettingsForm({ form }: { form: UseFormReturn<FormValues> }) {
  const { setCurrentFont } = useFont();
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
}

interface Memory {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

function MemorySettingsTab() {
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

  const handleMemoryDelete = async (memoryId: string) => {
    setDeletingId(memoryId);
    try {
      await deleteGlobalMemory(memoryId);
      setMemories((prev) => prev.filter((mem) => mem.id !== memoryId));
      toast.success("Memory deleted successfully.");
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
        <p className="text-sm text-muted-foreground">Here are the global memories saved from your conversations.</p>
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
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-400"
                          disabled={deletingId === memory.id}
                        >
                          {deletingId === memory.id ? "Deleting..." : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the memory created{" "}
                            {formatDistanceToNow(new Date(memory.createdAt), {
                              addSuffix: true
                            })}
                            .
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleMemoryDelete(memory.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
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

interface SettingsFormProps {
  initialData: Partial<UserSettings> | null;
  tab: "account" | "customization" | "memory";
}

export function SettingsForm({ initialData, tab }: SettingsFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { setCurrentFont } = useFont();
  const { theme, setTheme } = useTheme();
  const { data: session, update } = useSession();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobTitle: initialData?.jobTitle || "",
      occupation: initialData?.occupation || "",
      bio: initialData?.bio || "",
      location: initialData?.location || "",
      company: initialData?.company || "",
      website: initialData?.website || "",
      customFont: initialData?.customFont || "inter",
      theme: theme === "dark" ? "dark" : "light"
    }
  });

  async function onSubmit(data: FormValues) {
    setIsSaving(true);
    try {
      if (data.theme !== theme) {
        setTheme(data.theme);
      }
      if (data.customFont) {
        setCurrentFont(data.customFont);
      }

      await updateUserSettings(data);

      await update({ ...session, user: { ...session?.user, ...data } });

      toast.success("Settings updated successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update settings.");
    } finally {
      setIsSaving(false);
    }
  }

  const renderTabContent = () => {
    if (!session) return null;
    switch (tab) {
      case "account":
        return <AccountSettingsForm form={form} session={session} />;
      case "customization":
        return <CustomizationSettingsForm form={form} />;
      case "memory":
        return <MemorySettingsTab />;
      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {renderTabContent()}

        {tab !== "memory" && (
          <div className="flex justify-end border-t border-border pt-6">
            <Button type="submit" disabled={isSaving} className="bg-purple-600 text-white hover:bg-purple-700">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
