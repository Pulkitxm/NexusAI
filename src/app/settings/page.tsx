import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getUserSettings } from "@/lib/actions/user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsForm } from "./settings-form";

// Helper component to reduce repetition
function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-purple-200 dark:border-purple-800">
      <CardHeader>
        <CardTitle className="text-purple-600 dark:text-purple-400">
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default async function SettingsPage() {
  const settings = await getUserSettings();

  return (
    <div className="container max-w-5xl py-8 md:py-12">
      {/* Page Header */}
      <div className="mb-8 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </Link>
      </div>

      {/* Main Content with Responsive Tabs */}
      <Tabs defaultValue="account" className="grid gap-8 md:grid-cols-4">
        <TabsList className="flex h-full flex-col items-start justify-start rounded-lg bg-transparent p-0">
          <TabsTrigger
            value="account"
            className="w-full justify-start px-4 py-2 text-base"
          >
            Account
          </TabsTrigger>
          <TabsTrigger
            value="customization"
            className="w-full justify-start px-4 py-2 text-base"
          >
            Customization
          </TabsTrigger>
          <TabsTrigger
            value="memory"
            className="w-full justify-start px-4 py-2 text-base"
          >
            Memory
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
        </div>
      </Tabs>
    </div>
  );
}