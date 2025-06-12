"use client";

import { SidebarProvider } from "@/providers/sidebar";
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
            <SettingsModalProvider>
              <ModelProvider>
                <ChatProvider>
                  {children}
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
