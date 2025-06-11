"use client";

import { SidebarProvider } from "@/components/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { KeyProvider } from "@/providers/key-provider";
import { SessionProviderWrapper } from "@/providers/session";
import { ThemeProvider } from "@/providers/theme-provider";
import { SettingsModalProvider } from "./settings-modal-provider";
import { ModelProvider } from "./model-provider";
import { ChatProvider } from "./chat-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProviderWrapper>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <KeyProvider>
          <SidebarProvider>
            <div className="flex min-h-screen w-full bg-background">
              <SettingsModalProvider>
                <AppSidebar />
                <ModelProvider>
                  <ChatProvider>
                    <main className="flex-1">{children}</main>
                  </ChatProvider>
                </ModelProvider>
              </SettingsModalProvider>
            </div>
            <Toaster />
          </SidebarProvider>
        </KeyProvider>
      </ThemeProvider>
    </SessionProviderWrapper>
  );
}
