"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, Plus, MessageSquare, Settings, Trash2, Key, LogOut, User } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth-provider"
import { useKeys } from "@/components/key-provider"
import { SettingsModal } from "@/components/settings-modal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Globe } from "lucide-react"

interface Chat {
  id: string
  title: string
  model: string
  lastMessage: string
  timestamp: Date
}

export function AppSidebar() {
  const [chats, setChats] = useState<Chat[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredChats, setFilteredChats] = useState<Chat[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const router = useRouter()
  const { user, logout } = useAuth()
  const { hasAnyKeys } = useKeys()

  useEffect(() => {
    if (user) {
      const savedChats = localStorage.getItem(`nexus-chats-${user.id}`)
      if (savedChats) {
        const parsedChats = JSON.parse(savedChats).map((chat: any) => ({
          ...chat,
          timestamp: new Date(chat.timestamp),
        }))
        setChats(parsedChats)
        setFilteredChats(parsedChats)
      }
    }
  }, [user])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredChats(chats)
    } else {
      const filtered = chats.filter(
        (chat) =>
          chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredChats(filtered)
    }
  }, [searchQuery, chats])

  const createNewChat = () => {
    if (!hasAnyKeys) {
      setShowSettings(true)
      return
    }
    const newChatId = `chat-${Date.now()}`
    router.push(`/chat/${newChatId}`)
  }

  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updatedChats = chats.filter((chat) => chat.id !== chatId)
    setChats(updatedChats)
    if (user) {
      localStorage.setItem(`nexus-chats-${user.id}`, JSON.stringify(updatedChats))
    }
  }

  const openChat = (chatId: string) => {
    router.push(`/chat/${chatId}`)
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Sidebar className="border-r border-gray-200 bg-white">
        <SidebarHeader className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Globe className="text-white text-lg" />
              </div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Nexus AI
              </h2>
            </div>
            <SidebarTrigger />
          </div>

          <Button
            onClick={createNewChat}
            className="w-full mb-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {!hasAnyKeys && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-700 text-sm">
                <Key className="w-4 h-4" />
                <span>Add API keys to start chatting</span>
              </div>
            </div>
          )}
        </SidebarHeader>

        <SidebarContent className="px-2">
          <SidebarMenu>
            {filteredChats.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No conversations yet</p>
                <p className="text-xs text-gray-400 mt-1">Start a new chat to begin</p>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton
                    onClick={() => openChat(chat.id)}
                    className="w-full justify-start p-3 h-auto hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm truncate text-gray-900">{chat.title}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-gray-200"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="w-3 h-3 text-gray-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={(e) => deleteChat(chat.id, e)} className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Chat
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 truncate flex-1 mr-2">{chat.lastMessage}</p>
                        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                          {chat.model}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{chat.timestamp.toLocaleDateString()}</p>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
            )}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-gray-100">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setShowSettings(true)} className="hover:bg-gray-50">
                <Settings className="w-4 h-4" />
                <span>Settings & API Keys</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="hover:bg-gray-50">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{user.name}</span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
    </>
  )
}
