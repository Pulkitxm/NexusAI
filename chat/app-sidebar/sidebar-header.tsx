"use client";

import { Search, Plus, Key, PanelLeft } from "lucide-react";
import Link from "next/link";

import LOGO from "@/assets/logo.png";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSettingsModal } from "@/providers/use-settings";
import { useSidebar } from "@/providers/use-sidebar";

interface SidebarHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  hasAnyKeys: boolean;
}

export function SidebarHeader({ searchQuery, setSearchQuery, hasAnyKeys }: SidebarHeaderProps) {
  const { openModal } = useSettingsModal();
  const { setOpen } = useSidebar();

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src={LOGO.src} alt="Logo" className="pointer-events-none h-8 w-8 object-contain" draggable={false} />
          <h2 className="bg-gradient-to-r from-purple-600 to-purple-600 bg-clip-text text-base font-semibold text-transparent">
            Nexus AI
          </h2>
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <ThemeToggle />
        </div>
      </div>

      <Link href="/">
        <button className="mb-3 flex h-9 w-full items-center justify-center rounded-md border-0 bg-gradient-to-r from-purple-500 to-purple-600 text-sm text-white transition-colors hover:from-purple-600 hover:to-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </button>
      </Link>

      <div className="relative">
        <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 w-full rounded-md border border-gray-300 bg-white pl-9 text-sm text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
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
