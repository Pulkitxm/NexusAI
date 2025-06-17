"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

import { ChatInterface } from "@/chat/ui/chat-interface";
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
      // Cleanup when component unmounts
      setChatId(null);
    };
  }, [chatId, setChatId]);

  return <ChatInterface />;
} 