"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LogOutIcon } from "lucide-react";
import Link from "next/link";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { updateUserSettings, getUserSettings } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOutButton } from "@/lib/auth-buttons";
import { useFont } from "@/providers/use-font";

import { AccountSettingsForm } from "./account-form";
import { AttachmentsSettingsTab } from "./attachments-form";
import { CustomizationSettingsForm } from "./customization-form";
import { MemorySettingsTab } from "./memory-settings";

import type React from "react";

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

function SettingsCard({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-purple-200 dark:border-purple-800">
      <CardHeader>
        <CardTitle className="text-purple-600 dark:text-purple-400">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function SettingsPage({ session }: { session: Session }) {
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const { setCurrentFont } = useFont();
  const { theme, setTheme } = useTheme();
  const { update } = useSession();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobTitle: "",
      occupation: "",
      bio: "",
      location: "",
      company: "",
      website: "",
      customFont: "inter",
      theme: "light"
    }
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const userSettings = await getUserSettings();
        form.reset({
          jobTitle: userSettings?.jobTitle || "",
          occupation: userSettings?.occupation || "",
          bio: userSettings?.bio || "",
          location: userSettings?.location || "",
          company: userSettings?.company || "",
          website: userSettings?.website || "",
          customFont: userSettings?.customFont || "inter",
          theme: theme === "dark" ? "dark" : "light"
        });
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.id) {
      loadSettings();
    }
  }, [session?.user?.id, theme, form]);

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

  const renderTabContent = (tab: string) => {
    if (!session) return null;

    switch (tab) {
      case "account":
        return (
          <SettingsCard title="Account Information" description="Update your personal information and profile details.">
            <AccountSettingsForm form={form} session={session} />
          </SettingsCard>
        );
      case "customization":
        return (
          <SettingsCard
            title="Appearance & Customization"
            description="Customize your experience with different themes, fonts, and more."
          >
            <CustomizationSettingsForm form={form} />
          </SettingsCard>
        );
      case "memory":
        return (
          <SettingsCard
            title="Global Memory"
            description="Manage your global memory that will be used as context for all conversations."
          >
            <MemorySettingsTab />
          </SettingsCard>
        );
      case "attachments":
        return <AttachmentsSettingsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
      {/* Header Section */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-purple-600 md:text-4xl dark:text-purple-400">
            Settings
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">Manage your account settings and preferences.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </Link>
          <LogOutButton>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
            >
              <LogOutIcon className="h-4 w-4" />
              Logout
            </Button>
          </LogOutButton>
        </div>
      </div>

      {/* Main Content */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <Tabs defaultValue="account" className="grid gap-8 lg:grid-cols-[240px_1fr]">
            {/* Sidebar Navigation */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <TabsList className="bg-muted grid h-auto w-full grid-cols-2 gap-1 p-1 lg:grid-cols-1 lg:bg-transparent lg:p-0">
                <TabsTrigger
                  value="account"
                  className="justify-start px-4 py-3 text-sm font-medium lg:w-full lg:justify-start"
                >
                  Account
                </TabsTrigger>
                <TabsTrigger
                  value="customization"
                  className="justify-start px-4 py-3 text-sm font-medium lg:w-full lg:justify-start"
                >
                  Customization
                </TabsTrigger>
                <TabsTrigger
                  value="memory"
                  className="justify-start px-4 py-3 text-sm font-medium lg:w-full lg:justify-start"
                >
                  Memory
                </TabsTrigger>
                <TabsTrigger
                  value="attachments"
                  className="justify-start px-4 py-3 text-sm font-medium lg:w-full lg:justify-start"
                >
                  Attachments
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Content Area */}
            <div className="min-w-0">
              <TabsContent value="account" className="mt-0 space-y-6">
                {renderTabContent("account")}
                <div className="border-border flex justify-end border-t pt-6">
                  <Button type="submit" disabled={isSaving} className="bg-purple-600 text-white hover:bg-purple-700">
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="customization" className="mt-0 space-y-6">
                {renderTabContent("customization")}
                <div className="border-border flex justify-end border-t pt-6">
                  <Button type="submit" disabled={isSaving} className="bg-purple-600 text-white hover:bg-purple-700">
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="memory" className="mt-0 space-y-6">
                {renderTabContent("memory")}
              </TabsContent>

              <TabsContent value="attachments" className="mt-0 space-y-6">
                {renderTabContent("attachments")}
              </TabsContent>
            </div>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}
