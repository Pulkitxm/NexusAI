import { ArrowLeft, LogOutIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

import { getUserSettings } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/authOptions";

import { LogOut } from "./log-out";
import { SettingsForm } from "./settings-form";

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

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const settings = await getUserSettings();

  return (
    <div className="container max-w-5xl py-8 md:py-12">
      <div className="mb-8 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-purple-600 dark:text-purple-400 md:text-4xl">
            Settings
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">Manage your account settings and preferences.</p>
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
          <LogOut>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
            >
              <LogOutIcon className="h-4 w-4" />
              Logout
            </Button>
          </LogOut>
        </div>
      </div>

      <Tabs defaultValue="account" className="grid gap-8 md:grid-cols-4">
        <TabsList className="flex h-full flex-col items-start justify-start rounded-lg bg-transparent p-0">
          <TabsTrigger value="account" className="w-full justify-start px-4 py-2 text-base">
            Account
          </TabsTrigger>
          <TabsTrigger value="customization" className="w-full justify-start px-4 py-2 text-base">
            Customization
          </TabsTrigger>
          <TabsTrigger value="memory" className="w-full justify-start px-4 py-2 text-base">
            Memory
          </TabsTrigger>
          <TabsTrigger value="attachments" className="w-full justify-start px-4 py-2 text-base">
            Attachments
          </TabsTrigger>
        </TabsList>

        <div className="md:col-span-3">
          <TabsContent value="account">
            <SettingsCard
              title="Account Information"
              description="Update your personal information and profile details."
            >
              <SettingsForm initialData={settings} tab="account" />
            </SettingsCard>
          </TabsContent>

          <TabsContent value="customization">
            <SettingsCard
              title="Appearance & Customization"
              description="Customize your experience with different themes, fonts, and more."
            >
              <SettingsForm initialData={settings} tab="customization" />
            </SettingsCard>
          </TabsContent>

          <TabsContent value="memory">
            <SettingsCard
              title="Global Memory"
              description="Manage your global memory that will be used as context for all conversations."
            >
              <SettingsForm initialData={settings} tab="memory" />
            </SettingsCard>
          </TabsContent>

          <TabsContent value="attachments">
            <SettingsForm initialData={settings} tab="attachments" />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
