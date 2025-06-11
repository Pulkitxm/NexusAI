"use client"

import type React from "react"

import { useChat } from "@/providers/chat-provider"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SendHorizontal, Loader2, Command } from "lucide-react"
import { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface EnhancedChatInputProps {
  onShowShortcuts: () => void
}

export function ChatInput({ onShowShortcuts }: EnhancedChatInputProps) {
  const { input, handleInputChange, handleSubmit, isLoading, inputRef } =
    useChat()
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      inputRef.current.style.height = `${Math.min(
        inputRef.current.scrollHeight,
        120
      )}px`
    }
  }, [input])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault()
        setIsFocused(false)
        inputRef.current?.blur()
      }

      if (e.key === "/") {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (input.trim() && !isLoading) {
        handleSubmit(e)
      }
    }

    if ((e.metaKey || e.ctrlKey) && e.key === "/") {
      e.preventDefault()
      onShowShortcuts()
    }
  }

  return (
    <div className="sticky bottom-0 z-10">
      <div className="max-w-4xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="relative">
          <div
            className={cn(
              "relative flex items-end gap-3 p-4 rounded-xl transition-all duration-200",
              "bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-700",
              "backdrop-blur-sm",
              isFocused &&
                "border-zinc-300 dark:border-slate-600 shadow-lg shadow-zinc-200/10 dark:shadow-slate-950/30"
            )}
          >
            <div className="absolute top-4 left-4 flex items-center gap-2 text-xs text-zinc-400 dark:text-slate-500">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400/70 dark:bg-red-400/60" />
                <div className="w-2 h-2 rounded-full bg-yellow-400/70 dark:bg-yellow-400/60" />
                <div className="w-2 h-2 rounded-full bg-green-400/70 dark:bg-green-400/60" />
              </div>
            </div>

            <div className="flex-1 mt-4">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={onKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="// Ask me anything..."
                className={cn(
                  "min-h-[44px] max-h-[120px] resize-none border-0 bg-transparent",
                  "px-0 py-0 text-sm font-mono leading-relaxed",
                  "focus-visible:ring-0 focus-visible:ring-offset-0 outline-none",
                  "placeholder:text-zinc-400 dark:placeholder:text-slate-400 placeholder:font-mono",
                  "text-zinc-900 dark:text-slate-100"
                )}
                disabled={isLoading}
              />

              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-slate-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded text-[10px] font-mono text-zinc-600 dark:text-slate-300">
                      ⏎
                    </kbd>
                    <span className="text-zinc-500 dark:text-slate-400">send</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 rounded text-[10px] font-mono text-zinc-600 dark:text-slate-300">
                      ⇧⏎
                    </kbd>
                    <span className="text-zinc-500 dark:text-slate-400">new line</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onShowShortcuts}
                  className="flex items-center gap-1 text-zinc-400 dark:text-slate-400 hover:text-zinc-600 dark:hover:text-slate-200 transition-colors"
                >
                  <Command className="h-3 w-3" />
                  <span className="font-mono">shortcuts</span>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={cn(
                "h-10 w-10 rounded-lg shrink-0 transition-all duration-200",
                "focus-visible:ring-0 outline-none border-0 self-center",
                input.trim() && !isLoading
                  ? "bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-500 text-white shadow-lg shadow-purple-500/25 dark:shadow-purple-500/20 hover:shadow-purple-500/40"
                  : "bg-zinc-200 dark:bg-slate-700 text-zinc-400 dark:text-slate-500 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SendHorizontal className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}