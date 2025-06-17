"use client";

import { Settings, User, LogIn } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
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
    <SidebarMenuItem>
      {status === "loading" ? (
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      ) : status === "authenticated" ? (
        <SidebarMenuButton className="flex items-center gap-2 px-2 py-1.5">
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
        </SidebarMenuButton>
      ) : (
        <SidebarMenuButton className="hover:bg-accent px-2 py-1.5" onClick={() => signIn("google")}>
          <LogIn className="h-4 w-4" />
          <span className="text-sm">Login</span>
        </SidebarMenuButton>
      )}
    </SidebarMenuItem>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={openModal} className="hover:bg-accent/50 h-9">
          <Settings className="h-4 w-4" />
          <span className="text-sm">Manage API Keys</span>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {status === "authenticated" ? <Link href={"/settings"}>{AuthOption}</Link> : AuthOption}
    </SidebarMenu>
  );
}
