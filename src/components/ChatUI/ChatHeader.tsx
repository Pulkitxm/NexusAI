"use client"

import { Button } from "@/components/ui/button"
import { Keyboard } from "lucide-react"

interface ChatHeaderProps {
  onShowShortcuts: () => void
}

export function ChatHeader({ onShowShortcuts }: ChatHeaderProps) {
  return (
    <div className="flex justify-end p-2 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
      <Button
        variant="ghost"
        size="sm"
        onClick={onShowShortcuts}
        className="text-xs flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors h-7 px-2"
        aria-label="Show keyboard shortcuts"
      >
        <Keyboard className="h-3 w-3" />
        <span className="hidden sm:inline">Shortcuts</span>
      </Button>
    </div>
  )
}
