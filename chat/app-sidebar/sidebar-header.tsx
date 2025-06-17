"use client";

import { Search, Plus, Key } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSettingsModal } from "@/providers/use-settings";

import LogoIcon from "@/assets/logo.png";

interface SidebarHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  hasAnyKeys: boolean;
}

export function SidebarHeader({ searchQuery, setSearchQuery, hasAnyKeys }: SidebarHeaderProps) {
  const { openModal } = useSettingsModal();

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <Link href={"/"} className="flex items-center gap-2">
          <img
            src={LogoIcon.src || "/placeholder.svg"}
            alt="Logo"
            className="pointer-events-none h-8 w-8 object-contain"
            draggable={false}
          />
          <h2 className="bg-gradient-to-r from-purple-600 to-purple-600 bg-clip-text text-base font-semibold text-transparent">
            Nexus AI
          </h2>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <SidebarTrigger />
        </div>
      </div>

      <Link href="/">
        <Button className="mb-3 h-9 w-full border-0 bg-gradient-to-r from-purple-500 to-purple-600 text-sm text-white hover:from-purple-600 hover:to-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </Link>

      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 transform" />
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 pl-9 text-sm"
        />
      </div>

      {!hasAnyKeys && (
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-2.5 dark:border-amber-800/50 dark:bg-amber-950/50">
          <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
            <Key className="h-3.5 w-3.5" />
            <span>
              Please{" "}
              <span className="cursor-pointer underline" onClick={() => openModal()}>
                Add API keys
              </span>{" "}
              to start chatting
            </span>
          </div>
        </div>
      )}
    </>
  );
}
