"use client";

import { Button } from "@/components/ui/button";
import { useKeys } from "@/providers/key-provider";
import { getAvailableModels } from "@/lib/models";
import { RiKeyLine } from "react-icons/ri";
import { useSettingsModal } from "@/providers/settings-modal-provider";
import ChatUI from "@/components/ChatUI";
import { useEffect } from "react";
import { useChat } from "@/providers/chat-provider";
import { Message } from "@/types/chat";

export default function ChatDisplay({ id, messages }: { id: string; messages: Message[] }) {
  const { keys, hasAnyKeys } = useKeys();
  const { openModal } = useSettingsModal();
  const availableModels = getAvailableModels(keys);
  const { setMessages, setChatId } = useChat();

  useEffect(() => {
    if (id && messages) {
      setChatId(id);
      setMessages(
        messages.map((message) => ({
          ...message,
          role: message.role === "USER" ? "user" : "assistant",
          parts: [
            {
              type: "text",
              text: message.content,
            },
          ],
        }))
      );
    }
  }, [id, messages, setChatId, setMessages]);

  if (!hasAnyKeys || availableModels.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <div className="text-center max-w-sm bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <RiKeyLine className="text-amber-600 dark:text-amber-400 text-xl" />
          </div>
          <h2 className="text-xl font-semibold mb-2 dark:text-white">No API Keys Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Add your API keys to start chatting with AI models.</p>
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

  return <ChatUI id={id} />;
}
