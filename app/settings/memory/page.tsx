"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SettingsSkeleton from "../loading";
import { MemorySettingsTab } from "./memory-settings";

export default function MemorySettingsPage() {
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [session?.user?.id]);

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
          <CardTitle className="text-purple-600 dark:text-purple-400">Global Memory</CardTitle>
          <CardDescription>Manage your global memory that will be used as context for all conversations.</CardDescription>
        </CardHeader>
        <CardContent>
          <MemorySettingsTab />
        </CardContent>
      </Card>
    </div>
  );
}
