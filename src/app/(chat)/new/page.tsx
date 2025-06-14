"use client";

import { useEffect } from "react";

import ChatUI from "@/components/ChatUI";
import { useChat } from "@/providers/chat-provider";

export default function NewChatPage() {
  const { resetChat } = useChat();

  useEffect(() => {
    resetChat();
  }, [resetChat]);
  return (
    <div className="h-full w-screen overflow-hidden sm:w-auto">
      <ChatUI />
    </div>
  );
}
