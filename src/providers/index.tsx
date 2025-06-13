"use client";

import Syncer from "@/components/syncer";
import { Toaster } from "@/components/ui/toaster";
import { KeyProvider } from "@/providers/key-provider";
import { SessionProviderWrapper } from "@/providers/session";
import { SidebarProvider } from "@/providers/sidebar-provider";
import { ThemeProvider } from "@/providers/theme-provider";

import { ChatProvider } from "./chat-provider";
import { FontProvider } from "./font-provider";
import { ModelProvider } from "./model-provider";
import { SettingsModalProvider } from "./settings-modal-provider";
import { UploadAttachmentProvider } from "./upload-attachment-provider";

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
                    <UploadAttachmentProvider>{children}</UploadAttachmentProvider>
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
