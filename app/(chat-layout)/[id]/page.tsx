"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

import { ChatInterface } from "@/chat/interface";
import { useChat } from "@/providers/use-chat";

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;
  const { setChatId, chatId: currentChatId } = useChat();

  useEffect(() => {
    if (chatId && chatId !== currentChatId) {
      setChatId(chatId);
    }
  }, [chatId, currentChatId, setChatId]);

  return <ChatInterface />;
}
