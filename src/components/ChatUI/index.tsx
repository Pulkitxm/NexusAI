import React, { useState } from "react";
import { useModel } from "@/providers/model-provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatUI() {
  const { selectedModel, ModelSwitcher } = useModel();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim() || isStreaming) return;

    // Add user message
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    // Add assistant message that will be streamed
    const assistantMessage: Message = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMessage]);

    // Simulated streaming for now
    const response = "This is a simulated streaming response...";
    for (let i = 0; i < response.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        lastMessage.content += response[i];
        return newMessages;
      });
    }

    setIsStreaming(false);
  };

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Header with model selector */}
      <div className="border-b p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Chat</h2>
        <ModelSwitcher />
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <Card
              key={index}
              className={`p-4 ${
                message.role === "user"
                  ? "bg-primary/10 ml-12"
                  : "bg-muted mr-12"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="font-semibold">
                  {message.role === "user" ? "You" : "Assistant"}:
                </div>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isStreaming}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
