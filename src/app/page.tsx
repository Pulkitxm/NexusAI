"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { useKeys } from "@/components/key-provider"
import { useState } from "react"
import { SettingsModal } from "@/components/settings-modal"
import {
  RiRobotLine,
  RiShieldCheckLine,
  RiSpeedLine,
  RiRefreshLine,
  RiGoogleFill,
  RiBrainLine,
  RiAddLine,
  RiChatSmile3Line,
  RiKeyLine,
  RiGlobalLine,
} from "react-icons/ri"

export default function HomePage() {
  const { user, login } = useAuth()
  const { hasAnyKeys } = useKeys()
  const [showSettings, setShowSettings] = useState(false)

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <RiGlobalLine className="text-white text-3xl" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Nexus AI
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Your gateway to multiple AI models. Secure, private, and powered by your own API keys.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <RiRobotLine className="text-blue-600 text-xl" />
                </div>
                <CardTitle className="text-lg">25+ AI Models</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Access GPT, Claude, Gemini, and more in one interface</CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <RiShieldCheckLine className="text-green-600 text-xl" />
                </div>
                <CardTitle className="text-lg">100% Private</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Your API keys and data never leave your device</CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <RiSpeedLine className="text-purple-600 text-xl" />
                </div>
                <CardTitle className="text-lg">Real-time</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Streaming responses for instant AI interactions</CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-2">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <RiRefreshLine className="text-orange-600 text-xl" />
                </div>
                <CardTitle className="text-lg">Cross-Device</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Sync your chats across all your devices</CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Button
              onClick={login}
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all"
            >
              <RiGoogleFill className="mr-3 text-lg" />
              Continue with Google
            </Button>
            <p className="text-sm text-gray-500">Free to use • No subscription required • Bring your own API keys</p>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <Badge variant="secondary" className="bg-green-100 text-green-700 mb-2">
                <RiRobotLine className="mr-1" />
                OpenAI
              </Badge>
              <p className="text-xs text-gray-500">GPT-4, DALL-E</p>
            </div>
            <div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 mb-2">
                <RiBrainLine className="mr-1" />
                Anthropic
              </Badge>
              <p className="text-xs text-gray-500">Claude Models</p>
            </div>
            <div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 mb-2">
                <RiGoogleFill className="mr-1" />
                Google
              </Badge>
              <p className="text-xs text-gray-500">Gemini Pro</p>
            </div>
            <div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 mb-2">
                <RiAddLine className="mr-1" />
                More
              </Badge>
              <p className="text-xs text-gray-500">Groq, DeepSeek</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome back, {user.name?.split(" ")[0]}!</h1>
            <p className="text-xl text-gray-600">
              Ready to chat with AI?{" "}
              {hasAnyKeys ? "Choose a model and start chatting." : "Add your API keys to get started."}
            </p>
          </div>

          <div className="space-y-4">
            {hasAnyKeys ? (
              <Link href="/chat/new">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all"
                >
                  <RiChatSmile3Line className="mr-3 text-lg" />
                  Start New Chat
                </Button>
              </Link>
            ) : (
              <Button
                onClick={() => setShowSettings(true)}
                size="lg"
                className="text-lg px-8 py-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all"
              >
                <RiKeyLine className="mr-3 text-lg" />
                Add API Keys
              </Button>
            )}
          </div>

          {!hasAnyKeys && (
            <Card className="mt-8 border-amber-200 bg-amber-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 text-amber-800">
                  <RiKeyLine className="text-xl" />
                  <div className="text-left">
                    <h3 className="font-medium">API Keys Required</h3>
                    <p className="text-sm text-amber-700">
                      Add your API keys to start chatting with AI models. Your keys are stored securely in your browser.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
    </>
  )
}
