"use client"

import { useChat } from "ai/react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Send, Copy, Check, MoreVertical, Settings } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { useKeys } from "@/components/key-provider"
import { AI_MODELS, getAvailableModels } from "@/lib/models"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SettingsModal } from "@/components/settings-modal"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  RiRobotLine,
  RiUserLine,
  RiKeyLine,
  RiBrainLine,
  RiImageLine,
  RiChatSmile3Line,
  RiLoader4Line,
  RiAlertFill,
  RiGlobalLine,
} from "react-icons/ri"

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const chatId = params.id as string
  const { user } = useAuth()
  const { keys, hasAnyKeys } = useKeys()
  const [selectedModel, setSelectedModel] = useState("")
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const availableModels = getAvailableModels(keys)

  // Set default model when available models change
  useEffect(() => {
    if (availableModels.length > 0 && !selectedModel) {
      setSelectedModel(availableModels[0].id)
    }
  }, [availableModels, selectedModel])

  // Redirect if no API keys
  useEffect(() => {
    if (!hasAnyKeys) {
      router.push("/")
    }
  }, [hasAnyKeys, router])

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
    body: {
      model: selectedModel,
      chatId: chatId,
      keys: keys,
    },
    onFinish: (message) => {
      saveChatToStorage(message.content)
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      })
    },
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const saveChatToStorage = (lastMessage: string) => {
    if (!user) return

    const chats = JSON.parse(localStorage.getItem(`nexus-chats-${user.id}`) || "[]")
    const existingChatIndex = chats.findIndex((chat: any) => chat.id === chatId)

    const chatTitle =
      messages.length > 0
        ? messages[0].content.slice(0, 50) + (messages[0].content.length > 50 ? "..." : "")
        : "New Chat"

    const selectedModelInfo = AI_MODELS.find((m) => m.id === selectedModel)

    const chatData = {
      id: chatId,
      title: chatTitle,
      model: selectedModelInfo?.name || selectedModel,
      lastMessage: lastMessage.slice(0, 100) + (lastMessage.length > 100 ? "..." : ""),
      timestamp: new Date().toISOString(),
    }

    if (existingChatIndex >= 0) {
      chats[existingChatIndex] = chatData
    } else {
      chats.unshift(chatData)
    }

    localStorage.setItem(`nexus-chats-${user.id}`, JSON.stringify(chats))
  }

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessageId(messageId)
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      })
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy message to clipboard",
        variant: "destructive",
      })
    }
  }

  const selectedModelInfo = AI_MODELS.find((model) => model.id === selectedModel)

  if (!hasAnyKeys) {
    return null
  }

  if (availableModels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <RiKeyLine className="text-amber-600 text-xl" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No API Keys Found</h2>
          <p className="text-gray-600 mb-6">Add your API keys to start chatting with AI models.</p>
          <Button
            onClick={() => setShowSettings(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
          >
            <RiKeyLine className="mr-2" />
            Add API Keys
          </Button>
        </div>
        <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <div className="border-b bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <RiGlobalLine className="text-white text-sm" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Nexus AI</h1>
                  {selectedModelInfo && (
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`${selectedModelInfo.color} text-white text-xs`}>
                        <selectedModelInfo.icon className="mr-1 text-xs" />
                        {selectedModelInfo.name}
                      </Badge>
                      <span className="text-xs text-gray-500">by {selectedModelInfo.provider}</span>
                      {selectedModelInfo.category === "reasoning" && (
                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                          <RiBrainLine className="mr-1" />
                          Reasoning
                        </Badge>
                      )}
                      {selectedModelInfo.category === "image" && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                          <RiImageLine className="mr-1" />
                          Image Gen
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-64 border-gray-200">
                  <SelectValue placeholder="Select AI Model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center gap-3 py-1">
                        <div className={`w-6 h-6 ${model.color} rounded flex items-center justify-center`}>
                          <model.icon className="text-white text-xs" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{model.name}</div>
                          <div className="text-xs text-gray-500">
                            {model.provider} • {model.description}
                          </div>
                        </div>
                        {model.category === "reasoning" && (
                          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                            <RiBrainLine className="mr-1" />
                          </Badge>
                        )}
                        {model.category === "image" && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                            <RiImageLine className="mr-1" />
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setShowSettings(true)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <RiChatSmile3Line className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Start a conversation</h3>
              <p className="text-gray-600 mb-6">
                Ask me anything! I can help with writing, analysis, coding, creative tasks, and more.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                <Button
                  variant="outline"
                  className="text-left justify-start h-auto p-4 hover:bg-gray-50"
                  onClick={() => {
                    const event = { target: { value: "Write a creative story about space exploration" } }
                    handleInputChange(event as any)
                  }}
                >
                  <div>
                    <div className="font-medium text-sm">Creative Writing</div>
                    <div className="text-xs text-gray-500">Write a story about space</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="text-left justify-start h-auto p-4 hover:bg-gray-50"
                  onClick={() => {
                    const event = { target: { value: "Explain quantum computing in simple terms" } }
                    handleInputChange(event as any)
                  }}
                >
                  <div>
                    <div className="font-medium text-sm">Explain Concepts</div>
                    <div className="text-xs text-gray-500">Learn about quantum computing</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="text-left justify-start h-auto p-4 hover:bg-gray-50"
                  onClick={() => {
                    const event = { target: { value: "Help me write a Python function to sort a list" } }
                    handleInputChange(event as any)
                  }}
                >
                  <div>
                    <div className="font-medium text-sm">Code Help</div>
                    <div className="text-xs text-gray-500">Get programming assistance</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="text-left justify-start h-auto p-4 hover:bg-gray-50"
                  onClick={() => {
                    const event = { target: { value: "Analyze this data and provide insights" } }
                    handleInputChange(event as any)
                  }}
                >
                  <div>
                    <div className="font-medium text-sm">Data Analysis</div>
                    <div className="text-xs text-gray-500">Get insights from data</div>
                  </div>
                </Button>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-4 max-w-4xl ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarFallback
                      className={message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"}
                    >
                      {message.role === "user" ? (
                        <RiUserLine className="text-sm" />
                      ) : (
                        <RiRobotLine className="text-sm" />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <Card
                    className={`${
                      message.role === "user"
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0"
                        : "bg-white border border-gray-200 shadow-sm"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {message.parts.map((part, i) => {
                            switch (part.type) {
                              case "text":
                                return (
                                  <div key={`${message.id}-${i}`} className="whitespace-pre-wrap break-words">
                                    {part.text}
                                  </div>
                                )
                              default:
                                return null
                            }
                          })}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 w-8 p-0 flex-shrink-0 ${
                            message.role === "user"
                              ? "text-white/70 hover:text-white hover:bg-white/10"
                              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                          }`}
                          onClick={() => copyToClipboard(message.content, message.id)}
                        >
                          {copiedMessageId === message.id ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-4 justify-start">
              <Avatar className="w-8 h-8 mt-1">
                <AvatarFallback className="bg-gray-200 text-gray-600">
                  <RiRobotLine className="text-sm" />
                </AvatarFallback>
              </Avatar>
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                    <span className="text-sm text-gray-500">AI is thinking...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {error && (
            <div className="flex gap-4 justify-start">
              <Avatar className="w-8 h-8 mt-1">
                <AvatarFallback className="bg-red-100 text-red-600">
                  <RiAlertFill className="text-sm" />
                </AvatarFallback>
              </Avatar>
              <Card className="bg-red-50 border border-red-200">
                <CardContent className="p-4">
                  <div className="text-red-700">
                    <div className="font-medium mb-1">Error</div>
                    <div className="text-sm">{error.message}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t bg-white p-4 shadow-sm">
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="pr-12 py-3 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading || !selectedModel}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                {input.length}/4000
              </div>
            </div>
            <Button
              type="submit"
              disabled={isLoading || !input.trim() || !selectedModel}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
            >
              {isLoading ? <RiLoader4Line className="animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
          <div className="text-center mt-2">
            <p className="text-xs text-gray-500">Powered by your API keys • Messages are processed securely</p>
          </div>
        </div>
      </div>

      <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
    </>
  )
}
