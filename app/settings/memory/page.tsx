"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";

import { SettingsSkeleton } from "../loading";
import { SettingsForm, settingsFormSchema, SettingsFormValues } from "../settings-form";

export default function MemorySettingsPage() {
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

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
    if (session?.user?.id) {
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [session?.user?.id]);

  if (loading) {
    return <SettingsSkeleton notFullPage />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="text-purple-600 dark:text-purple-400">Global Memory</CardTitle>
          <CardDescription>
            Manage your global memory that will be used as context for all conversations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <SettingsForm form={form} section="memory" />
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
