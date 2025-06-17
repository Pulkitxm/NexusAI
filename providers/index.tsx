"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

import Syncer from "@/components/syncer";

import { ChatProvider } from "./use-chat";
import { FontProvider } from "./use-font";
import { KeyboardShortcutsProvider } from "./use-keyboardshortcuts";
import { KeyProvider } from "./use-keys";
import { ModelProvider } from "./use-model";
import { SettingsModalProvider } from "./use-settings";
import { SidebarProvider } from "./use-sidebar";
import { UploadAttachmentProvider } from "./use-upload-attachment";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <KeyboardShortcutsProvider>
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
            </SidebarProvider>
          </KeyProvider>
        </KeyboardShortcutsProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
