"use client";

import { useFont } from "@/providers/font-provider";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import React, { useEffect } from "react";

export default function syncer() {
  const { data: session } = useSession();
  const { setTheme } = useTheme();
  const { setCurrentFont } = useFont();

  useEffect(() => {
    if (session?.user?.settings?.theme) {
      setTheme(session.user.settings.theme);
    }
    if (session?.user?.settings?.customFont) {
      setCurrentFont(session.user.settings.customFont);
    }
  }, [session?.user?.settings?.theme, session?.user?.settings?.customFont]);

  return null;
}
