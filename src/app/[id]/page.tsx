"use client";

import { useChat } from "ai/react";
import { useState, useEffect, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Copy, Check, Code, FileText, Brain, Image } from "lucide-react";
import { useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useKeys } from "@/providers/key-provider";
import { AI_MODELS, getAvailableModels } from "@/lib/models";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  RiRobotLine,
  RiUserLine,
  RiKeyLine,
  RiChatSmile3Line,
  RiLoader4Line,
  RiAlertFill,
  RiShieldKeyholeLine,
} from "react-icons/ri";
import { useSettingsModal } from "@/providers/settings-modal-provider";
import { Chat } from "@/types/models";
import { useModel } from "@/providers/model-provider";

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;

  const { user } = {
    user: {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      avatar:"https://lh3.googleusercontent.com/ogw/AF2bZygRRf6obcCtNbv_pToFbILRlNF0BXv0UKL0dT-UbxRKqYpD"
    },
  };
  const { keys, hasAnyKeys } = useKeys();
  const { selectedModel } = useModel();
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const { openModal } = useSettingsModal();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const availableModels = getAvailableModels(keys);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
    body: {
      model: selectedModel,
      chatId: chatId,
      keys: keys,
    },
    onFinish: (message) => {
      saveChatToStorage(message.content);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const saveChatToStorage = (lastMessage: string) => {
    if (!user) return;

    const chats = JSON.parse(localStorage.getItem(`nexus-chats-${user.id}`) || "[]") as Chat[];
    const existingChatIndex = chats.findIndex((chat) => chat.id === chatId);

    const chatTitle =
      messages.length > 0
        ? messages[0].content.slice(0, 50) + (messages[0].content.length > 50 ? "..." : "")
        : "New Chat";

    const selectedModelInfo = AI_MODELS.find((m) => m.id === selectedModel);

    const chatData = {
      id: chatId,
      title: chatTitle,
      model: selectedModelInfo?.name || selectedModel,
      lastMessage: lastMessage.slice(0, 100) + (lastMessage.length > 100 ? "..." : ""),
      timestamp: new Date(),
    };

    if (existingChatIndex >= 0) {
      chats[existingChatIndex] = chatData;
    } else {
      chats.unshift(chatData);
    }

    localStorage.setItem(`nexus-chats-${user.id}`, JSON.stringify(chats));
  };

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      });
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to copy",
        description: "Could not copy message to clipboard",
        variant: "destructive",
      });
    }
  };

  if (!hasAnyKeys)
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

  if (availableModels.length === 0) {
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

  return (
    <>
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl flex items-center justify-center mb-4">
              <RiChatSmile3Line className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Start a conversation</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
              Ask me anything! I can help with writing, analysis, coding, creative tasks, and more.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              <Button
                variant="outline"
                className="text-left justify-start h-auto p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => {
                  const event = { target: { value: "Write a creative story about space exploration" } };
                  handleInputChange(event as ChangeEvent<HTMLInputElement>);
                }}
              >
                <FileText className="mr-2 h-4 w-4 text-purple-500" />
                <div>
                  <div className="font-medium text-sm">Creative Writing</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Write a story about space</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="text-left justify-start h-auto p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => {
                  const event = { target: { value: "Explain quantum computing in simple terms" } };
                  handleInputChange(event as ChangeEvent<HTMLInputElement>);
                }}
              >
                <Brain className="mr-2 h-4 w-4 text-blue-500" />
                <div>
                  <div className="font-medium text-sm">Explain Concepts</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Learn about quantum computing</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="text-left justify-start h-auto p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => {
                  const event = { target: { value: "Help me write a Python function to sort a list" } };
                  handleInputChange(event as ChangeEvent<HTMLInputElement>);
                }}
              >
                <Code className="mr-2 h-4 w-4 text-green-500" />
                <div>
                  <div className="font-medium text-sm">Code Help</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Get programming assistance</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="text-left justify-start h-auto p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => {
                  const event = { target: { value: "Generate an image of a futuristic city" } };
                  handleInputChange(event as ChangeEvent<HTMLInputElement>);
                }}
              >
                <Image className="mr-2 h-4 w-4 text-amber-500" />
                <div>
                  <div className="font-medium text-sm">Image Generation</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Create visual content</div>
                </div>
              </Button>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-3 max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                  <AvatarFallback
                    className={
                      message.role === "user"
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    }
                  >
                    {message.role === "user" ? <RiUserLine /> : <RiRobotLine />}
                  </AvatarFallback>
                </Avatar>

                <Card
                  className={`group ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <CardContent className="p-3 relative">
                    <div className="whitespace-pre-wrap break-words">{message.content}</div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className={`absolute top-1 right-1 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                        message.role === "user"
                          ? "text-white/70 hover:text-white hover:bg-white/10"
                          : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                      }`}
                      onClick={() => copyToClipboard(message.content, message.id)}
                    >
                      {copiedMessageId === message.id ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 mt-1">
              <AvatarFallback className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <RiRobotLine />
              </AvatarFallback>
            </Avatar>
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">AI is thinking...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {error && (
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 mt-1">
              <AvatarFallback className="bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300">
                <RiAlertFill />
              </AvatarFallback>
            </Avatar>
            <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <CardContent className="p-3">
                <div className="text-red-700 dark:text-red-300">
                  <div className="font-medium mb-1">Error</div>
                  <div className="text-sm">{error.message}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>
      <footer className="border-t bg-white dark:bg-gray-900 dark:border-gray-800 p-3 shadow-sm">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="pr-10 py-2.5 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500"
              disabled={isLoading || !selectedModel}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
              {input.length > 0 && `${input.length}/4000`}
            </div>
          </div>
          <Button
            type="submit"
            disabled={isLoading || !input.trim() || !selectedModel}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
          >
            {isLoading ? <RiLoader4Line className="animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
        <div className="text-center mt-2 flex items-center justify-center gap-1.5">
          <RiShieldKeyholeLine className="text-xs text-gray-500 dark:text-gray-400" />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Powered by your API keys • Messages are processed securely
          </p>
        </div>
      </footer>
    </>
  );
}
