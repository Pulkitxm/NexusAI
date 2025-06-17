"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

import { ChatInterface } from "@/chat/interface";
import { useChat } from "@/providers/use-chat";

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;
  const { setChatId } = useChat();

  useEffect(() => {
    if (chatId) {
      setChatId(chatId);
    }

    return () => {
      setChatId(null);
    };
  }, [chatId, setChatId]);

  return <ChatInterface />;
}
