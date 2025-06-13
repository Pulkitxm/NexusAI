import { ReactNode } from "react";

import { AppSidebar } from "@/components/app-sidebar";

import { LayoutContent } from "./LayoutContent";

import type React from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-screen overflow-hidden bg-background">
      <AppSidebar />
      <main className="flex-1">
        <LayoutContent>{children}</LayoutContent>
      </main>
    </div>
  );
}
