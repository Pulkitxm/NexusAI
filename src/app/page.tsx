"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useKeys } from "@/providers/key-provider"
import { useSettingsModal } from "@/providers/settings-modal-provider"
import {
  RiChatSmile3Line,
  RiKeyLine,
} from "react-icons/ri"

export default function HomePage() {
  const { hasAnyKeys } = useKeys()
  const { openModal } = useSettingsModal()

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome back!</h1>
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
                onClick={openModal}
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
    </>
  )
}
