"use client";

import { Settings, User, LogIn } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { useSettingsModal } from "@/providers/use-settings";

import type { Session } from "next-auth";

interface SidebarFooterSectionProps {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
}

export function SidebarFooterSection({ session, status }: SidebarFooterSectionProps) {
  const { openModal } = useSettingsModal();
  const user = session?.user;

  const AuthOption = (
    <Button variant={"ghost"} className="mb-2 w-full">
      {status === "loading" ? (
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      ) : status === "authenticated" ? (
        <div className="flex w-full items-center gap-2">
          {user?.avatar ? (
            <img
              src={user.avatar || "/placeholder.svg?height=20&width=20"}
              className="h-5 w-5 rounded-full"
              alt={user.name || "User"}
            />
          ) : (
            <User className="h-4 w-4" />
          )}
          <span className="truncate text-sm">{user?.name}</span>
        </div>
      ) : (
        <div className="flex w-full items-center gap-2" onClick={() => signIn("google")}>
          <LogIn className="h-4 w-4" />
          <span>Login</span>
        </div>
      )}
    </Button>
  );

  return (
    <div className="space-y-1">
      <Button onClick={openModal} variant={"ghost"} className="h-9 w-full gap-2 rounded-md">
        <div className="flex items-center justify-start w-full gap-2">
          <Settings className="h-4 w-4" />
          Manage API Keys
        </div>
      </Button>

      {status === "authenticated" ? (
        <Link href="/settings" className="w-full">
          {AuthOption}
        </Link>
      ) : (
        AuthOption
      )}
    </div>
  );
}
