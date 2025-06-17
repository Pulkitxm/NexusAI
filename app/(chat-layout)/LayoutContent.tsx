"use client";

import { PanelLeft, Plus } from "lucide-react";
import Link from "next/link";

import ChatTitle from "@/chat/chat-title";
import { Button } from "@/components/ui/button";
import { useChat } from "@/providers/use-chat";
import { useModel } from "@/providers/use-model";
import { useSidebar } from "@/providers/use-sidebar";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const { ModelSwitcher } = useModel();
  const { open, setOpen, chats } = useSidebar();
  const { chatId } = useChat();

  const currentChat = chats.find((chat) => chat.id === chatId);

  return (
    <div className="flex size-full flex-col bg-gray-50 dark:bg-gray-950">
      <header className="border-b bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between p-3">
          <div className="mr-4 flex items-center gap-2">
            {!open && (
              <>
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  onClick={() => setOpen(true)}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <PanelLeft className="h-5 w-5" />
                </Button>
                <Link href="/">
                  <Button variant={"ghost"} size={"icon"} className="flex cursor-pointer items-center gap-2">
                    <Plus className="h-5 w-5" />
                  </Button>
                </Link>
              </>
            )}

            {currentChat && <ChatTitle title={currentChat.title} id={currentChat.id} />}
          </div>

          <div className="flex min-h-10 items-center gap-2">{ModelSwitcher && <ModelSwitcher />}</div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
