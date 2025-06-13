"use client";

import { useEffect } from "react";
import { RiKeyLine } from "react-icons/ri";

import ChatUI from "@/components/ChatUI";
import { Button } from "@/components/ui/button";
import { getAvailableModels } from "@/lib/models";
import { useChat } from "@/providers/chat-provider";
import { useKeys } from "@/providers/key-provider";
import { useSettingsModal } from "@/providers/settings-modal-provider";

export default function NewChatPage() {
  const { keys, hasAnyKeys } = useKeys();
  const { openModal } = useSettingsModal();
  const availableModels = getAvailableModels(keys);
  const { resetChat } = useChat();

  useEffect(() => {
    resetChat();
  }, [resetChat]);

  if (!hasAnyKeys)
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="max-w-sm rounded-xl bg-white p-6 text-center shadow-sm dark:bg-gray-800">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <RiKeyLine className="text-xl text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="mb-2 text-xl font-semibold dark:text-white">No API Keys Found</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">Add your API keys to start chatting with AI models.</p>
          <Button
            onClick={openModal}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
          >
            <RiKeyLine className="mr-2" />
            Add API Keys
          </Button>
        </div>
      </div>
    );

  if (availableModels.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="max-w-sm rounded-xl bg-white p-6 text-center shadow-sm dark:bg-gray-800">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <RiKeyLine className="text-xl text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="mb-2 text-xl font-semibold dark:text-white">No API Keys Found</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">Add your API keys to start chatting with AI models.</p>
          <Button
            onClick={openModal}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
          >
            <RiKeyLine className="mr-2" />
            Add API Keys
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-screen overflow-hidden sm:w-auto">
      <ChatUI />
    </div>
  );
}
