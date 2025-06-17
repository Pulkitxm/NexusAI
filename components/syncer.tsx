"use client";

import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect } from "react";

import { useFont } from "@/providers/use-font";

export default function Syncer() {
  const { data: session } = useSession();
  const { setTheme } = useTheme();
  const { setCurrentFont } = useFont();

  useEffect(() => {
    console.log(session?.user?.settings);
    if (session?.user?.settings?.theme) {
      setTheme(session.user.settings.theme);
    }
    if (session?.user?.settings?.customFont) {
      setCurrentFont(session.user.settings.customFont);
    }
  }, [session, setCurrentFont, setTheme]);

  return null;
}
