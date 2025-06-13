import type React from "react";
import { ReactNode } from "react";
import { LayoutContent } from "./LayoutContent";
import { AppSidebar } from "@/components/app-sidebar";

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
