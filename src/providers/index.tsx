"use client";

import { SidebarProvider } from "@/providers/sidebar-provider";
import { Toaster } from "@/components/ui/toaster";
import { KeyProvider } from "@/providers/key-provider";
import { SessionProviderWrapper } from "@/providers/session";
import { ThemeProvider } from "@/providers/theme-provider";
import { SettingsModalProvider } from "./settings-modal-provider";
import { ModelProvider } from "./model-provider";
import { ChatProvider } from "./chat-provider";
import { FontProvider } from "./font-provider";
import Syncer from "@/components/syncer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProviderWrapper>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <KeyProvider>
          <SidebarProvider>
            <SettingsModalProvider>
              <ModelProvider>
                <ChatProvider>
                  <FontProvider>
                    <Syncer />
                    {children}
                  </FontProvider>
                </ChatProvider>
              </ModelProvider>
            </SettingsModalProvider>
            <Toaster />
          </SidebarProvider>
        </KeyProvider>
      </ThemeProvider>
    </SessionProviderWrapper>
  );
}
