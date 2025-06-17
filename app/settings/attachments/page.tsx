"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

import SettingsSkeleton from "../loading";

import { AttachmentsSettingsTab } from "./attachments-form";

export default function AttachmentsSettingsPage() {
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
      <AttachmentsSettingsTab />
    </div>
  );
}
