"use client";

import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import * as z from "zod";

import { getUserSettings, updateUserSettings } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFont } from "@/providers/use-font";
import SettingsSkeleton from "../loading";
import { CustomizationSettingsForm } from "./customization-form";

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

export default function CustomizationSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { data: session, update } = useSession();
  const { theme, setTheme } = useTheme();
  const { setCurrentFont } = useFont();

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
    } else {
      setLoading(false);
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
              <CustomizationSettingsForm form={form} />
              <div className="border-border flex justify-end border-t pt-6 mt-6">
                <Button type="submit" disabled={isSaving} className="bg-purple-600 text-white hover:bg-purple-700">
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
