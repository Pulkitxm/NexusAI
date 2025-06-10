"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";
import { useEffect } from "react";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    if (theme === "system") {
      setTheme("dark");
    }
  }, [theme, setTheme]);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn("w-9 h-9", theme === "dark" ? "text-white" : "text-black")}
    >
      {theme === "dark" ? (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      )}
    </button>
  );
}
