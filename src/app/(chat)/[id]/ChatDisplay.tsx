"use client";

import { useEffect } from "react";

import ChatUI from "@/components/ChatUI";
import { useChat } from "@/providers/chat-provider";
import { Message } from "@/types/chat";

export default function ChatDisplay({ id, messages }: { id: string; messages: Message[] }) {
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
              text: message.content
            }
          ]
        }))
      );
    }
  }, [id, messages, setChatId, setMessages]);

  return <ChatUI id={id} />;
}
