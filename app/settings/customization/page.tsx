"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { getUserSettings, updateUserSettings } from "@/actions/user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useFont } from "@/providers/use-font";

import SettingsSkeleton from "../loading";
import { SettingsForm, settingsFormSchema, SettingsFormValues } from "../settings-form";

export default function CustomizationSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { data: session, update } = useSession();
  const { theme, setTheme } = useTheme();
  const { setCurrentFont } = useFont();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
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
    } else {
      setLoading(false);
    }
  }, [session?.user?.id, theme, form]);

  async function onSubmit(data: SettingsFormValues) {
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
      toast.success("Customization settings updated successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update settings.");
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return <SettingsSkeleton />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="text-purple-600 dark:text-purple-400">Appearance & Customization</CardTitle>
          <CardDescription>Customize your experience with different themes, fonts, and more.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
              <SettingsForm form={form} section="customization" onSubmit={onSubmit} isSaving={isSaving} />
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
